// РЕВИЗИЯ СТРАНИЦ, ГДЕ ЦЕНА ОШИБКИ ВЫШЕ ВСЕГО.
//
// Запуск:  npm run check:tools   -- и всё; предпросмотр она поднимает сама и гасит за собой.
//
// Раньше сервер надо было запустить руками в соседнем окне, а проверка молча ждала его на
// порту 4390. Запущенная без него, она открывала пустоту и выдавала стену красного: страницы
// не открылись, поля остались пустыми, «значение не изменилось». Проверка, которую можно
// запустить неправильно, однажды будет запущена неправильно -- и соврёт про рабочий сайт.
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
//   -- CSV         -- образцы из RFC 4180 и обратный круг;
//   -- время Unix  -- системная команда date, то есть часы самой операционной системы;
//   -- минификаторы -- разбор самого браузера: из сжатых стилей он обязан построить те же
//                     правила, а сжатая разметка обязана дать то же дерево и тот же текст;
//   -- хэши         -- системные команды md5 и shasum, то есть чужой счёт тех же строк;
//   -- JWT          -- openssl: токены подписываются чужой программой, тем же способом,
//                     каким их подписывает сервер;
//   -- разбор ссылок -- python3 urllib.parse, другая программа и другой код;
//   -- экранирование HTML -- python3 html.escape и html.unescape: чужая программа с полной
//                     таблицей мнемоник HTML5;
//   -- системы счисления -- python3: у него целые без предела, и format(x,'b'/'o'/'X')
//                     писали другие люди. Половина случаев лежит ЗА границей 2^53, где
//                     обычное число в JavaScript уже округляет;
//   -- сравнение текстов -- медленный, но заведомо верный способ: таблица наибольшей общей
//                     подпоследовательности. Другой код от другой мысли; сверяется ДЛИНА
//                     цепочки правок -- минимальная она одна, а путей к ней несколько;
//   -- сравнение кода   -- НАСТОЯЩАЯ системная команда patch: собранный на странице патч
//                     прикладывается к исходному файлу, и получившееся сверяется с тем,
//                     что ожидалось. Судья здесь чужая программа, а не наш же код;
//   -- .htaccess    -- НАСТОЯЩИЙ Apache. Отдельным испытанием (scripts/../апач) поднимается
//                     httpd 2.4 с AllowOverride All, собранный файл кладётся в корень, и
//                     сверяются коды ответов. Здесь, в браузерной ревизии, проверяется то,
//                     что можно проверить без сервера: состав файла и жалобы на ошибки.

import { spawn, execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Своя временная папка на каждый прогон: чужой профиль браузера трогать нельзя.
const Д = mkdtempSync(join(tmpdir(), 'opitro-ревизия-')) + '/';
const КОРЕНЬ = fileURLToPath(new URL('..', import.meta.url));
const САЙТ = 'http://localhost:4390';
const П = 10231;

// Предпросмотр поднимаем сами. Порт тот же, что и был; если на нём уже кто-то сидит (вы
// запустили предпросмотр руками), берём его и чужой процесс не трогаем.
let свойСервер = null;
const портЗанят = async () => {
  try { await fetch(САЙТ + '/ru'); return true; } catch (е) { return false; }
};
if (!(await портЗанят())) {
  свойСервер = spawn('npx', ['astro', 'preview', '--port', '4390'],
    { cwd: КОРЕНЬ, stdio: 'ignore' });
  let поднялся = false;
  for (let п = 0; п < 60; п++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await портЗанят()) { поднялся = true; break; }
  }
  if (!поднялся) {
    console.error('Предпросмотр не поднялся на порту 4390. Собран ли сайт? npm run build');
    try { свойСервер.kill(); } catch (е) {}
    process.exit(2);
  }
}

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
console.log('\n════ 6. Цвета: /ru/color-converter ════');
await иди('/ru/color-converter');
{
  // Судья -- сам браузер: он разбирает цвет по описанию CSS и своим кодом, не нашим.
  const образцы = ['#ff0000', '#00ff00', '#0000ff', '#808080', '#c0c0c0', '#ffa500', '#22c55e'];
  for (const hex of образцы) {
    await вписать('цв-hex', hex);
    await жди(220);
    const итог = await считай(`(() => {
      const с2 = window.__цвСостояние();
      // Просим браузер посчитать тот же цвет самостоятельно и сравниваем с нашим.
      const э = document.createElement('div');
      э.style.color = ${JSON.stringify(hex)};
      document.body.appendChild(э);
      const свой = getComputedStyle(э).color;
      э.remove();
      return { наш: с2.краска, свой, hsl: с2.строки[2][1] };
    })()`);
    так(итог.наш === итог.свой, `${hex}: RGB совпал с разбором самого браузера`,
      `наш ${итог.наш} / браузер ${итог.свой}`);
  }

  // Главное обещание страницы: цвет не уползает от движения ползунков.
  await вписать('цв-hex', '#c0c0c0');
  await жди(250);
  for (let и = 0; и < 20; и++) {
    await вписать('цв-п-s', String(40 + (и % 5) * 7));
    await вписать('цв-п-s', '0');
  }
  await жди(250);
  так((await считай('window.__цвСостояние()')).строки[0][1] === '#c0c0c0',
    'серебряный вернулся тем же после двадцати движений ползунка',
    (await считай('window.__цвСостояние()')).строки[0][1]);

  // Прозрачность переключает записи на современные.
  await вписать('цв-hex', '#00ff00');
  await жди(200);
  await вписать('цв-п-a', '50');
  await жди(250);
  const п2 = await считай('window.__цвСостояние()');
  так(п2.строки[0][1] === '#00ff0080' && п2.строки[1][1] === 'rgba(0, 255, 0, 0.5)',
    'при прозрачности HEX становится восьмизначным, а rgb -- rgba',
    JSON.stringify(п2.строки));
}

