
import { МОДЕЛИ } from '../src/lib/tts-models.js';

const беды = [];
const плохо = (ч) => беды.push(ч);
const ок = (ч) => console.log('  ✓ ' + ч);

const МБ = 1048576;
const адрес = (х, ф) => `https://huggingface.co/${х}/resolve/main/${ф}`;

async function вес(url) {
  const о = await fetch(url, { method: 'HEAD', redirect: 'follow' });
  if (!о.ok) return null;
  const д = о.headers.get('content-length');
  return д ? Number(д) : null;
}

async function лицензия(хранилище) {
  const о = await fetch(`https://huggingface.co/api/models/${хранилище}`);
  if (!о.ok) return null;
  const д = await о.json();
  return (д.cardData && д.cardData.license) || д.license || null;
}

const своё = (с) => String(с || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const СВОДКА = { 'apache20': 'apache20', apache2: 'apache20', mit: 'mit', openrail: 'openrailm', 'openrailm': 'openrailm' };
const равныЛицензии = (а, б) => (СВОДКА[своё(а)] || своё(а)) === (СВОДКА[своё(б)] || своё(б));

try {
  await fetch('https://huggingface.co/api/models/onnx-community/Kokoro-82M-v1.0-ONNX');
} catch (е) {
  console.log('Сети нет — проверить нечего. Это НЕ значит, что всё в порядке.');
  process.exit(2);
}

for (const м of МОДЕЛИ) {
  console.log(`\n════ ${м.имя} ════`);

  const л = await лицензия(м.хранилище);
  if (!л) плохо(`${м.имя}: хранилище ${м.хранилище} не отвечает`);
  else if (!равныЛицензии(л, м.лицензия)) {
    плохо(`${м.имя}: лицензия в хранилище «${л}», а у нас записано «${м.лицензия}»`);
  } else ок(`лицензия сошлась: ${м.лицензия}`);

  const файлы = м.файлы || (м.файл ? [м.файл] : []);
  if (файлы.length) {
    let всего = 0;
    let целы = true;
    for (const ф of файлы) {
      const р = await вес(адрес(м.хранилище, ф));
      if (р === null) { плохо(`${м.имя}: файл ${ф} не отвечает`); целы = false; continue; }
      всего += р;
    }
    if (целы) {
      const мб = всего / МБ;

      if (мб - м.вес > 1) {
        плохо(`${м.имя}: обещаем ${м.вес} МБ, а на деле ${мб.toFixed(1)} МБ — человек скачает больше обещанного`);
      } else {
        ок(`вес ${мб.toFixed(1)} МБ, обещаем ${м.вес} МБ — не обманываем`);
      }
    }
  }

  if (м.языки.includes('ru') || м.языки.includes('uk')) {
    if (м.ключ === 'supertonic') {
      const о = await fetch(адрес(м.хранилище, 'onnx/unicode_indexer.json'));
      if (!о.ok) плохо(`${м.имя}: словарь знаков не отвечает`);
      else {
        const таблица = await о.json();
        const кир = сколькоКириллицы(таблица);
        if (кир < 30) плохо(`${м.имя}: обещаем русский и украинский, а в словаре ${кир} кириллических знаков`);
        else ок(`кириллица в словаре: ${кир} знаков`);
      }
    } else {
      ок('кириллица обеспечена отдельными голосами');
    }
  }

  if (м.сеть) console.log(`  · ходит в сеть: ${м.сеть.join(', ')} — это написано на странице`);
}

function сколькоКириллицы(таблица) {
  let n = 0;
  for (let к = 0x0400; к <= 0x04ff; к++) if (таблица[к] !== undefined && таблица[к] !== -1) n++;
  return n;
}

console.log('');
if (беды.length) {
  console.log(`  НЕ СОШЛОСЬ: ${беды.length}`);
  беды.forEach((б) => console.log('    — ' + б));
  process.exit(1);
}
console.log('  ✓ реестр моделей сходится с тем, что лежит на Hugging Face');
