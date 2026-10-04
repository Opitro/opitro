
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

import { подпись } from '../src/lib/tool-summary.js';

const КОРЕНЬ = fileURLToPath(new URL('..', import.meta.url));
const КОЛЛЕКЦИИ = ['src/content/media-tools', 'src/content/tools'];

const ПРЕДЕЛ = 90;

const ПРЕДЕЛ_ИМЕНИ = 34;

const ПУСТЫЕ = [
  /^профессиональн/i, /^professional/i, /^herramienta profesional/i, /^професійн/i,
  /^бесплатн/i, /^free online/i, /^gratis/i, /^безкоштовн/i,
  /^онлайн[- ]инструмент/i, /^online tool/i,
  /^удобн/i, /^простой и/i, /^easy and/i,
];

const беды = [];
const плохо = (что) => беды.push(что);

let всего = 0;
let написанных = 0;

for (const коллекция of КОЛЛЕКЦИИ) {
  const путь = join(КОРЕНЬ, коллекция);
  if (!existsSync(путь)) continue;

  for (const слуг of readdirSync(путь)) {
    const папка = join(путь, слуг);
    const файлы = readdirSync(папка).filter((и) => и.endsWith('.md'));
    const языки = файлы.map((и) => и.replace(/\.md$/, ''));

    const подписи = new Map();
    const имена = new Map();

    for (const файл of файлы) {
      const язык = файл.replace(/\.md$/, '');
      const текст = readFileSync(join(папка, файл), 'utf8');
      const шапка = текст.match(/^---\n([\s\S]*?)\n---/);
      if (!шапка) { плохо(`${слуг}/${файл}: нет шапки`); continue; }

      let данные;
      try { данные = yaml.load(шапка[1]); }
      catch (е) { плохо(`${слуг}/${файл}: шапка не читается -- ${е.message.slice(0, 80)}`); continue; }

      всего++;
      имена.set(язык, данные.navName || '');
      if (данные.navName && [...данные.navName].length > ПРЕДЕЛ_ИМЕНИ) {
        плохо(`${слуг}/${файл}: название длиннее ${ПРЕДЕЛ_ИМЕНИ} знаков (${[...данные.navName].length}) -- на карточке перенесётся`);
      }
      const строка = подпись(данные);
      подписи.set(язык, строка);

      if (!строка) {
        плохо(`${слуг}/${файл}: подписи нет. Впишите summary в шапку`);
        continue;
      }
      написанных++;

      if ([...строка].length > ПРЕДЕЛ) {
        плохо(`${слуг}/${файл}: подпись длиннее ${ПРЕДЕЛ} знаков (${[...строка].length}) -- на карточке обрежется`);
      }

      const имя = (данные.navName || данные.h1 || '').toLowerCase().replace(/^"|"$/g, '');
      const низ = строка.toLowerCase();
      if (имя && (низ === имя || низ.startsWith(имя))) {
        плохо(`${слуг}/${файл}: подпись повторяет название («${строка.slice(0, 40)}»)`);
      }

      for (const пусто of ПУСТЫЕ) {
        if (пусто.test(строка)) {
          плохо(`${слуг}/${файл}: подпись начинается с пустых слов («${строка.slice(0, 45)}»)`);
          break;
        }
      }
    }

    const сИменем = [...имена.values()].filter(Boolean).length;
    if (сИменем > 0 && сИменем < имена.size) {
      const без = [...имена.entries()].filter(([, и]) => !и).map(([я]) => я);
      плохо(`${слуг}: navName есть на ${сИменем} языках из ${имена.size}, нет на ${без.join(', ')}`);
    }

    const без = языки.filter((я) => !подписи.get(я));
    if (без.length && без.length < языки.length) {
      плохо(`${слуг}: подписи нет на языках ${без.join(', ')}, а страницы на них есть`);
    }
  }
}

console.log(`Проверено страниц: ${всего}`);
console.log(`  с подписью: ${написанных}`);

if (беды.length) {
  console.log(`\n  НЕ СОШЛОСЬ: ${беды.length}`);
  for (const б of беды.slice(0, 40)) console.log('    — ' + б);
  if (беды.length > 40) console.log(`    … и ещё ${беды.length - 40}`);
  process.exit(1);
}
console.log('\n  ✓ у каждой страницы есть внятная подпись');