// =============================================================================================
console.log('\n════ 7. Палитры: /ru/color-palette ════');
await иди('/ru/color-palette');
{
  await вписать('пл-hex', '#22c55e');
  await жди(300);
  const с = await считай('window.__плСостояние()');
  так(с.цвета.length === 5 && с.цвета[1].код === '#22c55e',
    'пять плашек, основа стоит ровно та, что ввели', JSON.stringify(с.цвета.map((п) => п.код)));

  // Судья -- расчёт контраста, сделанный прямо здесь по описанию правил доступности, а не
  // нашим кодом: сверяем, что подпись на каждой плашке выбрана верно.
  const подписи = await считай(`(() => {
    const св = (с3) => { const м = с3.match(/\\d+/g).map(Number);
      const л = (з) => { const д = з / 255; return д <= 0.04045 ? д / 12.92 : Math.pow((д + 0.055) / 1.055, 2.4); };
      return 0.2126 * л(м[0]) + 0.7152 * л(м[1]) + 0.0722 * л(м[2]); };
    const к = (а, б) => { const в = Math.max(а, б), н = Math.min(а, б); return (в + 0.05) / (н + 0.05); };
    return [...document.querySelectorAll('.пл-полоса')].map((п) => {
      const ст = getComputedStyle(п);
      const фон = св(ст.backgroundColor), буквы = св(ст.color);
      return { лучше: к(фон, буквы) >= к(фон, буквы > 0.5 ? 0 : 1), контраст: к(фон, буквы) };
    });
  })()`);
  так(подписи.every((п) => п.лучше && п.контраст >= 4.5),
    'подпись на каждой плашке -- более контрастная, и не ниже 4,5',
    JSON.stringify(подписи.map((п) => +п.контраст.toFixed(2))));

  // Правила: сдвиги по кругу считает страница, а проверяем их через разбор цвета браузером.
  for (const [правило, ждём] of [['аналоговая', 5], ['триада', 5], ['монохромная', 5]]) {
    await считай(`(() => { const с2 = document.getElementById('пл-правило');
      с2.value = ${'$'}{JSON.stringify(правило)}; с2.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`
      .replace('${JSON.stringify(правило)}', JSON.stringify(правило)));
    await жди(250);
    const р = await считай('window.__плСостояние()');
    так(р.цвета.length === ждём && new Set(р.цвета.map((п) => п.код)).size === 5,
      `${правило}: пять плашек и все разные`, JSON.stringify(р.цвета.map((п) => п.код)));
  }

  const css2 = await считай('window.__плCss()');
  так(/^:root \{/.test(css2) && (css2.match(/--color-\d: #[0-9a-f]{6};/g) || []).length === 5,
    'вывоз в переменные CSS: пять штук в :root', css2.replace(/\n/g, ' '));
  const json2 = JSON.parse(await считай('window.__плJson()'));
  так(json2.base === '#22c55e' && json2.colors.length === 5 && typeof json2.rule === 'string',
    'вывоз в JSON: основа, правило и пять цветов', JSON.stringify(json2));
}

// =============================================================================================
console.log('\n════ 8. Контраст: /ru/contrast-checker ════');
await иди('/ru/contrast-checker');
{
  // Числа взяты из описания самих правил доступности -- опора чужая, не наш расчёт.
  const пары = [
    ['#000000', '#ffffff', 21, [true, true, true, true]],
    ['#ffffff', '#ffffff', 1, [false, false, false, false]],
    // Знаменитая граница: #777777 не дотягивает до 4,5, а #767676 дотягивает.
    ['#777777', '#ffffff', 4.48, [false, true, false, false]],
    ['#767676', '#ffffff', 4.54, [true, true, false, true]],
    ['#595959', '#ffffff', 7.0, [true, true, true, true]],
  ];
  for (const [текст, фон, ждём, уровни] of пары) {
    await вписать('кн-текст-hex', текст);
    await жди(120);
    await вписать('кн-фон-hex', фон);
    await жди(250);
    const с2 = await считай('window.__кнСостояние()');
    так(Math.abs(с2.отношение - ждём) < 0.02,
      `${текст} на ${фон}: отношение ${с2.отношение.toFixed(3)} (ждали около ${ждём})`,
      JSON.stringify(с2.число));
    так(JSON.stringify(с2.уровни.map((у) => у.прошло)) === JSON.stringify(уровни),
      `${текст} на ${фон}: четыре уровня расставлены верно`,
      JSON.stringify(с2.уровни.map((у) => [у.порог, у.прошло])));
  }

  // Окно показа обязано красить себя теми же цветами, что проверяются, иначе оно врёт.
  await вписать('кн-текст-hex', '#22c55e');
  await жди(120);
  await вписать('кн-фон-hex', '#101418');
  await жди(250);
  const п2 = await считай(`(() => {
    const п3 = document.getElementById('кн-показ');
    const ст = getComputedStyle(п3);
    return { фон: ст.backgroundColor, буквы: ст.color };
  })()`);
  так(п2.фон === 'rgb(16, 20, 24)' && п2.буквы === 'rgb(34, 197, 94)',
    'живой образец покрашен ровно проверяемой парой', JSON.stringify(п2));

  // Обмен местами не меняет числа -- отношение симметрично.
  const до = (await считай('window.__кнСостояние()')).отношение;
  await считай(`document.getElementById('кн-обмен').click()`);
  await жди(250);
  const после = await считай('window.__кнСостояние()');
  так(Math.abs(после.отношение - до) < 1e-9 && после.буквы === '#101418',
    'обмен местами: цвета поменялись, число то же',
    `${до.toFixed(3)} → ${после.отношение.toFixed(3)}, текст ${после.буквы}`);
}

// =============================================================================================
console.log('\n════ 9. Градиенты: /ru/css-gradient ════');
await иди('/ru/css-gradient');
{
  // Судья -- сам браузер: отдаём собранную строку живому свойству и смотрим, приняло ли.
  // Мусор он молча отбрасывает, и computed остаётся пустым.
  const принял = () => считай(`(() => {
    const с2 = window.__грСостояние();
    const э = document.createElement('div');
    э.style.backgroundImage = с2.строка;
    document.body.appendChild(э);
    const п2 = getComputedStyle(э).backgroundImage;
    э.remove();
    return { строка: с2.строка, принято: п2 !== 'none' && п2.length > 5 };
  })()`);

  const л = await принял();
  так(л.принято, 'линейный: браузер принял строку', л.строка);

  await считай(`document.querySelector('.гр-выбор[data-в="radial"]').click()`);
  await жди(250);
  const р = await принял();
  так(р.принято && /radial-gradient\(circle at center/.test(р.строка),
    'радиальный: принят и привязан к кругу', р.строка);
  await считай(`document.querySelector('.гр-выбор[data-в="linear"]').click()`);
  await жди(200);

  const с3 = await считай('window.__грСостояние()');
  так(с3.код.startsWith('background-color:') && /background-image: linear-gradient/.test(с3.код),
    'запасной цвет идёт ПЕРВОЙ строкой, градиент второй', с3.код.replace(/\n/g, ' | '));

  // Прозрачная точка не должна обесцветить запасной цвет: он ставится ради читаемости текста.
  await считай(`(() => { const м = document.querySelectorAll('.гр-метка')[0];
    м.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 0, clientY: 0 })); return true; })()`);
  await жди(200);
  await вписать('гр-альфа-ч', '0');
  await жди(250);
  const п3 = await считай('window.__грСостояние()');
  так(/^#[0-9a-f]{6}$/.test(п3.запасной) && п3.запасной !== '#000000' && /rgba\(/.test(п3.строка),
    'при прозрачной точке запасной цвет остался плотным и осмысленным',
    `${п3.запасной} | ${п3.строка}`);
  const пп = await принял();
  так(пп.принято, 'строка с прозрачной точкой тоже принята браузером', пп.строка);
}

// =============================================================================================
console.log('\n════ 10. Тени: /ru/box-shadow ════');
await иди('/ru/box-shadow');
{
  // Судья -- сам браузер: отдаём строку живому свойству и смотрим, приняло ли.
  const принял = () => считай(`(() => {
    const с2 = window.__тнСостояние();
    const э = document.createElement('div');
    э.style.boxShadow = с2.строка;
    document.body.appendChild(э);
    const п2 = getComputedStyle(э).boxShadow;
    э.remove();
    return { строка: с2.строка, принято: п2 !== 'none' && п2.length > 5, слоёв: с2.слоёв };
  })()`);

  const о = await принял();
  так(о.принято && о.слоёв === 1, 'начальная тень: один слой, браузер принял', о.строка);

  // Готовая мягкая тень: три слоя, плотность падает от ближнего к дальнему.
  await считай(`document.getElementById('тн-мягкая').click()`);
  await жди(250);
  const м = await принял();
  так(м.принято && м.слоёв === 3, 'готовая мягкая тень: три слоя, приняты', м.строка);
  const плотности = await считай(`window.__тнСостояние().слои
    .map((с2) => { const м2 = с2.match(/rgba\\([^)]*?([\\d.]+)\\)/); return м2 ? Number(м2[1]) : 1; })`);
  так(плотности.every((з, и) => и === 0 || з < плотности[и - 1]),
    'плотность слоёв убывает от ближнего к дальнему', JSON.stringify(плотности));

  // Внутренняя тень пишется словом inset и тоже принимается.
  await считай(`document.getElementById('тн-сбросить').click()`);
  await жди(200);
  await считай(`(() => { const г = document.getElementById('тн-внутрь');
    г.checked = true; г.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
  await жди(250);
  const вн = await принял();
  так(вн.принято && /^inset /.test(вн.строка), 'внутренняя тень: слово inset впереди, принято', вн.строка);

  // Последний слой убрать нельзя, и об этом сказано.
  await считай(`document.getElementById('тн-сбросить').click()`);
  await жди(200);
  await считай(`document.getElementById('тн-убрать').click()`);
  await жди(200);
  const п3 = await считай('window.__тнСостояние()');
  так(п3.слоёв === 1 && п3.беда.length > 10,
    'последний слой не убирается, и сказано почему', JSON.stringify(п3.беда).slice(0, 90));

  так((await считай('window.__тнСостояние()')).код.startsWith('box-shadow:'),
    'код начинается со свойства box-shadow', (await считай('window.__тнСостояние()')).код);
}

// =============================================================================================
console.log('\n════ 11. Скругление: /ru/border-radius ════');
await иди('/ru/border-radius');
{
  const принял = () => считай(`(() => {
    const с2 = window.__руСостояние();
    const э = document.createElement('div');
    э.style.borderRadius = с2.строка;
    document.body.appendChild(э);
    const п2 = getComputedStyle(э).borderRadius;
    э.remove();
    return { строка: с2.строка, принято: п2 !== '' && п2 !== '0px', режим: с2.режим };
  })()`);

  const о = await принял();
  так(о.принято && !/\//.test(о.строка),
    'простой режим: короткая запись без косой черты, принята', о.строка);

  await считай(`document.querySelector('.ру-выбор[data-р="сложный"]').click()`);
  await жди(200);
  await считай(`document.getElementById('ру-случай').click()`);
  await жди(250);
  const б = await принял();
  так(б.принято && /\s\/\s/.test(б.строка),
    'сложный режим: восемь чисел через косую черту, принято', б.строка);

  // Правило CSS, о котором мало кто знает: если радиусы не помещаются, браузер уменьшает их
  // ВСЕ на один множитель. Страница обязана об этом сказать, иначе выглядит поломкой.
  await считай(`document.getElementById('ру-сбросить').click()`);
  await жди(200);
  await считай(`(() => { for (const к of ['%']) {
    document.querySelector('.ру-выбор[data-е="%"]').click(); } return true; })()`);
  await жди(200);
  await вписать('ру-ч-лв', '100');
  await жди(300);
  const с4 = await считай('window.__руСостояние()');
  так(с4.весть.length > 20, 'при крайних значениях сказано, что браузер ужал скругления',
    с4.весть.slice(0, 90));

  // А в обычном положении предупреждения быть не должно.
  await считай(`document.getElementById('ру-сбросить').click()`);
  await жди(300);
  так((await считай('window.__руСостояние()')).весть === '',
    'при обычных значениях предупреждения нет');

  так((await считай('window.__руСостояние()')).код.startsWith('border-radius:'),
    'код начинается со свойства border-radius');
}

// =============================================================================================
console.log('\n════ 12. Markdown ↔ HTML: /ru/markdown-html ════');
await иди('/ru/markdown-html');
{
  const подать = (текст) => считай(`(async () => {
    const п = document.getElementById('мх-ввод');
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(п, ${'$'}{JSON.stringify(текст)});
    await window.__мхЖдать();
    return true;
  })()`.replace('${JSON.stringify(текст)}', JSON.stringify(текст)));
  const направление = (куда) => считай(`(async () => {
    const с2 = document.getElementById('мх-направление');
    с2.value = ${'$'}{JSON.stringify(куда)};
    await window.__мхЖдать();
    return с2.value;
  })()`.replace('${JSON.stringify(куда)}', JSON.stringify(куда)));

  await направление('вhtml');
  await подать('# Заголовок\n\nтекст **жирный** и [ссылка](https://example.com)');
  await жди(200);
  const п1 = await считай('window.__мхСостояние()');
  так(/<h1>Заголовок<\/h1>/.test(п1.вывод) && /<strong>жирный<\/strong>/.test(п1.вывод)
    && /href="https:\/\/example\.com"/.test(п1.вывод),
    'Markdown → HTML: заголовок, выделение и ссылка на месте', п1.вывод.slice(0, 120));

  await направление('вmd');
  await подать('<h2>Раздел</h2><p>текст <em>косой</em></p>');
  await жди(250);
  const п2 = await считай('window.__мхСостояние()');
  так(/## Раздел/.test(п2.вывод) && /текст \*косой\*/.test(п2.вывод),
    'HTML → Markdown: заголовок и выделение', п2.вывод.replace(/\n/g, ' | ').slice(0, 120));

  // САМОЕ ВАЖНОЕ: очистка. Приёмы настоящие, а не выдуманные.
  const опасные = [
    ['<script>alert(1)</script><p>т</p>', 'script', 'скрипт'],
    ['<img src=x onerror="alert(1)">', 'onerror', 'обработчик на картинке'],
    ['<a href="javascript:alert(1)">т</a>', 'javascript:', 'ссылка со скриптом'],
    ['<a href="jav&#9;ascript:alert(1)">т</a>', 'ascript:', 'схема, скрытая табуляцией'],
    ['<a href="data:text/html;base64,PHNjcmlwdD4=">т</a>', 'data:text/html', 'разметка в data:'],
    ['<scr<script>ipt>alert(1)</scr</script>ipt>', '<script', 'разорванный тег'],
    ['<p style="color:red">т</p>', 'style=', 'стиль в свойстве'],
    ['<iframe src="https://example.com"></iframe>', '<iframe', 'чужая рамка'],
    ['<svg><script>alert(1)</script></svg>', '<svg', 'скрипт внутри svg'],
  ];
  let отбито = 0;
  for (const [ввод, чего, имя] of опасные) {
    await подать(ввод);
    await жди(160);
    const с2 = await считай('window.__мхСостояние()');
    const прошло = !с2.вывод.includes(чего) && !с2.вРамке.includes(чего);
    if (прошло) отбито++;
    else console.log(`      ✗ пропущено: ${имя} («${чего}»)`);
  }
  так(отбито === опасные.length, `очистка отбила все ${опасные.length} приёма`,
    `отбито ${отбито} из ${опасные.length}`);

  // Показ заперт ВСЕГДА, даже когда очистка выключена.
  await считай(`document.getElementById('мх-чистить').checked = false`);
  await подать('<script>window.ПРОБИЛСЯ = 1</script><p>т</p>');
  await жди(400);
  const с3 = await считай('window.__мхСостояние()');
  const пробился = await считай('typeof window.ПРОБИЛСЯ');
  так(с3.рамкаЗаперта && !с3.вРамке.includes('<script') && пробился === 'undefined',
    'показ заперт и при снятой галочке: на странице ничего не выполнилось',
    `заперта ${с3.рамкаЗаперта}, пробился ${пробился}`);
  await считай(`document.getElementById('мх-чистить').checked = true`);
}

// =============================================================================================
console.log('\n════ 13. Круг «генератор QR → сканер QR» ════');
//
// Эта проверка не про одну страницу, а про ДОГОВОР между двумя файлами. qr-payload.js
// собирает строку Wi-Fi и визитки, qr-read.js её разбирает. По отдельности каждая страница
// проходит свои проверки как ни в чём не бывало, а расхождение между ними не ловит никто:
// поправишь экранирование в одном и забудешь в другом -- пароль от сети приедет человеку с
// лишними косыми чертами. Поэтому круг: сгенерировали, прочитали своим же сканером, сверили.
{
  // Знаки нарочно те, что и ломают экранирование: точка с запятой, кавычка, косая,
  // запятая и двоеточие. Плюс кириллица -- на ней генератор однажды уже спотыкался.
  const сеть = { имя: 'Кафе «Ёлка»; 2', пароль: 'Pa;ss"wo\\rd,1:2' };
  const визитка = { имя: 'Иван', фамилия: 'Петров-Водкин', орг: 'ООО «Ромашка; и Ко»' };

  const снять = () => считай(`(async () => {
    await new Promise(r => setTimeout(r, 300));
    const рис = document.getElementById('кр-код').querySelector('svg');
    if (!рис) return '';
    const blob = new Blob([new XMLSerializer().serializeToString(рис)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const карт = await new Promise((r, j) => { const и = new Image(); и.onload = () => r(и); и.onerror = j; и.src = url; });
    const х = document.createElement('canvas');
    // Крупнее исходного: мелкий растр сканер читает хуже, а нам проверять договор, а не резкость.
    х.width = 600; х.height = 600;
    const р = х.getContext('2d');
    р.fillStyle = '#fff'; р.fillRect(0, 0, 600, 600);
    р.imageSmoothingEnabled = false;
    р.drawImage(карт, 0, 0, 600, 600);
    URL.revokeObjectURL(url);
    return х.toDataURL('image/png');
  })()`);

  const прочитать = async (дурл, имя) => {
    await иди('/ru/qr-scan');
    await считай(`document.querySelector('.ск2-выбор[data-р="photo"]').click()`);
    await жди(200);
    await считай(`(async () => {
      const б = await (await fetch(${JSON.stringify(дурл)})).blob();
      const дт = new DataTransfer(); дт.items.add(new File([б], 'к.png', { type: 'image/png' }));
      const п = document.getElementById('ск2-файл');
      п.files = дт.files; п.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 2200));
      return true;
    })()`);
    const с2 = await считай('window.__ск2Состояние()');
    return с2;
  };

  // --- 1. Сеть Wi-Fi -------------------------------------------------------------------------
  await иди('/ru/qr-code');
  await считай(`document.querySelector('.кр-выбор[data-к="wifi"]').click()`);
  await жди(200);
  await вписать('кр-ssid', сеть.имя);
  await вписать('кр-pass', сеть.пароль);
  await жди(400);
  const картинкаСети = await снять();
  так(!!картинкаСети, 'сеть: код нарисован');
  if (картинкаСети) {
    const итог = await прочитать(картинкаСети, 'сеть');
    // Сканер показывает имя и пароль отдельными строками -- ищем их в разобранном виде.
    const текст = итог.итог || '';
    так(текст.includes(сеть.имя) && текст.includes(сеть.пароль),
      'сеть: имя и пароль вернулись ровно теми, что вводили',
      `в разборе: ${текст.replace(/\s+/g, ' ').slice(0, 160)}`);
  }

  // --- 2. Визитка ----------------------------------------------------------------------------
  await иди('/ru/qr-code');
  await считай(`document.querySelector('.кр-выбор[data-к="card"]').click()`);
  await жди(200);
  await вписать('кр-first', визитка.имя);
  await вписать('кр-last', визитка.фамилия);
  await вписать('кр-org', визитка.орг);
  await жди(400);
  const картинкаВизитки = await снять();
  так(!!картинкаВизитки, 'визитка: код нарисован');
  if (картинкаВизитки) {
    const итог = await прочитать(картинкаВизитки, 'визитка');
    const текст = итог.итог || '';
    так(текст.includes(визитка.фамилия) && текст.includes(визитка.орг),
      'визитка: фамилия и организация вернулись с точкой с запятой на месте',
      `в разборе: ${текст.replace(/\s+/g, ' ').slice(0, 160)}`);
  }

  // --- 3. Кириллица в ссылке -----------------------------------------------------------------
  await иди('/ru/qr-code');
  await считай(`document.querySelector('.кр-выбор[data-к="text"]').click()`);
  await жди(200);
  await вписать('кр-текст', 'Проверка кириллицы: ёжик, «кавычки» и — тире');
  await жди(400);
  const картинкаТекста = await снять();
  так(!!картинкаТекста, 'текст: код нарисован');
  if (картинкаТекста) {
    const итог = await прочитать(картинкаТекста, 'текст');
    так(итог.найдено === 'Проверка кириллицы: ёжик, «кавычки» и — тире',
      'кириллица прошла круг без потерь', итог.найдено);
  }
}

// =============================================================================================
console.log('\n════ 14. RegEx тестер: /ru/regex-tester ════');
await иди('/ru/regex-tester');
{
  const задать = (выражение, текст, флаги) => считай(`(async () => {
    const в = document.getElementById('рг-выражение');
    const т = document.getElementById('рг-текст');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(в, ` +
      JSON.stringify(выражение) + `);
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(т, ` +
      JSON.stringify(текст) + `);
    for (const ф of ['g', 'i', 'm']) document.getElementById('рг-ф-' + ф).checked = ` +
      JSON.stringify(флаги) + `.includes(ф);
    await window.__ргЖдать();
    return true;
  })()`);

  await задать(String.raw`(\d{4})-(\d{2})-(\d{2})`, 'дата 2026-09-06 конец', 'g');
  await жди(250);
  const о = await считай('window.__ргСостояние()');
  так(JSON.stringify(о.совпадения) === JSON.stringify(['2026-09-06'])
    && JSON.stringify(о.группы.map((г) => г.текст)) === JSON.stringify(['2026', '09', '06']),
    'находка и три группы разобраны', JSON.stringify(о.совпадения) + ' / ' + JSON.stringify(о.группы));

  await задать('^раз', 'раз\nраз\nраз', 'g');
  await жди(200);
  const б1 = (await считай('window.__ргСостояние()')).найдено;
  await задать('^раз', 'раз\nраз\nраз', 'gm');
  await жди(200);
  const б2 = (await считай('window.__ргСостояние()')).найдено;
  так(б1 === 1 && б2 === 3, 'флаг «по строкам» переносит якоря', `${б1} → ${б2}`);

  await задать('(', 'текст', 'g');
  await жди(300);
  const о2 = await считай('window.__ргСостояние()');
  так(о2.беда.length > 5, 'сломанное выражение названо ошибкой движка', о2.беда.slice(0, 70));

  // ГЛАВНОЕ: злое выражение не должно убить вкладку. Классический перебор разбиений --
  // счёт на таком не кончается никогда, и остановить его из своего потока нельзя.
  await задать('(a+)+$', 'a'.repeat(34) + 'b', 'g');
  await жди(2600);
  const о3 = await считай('window.__ргСостояние()');
  const живая = await считай('1 + 1');
  так(о3.зациклилось && живая === 2,
    'злое выражение прервано, страница жива', `зациклилось ${о3.зациклилось}, страница ${живая}`);

  // И после этого инструмент обязан продолжать работать.
  await задать(String.raw`\d+`, 'снова 42', 'g');
  await жди(400);
  так(JSON.stringify((await считай('window.__ргСостояние()')).совпадения) === JSON.stringify(['42']),
    'после прерывания поиск снова работает');

  // Пустое совпадение: наивный цикл на нём вечен.
  const н2 = Date.now();
  await задать('a*', 'aaa bbb', 'g');
  await жди(400);
  const о4 = await считай('window.__ргСостояние()');
  так(о4.найдено > 0 && !о4.зациклилось && Date.now() - н2 < 4000,
    'пустые совпадения показаны и не зациклили поиск', `найдено ${о4.найдено}`);
}

// =============================================================================================
console.log('\n════ 15. UUID: /ru/uuid-generator ════');
await иди('/ru/uuid-generator');
{
  const задать = (сколько, версия, заглавными, безДефисов) => считай(`(async () => {
    const п = document.getElementById('ид-сколько');
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(п, '` + сколько + `');
    document.getElementById('ид-версия').value = '` + версия + `';
    document.getElementById('ид-заглавными').checked = ` + !!заглавными + `;
    document.getElementById('ид-безДефисов').checked = ` + !!безДефисов + `;
    window.__идСделать();
    return true;
  })()`);

  // Судья -- разбор строки по стандарту, написанный ПРЯМО ЗДЕСЬ, а не наш же uuid.js.
  const годенТут = (с2, версия) => {
    const без = String(с2).trim().toLowerCase().replace(/-/g, '');
    if (!/^[0-9a-f]{32}$/.test(без)) return false;
    if (String(без[12]) !== String(версия)) return false;
    return '89ab'.includes(без[16]);
  };

  await задать(200, 4, false, false);
  await жди(400);
  const с4 = await считай('window.__идСостояние()');
  const всеГодны = с4.строки.length === 200 && с4.строки.every((к) => годенТут(к, 4));
  const всеРазные = new Set(с4.строки).size === 200;
  так(всеГодны && всеРазные,
    '200 ключей v4: у всех верны версия и разновидность, все разные',
    `строк ${с4.строки.length}, разных ${new Set(с4.строки).size}`);

  await задать(200, 7, false, false);
  await жди(400);
  const с7 = await считай('window.__идСостояние()');
  const порядок = с7.строки.every((к, и) => и === 0 || к > с7.строки[и - 1]);
  так(с7.строки.every((к) => годенТут(к, 7)) && порядок,
    'v7: стандарту соответствуют и идут строго по возрастанию',
    `порядок ${порядок}`);
  // И проверка не пустая: v4 порядка держать не должен.
  const безПорядка = !с4.строки.every((к, и) => и === 0 || к > с4.строки[и - 1]);
  так(безПорядка, 'v4 порядка не держит -- значит проверка выше не пустая');

  // Вид записи меняется НА МЕСТЕ, не выдавая новых ключей.
  await задать(5, 4, false, false);
  await жди(300);
  const было = (await считай('window.__идСостояние()')).ключи;
  await считай(`(() => {
    const г = document.getElementById('ид-безДефисов');
    г.checked = true; г.dispatchEvent(new Event('change', { bubbles: true }));
    const з = document.getElementById('ид-заглавными');
    з.checked = true; з.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await жди(250);
  const стало = await считай('window.__идСостояние()');
  так(JSON.stringify(стало.ключи) === JSON.stringify(было)
    && стало.строки.every((к) => /^[0-9A-F]{32}$/.test(к)),
    'галочки меняют вид записи, а не выдают новые ключи',
    стало.строки[0]);

  // Границы количества.
  await задать(9999, 4, false, false);
  await жди(500);
  так((await считай('window.__идСостояние()')).строки.length === 500,
    'больше пятисот за раз не выдаём');
}

// =============================================================================================
console.log('\n════ 16. Время Unix: /ru/unix-timestamp ════');
await иди('/ru/unix-timestamp');
{
  // СУДЬЯ -- системная команда date. Всемирное время не зависит от настроек этой машины,
  // поэтому сверяем именно его: пояс браузера ревизии мы не задаём.
  const судья = (секунды) =>
    execSync(`date -u -r ${секунды} '+%Y-%m-%d %H:%M:%S'`).toString().trim();

  const задатьМетку = async (текст) => {
    await считай(`window.__юнЗадать(${JSON.stringify(текст)})`);
    await жди(140);
    return считай('window.__юнСостояние()');
  };

  // Опорные метки. 2100 год взят нарочно: он делится на четыре, но високосным не является,
  // и самодельные календари спотыкаются именно здесь.
  let сошлось = 0;
  const набор = [0, 1, 1000000000, 1234567890, 2147483647, 1788692700, 951782400, 4107542400];
  for (const м of набор) {
    const с = await задатьМетку(String(м));
    if (с.utc === судья(м) + ' UTC') сошлось++;
    else так(false, `метка ${м} совпала с системными часами`, `${с.utc} против ${судья(м)}`);
  }
  так(сошлось === набор.length, `${набор.length} опорных меток сошлись с системной командой date`);

  // Отрицательные метки -- то, о чём молчит правило «считай знаки».
  let доЭпохи = 0;
  for (const м of [-1, -86400, -2208988800]) {
    const с = await задатьМетку(String(м));
    if (с.utc === судья(м) + ' UTC') доЭпохи++;
  }
  так(доЭпохи === 3, 'три метки до 1970 года разобраны верно');

  // Определение единиц: то же мгновение, записанное четырьмя способами.
  const четыре = [['1788692700', 'с'], ['1788692700000', 'мс'],
                  ['1788692700000000', 'мкс'], ['1788692700000000000', 'нс']];
  let единиц = 0, датой = 0;
  for (const [текст, ждём] of четыре) {
    const с = await задатьМетку(текст);
    if (с.выбранаЕдиница === ждём) единиц++;
    if (с.utc === судья(1788692700) + ' UTC') датой++;
  }
  так(единиц === 4, 'секунды, миллисекунды, микро- и наносекунды различены');
  так(датой === 4, 'все четыре записи дают одно и то же мгновение');

  // Края, где ходовое правило разваливается.
  const девять = await задатьМетку('999999999');
  так(девять.выбранаЕдиница === 'с' && девять.utc === судья(999999999) + ' UTC',
    'девять знаков всё-таки секунды, а не миллисекунды', девять.utc);
  const ноль = await задатьМетку('0');
  так(ноль.utc === '1970-01-01 00:00:00 UTC', 'ноль -- начало эпохи', ноль.utc);
  const минус = await задатьМетку('-86400');
  так(минус.выбранаЕдиница === 'с', 'отрицательная метка читается как секунды, а не наносекунды');

  // Плашка про 2038 год. Смотрим НА ЭКРАН, а не на свойство hidden: правило display в стилях
  // сильнее, чем display:none у браузера, и спрятанное умеет оставаться на виду.
  const видна = () => считай(`(() => { const у = document.querySelector('.юн-метка38');
    const с = getComputedStyle(у); return с.display !== 'none' && у.getBoundingClientRect().height > 0; })()`);
  await задатьМетку('2147483647');
  const наПределе = await видна();
  await задатьМетку('2147483648');
  const заПределом = await видна();
  так(!наПределе && заПределом,
    'плашка «2038+» зажигается ровно на следующей секунде после предела',
    `на пределе ${наПределе}, за пределом ${заПределом}`);

  // Мусор не должен показываться как дата.
  let отвергнуто = 0;
  for (const п of ['abc', '12.5', '1e9', '']) {
    const с = await задатьМетку(п);
    if (с.utc === '—' && !(await считай(`(() => { const у = document.querySelector('.юн-чипы');
      return getComputedStyle(у).display !== 'none'; })()`))) отвергнуто++;
  }
  так(отвергнуто === 4, 'мусор отвергнут, а не показан как Invalid Date');

  // Обратный ход. Часовой пояс задаём явно -- иначе ответ зависел бы от машины ревизии.
  await считай(`[...document.querySelectorAll('[data-пояс="utc"]')][0].click()`);
  await жди(150);
  let назад = 0;
  const обратные = [['1970-01-01T00:00:00', '0'], ['2038-01-19T03:14:07', '2147483647'],
                    ['2026-09-06T11:05:00', '1788692700'], ['2000-02-29T00:00:00', '951782400']];
  for (const [дата, ждём] of обратные) {
    await считай(`window.__юнДата(${JSON.stringify(дата)})`);
    await жди(140);
    if ((await считай('window.__юнСостояние()')).итог === ждём) назад++;
  }
  так(назад === обратные.length, 'обратный ход по UTC собирает метки точно');

  // И круг: метка -> дата -> метка. Судья тут -- сама страница, но два её разных конца.
  let круг = 0;
  for (const м of [0, 1000000000, 1788692700, 2147483647, -86400]) {
    const с = await задатьМетку(String(м));
    const дата = с.utc.replace(' UTC', '').replace(' ', 'T');
    await считай(`window.__юнДата(${JSON.stringify(дата)})`);
    await жди(130);
    if ((await считай('window.__юнСостояние()')).итог === String(м)) круг++;
  }
  так(круг === 5, 'круг «метка → дата → метка» замкнулся на пяти метках, включая отрицательную');

  так(ошибки.length === 0, 'на странице времени не было исключений', ошибки[0]);
}

// =============================================================================================
console.log('\n════ 17. Минификаторы: /ru/minify-css, /ru/minify-html, /ru/minify-js ════');
{
  const сжать = async (текст, н) =>
    считай(`window.__мнСжать(${JSON.stringify(текст)}, ${JSON.stringify(н || null)})`);

  // ---- CSS -------------------------------------------------------------------------------
  await иди('/ru/minify-css');
  const ловушкиCSS = [
    ['.a{width:calc(100% - 10px)}', '.a{width:calc(100% - 10px)}', 'пробелы в calc'],
    ['#aabbcc{color:#aabbcc}', '#aabbcc{color:#abc}', 'селектор по имени против цвета'],
    ['a{transition:0s}', 'a{transition:0s}', 'единица времени у нуля'],
    ['@keyframes к{0%{opacity:0}}', '@keyframes к{0%{opacity:0}}', 'проценты в @keyframes'],
    [':root{--о:0px}.a{width:calc(100% - var(--о))}',
     ':root{--о:0px}.a{width:calc(100% - var(--о))}', 'собственное свойство'],
    ['a{content:"/* не комментарий */"}', 'a{content:"/* не комментарий */"}', 'строка с комментарием'],
    ['a{margin:0px;padding:0.50rem;color:rgb(0,0,0)}', 'a{margin:0;padding:.5rem;color:#000}',
     'что и должно сжаться'],
  ];
  let целых = 0;
  for (const [вход, ждём, имя] of ловушкиCSS) {
    const р = await сжать(вход);
    if (р.вывод === ждём) целых++;
    else так(false, `CSS, ${имя}`, `${р.вывод} вместо ${ждём}`);
  }
  так(целых === ловушкиCSS.length, `CSS: все ${ловушкиCSS.length} ловушек обойдены`);

  // СУДЬЯ: настоящий разбор браузера. Сжимаем стили самой этой страницы и требуем, чтобы
  // браузер построил из сжатого тот же состав правил, что из исходного.
  await считай(`window.__состав = (css) => {
    const с = document.createElement('style');
    с.textContent = css; document.head.appendChild(с);
    const собрать = (п) => [...п].map((г) => {
      if (г.style) return (г.selectorText || г.keyText || '@') + '{'
        + [...г.style].map((и) => и + '=' + г.style.getPropertyValue(и).replace(/\\s+/g, '')).join(';') + '}';
      if (г.cssRules) return (г.conditionText || г.name || '@') + '[' + собрать(г.cssRules).join('|') + ']';
      return г.cssText;
    });
    let итог; try { итог = собрать(с.sheet.cssRules); } catch (е) { итог = ['ОШИБКА']; }
    с.remove(); return итог;
  }`);
  {
    // Берём стили, которые уже лежат на странице, -- настоящие, не придуманные.
    const исходник = await считай(`[...document.querySelectorAll('style')]
      .map((у) => у.textContent).join('\\n').slice(0, 60000)`);
    const р = await сжать(исходник);
    const было = await считай(`window.__состав(${JSON.stringify(исходник)})`);
    const стало = await считай(`window.__состав(${JSON.stringify(р.вывод)})`);
    так(JSON.stringify(было) === JSON.stringify(стало) && (было || []).length > 20,
      `CSS: браузер строит из сжатого тот же состав правил (${(было || []).length} правил)`,
      JSON.stringify(стало).slice(0, 200));
    // И судья не спит: от порчи calc свойство пропадает.
    const порча = await считай(`window.__состав('a{width:calc(100%-10px)}')`);
    const цело = await считай(`window.__состав('a{width:calc(100% - 10px)}')`);
    так(JSON.stringify(порча) !== JSON.stringify(цело), 'CSS: судья не спит');
  }

  // ---- HTML ------------------------------------------------------------------------------
  await иди('/ru/minify-html');
  const ловушкиHTML = [
    ['<p><b>два</b> <i>слова</i></p>', '<p><b>два</b> <i>слова</i></p>', 'пробел между строчными'],
    ['<div>\n  <h1>Х</h1>\n</div>', '<div><h1>Х</h1></div>', 'пробел между блочными'],
    ['<pre>  два  пробела</pre>', '<pre>  два  пробела</pre>', 'дословное pre'],
    ['<a title="раз>два">я</a>', '<a title="раз>два">я</a>', 'знак больше в кавычках'],
    ['<!--[if lt IE 9]><p>x</p><![endif]-->', '<!--[if lt IE 9]><p>x</p><![endif]-->',
     'условный комментарий'],
    ['<input disabled="disabled">', '<input disabled>', 'избыточное свойство'],
    ['<style>a { color : red ; }</style>', '<style>a{color:red}</style>', 'встроенный CSS'],
    ['<!-- Test Comment -->\n<div class="container">\n    <h1>Hello World</h1>\n</div>',
     '<div class="container"><h1>Hello World</h1></div>', 'пример из задания'],
  ];
  let целыхH = 0;
  for (const [вход, ждём, имя] of ловушкиHTML) {
    const р = await сжать(вход);
    if (р.вывод === ждём) целыхH++;
    else так(false, `HTML, ${имя}`, `${р.вывод} вместо ${ждём}`);
  }
  так(целыхH === ловушкиHTML.length, `HTML: все ${ловушкиHTML.length} ловушек обойдены`);

  // ---- JS --------------------------------------------------------------------------------
  await иди('/ru/minify-js');
  {
    const пример = 'function calculateTotal(price, quantity) {\n  // Налог\n'
      + '  let taxRate = 0.2;\n  return (price * quantity) * (1 + taxRate);\n}';
    const р = await сжать(пример);
    так(р.вывод === 'function calculateTotal(t,a){return t*a*1.2}',
      'JS: имена сокращены, арифметика свёрнута', р.вывод);
    так(/%/.test(р.числа), `JS: счётчики заполнены`, р.числа);
  }
  {
    const р = await сжать('function f(){ let свой=1; return window.глобальный + свой; }');
    так(/window\.глобальный/.test(р.вывод), 'JS: чужие имена не тронуты', р.вывод);
  }
  {
    const р = await сжать('function f(){\n let a=1;\n return a;\n');
    так(!р.вывод && /строка/.test(р.беда), 'JS: незакрытая скобка названа со строкой', р.беда);
    const видна = await считай(`(() => { const у = document.querySelector('.мн-беда');
      return getComputedStyle(у).display !== 'none' && у.getBoundingClientRect().height > 0; })()`);
    так(видна, 'JS: жалоба видна на экране, а не только в свойстве');
  }
  так((await сжать('let a=1;')).вывод === 'let a=1;', 'JS: после ошибки работа продолжается');

  // Разбор не должен грузиться раньше нажатия -- это обещание страницы про её лёгкость.
  {
    const ряд = await считай(`JSON.stringify([...document.querySelectorAll('script[src]')]
      .map((у) => у.getAttribute('src')))`);
    так(!/\/main\./.test(ряд), 'JS: разбор не подключён к странице, а подтягивается по нажатию');
  }

  так(ошибки.length === 0, 'на страницах минификаторов не было исключений', ошибки[0]);
}

// =============================================================================================
console.log('\n════ 18. Генератор .htaccess: /ru/htaccess-generator ════');
await иди('/ru/htaccess-generator');
{
  const собрать = (н) => считай(`window.__хтСобрать(${JSON.stringify(н)})`);

  {
    const р = await собрать({
      домен: 'example.com', https: true, заПосредником: true, зеркала: 'без-www',
      листинг: true, хотлинк: true, сжатие: true, кэш: true, адреса: '203.0.113.5',
      переносы: [{ откуда: '/old-page', куда: 'https://example.com/new' }],
    });
    const надо2 = [
      ['RewriteEngine On', 'движок переписывания включён'],
      ['X-Forwarded-Proto', 'взгляд на заголовок посредника -- без него вечный круг'],
      ['RewriteRule ^old-page/?$ https://example.com/new [R=301,L]', 'своё перенаправление'],
      ['RewriteCond %{HTTP_REFERER} !^$', 'пустой источник перехода разрешён'],
      ['Require not ip 203.0.113.5', 'запрет по адресу на наречии Apache 2.4'],
      ['Deny from 203.0.113.5', 'и на наречии Apache 2.2'],
      ['<IfModule mod_deflate.c>', 'сжатие под проверкой наличия модуля'],
      ['ExpiresByType text/html "access plus 0 seconds"', 'у страниц срок хранения нулевой'],
      ['Options -Indexes', 'запрет показа содержимого папок'],
    ];
    let целых = 0;
    for (const [кусок, имя] of надо2) {
      if (р.вывод.includes(кусок)) целых++;
      else так(false, `.htaccess: ${имя}`, кусок);
    }
    так(целых === надо2.length, `.htaccess: все ${надо2.length} кусков на месте`);

    // Схема и хост -- ОДНИМ правилом. Двух правил перенаправления быть не должно.
    const перенаправлений = (р.вывод.match(/\[R=301,L\]/g) || []).length;
    так(перенаправлений === 2,
      '.htaccess: правил перенаправления два -- своё и одно общее на схему с хостом',
      `их ${перенаправлений}`);
  }

  // Жалобы вместо молчания. Файл настроек с ошибкой кладёт чужой сайт, поэтому лучше
  // отказаться собрать, чем выдать негодное.
  const жалобы = [
    [{ домен: '', зеркала: 'без-www' }, /домен/i, 'без домена'],
    [{ домен: 'не домен!!', зеркала: 'без-www' }, /домен/i, 'кривой домен'],
    [{ домен: 'example.com', зеркала: 'без-www', адреса: '999.1.1.1' }, /999\.1\.1\.1/, 'негодный адрес назван'],
    [{ домен: 'example.com', зеркала: 'нет', https: true, адреса: '',
       переносы: [{ откуда: 'old', куда: 'https://example.com/new' }] }, /кос/i, 'путь без косой'],
    [{ домен: 'example.com', зеркала: 'нет', https: true, адреса: '',
       переносы: [{ откуда: '/ста рый', куда: 'https://example.com/new' }] }, /пробел/i, 'пробел в пути'],
    [{ домен: 'example.com', зеркала: 'нет', https: false, листинг: false, хотлинк: false,
       сжатие: false, кэш: false, адреса: '', переносы: [] }, /\S/, 'ничего не выбрано'],
  ];
  let сказано = 0;
  for (const [н, образец, имя] of жалобы) {
    const р = await собрать(н);
    if (!р.вывод && образец.test(р.беда)) сказано++;
    else так(false, `.htaccess: жалоба «${имя}»`, `вывод ${р.вывод.length} знаков, жалоба «${р.беда}»`);
  }
  так(сказано === жалобы.length, `.htaccess: все ${жалобы.length} ошибок названы, а не проглочены`);

  {
    const видна = await считай(`(() => { const у = document.querySelector('.хт-беда');
      return getComputedStyle(у).display !== 'none' && у.getBoundingClientRect().height > 0; })()`);
    так(видна, '.htaccess: жалоба видна на экране, а не только в свойстве');
  }

  // После жалобы инструмент обязан продолжать работать.
  {
    const р = await собрать({ домен: 'example.com', зеркала: 'без-www', https: true, адреса: '' });
    так(р.вывод.includes('RewriteEngine On') && !р.беда, '.htaccess: после жалобы сборка работает');
  }

  так(ошибки.length === 0, 'на странице .htaccess не было исключений', ошибки[0]);
}

// =============================================================================================
console.log('\n════ 19. Хэши: /ru/hash-generator ════');
await иди('/ru/hash-generator');
{
  // СУДЬЯ -- системные md5 и shasum. Считают от ФАЙЛА: так в дело не вмешиваются ни кавычки
  // оболочки, ни лишний перенос строки, который echo добавляет сам.
  const проба = '/tmp/opitro-хэш-проба.bin';
  const судья = (алг, текст) => {
    writeFileSync(проба, Buffer.from(текст, 'utf8'));
    if (алг === 'MD5') return execSync(`md5 -q ${проба}`).toString().trim();
    const н = { 'SHA-1': 1, 'SHA-256': 256, 'SHA-512': 512 }[алг];
    return execSync(`shasum -a ${н} ${проба}`).toString().trim().split(/\s+/)[0];
  };
  const ввести = (т) => считай(`window.__хшВвод(${JSON.stringify(т)})`);

  const образцы = ['hello', 'a', 'привет', '日本語', '🙂', 'x'.repeat(64), 'x'.repeat(65),
    'строка с пробелами и кириллицей'];
  let плохих = 0;
  for (const о of образцы) {
    const с = await ввести(о);
    for (const алг of ['MD5', 'SHA-1', 'SHA-256', 'SHA-512']) {
      if (с.хэши[алг] !== судья(алг, о)) {
        плохих++;
        так(false, `хэш ${алг} на ${JSON.stringify(о.slice(0, 16))}`,
          `${с.хэши[алг]} против ${судья(алг, о)}`);
      }
    }
  }
  так(плохих === 0,
    `${образцы.length} образцов на четырёх алгоритмах сошлись с системными md5 и shasum`);

  // Значение из макета задания было неверным -- следим, чтобы оно не вернулось.
  {
    const с = await ввести('hello');
    так(с.хэши['SHA-1'] === 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d'
      && с.хэши['SHA-1'] !== 'afd0dfa130ae2aae13942a0b3193291b52bc6c37',
      'SHA-1 от «hello» настоящий, а не тот, что стоял в макете задания', с.хэши['SHA-1']);
  }

  // Счёт знаков и байтов раздельно: на кириллице они расходятся вдвое.
  {
    const с = await ввести('привет');
    так(/Знаков: 6/.test(с.счёт) && /Байтов: 12/.test(с.счёт),
      'счёт знаков и байтов раздельно -- на кириллице они расходятся', с.счёт);
  }

  // Галочка меняет ВИД записи, а не пересчитывает.
  {
    await считай(`document.getElementById('хш-заглавными').click()`);
    await жди(200);
    const с = await считай('window.__хшСостояние()');
    так(Object.values(с.хэши).every((з) => з === з.toUpperCase())
      && с.хэши['MD5'].toLowerCase() === судья('MD5', 'привет'),
      'заглавными -- тот же хэш, записанный иначе');
    await считай(`document.getElementById('хш-заглавными').click()`);
    await жди(200);
  }

  // Корзина сбрасывает всё.
  {
    await считай(`document.getElementById('хш-очистить').click()`);
    await жди(250);
    const с = await считай('window.__хшСостояние()');
    так(с.ввод === '' && Object.values(с.хэши).every((з) => з === '—') && с.живых === 0,
      'корзина стирает текст, сбрасывает хэши и гасит копирование');
  }

  так(ошибки.length === 0, 'на странице хэшей не было исключений', ошибки[0]);
}

// =============================================================================================
console.log('\n════ 20. JWT: /ru/jwt-decoder ════');
await иди('/ru/jwt-decoder');
{
  // СУДЬЯ -- openssl. Токен собирается чужой программой, а страница обязана его признать.
  const b64url = (б) => Buffer.from(б).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const собрать = (заголовок, нагрузка, ключ, алг = 'sha256') => {
    const тело = b64url(Buffer.from(JSON.stringify(заголовок)))
      + '.' + b64url(Buffer.from(JSON.stringify(нагрузка)));
    writeFileSync('/tmp/opitro-jwt-тело.txt', тело);
    const шестн = execSync(
      `openssl dgst -${алг} -mac HMAC -macopt key:'${ключ}' -binary /tmp/opitro-jwt-тело.txt`,
      { encoding: 'buffer' });
    return тело + '.' + b64url(шестн);
  };
  const ввод = (т, к) => считай(`window.__жвВвод(${JSON.stringify(т)}, ${JSON.stringify(к ?? '')})`);

  // Известный токен, который показывают на jwt.io.
  {
    const токен = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
      + '.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ'
      + '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const без = await ввод(токен, '');
    так(без.заголовок.includes('"HS256"') && без.нагрузка.includes('"John Doe"'),
      'JWT: токен читается БЕЗ ключа -- он не зашифрован, а лишь закодирован');
    const верно = await ввод(токен, 'your-256-bit-secret');
    const неверно = await ввод(токен, 'wrong');
    так(/сошлась/.test(верно.знак) && /не сошлась/.test(неверно.знак),
      'JWT: верный ключ сходится, неверный -- нет', `${верно.знак} / ${неверно.знак}`);
  }

  // Токены от openssl на трёх длинах HMAC.
  {
    let плохих = 0;
    for (const [алг, имя] of [['HS256', 'sha256'], ['HS384', 'sha384'], ['HS512', 'sha512']]) {
      const ключ = 'ключ-' + алг;
      const токен = собрать({ alg: алг, typ: 'JWT' }, { sub: 'п', exp: 2000000000 }, ключ, имя);
      const о = await ввод(токен, ключ);
      const п = await ввод(токен, ключ + 'x');
      if (!/сошлась/.test(о.знак) || !/не сошлась/.test(п.знак)) плохих++;
    }
    так(плохих === 0, 'JWT: токены от openssl на трёх длинах HMAC проверены верно');
  }

  // Три отдельных ответа вместо двух.
  {
    const безПодписи = b64url(Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })))
      + '.' + b64url(Buffer.from(JSON.stringify({ роль: 'админ' }))) + '.';
    const а = await ввод(безПодписи, 'любой');
    так(/нет вовсе/.test(а.знак) && а.нагрузка.includes('админ'),
      'JWT: alg none -- отдельный ответ «подписи нет», и нагрузка всё равно прочитана', а.знак);

    const рс = b64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })))
      + '.' + b64url(Buffer.from(JSON.stringify({ sub: '1' }))) + '.' + b64url(Buffer.alloc(64, 7));
    const б = await ввод(рс, 'пароль');
    так(/открытый ключ/i.test(б.знак),
      'JWT: RS256 -- «нужен открытый ключ», а не ложное «подпись неверна»', б.знак);
  }

  // Сроки в СЕКУНДАХ: живой токен на минуту вперёд не должен выглядеть истёкшим.
  {
    const сейчас = Math.floor(Date.now() / 1000);
    const живой = await ввод(собрать({ alg: 'HS256', typ: 'JWT' },
      { exp: сейчас + 60, iat: сейчас - 60 }, 'к'), 'к');
    const мёртвый = await ввод(собрать({ alg: 'HS256', typ: 'JWT' }, { exp: сейчас - 10 }, 'к'), 'к');
    так(/Действует/.test(живой.состояние) && /истёк/i.test(мёртвый.состояние)
      && живой.сроков === 2,
      'JWT: сроки считаются в секундах и разобраны в даты',
      `${живой.состояние} / ${мёртвый.состояние}`);
  }

  так(ошибки.length === 0, 'на странице JWT не было исключений', ошибки[0]);
}

