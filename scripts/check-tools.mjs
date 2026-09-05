// РЕВИЗИЯ ПЯТИ СТРАНИЦ, ГДЕ ЦЕНА ОШИБКИ ВЫШЕ ВСЕГО.
//
// Запуск:  npx astro preview --port 4390   (в одном окне)
//          npm run check:tools             (в другом)
//
// Возвращает ненулевой код, если хоть одна проверка не сошлась, -- так его можно поставить
// в любую цепочку сборки.
//
// Проверяем не чтением кода, а вводом данных в НАСТОЯЩУЮ страницу в браузере и сверкой
// вывода с независимым судьёй. Судьи разные и намеренно чужие:
//   -- Base64      -- системная команда base64;
//   -- штрихкод    -- распознаватель самого браузера, то есть другой код, чем рисовальщик;
//   -- JSON        -- разбор самим узлом и точное сравнение значений;
//   -- SQL         -- неизменность набора знаков: форматирование не имеет права ничего
//                     потерять или дописать, кроме пробелов;
//   -- CSV         -- образцы из RFC 4180 и обратный круг.

import { spawn, execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Своя временная папка на каждый прогон: чужой профиль браузера трогать нельзя.
const Д = mkdtempSync(join(tmpdir(), 'opitro-ревизия-')) + '/';
const КОРЕНЬ = fileURLToPath(new URL('..', import.meta.url));
const САЙТ = 'http://localhost:4390';
const П = 10231;

const хром = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', `--remote-debugging-port=${П}`, `--user-data-dir=${Д}пррев231`,
  '--window-size=1400,1000', 'about:blank']);
let инфо = null;
for (let п = 0; п < 60; п++) { await new Promise((r) => setTimeout(r, 500));
  try { инфо = await (await fetch(`http://127.0.0.1:${П}/json/list`)).json(); break; } catch (е) {} }
const сок = new WebSocket(инфо.find((т) => т.type === 'page').webSocketDebuggerUrl);
let ид = 0; const ждут = new Map();
await new Promise((r) => { сок.onopen = r; });
let ошибки = [];
сок.onmessage = (е) => { const м = JSON.parse(е.data);
  if (м.method === 'Runtime.exceptionThrown') ошибки.push(м.params.exceptionDetails.exception?.description || м.params.exceptionDetails.text);
  if (ждут.has(м.id)) { ждут.get(м.id)(м); ждут.delete(м.id); } };
const шли = (м, п = {}) => new Promise((r) => { const и = ++ид; ждут.set(и, r); сок.send(JSON.stringify({ id: и, method: м, params: п })); });
const жди = (мс) => new Promise((r) => setTimeout(r, мс));
const считай = async (к) => { const о = await шли('Runtime.evaluate', { expression: к, returnByValue: true, awaitPromise: true });
  if (о.result?.exceptionDetails) return { ОШИБКА: String(о.result.exceptionDetails.exception?.description).slice(0, 300) };
  return о.result.result.value; };
await шли('Page.enable'); await шли('Runtime.enable');

const беды = [];
const так = (условие, имя, подробно) => {
  if (условие) { console.log('  ✓ ' + имя); return true; }
  console.log('  ✗ ' + имя + (подробно ? '\n      ' + String(подробно).slice(0, 400) : ''));
  беды.push(имя);
  return false;
};
const иди = async (адрес) => { ошибки = []; await шли('Page.navigate', { url: САЙТ + адрес }); await жди(2200); };
/** Вписать значение так, как это делает человек: через настоящее событие. */
const вписать = (ид2, текст) => считай(`(() => {
  const п = document.getElementById(${JSON.stringify(ид2)});
  const кл = п.tagName === 'TEXTAREA' ? HTMLTextAreaElement : HTMLInputElement;
  Object.getOwnPropertyDescriptor(kлПроверка(кл), 'value').set.call(п, ${JSON.stringify(текст)});
  п.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
  function kлПроверка(к) { return к.prototype }
})()`);

