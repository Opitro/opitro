// ПЕРЕСЧЁТ ЦВЕТА: HEX, RGB, HSL.
//
// ИСТОЧНИК ПРАВДЫ ЗДЕСЬ ВСЕГДА RGB, и это не мелочь. HSL показывается округлённым -- градусы
// целыми, проценты целыми, иначе поля превращаются в кашу вида 41.176470588. Но округление
// теряет точность: если после каждой правки пересчитывать HSL -> RGB -> HSL, цвет медленно
// уползает, и человек, подвигав один ползунок туда-обратно, получает другой цвет. Поэтому
// RGB хранится как есть, а HSL из него только ВЫВОДИТСЯ; обратный пересчёт делается лишь
// тогда, когда человек сам правит поле HSL.
//
// Прозрачность хранится долей от 0 до 1. В восьмизначном HEX она записывается байтом:
// 0.5 -> 80, потому что 128 из 255 -- это ровно половина.

const вЧисло = (з, наим, наиб) => {
  const н = Number(String(з).trim().replace(',', '.'));
  if (!Number.isFinite(н)) return null;
  return Math.min(наиб, Math.max(наим, н));
};

/** Целое 0..255 из доли 0..1 и обратно -- в одном месте, чтобы округляли одинаково. */
const вБайт = (доля) => Math.round(Math.min(1, Math.max(0, доля)) * 255);
const изБайта = (байт) => байт / 255;

const дв = (н) => н.toString(16).padStart(2, '0');

/**
 * Разбор записи HEX. Принимает 3, 4, 6 и 8 знаков, с решёткой и без.
 * @returns {r,g,b,a} либо null.
 */
export function изHex(строка) {
  const с = String(строка ?? '').trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]+$/.test(с)) return null;
  const ч = (и, дл) => parseInt(дл === 1 ? с[и] + с[и] : с.slice(и, и + 2), 16);
  if (с.length === 3 || с.length === 4) {
    return { r: ч(0, 1), g: ч(1, 1), b: ч(2, 1),
      a: с.length === 4 ? изБайта(ч(3, 1)) : 1 };
  }
  if (с.length === 6 || с.length === 8) {
    return { r: ч(0, 2), g: ч(2, 2), b: ч(4, 2),
      a: с.length === 8 ? изБайта(ч(6, 2)) : 1 };
  }
  return null;
}

/** Запись HEX. Восемь знаков только когда прозрачность и правда есть. */
export function вHex({ r, g, b, a = 1 }, всегдаAlpha = false) {
  const тело = '#' + дв(Math.round(r)) + дв(Math.round(g)) + дв(Math.round(b));
  return (всегдаAlpha || a < 1) ? тело + дв(вБайт(a)) : тело;
}

/**
 * RGB -> HSL. Тон в градусах 0..360, насыщенность и светлота в процентах 0..100.
 * Возвращаются НЕ округлёнными: округляет тот, кто показывает.
 */
export function вHsl({ r, g, b, a = 1 }) {
  const кр = r / 255, зл = g / 255, си = b / 255;
  const наиб = Math.max(кр, зл, си);
  const наим = Math.min(кр, зл, си);
  const размах = наиб - наим;
  const светлота = (наиб + наим) / 2;

  let тон = 0;
  let насыщенность = 0;
  if (размах !== 0) {
    // Знаменатель разный выше и ниже середины: у светлых цветов запас насыщенности меньше.
    насыщенность = размах / (1 - Math.abs(2 * светлота - 1));
    if (наиб === кр) тон = ((зл - си) / размах) % 6;
    else if (наиб === зл) тон = (си - кр) / размах + 2;
    else тон = (кр - зл) / размах + 4;
    тон *= 60;
    if (тон < 0) тон += 360;
  }
  return { h: тон, s: насыщенность * 100, l: светлота * 100, a };
}