// =============================================================================================
console.log('\n════ 21. Разбор ссылки: /ru/url-parser ════');
await иди('/ru/url-parser');
{
  const ввод = (т) => считай(`window.__урВвод(${JSON.stringify(т)})`);
  const часть = (с, имя) => (с.части.find((ч) => ч[0] === имя) || [])[1];

  {
    const с = await ввод('https://site.com:8443/path?user=admin&token=xyz#кусок');
    так(часть(с, 'схема') === 'https:' && часть(с, 'хост') === 'site.com'
      && часть(с, 'порт') === '8443' && часть(с, 'путь') === '/path',
      'ссылка разобрана на части', JSON.stringify(с.части));
    // Раньше здесь стояло так(значение, ожидание, имя) -- проверка проходила от любой
    // непустой строки. Сравниваем как положено.
    так(с.параметры.map((п) => `${п[0]}=${п[1]}`).join(',') === 'user=admin,token=xyz',
      'параметры разобраны', JSON.stringify(с.параметры));
  }

  // Повторы: обычный разбор потерял бы всё, кроме первого.
  {
    const с = await ввод('https://site.com/?a=1&a=2&b=3&a=4');
    так(с.параметры.map((п) => `${п[0]}=${п[1]}`).join(',') === 'a=1,a=2,b=3,a=4'
      && с.параметры.filter((п) => п[2]).length === 3,
      'повторяющиеся параметры не теряются и помечены',
      JSON.stringify(с.параметры));
  }

  // %2F -- закодированная косая ВНУТРИ отрезка. Раскодировать её нельзя: строение изменится.
  {
    const с = await ввод('https://site.com/a%2Fb/c');
    так(часть(с, 'путь') === '/a%2Fb/c'
      && с.части.find((ч) => ч[0] === 'путь')[2] === '',
      '%2F в пути оставлен как есть -- это не разделитель', JSON.stringify(с.части));
  }

  // Имя на кириллице: на сервер уходит punycode.
  {
    const с = await ввод('https://пример.рф/путь');
    так(часть(с, 'хост') === 'xn--e1afmkfd.xn--p1ai'
      && с.части.find((ч) => ч[0] === 'хост')[2].includes('пример.рф'),
      'имя показано и в punycode, и как набирали', JSON.stringify(с.части[1]));
  }

  // Плюс в запросе -- пробел.
  {
    const с = await ввод('https://site.com/?q=a+b');
    так(с.параметры[0][1] === 'a b', 'плюс в запросе прочитан как пробел', с.параметры[0][1]);
  }

  // Логин с паролем в ссылке -- утечка, о ней надо сказать.
  {
    const с = await ввод('https://вася:тайна@site.com/');
    так(с.вести.some((в) => /логин/i.test(в)), 'логин с паролем в ссылке назван прямо');
  }

  // Мусор.
  {
    const с = await ввод('!!!');
    так(/беда/.test(с.видСостояния) && с.части.length === 0,
      'мусор отвергнут, а не выдан за ссылку', с.состояние);
  }

  так(ошибки.length === 0, 'на странице разбора ссылки не было исключений', ошибки[0]);
}