// =============================================================================================
console.log('\n════ 1. JSON: /ru/json-formatter ════');
await иди('/ru/json-formatter');
{
  const образцы = [
    ['вложенность и типы', '{"а":[1,2,{"б":null,"в":true}],"г":"стро\\"ка","д":-1.5e3}'],
    ['пустые', '{"а":{},"б":[],"в":"","г":0,"д":false}'],
    ['юникод и переводы строк', '{"текст":"строка\\nвторая\\tтаб","знак":"\\u00e9"}'],
    ['скобки внутри строки', '{"код":"{ if (x) { y } }","путь":"a/b,c"}'],
  ];
  for (const [имя, ввод] of образцы) {
    await вписать('дж-ввод', ввод);
    await жди(400);
    const с = await считай('window.__джСостояние()');
    const вывод = с.вывод || '';
    let сошлось = false, почему = '';
    try {
      сошлось = JSON.stringify(JSON.parse(вывод)) === JSON.stringify(JSON.parse(ввод));
      if (!сошлось) почему = 'вывод: ' + вывод;
    } catch (е) { почему = 'вывод не разбирается: ' + вывод.slice(0, 200); }
    так(сошлось, `${имя}: значение не изменилось`, почему);
  }

  // Обещание страницы: длинные числа не портятся. Узел их портит -- на этом и ловим.
  await вписать('дж-ввод', '{"id":9007199254740993,"big":12345678901234567890,"точное":0.1000000000000000055511151231257827}');
  await жди(400);
  const длинные = (await считай('window.__джСостояние()')).вывод || '';
  так(длинные.includes('9007199254740993'), 'длинное целое сохранено в точности', длинные);
  так(длинные.includes('12345678901234567890'), 'очень длинное число сохранено', длинные);
  так(String(JSON.parse('{"id":9007199254740993}').id) === '9007199254740992',
    '…а узел его действительно портит -- значит проверка не пустая');

  // Битый JSON: должна быть жалоба, а не тихий мусор на выходе.
  for (const [имя, битый] of [['без запятой', '{"а":1 "б":2}'], ['лишняя запятая', '{"а":1,}'],
    ['оборвано', '{"а":['], ['одинарные кавычки', "{'а':1}"]]) {
    await вписать('дж-ввод', битый);
    await жди(400);
    const с = await считай('window.__джСостояние()');
    так(!!с.беда || !с.вывод, `${имя}: названа ошибкой, а не разобрана молча`,
      'вывод: ' + (с.вывод || '').slice(0, 120) + ' | беда: ' + JSON.stringify(с.беда));
  }
}

