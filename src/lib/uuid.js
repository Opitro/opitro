
const шестнадцать = '0123456789abcdef';

function байты(сколько) {
  const б = new Uint8Array(сколько);
  crypto.getRandomValues(б);
  return б;
}

const вЗнаки = (б) => {
  let с = '';
  for (const з of б) с += шестнадцать[з >> 4] + шестнадцать[з & 15];
  return с;
};

const сДефисами = (с) =>
  `${с.slice(0, 8)}-${с.slice(8, 12)}-${с.slice(12, 16)}-${с.slice(16, 20)}-${с.slice(20, 32)}`;

export function uuid4() {

  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();

  const б = байты(16);
  б[6] = (б[6] & 0x0f) | 0x40;
  б[8] = (б[8] & 0x3f) | 0x80;
  return сДефисами(вЗнаки(б));
}

let прошлоеВремя = -1;
let счётчик = 0;

export function uuid7(сейчас = Date.now()) {
  if (сейчас === прошлоеВремя) счётчик = (счётчик + 1) & 0x0fff;
  else { прошлоеВремя = сейчас; счётчик = байты(2)[0] & 0x0f; }

  const б = байты(16);

  б[0] = (сейчас / 2 ** 40) & 0xff;
  б[1] = (сейчас / 2 ** 32) & 0xff;
  б[2] = (сейчас / 2 ** 24) & 0xff;
  б[3] = (сейчас / 2 ** 16) & 0xff;
  б[4] = (сейчас / 2 ** 8) & 0xff;
  б[5] = сейчас & 0xff;

  б[6] = 0x70 | ((счётчик >> 8) & 0x0f);
  б[7] = счётчик & 0xff;
  б[8] = (б[8] & 0x3f) | 0x80;
  return сДефисами(вЗнаки(б));
}

export function пачка(сколько, версия = 4) {
  const н = Math.min(500, Math.max(1, Math.round(сколько) || 1));
  const итог = [];
  for (let и = 0; и < н; и++) итог.push(версия === 7 ? uuid7() : uuid4());
  return итог;
}

export function оформить(ключ, { заглавными = false, безДефисов = false } = {}) {
  let с = безДефисов ? ключ.replace(/-/g, '') : ключ;
  return заглавными ? с.toUpperCase() : с;
}

export function годен(строка, версия = null) {
  const с = String(строка ?? '').trim().toLowerCase();
  const без = с.replace(/-/g, '');
  if (!/^[0-9a-f]{32}$/.test(без)) return false;

  if (с.includes('-') && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(с)) {
    return false;
  }
  if (версия !== null && без[12] !== String(версия)) return false;

  if (!'89ab'.includes(без[16])) return false;
  return true;
}
