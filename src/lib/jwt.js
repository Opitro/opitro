
const ЧАСЫ = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' };

const ОТКРЫТЫЙ_КЛЮЧ = /^(RS|ES|PS|EdDSA)/i;

function изBase64url(кусок) {
  const с = String(кусок).replace(/-/g, '+').replace(/_/g, '/');
  const добор = с + '='.repeat((4 - (с.length % 4)) % 4);
  const строка = atob(добор);
  const байты = new Uint8Array(строка.length);
  for (let и = 0; и < строка.length; и++) байты[и] = строка.charCodeAt(и);
  return байты;
}

const вТекст = (байты) => new TextDecoder('utf-8', { fatal: false }).decode(байты);

export function разобрать(токен) {
  const с = String(токен ?? '').trim();
  if (!с) return { годен: false, беда: 'ПУСТО' };

  const части = с.split('.');
  if (части.length !== 3) return { годен: false, беда: 'НЕ_ТРИ_ЧАСТИ', частей: части.length };
  if (!/^[A-Za-z0-9_-]+$/.test(части[0]) || !/^[A-Za-z0-9_-]*$/.test(части[1])) {
    return { годен: false, беда: 'НЕ_BASE64URL' };
  }

  let заголовок, нагрузка;
  try { заголовок = JSON.parse(вТекст(изBase64url(части[0]))); }
  catch (е) { return { годен: false, беда: 'ЗАГОЛОВОК_НЕ_JSON' }; }
  try { нагрузка = части[1] ? JSON.parse(вТекст(изBase64url(части[1]))) : {}; }
  catch (е) { return { годен: false, беда: 'НАГРУЗКА_НЕ_JSON' }; }

  const алгоритм = String(заголовок && заголовок.alg || '').trim();
  return {
    годен: true,
    заголовок,
    нагрузка,
    части,
    алгоритм,
    безПодписи: алгоритм.toLowerCase() === 'none' || части[2] === '',
    нуженОткрытый: ОТКРЫТЫЙ_КЛЮЧ.test(алгоритм),
    беда: null,
  };
}

export function сроки(нагрузка, сейчас = Math.floor(Date.now() / 1000)) {
  const взять = (имя) => {
    const з = нагрузка && нагрузка[имя];
    return typeof з === 'number' && Number.isFinite(з) ? з : null;
  };
  const истекает = взять('exp');
  const неРаньше = взять('nbf');
  const выдан = взять('iat');
  let состояние = 'НЕТ_СРОКА';
  if (истекает !== null && сейчас >= истекает) состояние = 'ИСТЁК';
  else if (неРаньше !== null && сейчас < неРаньше) состояние = 'ЕЩЁ_НЕ_ДЕЙСТВУЕТ';
  else if (истекает !== null || неРаньше !== null) состояние = 'ДЕЙСТВУЕТ';
  return { истекает, неРаньше, выдан, состояние, осталось: истекает === null ? null : истекает - сейчас };
}

export async function проверить(токен, ключ) {
  const р = разобрать(токен);
  if (!р.годен) return { итог: 'НЕ_РАЗОБРАН', алгоритм: '' };
  if (р.безПодписи) return { итог: 'НЕТ_ПОДПИСИ', алгоритм: р.алгоритм };
  if (р.нуженОткрытый) return { итог: 'НУЖЕН_ОТКРЫТЫЙ_КЛЮЧ', алгоритм: р.алгоритм };

  const часы = ЧАСЫ[р.алгоритм.toUpperCase()];
  if (!часы) return { итог: 'АЛГОРИТМ_НЕИЗВЕСТЕН', алгоритм: р.алгоритм };
  if (!ключ) return { итог: 'НЕТ_КЛЮЧА', алгоритм: р.алгоритм };

  const узел = (typeof crypto !== 'undefined' && crypto.subtle) ? crypto.subtle : null;
  if (!узел) return { итог: 'НЕТ_CRYPTO', алгоритм: р.алгоритм };

  const кодировщик = new TextEncoder();
  const подписант = await узел.importKey('raw', кодировщик.encode(ключ),
    { name: 'HMAC', hash: часы }, false, ['sign']);
  const своя = new Uint8Array(await узел.sign('HMAC', подписант,
    кодировщик.encode(`${р.части[0]}.${р.части[1]}`)));
  let чужая;
  try { чужая = изBase64url(р.части[2]); } catch (е) { return { итог: 'НЕ_СОШЛАСЬ', алгоритм: р.алгоритм }; }

  if (своя.length !== чужая.length) return { итог: 'НЕ_СОШЛАСЬ', алгоритм: р.алгоритм };
  let разница = 0;
  for (let и = 0; и < своя.length; и++) разница |= своя[и] ^ чужая[и];
  return { итог: разница === 0 ? 'СОШЛАСЬ' : 'НЕ_СОШЛАСЬ', алгоритм: р.алгоритм };
}