// =============================================================================================
console.log('\n════ 2. CSV ↔ JSON: /ru/csv-json ════');
await иди('/ru/csv-json');
{
  // Образцы прямо из RFC 4180: кавычки, запятая и перевод строки внутри поля.
  const csv = 'имя,примечание,число\r\n"Иванов, И.И.","строка\nвторая",42\r\nПетров,"он сказал ""да""",7';
  await вписать('цс-ввод', csv);
  await жди(500);
  const с1 = await считай('window.__цсСостояние()');
  let ряды = null;
  try { ряды = JSON.parse(с1.вывод); } catch (е) {}
  так(Array.isArray(ряды) && ряды.length === 2, 'две строки данных', JSON.stringify(с1.вывод).slice(0, 200));
  if (ряды && ряды.length === 2) {
    так(ряды[0]['имя'] === 'Иванов, И.И.', 'запятая внутри кавычек не разорвала поле', JSON.stringify(ряды[0]));
    так(ряды[0]['примечание'] === 'строка\nвторая', 'перевод строки внутри поля сохранён', JSON.stringify(ряды[0]));
    так(ряды[1]['примечание'] === 'он сказал "да"', 'удвоенные кавычки сняты', JSON.stringify(ряды[1]));
    так(ряды[0]['число'] === 42 || ряды[0]['число'] === '42', 'число прочитано', JSON.stringify(ряды[0]));
  }

  // Обратный круг: JSON -> CSV -> JSON должен вернуть то же самое.
  const исход = [{ а: 'зап,ятая', б: 'кав"ычка', в: 'пере\nвод', г: '' },
                 { а: 'простой', б: '2', в: 'да', г: 'x' }];
  const переключить = (куда) => считай(`(() => {
    const с2 = document.getElementById('цс-направление');
    с2.value = ${JSON.stringify(куда)};
    с2.dispatchEvent(new Event('change', { bubbles: true }));
    return с2.value;
  })()`);
  const переключено = await переключить('вcsv');
  await жди(300);
  await вписать('цс-ввод', JSON.stringify(исход, null, 2));
  await жди(600);
  const с2 = await считай('window.__цсСостояние()');
  console.log('    (направление: ' + (переключено || 'не переключилось') + ')');
  if (с2.вывод) {
    // Обратно в JSON тем же инструментом.
    await переключить('вjson');
    await жди(300);
    await вписать('цс-ввод', с2.вывод);
    await жди(600);
    const с3 = await считай('window.__цсСостояние()');
    let назад = null;
    try { назад = JSON.parse(с3.вывод); } catch (е) {}
    const сошлось = назад && JSON.stringify(назад.map((р) => Object.fromEntries(
      Object.entries(р).map(([к, з]) => [к, String(з)])))) === JSON.stringify(исход);
    так(сошлось, 'круг JSON → CSV → JSON вернул то же самое',
      'вышло: ' + JSON.stringify(назад).slice(0, 240));
  } else {
    так(false, 'JSON → CSV дал пустой вывод', JSON.stringify(с2).slice(0, 200));
  }
}

// =============================================================================================
console.log('\n════ 3. SQL: /ru/sql-formatter ════');
await иди('/ru/sql-formatter');
{
  const запросы = [
    ['обычный', "SELECT a.id, a.name FROM users a JOIN orders o ON o.uid=a.id WHERE a.age>18 AND a.city='Москва' ORDER BY a.id DESC"],
    ['строка со словами языка', "SELECT * FROM t WHERE note='select from where -- not a comment' AND x=1"],
    ['вложенный запрос', 'SELECT * FROM (SELECT id, SUM(x) AS s FROM t GROUP BY id HAVING SUM(x)>10) q WHERE q.s<100'],
    ['звёздочка и скобки в строке', "INSERT INTO t (a,b) VALUES ('/* не комментарий */','a,b')"],
  ];
  for (const [имя, запрос] of запросы) {
    await вписать('ск-ввод', запрос);
    await жди(600);
    const с = await считай('window.__скСостояние()');
    const вывод = с.вывод || '';
    // Судья: набор знаков без пробелов обязан совпасть. Форматирование не имеет права ни
    // потерять знак, ни дописать свой.
    const сжать = (т) => т.replace(/\s+/g, '');
    так(сжать(вывод) === сжать(запрос), `${имя}: ни одного знака не потеряно и не добавлено`,
      'было: ' + сжать(запрос).slice(0, 160) + '\n      стало: ' + сжать(вывод).slice(0, 160));
  }
}

// =============================================================================================
console.log('\n════ 4. Base64 файла: /ru/base64-file ════');
await иди('/ru/base64-file');
{
  const файлы = ['public/favicon-32.png', 'public/favicon.svg', 'public/icon-512.png'];
  for (const путь of файлы) {
    const полный = КОРЕНЬ + путь;
    const данные = readFileSync(полный);
    // Независимый судья: системная команда.
    const свой = execSync(`base64 -i ${JSON.stringify(полный)}`).toString().replace(/\s+/g, '');
    await считай(`(async () => {
      const б = new Uint8Array(${JSON.stringify(Array.from(данные))});
      const ф = new File([б], ${JSON.stringify(путь.split('/').pop())}, { type: 'application/octet-stream' });
      const дт = new DataTransfer(); дт.items.add(ф);
      const п = document.getElementById('бф-файл');
      п.files = дт.files; п.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 1200)); return true;
    })()`);
    await жди(600);
    const с = await считай('window.__бфСостояние()');
    const наш = String(с.вывод || '').replace(/^data:[^,]*,/, '').replace(/\s+/g, '');
    так(наш === свой, `${путь.split('/').pop()}: совпало с системной base64 (${данные.length} байт)`,
      'наш:  ' + наш.slice(0, 80) + '\n      свой: ' + свой.slice(0, 80));
  }
}

