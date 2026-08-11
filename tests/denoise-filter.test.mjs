// Строка фильтра шумоподавления. Проверяется не «как звучит» -- это меряется на настоящих
// записях в браузере, -- а то, что в строке есть оба недостающих параметра и что пол шума не
// уходит за границы, за которыми фильтр либо бесполезен, либо начинает есть голос.
import { denoiseFilter, noiseFloorFor } from '../src/lib/audio-tools-config.js';

let pass = 0;
let fail = 0;
function eq(actual, expected, name) {
  if (actual === expected) pass++;
  else { fail++; console.log(`  НЕ ПРОШЛО: ${name} -> получено ${JSON.stringify(actual)}, ожидалось ${JSON.stringify(expected)}`); }
}
function ok(cond, name) {
  if (cond) pass++; else { fail++; console.log(`  НЕ ПРОШЛО: ${name}`); }
}

// --- три силы шумоподавления: точки, на которых всё измерялось
eq(noiseFloorFor(6), -29, 'лёгкая');
eq(noiseFloorFor(12), -26, 'средняя');
eq(noiseFloorFor(22), -21, 'сильная');

// --- силы из «улучшить звук»
eq(noiseFloorFor(4), -30, 'музыка -- самая мягкая');
eq(noiseFloorFor(8), -28, 'подкаст');
eq(noiseFloorFor(10), -27, 'авто и голос');
eq(noiseFloorFor(16), -24, 'телефонный разговор');
eq(noiseFloorFor(20), -22, 'старая запись');

// --- границы. Ниже -30 фильтр перестаёт что-либо убирать (по умолчанию там -50, и в этом была
// вся беда), выше -20 он начинает считать шумом тихие места голоса.
eq(noiseFloorFor(0), -30, 'ноль не проваливается в бесполезное');
eq(noiseFloorFor(-100), -30, 'мусор на входе тоже упирается в нижнюю границу');
eq(noiseFloorFor(1000), -20, 'огромная сила упирается в верхнюю границу');
for (let nr = 0; nr <= 60; nr++) {
  const nf = noiseFloorFor(nr);
  ok(nf >= -30 && nf <= -20, `сила ${nr}: пол шума ${nf} внутри границ`);
}

// --- сама строка
eq(denoiseFilter(12), 'afftdn=nr=12:nf=-26:tn=1', 'строка фильтра целиком');
ok(denoiseFilter(6).includes(':nf='), 'пол шума задан явно -- без него фильтр не убирал ничего');
ok(denoiseFilter(6).includes(':tn=1'), 'слежение за шумом включено');
// Сила должна расти вместе с числом, иначе три пункта списка будут звучать одинаково.
ok(noiseFloorFor(22) > noiseFloorFor(6), 'чем сильнее подавление, тем выше поднят пол шума');

console.log(`итого: ${pass} прошло, ${fail} не прошло`);
process.exit(fail ? 1 : 0);
