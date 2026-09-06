// РЕВИЗИЯ СТРАНИЦ, ГДЕ ЦЕНА ОШИБКИ ВЫШЕ ВСЕГО.
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
console.log('\n════ ИТОГ ════');
if (беды.length) {
  console.log(`  НЕ СОШЛОСЬ: ${беды.length}`);
  беды.forEach((б) => console.log('    — ' + б));
} else {
  console.log('  всё сошлось');
}
хром.kill();
process.exit(беды.length ? 1 : 0);