// =============================================================================================
console.log('\n════ 22. Экранирование HTML: /ru/html-entities ════');
await иди('/ru/html-entities');
{
  const ввод = (т, режим, неascii) =>
    считай(`window.__ммВвод(${JSON.stringify(т)}, ${JSON.stringify(режим)}, ${JSON.stringify(!!неascii)})`);

  // Судья -- python3. Его html.escape и html.unescape писали другие люди, и таблица мнемоник
  // HTML5 у него полная. Ответы берём одним вызовом, чтобы не дёргать питон на каждую строку.
  const случаи = [
    "<script>alert('xss')</script>",
    'a & b < c > d " e \' f',
    'AT&T',
    '&amp;',
    '&amp;amp;',
    '&lt;div&gt;',
    '<a href="x?a=1&b=2">ссылка</a>',
    '&nbsp;&copy;&trade;&hellip;',
    '&#1055;&#1088;&#1080;&#1074;&#1077;&#1090;',
    '&#x41;&#x42;&#x43;',
    '&notit;',
    '&unknown; &amp',
    'emoji: 😀👨‍👩‍👧‍👦',
    '«ёлки» — 100% & «палки»',
  ];
  // Программу судьи кладём файлом, а не в python3 -c: переводы строк, пройдя через оболочку,
  // доезжают до питона обратной косой с буквой n, и он падает на первой же строке.
  const судьяПуть = Д + 'судья-мнемоник.py';
  writeFileSync(судьяПуть, [
    'import html, json, sys',
    'дела = json.load(sys.stdin)',
    'print(json.dumps([[html.escape(с, quote=True), html.unescape(с)] for с in дела], ensure_ascii=False))',
  ].join('\n'));
  const судья = JSON.parse(execSync(`python3 ${JSON.stringify(судьяПуть)}`,
    { input: JSON.stringify(случаи), encoding: 'utf8' }));

  // python3 пишет апостроф шестнадцатерично (&#x27;), мы -- десятерично (&#39;). Это одна и та
  // же ссылка на один и тот же знак в разных системах счисления.
  const ровно = (с) => String(с).replace(/&#x27;/g, '&#39;');

  let кодОК = 0; let раскодОК = 0; let кругОК = 0; let первыйСбой = '';
  for (let и = 0; и < случаи.length; и++) {
    const [ждёмКод, ждёмРаскод] = судья[и];

    const код = (await ввод(случаи[и], 'enc', false)).вывод;
    if (ровно(код) === ровно(ждёмКод)) кодОК++;
    else первыйСбой ||= `код ${JSON.stringify(случаи[и])}: наш ${JSON.stringify(код)} судья ${JSON.stringify(ждёмКод)}`;

    const раскод = (await ввод(случаи[и], 'dec')).вывод;
    if (раскод === ждёмРаскод) раскодОК++;
    else первыйСбой ||= `раскод ${JSON.stringify(случаи[и])}: наш ${JSON.stringify(раскод)} судья ${JSON.stringify(ждёмРаскод)}`;

    // Ради этого страница и нужна: закодированное обязано вернуться в исходное знак в знак.
    const назад = (await ввод(код, 'dec')).вывод;
    if (назад === случаи[и]) кругОК++;
    else первыйСбой ||= `круг ${JSON.stringify(случаи[и])}: вернулось ${JSON.stringify(назад)}`;
  }
  так(кодОК === случаи.length, `кодирование сошлось с python3 (${кодОК}/${случаи.length})`, первыйСбой);
  так(раскодОК === случаи.length, `раскодирование сошлось с python3 (${раскодОК}/${случаи.length})`, первыйСбой);
  так(кругОК === случаи.length, `круг «закодировать → раскодировать» (${кругОК}/${случаи.length})`, первыйСбой);

  // Двойное экранирование -- главная беда ручной замены: амперсанд съедает свои же мнемоники.
  так((await ввод('&lt;', 'enc', false)).вывод === '&amp;lt;',
    'двойного экранирования нет: амперсанд заменён один раз');

  // Не-ASCII: смайлик вне BMP обязан стать одной ссылкой, а не двумя половинками пары.
  {
    const с = await ввод('Привет 😀 & «ёж»', 'enc', true);
    так(!/[^\x00-\x7F]/.test(с.вывод) && с.вывод.includes('&#128512;'),
      'при позначке «весь не-ASCII» не осталось не-ASCII, смайлик одной ссылкой', с.вывод);
    так((await ввод(с.вывод, 'dec')).вывод === 'Привет 😀 & «ёж»',
      'закодированный не-ASCII раскодировался обратно');
  }

  // Раскодирование не имеет права выполнять разметку: innerHTML запустил бы onerror.
  await считай('window.__мметка = 0');
  await ввод('&lt;img src=x onerror="window.__мметка=1"&gt;', 'dec');
  await жди(700);
  так(await считай('window.__мметка') === 0, 'раскодирование не выполняет разметку (onerror молчит)');
  так((await считай('window.__ммСостояние()')).вывод === '<img src=x onerror="window.__мметка=1">',
    'при этом текст всё же раскодирован');

  // Позначка про не-ASCII имеет смысл только при кодировании. Спрашиваем у браузера,
  // что он рисует: свойство .hidden врёт, display в стилях сильнее.
  так((await ввод('x', 'enc')).галкаВидна === true, 'при кодировании позначка видна');
  так((await ввод('x', 'dec')).галкаВидна === false, 'при раскодировании позначка спрятана');

  так(ошибки.length === 0, 'на странице экранирования HTML не было исключений', ошибки[0]);
}

// =============================================================================================
console.log('\n════ 23. Системы счисления: /ru/number-base-converter ════');
await иди('/ru/number-base-converter');
{
  const ввод = (т, основание) =>
    считай(`window.__ссВвод(${JSON.stringify(т)}, ${основание})`);

  // Судья -- python3: у него целые тоже без предела, а format(x,'b'/'o'/'X') писали другие люди.
  // Числа взяты так, чтобы половина лежала ЗА границей 2^53, где обычное число уже врёт.
  const судьяПуть = Д + 'судья-счисление.py';
  writeFileSync(судьяПуть, [
    'import json, random',
    'особые = [0, 1, 7, 8, 42, 255, 256, 65535, 65536, 2**31, 2**32-1, 2**53, 2**53+1,',
    '          2**63, 2**64-1, 0xDEADBEEF, 0xFFFFFFFFFFFFFFFF]',
    'random.seed(23)',
    'случайные = [random.getrandbits(n) for n in (16, 53, 54, 64, 96, 128)]',
    'итог = []',
    'for ч in особые + случайные + [-42, -255]:',
    '    м = ч if ч >= 0 else -ч',
    '    знак = "" if ч >= 0 else "-"',
    '    итог.append([str(ч), знак + format(м, "b"), знак + format(м, "o"), знак + format(м, "X"),',
    '                 м.bit_length() or 1])',
    'print(json.dumps(итог))',
  ].join('\n'));
  const судья = JSON.parse(execSync(`python3 ${JSON.stringify(судьяПуть)}`, { encoding: 'utf8' }));

  let тудаОК = 0; let обратноОК = 0; let битыОК = 0; let первыйСбой = '';
  for (const [дес, дв, вос, шест, биты] of судья) {
    const с = await ввод(дес, 10);
    if (с['2'].значение === дв && с['8'].значение === вос && с['16'].значение === шест) тудаОК++;
    else первыйСбой ||= `${дес}: дв ${с['2'].значение}/${дв}, шест ${с['16'].значение}/${шест}`;

    if (new RegExp(`\\b${биты}\\b`).test(с.итог)) битыОК++;
    else первыйСбой ||= `${дес}: разрядность ${с.итог}, судья ${биты}`;

    // Обратно из каждой системы -- должно вернуться то же десятичное.
    const н = [await ввод(дв, 2), await ввод(вос, 8), await ввод(шест, 16)];
    if (н.every((о) => о['10'].значение === дес)) обратноОК++;
    else первыйСбой ||= `${дес}: обратно вышло ${н.map((о) => о['10'].значение).join(',')}`;
  }
  так(тудаОК === судья.length, `десятичная → остальные сошлись с python3 (${тудаОК}/${судья.length})`, первыйСбой);
  так(обратноОК === судья.length, `остальные → десятичная сошлись (${обратноОК}/${судья.length})`, первыйСбой);
  так(битыОК === судья.length, `разрядность сошлась (${битыОК}/${судья.length})`, первыйСбой);

  // Ради чего взят BigInt. Заодно доказываем, что проверка не пустая: рецепт из учебника
  // на этом же числе даёт другое.
  {
    const с = await ввод('FFFFFFFFFFFFFFFF', 16);
    так(с['10'].значение === '18446744073709551615' && с['2'].значение === '1'.repeat(64),
      'за границей 2^53 счёт точный (64 единицы, 18446744073709551615)',
      с['10'].значение);
    const учебник = await считай(`parseInt('FFFFFFFFFFFFFFFF',16).toString(16).toUpperCase()`);
    так(учебник !== 'FFFFFFFFFFFFFFFF',
      '…а parseInt на нём же врёт -- значит проверка не пустая', учебник);
  }

  // Негодные знаки в поле просто не появляются.
  так((await ввод('10201', 2))['2'].значение === '1001', 'двойка не вошла в двоичное поле');
  так((await ввод('7890', 8))['8'].значение === '70', 'восьмёрка и девятка не вошли в восьмеричное');
  так((await ввод('12AG', 16))['16'].значение === '12A', 'буква G не вошла в шестнадцатеричное');
  так((await ввод('3.5', 10))['10'].значение === '35', 'точка не проходит: дробей здесь нет');
  так((await ввод('2a', 16))['10'].значение === '42', 'строчные буквы читаются наравне с заглавными');

  // У отрицательного числа размер зависит от способа кодирования -- врать про него нельзя.
  {
    const о = await ввод('-42', 10);
    так(о['2'].значение === '-101010' && о['16'].значение === '-2A', 'минус проходит во все поля');
    так(!/Помещается|Больше/.test(о.итог), 'у отрицательного показана только разрядность', о.итог);
  }

  // Корзина связана со всеми четырьмя окнами.
  {
    await ввод('42', 10);
    await считай(`document.getElementById('сс-корзина-16').click()`);
    await жди(200);
    const с = await считай('window.__ссСостояние()');
    так([2, 8, 10, 16].every((о) => с[о].значение === '') && с.итог === '',
      'корзина очистила все четыре окна и строку итога');
  }

  так(ошибки.length === 0, 'на странице систем счисления не было исключений', ошибки[0]);
}

// =============================================================================================
console.log('\n════ 24. Сравнение текстов: /ru/text-diff ════');
await иди('/ru/text-diff');
{
  const ввод = (а, б, реж) =>
    считай(`window.__дфВвод(${JSON.stringify(а)}, ${JSON.stringify(б)}, ${реж ? JSON.stringify(реж) : 'null'})`);

  // Судья алгоритма -- медленный, но заведомо верный способ: таблица наибольшей общей
  // подпоследовательности. Другой код, написанный от другой мысли. Сверяем ДЛИНУ цепочки
  // правок: минимальная она одна, а путей к ней бывает несколько.
  {
    const итог = await считай(`(() => {
      function эталон(a, b) {
        const n = a.length, m = b.length;
        const т = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
        for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
          т[i][j] = a[i] === b[j] ? т[i + 1][j + 1] + 1 : Math.max(т[i + 1][j], т[i][j + 1]);
        return n + m - 2 * т[0][0];
      }
      let расхождений = 0; const примеры = [];
      for (let т = 0; т < 2000; т++) {
        const дл = () => Math.floor(Math.random() * 12);
        const бук = () => String.fromCharCode(97 + Math.floor(Math.random() * 4));
        const a = Array.from({ length: дл() }, бук), b = Array.from({ length: дл() }, бук);
        const наш = window.__дфРазличия(a, b).filter((к) => к.вид !== 'равно').length;
        if (наш !== эталон(a, b)) { расхождений++; if (примеры.length < 3) примеры.push(a.join('') + '|' + b.join('')); }
      }
      return JSON.stringify({ расхождений, примеры });
    })()`);
    const о = JSON.parse(итог);
    так(о.расхождений === 0, 'цепочка правок минимальна: 2000 случайных пар против эталона',
      JSON.stringify(о.примеры));
  }

  // Потолок числа правок. Без него два непохожих текста съедали память вкладки: замерено --
  // 10 000 различий это 3 ГБ и две секунды.
  {
    const а = 'абвгдежзийклмнопрстуфхцчшщэюя'.repeat(200);
    const б = 'ЯЮЭЩШЧЦХФУТСРПОНМЛКЙИЗЖЕДГВБА'.repeat(200);
    const начало = Date.now();
    const с = await ввод(а, б, 'буквы');
    const мс = Date.now() - начало;
    так(мс < 4000, 'непохожие тексты по буквам не вешают вкладку', мс + ' мс');
    так(с.огрубили === true, 'ответ честно помечен огрублённым');
    так(/слишком много/.test(с.сказ), 'об огрублении сказано вслух', с.сказ.slice(0, 50));

    // Предупреждение -- состояние, а не мигалка: пока грубый ответ на экране, надпись висит.
    await жди(7000);
    так(/слишком много/.test((await считай('window.__дфСостояние()')).сказ),
      'через 7 секунд предупреждение на месте, а не исчезло');

    const т = await ввод(а, а.slice(0, 2900) + 'Ж' + а.slice(2901), 'буквы');
    так(т.огрубили === false && т.сказ === '',
      'похожие тексты той же длины считаются точно, предупреждение снято');
    так(т.убранных === 1 && т.добавленных === 1,
      'найдена ровно одна подменённая буква', `${т.убранных}/${т.добавленных}`);
  }

  // Три способа резки дают разную крупность -- в этом весь их смысл.
  {
    const бук = await ввод('привет мир', 'привет мор', 'буквы');
    так(бук.убрано === '1 знак' && бук.добавлено === '1 знак',
      'по буквам видно одну букву', `${бук.убрано} / ${бук.добавлено}`);
    const сл = await ввод('привет мир', 'привет мор', 'слова');
    так(/1 слово/.test(сл.убрано), 'по словам -- целое слово', сл.убрано);
    const стр = await ввод('привет мир', 'привет мор', 'строки');
    так(/1 строка/.test(стр.убрано), 'по строкам -- целая строка', стр.убрано);
  }

  // Знаки, а не кодовые единицы: иначе смайлик развалится на две половинки пары.
  {
    const с = await ввод('вот 😀', 'вот 🙂', 'буквы');
    так(с.убранных === 1 && с.добавленных === 1,
      'смайлик заменён одним куском, а не двумя половинками', `${с.убранных}/${с.добавленных}`);
  }

  // Корзина чистит СВОЁ окно и не трогает соседнее.
  {
    const с = await ввод('раз\nдва', 'три', 'слова');
    так(/Строк: 2/.test(с.счётА) && /Знаков: 7/.test(с.счётА), 'счёт первого окна', с.счётА);
    await считай(`document.getElementById('дф-корзина-а').click()`);
    await жди(200);
    const п = await считай('window.__дфСостояние()');
    так(п.счётА === '' && !п.корзинаАЖива, 'корзина очистила своё окно');
    так(/Строк: 1/.test(п.счётБ) && п.корзинаБЖива, '…и не тронула соседнее', п.счётБ);
  }

  // Копирование живо только тогда, когда есть что копировать.
  {
    так(!(await ввод('', '', 'слова')).копиЖива, 'на пустом копирование выключено');
    так(!(await ввод('раз', 'раз', 'слова')).копиЖива, 'при совпадении копирование выключено');
    так((await ввод('раз', 'два', 'слова')).копиЖива, 'при отличиях копирование включено');
  }

  так(ошибки.length === 0, 'на странице сравнения текстов не было исключений', ошибки[0]);
}

// =============================================================================================
console.log('\n════ 25. Сравнение кода: /ru/code-diff ════');
await иди('/ru/code-diff');
{
  const ввод = (а, б) => считай(`window.__дпВвод(${JSON.stringify(а)}, ${JSON.stringify(б)})`);

  // ГЛАВНЫЙ СУДЬЯ -- системная команда patch. Собранный страницей патч прикладываем к
  // исходному файлу настоящей программой и сверяем, что вышло ровно ожидаемое.
  {
    let принято = 0; let сбой = '';
    for (let т = 0; т < 12; т++) {
      const н = 6 + Math.floor(Math.random() * 25);
      const было = Array.from({ length: н }, (_, i) => '  строка ' + i + ' ' + Math.random().toString(36).slice(2, 6));
      const стало = было.slice();
      const правок = 1 + Math.floor(Math.random() * 4);
      for (let p = 0; p < правок; p++) {
        const где = Math.floor(Math.random() * Math.max(1, стало.length));
        const к = Math.random();
        if (к < 0.35 && стало.length > 1) стало.splice(где, 1);
        else if (к < 0.7) стало.splice(где, 0, '  новая ' + p + ' ' + Math.random().toString(36).slice(2, 5));
        else стало[где] = '  изменена ' + p;
      }
      await ввод(было.join('\n'), стало.join('\n'));
      const п = await считай('window.__дпПатч()');
      writeFileSync(Д + 'было.txt', было.join('\n') + '\n');
      writeFileSync(Д + 'ждём.txt', стало.join('\n') + '\n');
      writeFileSync(Д + 'п.diff', String(п).replace(/^--- .*$/m, '--- было.txt').replace(/^\+\+\+ .*$/m, '+++ было.txt') + '\n');
      try {
        execSync(`cp ${JSON.stringify(Д + 'было.txt')} ${JSON.stringify(Д + 'вышло.txt')} && patch -s ${JSON.stringify(Д + 'вышло.txt')} < ${JSON.stringify(Д + 'п.diff')}`);
        if (readFileSync(Д + 'вышло.txt', 'utf8') === readFileSync(Д + 'ждём.txt', 'utf8')) принято++;
        else сбой ||= 'файл вышел другим на прогоне ' + т;
      } catch (е) { сбой ||= 'patch отказался: ' + String(е.message).slice(0, 90); }
    }
    так(принято === 12, `патч принят настоящей командой patch (${принято}/12)`, сбой);
  }

  // Невидимые знаки -- то, ради чего страница отделена от прозы.
  {
    так((await ввод('\tотступ', '    отступ')).находки.some((т) => /таб/i.test(т)),
      'отступ табом против пробелов назван');
    так((await ввод('строка  \nдва', 'строка\nдва')).находки.some((т) => /конце строк/.test(т)),
      'пробелы в конце строк названы');
    так((await ввод('а б', 'а\u00a0б')).находки.some((т) => /еразрывн/.test(т)),
      'неразрывный пробел назван');
    так((await ввод('\ufeffраз', 'раз')).находки.some((т) => /порядка байтов/.test(т)),
      'метка порядка байтов названа');
    так((await ввод('раз\nдва', 'раз\nтри')).тихо === 1,
      'когда невидимого нет -- так и сказано');
  }

  // Концы строк. Поле ввода САМО приводит CRLF к LF -- измерено, textarea.value отдаёт LF
  // всегда. Значит: узнать их можно только из вставки, и они НЕ причина отличий на странице.
  {
    await считай(`window.__дпВставка('раз\\r\\nдва\\r\\n', 'а')`);
    const с = await считай(`window.__дпВставка('раз\\nдва\\n', 'б')`);
    так(с.находки.some((т) => /CRLF/.test(т)), 'разные концы строк названы после вставки');
    так(с.находки.some((т) => /не влияет/.test(т)),
      '…и сказано честно: на сравнение здесь это не влияет');
    // Находка привязана к тексту: сменился текст -- сведения о концах строк недействительны.
    так(!(await ввод('раз\nдва', 'раз\nтри')).находки.some((т) => /CRLF/.test(т)),
      'после набора руками про концы строк ничего не выдумано');
  }

  // Переключатели «не смотреть».
  {
    await ввод('строка  \nдва', 'строка\nдва');
    так((await считай('window.__дпСостояние()')).убрано === '1 строка',
      'хвостовой пробел делает строку изменённой');
    так((await считай(`window.__дпГалка('хвосты', true)`)).убрано === '0 строк',
      '…а с включённой галкой отличий нет');
    await считай(`window.__дпГалка('хвосты', false)`);
    await ввод('    раз', '\t\t\tраз');
    так((await считай(`window.__дпГалка('отступ', true)`)).убрано === '0 строк',
      'величину отступа можно не смотреть');
    await считай(`window.__дпГалка('отступ', false)`);
  }

  // Номера строк и сворачивание -- то, чего у прозы нет.
  {
    const было = Array.from({ length: 60 }, (_, i) => 'строка ' + i);
    const стало = было.slice(); стало[30] = 'ПРАВКА';
    const с = await ввод(было.join('\n'), стало.join('\n'));
    так(с.свёрток === 2 && с.строк <= 8,
      'одинаковые куски свёрнуты, показано только окружение правки', `${с.свёрток} свёртки, ${с.строк} строк`);
    так(с.номера[0] === '28/28', 'номера идут двумя колонками', JSON.stringify(с.номера.slice(0, 3)));
    const р = await считай('window.__дпРазвернуть()');
    так(р.строк > с.строк && р.свёрток === 1, 'нажатие развернуло промежуток');
  }

  // Чего здесь быть не должно: это отделено прозе намеренно.
  так(await считай(`!document.querySelector('#дп-регистр') && !document.querySelector('#дп-слова')`),
    'ни «не смотреть на регистр», ни сравнения по словам -- они на странице текстов');

  так(ошибки.length === 0, 'на странице сравнения кода не было исключений', ошибки[0]);
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
if (свойСервер) { try { свойСервер.kill(); } catch (е) {} }
process.exit(беды.length ? 1 : 0);
