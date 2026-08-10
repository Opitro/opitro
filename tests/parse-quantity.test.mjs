import { parseQuantity, parseMixed } from '../src/lib/parse-quantity.js';

let pass = 0;
let fail = 0;
function eq(actual, expected, name) {
  const ok = actual === expected || (typeof actual === 'number' && typeof expected === 'number' && Math.abs(actual - expected) < 1e-9);
  if (ok) pass++;
  else { fail++; console.log(`  НЕ ПРОШЛО: ${name} -> получено ${JSON.stringify(actual)}, ожидалось ${JSON.stringify(expected)}`); }
}

const FEET = { per: 12, main: ['ft', 'feet', 'foot', 'фут', 'фута', 'футов', 'фт'], sub: ['in', 'inch', 'inches', 'дюйм', 'дюйма', 'дюймов', '"'] };
const STONE = { per: 14, main: ['st', 'stone', 'stones', 'стоун', 'стоуна', 'стоунов'], sub: ['lb', 'lbs', 'pound', 'pounds', 'фунт', 'фунта', 'фунтов'] };

// --- обычные числа
eq(parseQuantity('5'), 5, 'целое');
eq(parseQuantity('5.5'), 5.5, 'точка');
eq(parseQuantity('5,5'), 5.5, 'запятая как десятичный разделитель');
eq(parseQuantity('0,25'), 0.25, 'запятая с нулём');
eq(parseQuantity('-3'), -3, 'отрицательное');
eq(parseQuantity('-3,5'), -3.5, 'отрицательное с запятой');

// --- тысячи
eq(parseQuantity('1 500'), 1500, 'пробел как разделитель тысяч');
eq(parseQuantity('1 000 000'), 1000000, 'два разделителя тысяч');
eq(parseQuantity('1 500'), 1500, 'узкий пробел');

// --- дроби
eq(parseQuantity('1/2'), 0.5, 'простая дробь');
eq(parseQuantity('5 1/2'), 5.5, 'смешанная дробь');
eq(parseQuantity('3/4'), 0.75, 'три четверти');
eq(parseQuantity('5 3/8'), 5.375, 'восьмые доли дюйма');

// --- составной ввод: футы и дюймы
eq(parseQuantity("5'9", FEET), 5 + 9 / 12, 'апостроф без кавычки');
eq(parseQuantity('5\'9"', FEET), 5 + 9 / 12, 'апостроф и кавычка -- запись роста в США');
eq(parseQuantity('5 ft 9 in', FEET), 5 + 9 / 12, 'словами по-английски');
eq(parseQuantity('5 футов 9 дюймов', FEET), 5 + 9 / 12, 'словами по-русски');
eq(parseQuantity('6\'', FEET), 6, 'только футы');
eq(parseQuantity("5'6 1/2\"", FEET), 5 + 6.5 / 12, 'дюймы с дробью внутри составного');

// --- составной ввод: стоуны и фунты
eq(parseQuantity('11 st 4 lb', STONE), 11 + 4 / 14, 'стоуны и фунты');
eq(parseQuantity('11 стоунов 4 фунта', STONE), 11 + 4 / 14, 'стоуны словами по-русски');
eq(parseQuantity('12 st', STONE), 12, 'только стоуны');

// --- то, что разбирать нельзя
eq(parseQuantity(''), null, 'пустая строка -- не ноль');
eq(parseQuantity('   '), null, 'пробелы -- не ноль');
eq(parseQuantity('abc'), null, 'буквы');
eq(parseQuantity('5..5'), null, 'две точки');
eq(parseQuantity(null), null, 'ничего');
eq(parseQuantity('1/0'), null, 'деление на ноль');

// Отдельно: «1,500» НЕ считается тысячей пятьюстами. Запятая в этой записи неотличима от
// десятичной, а ошибиться в тысячу раз хуже, чем не понять ввод.
eq(parseQuantity('1,500'), 1.5, 'запятая всегда десятичная, даже если похоже на тысячи');

// --- parseMixed сам по себе
eq(parseMixed('2 1/4'), 2.25, 'смешанная дробь напрямую');
eq(parseMixed('1 500'), 1500, 'тысячи не путаются со смешанной дробью');

console.log(`итого: ${pass} прошло, ${fail} не прошло`);
process.exit(fail ? 1 : 0);
