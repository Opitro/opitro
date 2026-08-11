// Подъём уровня записи с микрофона. Проверяется именно расчёт множителя: если он ошибётся в
// большую сторону, запись захрипит, а хрип уже не убрать -- файл сохранён.
import { normalizeGain } from '../src/lib/web-audio-engine.js';

let pass = 0;
let fail = 0;
function eq(actual, expected, name) {
  const ok = Math.abs(actual - expected) < 1e-9;
  if (ok) pass++;
  else { fail++; console.log(`  НЕ ПРОШЛО: ${name} -> получено ${actual}, ожидалось ${expected}`); }
}
function approx(actual, expected, tol, name) {
  const ok = Math.abs(actual - expected) <= tol;
  if (ok) pass++;
  else { fail++; console.log(`  НЕ ПРОШЛО: ${name} -> получено ${actual}, ожидалось ~${expected}`); }
}

// --- обычный случай: микрофон ноутбука отдаёт голос примерно на этом уровне
// 0,89/0,05 -- это подъём в 17,8 раза, но такой уже вытащил бы наверх шум комнаты вместе с
// голосом. Предел в 8 раз (+18 дБ) обрезает его: запись станет заметно громче, но не превратится
// в шипение. Остаётся тише цели -- и это честнее, чем громкий шум.
eq(normalizeGain(0.05), 8, 'очень тихая запись упирается в предел, а не разгоняется до 17,8');
approx(normalizeGain(0.2), 4.45, 0.01, 'тихая запись: 0,2 -> 0,89');
approx(normalizeGain(0.445), 2, 0.01, 'вдвое тише нормы -> подъём вдвое');

// --- ничего не трогаем
eq(normalizeGain(0.89), 1, 'ровно на целевом уровне -- не трогаем');
eq(normalizeGain(0.95), 1, 'уже громче цели -- не трогаем');
eq(normalizeGain(1), 1, 'запись под потолок -- не трогаем');

// --- главное свойство: после подъёма ничего не должно упереться в потолок
for (const peak of [0.02, 0.1, 0.3, 0.5, 0.7, 0.88]) {
  const after = peak * normalizeGain(peak);
  eq(after <= 1, true, `пик ${peak} после подъёма не превышает 1 (стало ${after.toFixed(3)})`);
}

// --- тишина и мусор на входе
eq(normalizeGain(0), 1, 'полная тишина -- усиливать нечего');
eq(normalizeGain(0.005), 1, 'ниже порога (микрофон выключен) -- не разгоняем шум');
eq(normalizeGain(NaN), 1, 'NaN не должен превратиться в бесконечный подъём');
eq(normalizeGain(undefined), 1, 'ничего на входе -- множитель 1');

// --- предел подъёма настраивается
eq(normalizeGain(0.05, { maxGain: 4 }), 4, 'предел можно опустить');
approx(normalizeGain(0.1, { target: 0.5 }), 5, 1e-9, 'цель можно опустить');

console.log(`итого: ${pass} прошло, ${fail} не прошло`);
process.exit(fail ? 1 : 0);
