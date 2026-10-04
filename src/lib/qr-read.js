
export function снятьЭкранWifi(с) {
  return String(с ?? '').replace(/\\(.)/g, '$1');
}

export function снятьЭкранВизитки(с) {
  return String(с ?? '')
    .replace(/\\n/gi, '\n')
    .replace(/\\([\\;,])/g, '$1');
}

function разобратьWifi(текст) {
  const тело = текст.slice(5).replace(/;;\s*$/, '');
  const поля = {};

  const части = [];
  let кусок = '';
  for (let и = 0; и < тело.length; и++) {
    if (тело[и] === '\\') { кусок += тело[и] + (тело[и + 1] ?? ''); и++; continue; }
    if (тело[и] === ';') { части.push(кусок); кусок = ''; continue; }
    кусок += тело[и];
  }
  if (кусок) части.push(кусок);
  for (const ч of части) {
    const н = ч.indexOf(':');
    if (н === -1) continue;
    поля[ч.slice(0, н).toUpperCase()] = снятьЭкранWifi(ч.slice(н + 1));
  }
  return {
    имя: поля.S || '',
    пароль: поля.P || '',
    защита: поля.T || 'nopass',
    скрытая: String(поля.H || '').toLowerCase() === 'true',
  };
}

function разобратьВизитку(текст) {
  const из = {};
  for (const строка of текст.split(/\r?\n/)) {
    const н = строка.indexOf(':');
    if (н === -1) continue;
    const метка = строка.slice(0, н).toUpperCase().split(';')[0];
    const значение = снятьЭкранВизитки(строка.slice(н + 1));
    if (метка === 'FN') из.имя = значение;
    else if (метка === 'N' && !из.имя) из.имя = значение.split(';').filter(Boolean).reverse().join(' ');
    else if (метка === 'ORG') из.организация = значение;
    else if (метка === 'TITLE') из.должность = значение;
    else if (метка === 'TEL') из.телефон = значение;
    else if (метка === 'EMAIL') из.почта = значение;
    else if (метка === 'URL') из.сайт = значение;
  }
  return из;
}

const БЕЗОПАСНЫЕ_СХЕМЫ = new Set(['http:', 'https:', 'mailto:', 'tel:', 'sms:', 'geo:']);

export function разобратьСсылку(текст) {
  let у;
  try { у = new URL(текст); } catch (е) { return null; }
  const тревоги = [];
  const схема = у.protocol;

  if (!БЕЗОПАСНЫЕ_СХЕМЫ.has(схема)) тревоги.push({ вид: 'схема', что: схема });

  if (у.username || у.password) тревоги.push({ вид: 'собачка', что: у.hostname });

  if (/(^|\.)xn--/i.test(у.hostname)) тревоги.push({ вид: 'punycode', что: у.hostname });

  const сетевая = схема === 'http:' || схема === 'https:';
  if (сетевая && !у.username && /@/.test(у.pathname + у.search)) {
    тревоги.push({ вид: 'собачка-в-пути', что: у.hostname });
  }

  return {
    адрес: у.href,
    узел: у.hostname,
    схема,
    переходить: схема === 'http:' || схема === 'https:',
    тревоги,
  };
}

export function разобратьСодержимое(текст) {
  const т = String(текст ?? '');
  if (!т) return { вид: 'text', текст: '' };

  if (/^WIFI:/i.test(т)) return { вид: 'wifi', сеть: разобратьWifi(т), текст: т };
  if (/^BEGIN:VCARD/i.test(т)) return { вид: 'card', визитка: разобратьВизитку(т), текст: т };
  if (/^tel:/i.test(т)) return { вид: 'tel', номер: т.slice(4), текст: т };
  if (/^(mailto|smsto|sms):/i.test(т)) return { вид: 'mail', адрес: т.replace(/^[a-z]+:/i, ''), текст: т };

  const ссылка = разобратьСсылку(т);
  if (ссылка) return { вид: 'url', ссылка, текст: т };

  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(т) && т.length < 300) {
    const п = разобратьСсылку('https://' + т);
    if (п) return { вид: 'url', ссылка: п, безСхемы: true, текст: т };
  }
  return { вид: 'text', текст: т };
}