/** HSL -> RGB. Тон приводится к кругу: 400 градусов -- это 40. */
export function изHsl({ h, s, l, a = 1 }) {
  const тон = ((h % 360) + 360) % 360;
  const нас = Math.min(100, Math.max(0, s)) / 100;
  const свет = Math.min(100, Math.max(0, l)) / 100;
  const c = (1 - Math.abs(2 * свет - 1)) * нас;
  const x = c * (1 - Math.abs(((тон / 60) % 2) - 1));
  const m = свет - c / 2;
  let [кр, зл, си] = [0, 0, 0];
  if (тон < 60) [кр, зл, си] = [c, x, 0];
  else if (тон < 120) [кр, зл, си] = [x, c, 0];
  else if (тон < 180) [кр, зл, си] = [0, c, x];
  else if (тон < 240) [кр, зл, си] = [0, x, c];
  else if (тон < 300) [кр, зл, си] = [x, 0, c];
  else [кр, зл, си] = [c, 0, x];
  return { r: Math.round((кр + m) * 255), g: Math.round((зл + m) * 255),
    b: Math.round((си + m) * 255), a };
}

/** Готовая строка rgb() или rgba(). Долю прозрачности пишем без хвоста нулей. */
export function вСтрокуRgb({ r, g, b, a = 1 }) {
  const кр = Math.round(r), зл = Math.round(g), си = Math.round(b);
  if (a >= 1) return `rgb(${кр}, ${зл}, ${си})`;
  return `rgba(${кр}, ${зл}, ${си}, ${коротко(a)})`;
}

/** Готовая строка hsl() или hsla(). */
export function вСтрокуHsl(цвет) {
  const { h, s, l, a } = цвет.h === undefined ? вHsl(цвет) : цвет;
  const т = Math.round(((h % 360) + 360) % 360);
  const н = Math.round(s), св = Math.round(l);
  if ((a ?? 1) >= 1) return `hsl(${т}, ${н}%, ${св}%)`;
  return `hsla(${т}, ${н}%, ${св}%, ${коротко(a)})`;
}

/** Доля прозрачности человеческой записью: 1, 0.5, 0.25 -- без лишних нулей. */
export function коротко(доля) {
  const н = Math.round(доля * 100) / 100;
  return String(н);
}

/**
 * Разбор чего угодно: #hex, rgb(), rgba(), hsl(), hsla() и просто три числа.
 * Нужен, чтобы человек мог вставить строку из чужого кода как есть.
 */
export function разобрать(строка) {
  const с = String(строка ?? '').trim();
  if (!с) return null;

  const hex = изHex(с);
  if (hex) return hex;

  const числа = (внутри) => внутри.split(/[\s,/]+/).filter(Boolean);

  const rgb = с.match(/^rgba?\s*\(([^)]*)\)$/i);
  if (rgb) {
    const ч = числа(rgb[1]);
    if (ч.length < 3) return null;
    // Проценты в rgb() тоже разрешены стандартом: rgb(100%, 0%, 0%).
    const знач = (т) => т.endsWith('%')
      ? вЧисло(т.slice(0, -1), 0, 100) * 2.55
      : вЧисло(т, 0, 255);
    const [r, g, b] = [знач(ч[0]), знач(ч[1]), знач(ч[2])];
    if ([r, g, b].some((н) => н === null)) return null;
    return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a: долю(ч[3]) };
  }

  const hsl = с.match(/^hsla?\s*\(([^)]*)\)$/i);
  if (hsl) {
    const ч = числа(hsl[1]);
    if (ч.length < 3) return null;
    const h = вЧисло(ч[0].replace(/deg$/i, ''), -100000, 100000);
    const s = вЧисло(ч[1].replace('%', ''), 0, 100);
    const l = вЧисло(ч[2].replace('%', ''), 0, 100);
    if ([h, s, l].some((н) => н === null)) return null;
    return изHsl({ h, s, l, a: долю(ч[3]) });
  }

  // Три числа через запятую или пробел -- самая частая запись «из головы».
  const голые = числа(с);
  if (голые.length === 3 || голые.length === 4) {
    const [r, g, b] = голые.slice(0, 3).map((т) => вЧисло(т, 0, 255));
    if ([r, g, b].every((н) => н !== null)) {
      return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a: долю(голые[3]) };
    }
  }
  return null;

  function долю(т) {
    if (т === undefined) return 1;
    if (String(т).endsWith('%')) return вЧисло(String(т).slice(0, -1), 0, 100) / 100;
    const н = вЧисло(т, 0, 1);
    return н === null ? 1 : н;
  }
}
