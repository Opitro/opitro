// Разбор того, что человек реально пишет в поле калькулятора.
//
// Любительский конвертер требует привести число к правильному виду до ввода -- то есть просит
// выполнить ту работу, ради которой к нему и пришли. Человек приходит с «5 футов 9 дюймов»,
// «11 стоунов 4 фунта», «5 1/2 дюйма», «1 500». Здесь всё это превращается в одно число.
//
// Правила разбора выбраны по тому, как пишут люди, а не по тому, как удобно программе:
//
//  * Запятая -- десятичный разделитель. В русском, украинском и испанском так пишут по умолчанию,
//    и «5,5» обязано значить пять с половиной.
//  * Пробел и узкий пробел внутри числа -- разделитель тысяч: «1 500» это полторы тысячи.
//  * Апостроф и кавычка -- футы и дюймы: 5'9" -- это то, как в США называют рост.
//  * Дробь: «1/2» и «5 1/2» -- американцы пишут дюймы именно так.
//
// Сознательно НЕ разбирается: «1,500» в англоязычной записи (тысяча пятьсот). Запятая в этом
// случае неотличима от десятичной, а ошибиться здесь в тысячу раз хуже, чем не понять ввод.
// Поэтому запятая всегда десятичная, а тысячи разделяются только пробелом.

const SPACES = /[   \s]/g;

/** Дробь вида "1/2" -> 0.5. Возвращает null, если это не дробь. */
function parseFraction(token) {
  const m = /^(\d+)\s*\/\s*(\d+)$/.exec(token);
  if (!m) return null;
  const den = Number(m[2]);
  if (!den) return null;
  return Number(m[1]) / den;
}

/** Простое число: "5", "5.5", "5,5", "1 500". */
function parsePlain(text) {
  const cleaned = String(text)
    .replace(SPACES, '')      // тысячи
    .replace(',', '.');       // десятичная запятая
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  if (!/^-?\d*\.?\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Разбирает строку в число в основной единице.
 *
 * @param {string} text  то, что напечатал человек
 * @param {object} [compound]  { per, sub } -- сколько дробных единиц в основной и как они
 *        называются: { per: 12, sub: ['in', '"', 'дюйм', ...] } для футов и дюймов.
 * @returns {number|null} null, если разобрать не удалось -- вызывающая сторона показывает пустоту,
 *          а не ноль: ноль это ответ, а пустота -- честное «пока нечего считать».
 */
export function parseQuantity(text, compound) {
  if (text == null) return null;
  let s = String(text).trim().toLowerCase();
  if (!s) return null;

  // 5'9" и 5'9 -- запись роста, принятая в США.
  const feetInch = /^(-?[\d.,]+)\s*['′]\s*([\d.,\s/]+)?\s*(?:["”″]|in|inch|inches)?$/.exec(s);
  if (feetInch && compound && compound.per) {
    const whole = parsePlain(feetInch[1]);
    if (whole == null) return null;
    const sub = feetInch[2] ? parseMixed(feetInch[2]) : 0;
    if (sub == null) return null;
    return whole + sub / compound.per;
  }

  if (compound && compound.per && compound.sub) {
    // «5 футов 9 дюймов», «11 st 4 lb», «5 ft 9». Названия единиц выбрасываются, остаются два
    // числа: первое -- основная единица, второе -- дробная.
    const words = compound.sub.concat(compound.main || []).map((w) => w.toLowerCase());
    let t = s;
    for (const w of words.sort((a, b) => b.length - a.length)) {
      t = t.split(w).join(' ');
    }
    const nums = t.split(/\s+/).map((x) => x.trim()).filter(Boolean);
    if (nums.length === 2) {
      const whole = parsePlain(nums[0]);
      const sub = parseMixed(nums[1]);
      if (whole != null && sub != null) return whole + sub / compound.per;
    }
    // «12 st» -- названа только основная единица. Без этой ветки строка проваливалась дальше и
    // не разбиралась вовсе, потому что «st» мешало прочитать её как обычное число.
    if (nums.length === 1 && t !== s) {
      const whole = parseMixed(nums[0]);
      if (whole != null) return whole;
    }
  }

  return parseMixed(s);
}

/** "5 1/2" -> 5.5, "1/2" -> 0.5, "5.5" -> 5.5. */
export function parseMixed(text) {
  const s = String(text).trim();
  if (!s) return null;
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 2) {
    const whole = parsePlain(parts[0]);
    const frac = parseFraction(parts[1]);
    if (whole != null && frac != null) return whole + (whole < 0 ? -frac : frac);
    // «1 500» -- это тысяча пятьсот, а не «1 и 500»: разбираем как одно число.
    return parsePlain(s);
  }
  const frac = parseFraction(s);
  if (frac != null) return frac;
  return parsePlain(s);
}

// Составные единицы по инструментам. Держатся здесь, а не в текстах страниц: это свойство самой
// величины, одинаковое во всех четырёх языках, и дублировать его в 8 файлах не за чем.
// Названия перечислены на всех языках сайта -- человек пишет на своём.
export const COMPOUND = {
  'feet-to-m': {
    per: 12,
    main: ['ft', 'feet', 'foot', 'фут', 'фута', 'футов', 'фт', 'pie', 'pies', 'фути', 'футів'],
    sub: ['in', 'inch', 'inches', '"', 'дюйм', 'дюйма', 'дюймов', 'дюйми', 'дюймів', 'pulgada', 'pulgadas'],
  },
  'stone-to-kg': {
    per: 14,
    main: ['st', 'stone', 'stones', 'стоун', 'стоуна', 'стоунов', 'стоунів'],
    sub: ['lb', 'lbs', 'pound', 'pounds', 'фунт', 'фунта', 'фунтов', 'фунтів', 'libra', 'libras'],
  },
};