// =============================================================================================
console.log('\n════ 5. Генератор штрихкода: /ru/barcode ════');
await иди('/ru/barcode');
{
  const контрольная = (с) => { let сум = 0;
    for (let и = 0; и < с.length; и++) сум += (и % 2 === 0 ? 3 : 1) * Number(с[с.length - 1 - и]);
    return (10 - (сум % 10)) % 10; };
  const набор = [['EAN13', '5449000000996'], ['EAN13', '9780306406157'], ['EAN8', '46009333'],
    ['CODE128', 'ORDER-2026-11'], ['CODE39', 'ABC-123'], ['UPC', '012000000010']];
  for (const [формат, значение] of набор) {
    const итог = await считай(`(async () => {
      const ф = document.getElementById('шт-формат'); ф.value = ${JSON.stringify(формат)};
      ф.dispatchEvent(new Event('change', { bubbles: true }));
      const в = document.getElementById('шт-ввод');
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(в, ${JSON.stringify(значение)});
      в.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r => setTimeout(r, 400));
      const рис = document.getElementById('шт-рисунок');
      if (!рис || !рис.querySelector('rect, path, g')) return { нарисован: false };
      const blob = new Blob([new XMLSerializer().serializeToString(рис)], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const карт = await new Promise((r, j) => { const и = new Image(); и.onload = () => r(и); и.onerror = j; и.src = url; });
      const х = document.createElement('canvas');
      х.width = карт.naturalWidth * 3; х.height = карт.naturalHeight * 3;
      const р = х.getContext('2d');
      р.fillStyle = '#fff'; р.fillRect(0, 0, х.width, х.height);
      р.drawImage(карт, 0, 0, х.width, х.height);
      URL.revokeObjectURL(url);
      // Судья -- распознаватель самого браузера: другой код, чем тот, что рисовал.
      if (typeof BarcodeDetector === 'undefined') return { нарисован: true, прочитано: null };
      const д = new BarcodeDetector({ formats: ['ean_13','ean_8','upc_a','upc_e','code_128','code_39'] });
      const н = await д.detect(х);
      return { нарисован: true, прочитано: н.length ? н[0].rawValue : '', вид: н.length ? н[0].format : '' };
    })()`);
    // UPC-A и есть EAN-13 с нулём впереди: распознаватель на маке умеет только ean_13 и
    // называет его так. Это не расхождение, а тот же самый номер.
    const сошлось = итог.прочитано === значение
      || (формат === 'UPC' && итог.прочитано === '0' + значение);
    так(итог.нарисован && сошлось,
      `${формат} ${значение}: нарисован и прочитан обратно${итог.вид ? ' как ' + итог.вид : ''}`,
      JSON.stringify(итог));
  }
  // Контрольная цифра, дописанная самим инструментом.
  const без = '460068200011';
  const дописано = await считай(`(async () => {
    const ф = document.getElementById('шт-формат'); ф.value = 'EAN13';
    ф.dispatchEvent(new Event('change', { bubbles: true }));
    const в = document.getElementById('шт-ввод');
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(в, ${JSON.stringify(без)});
    в.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(r => setTimeout(r, 400));
    return document.getElementById('шт-замечание').textContent.trim();
  })()`);
  const ждём = контрольная(без);
  так(String(дописано).includes(String(ждём)), `контрольная цифра дописана верно (${ждём})`, дописано);
}

// =============================================================================================
console.log('\n════ ИТОГ ════');
if (беды.length) {
  console.log(`  НЕ СОШЛОСЬ: ${беды.length}`);
  беды.forEach((б) => console.log('    — ' + б));
} else {
  console.log('  всё сошлось');
}
хром.kill();
process.exit(беды.length ? 1 : 0);
