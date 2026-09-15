// ТЕКСТ ИЗ PDF -- ЖИВАЯ ПРОВЕРКА СОБРАННОЙ СТРАНИЦЫ.
//
// Два пути внутри одной страницы, и они устроены совершенно по-разному:
//   1. У файла есть текстовый слой -- буквы берутся изнутри, распознавание не поднимается;
//   2. файл -- скан (внутри картинка) -- страница рисует лист и читает распознавателем.
// Проверяются ОБА, на настоящих файлах, собранных здесь же: текстовый -- нашим писателем
// PDF, скан -- отрисовкой букв на холст и вкладыванием картинки в PDF.
//
// Странице закрыт интернет (--host-resolver-rules): всё нужное лежит у нас.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const КОРЕНЬ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ДИСТ = path.join(КОРЕНЬ, 'dist');
const СТРАНИЦА = process.argv[2] || '/uk/pdf-to-text/';
const ПОРТ = 8802, БРАУЗЕР = 9362;
const ПРОФИЛЬ = path.join(os.tmpdir(), 'opitro-проверка-pdf-текста');
const сон = (м) => new Promise((р) => setTimeout(р, м));

// ОДИН длинный абзац: писатель PDF сам перенесёт его по ширине листа, и внутри файла он
// ляжет несколькими строками до правого поля. Ровно на таком и проверяется, сшиваются ли
// переносы обратно. Если подать четыре ОТДЕЛЬНЫХ абзаца, писатель поставит между ними
// отступ, сшивать будет нечего, и проверка окажется ни о чём.
const АБЗАЦ = 'Сторони домовилися, що виконавець передає замовнику результат роботи у строк, '
  + 'погоджений сторонами у додатку номер один, який є невідʼємною частиною цього договору '
  + 'та підписується обома сторонами у двох примірниках однакової юридичної сили.';
const ПОДПИСЬ = 'Місто Київ';

if (!fs.existsSync(path.join(ДИСТ, 'index.html'))) {
  console.log('Нет собранного сайта. Сначала: npm run build');
  process.exit(1);
}

const ТИПЫ = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ttf': 'font/ttf',
  '.pdf': 'application/pdf', '.onnx': 'application/octet-stream', '.tar': 'application/x-tar',
  '.gz': 'application/gzip' };
// Образец текстового PDF собирается ЗДЕСЬ, нашим же писателем из src/lib/pdf-text.js, и
// отдаётся странице как обычный файл. Так проверяется настоящий путь «внутри есть буквы».
globalThis.fetch = globalThis.fetch;
const образецТекстовый = await (async () => {
  const прежнийFetch = globalThis.fetch;
  globalThis.fetch = async (путь) => {
    const б = fs.readFileSync(path.join(КОРЕНЬ, 'public', путь));
    return { ok: true, status: 200, arrayBuffer: async () => б.buffer.slice(б.byteOffset, б.byteOffset + б.byteLength) };
  };
  try {
    const { собратьPdf } = await import(path.join(КОРЕНЬ, 'src/lib/pdf-text.js'));
    return Buffer.from(await собратьPdf(
      [{ строки: [{ текст: АБЗАЦ }] }, { строки: [{ текст: ПОДПИСЬ }] }], { заголовок: 'Проба' }));
  } finally { globalThis.fetch = прежнийFetch; }
})();

const сервер = http.createServer((зап, отв) => {
  const адрес = decodeURIComponent((зап.url || '/').split('?')[0]);
  if (адрес === '/образец-текстовый.pdf') {
    отв.writeHead(200, { 'Content-Type': 'application/pdf' });
    отв.end(образецТекстовый);
    return;
  }
  let файл = path.join(ДИСТ, path.normalize(адрес).replace(/^(\.\.[/\\])+/, ''));
  if (fs.existsSync(файл) && fs.statSync(файл).isDirectory()) файл = path.join(файл, 'index.html');
  if (!fs.existsSync(файл)) { отв.writeHead(404); отв.end('нет'); return; }
  отв.writeHead(200, { 'Content-Type': ТИПЫ[path.extname(файл)] || 'application/octet-stream' });
  fs.createReadStream(файл).pipe(отв);
});
await new Promise((р) => сервер.listen(ПОРТ, р));

try { execSync(`lsof -ti tcp:${БРАУЗЕР} | xargs kill -9`, { stdio: 'ignore' }); } catch (е) {}
const браузер = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  `--remote-debugging-port=${БРАУЗЕР}`, `--user-data-dir=${ПРОФИЛЬ}`, '--headless=new',
  '--no-first-run', '--no-default-browser-check', '--window-size=1280,1000',
  '--host-resolver-rules=MAP * 0.0.0.0:1, EXCLUDE 127.0.0.1',
  'about:blank'], { stdio: 'ignore' });
process.on('exit', () => { try { браузер.kill(); } catch (е) {} try { сервер.close(); } catch (е) {} });

let верс;
for (let и = 0; и < 120; и++) {
  try { верс = await (await fetch(`http://127.0.0.1:${БРАУЗЕР}/json/version`)).json(); break; } catch (е) { await сон(300); }
}
if (!верс) { console.log('не поднялся Chrome'); process.exit(1); }

let счёт = 0; const ждут = new Map(); const ошибки = [];
const ws = new WebSocket(верс.webSocketDebuggerUrl);
await new Promise((р) => ws.addEventListener('open', р));
ws.addEventListener('message', (м) => {
  const д = JSON.parse(м.data);
  if (д.id && ждут.has(д.id)) { const { да, нет } = ждут.get(д.id); ждут.delete(д.id); д.error ? нет(new Error(д.error.message)) : да(д.result); return; }
  if (д.method === 'Runtime.exceptionThrown') {
    ошибки.push((д.params.exceptionDetails.exception?.description || д.params.exceptionDetails.text || '').slice(0, 160));
  }
});
const шлём = (м, п = {}, с) => new Promise((да, нет) => {
  const и = ++счёт; ждут.set(и, { да, нет });
  ws.send(JSON.stringify({ id: и, method: м, params: п, sessionId: с }));
});
const { targetId } = await шлём('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await шлём('Target.attachToTarget', { targetId, flatten: true });
await шлём('Runtime.enable', {}, sessionId);
await шлём('Page.enable', {}, sessionId);
const выполнить = async (код) => {
  const о = await шлём('Runtime.evaluate', { expression: код, awaitPromise: true, returnByValue: true }, sessionId);
  if (о.exceptionDetails) throw new Error(о.exceptionDetails.exception?.description || о.exceptionDetails.text);
  return о.result.value;
};

const беды = [];
const проба = (имя, ладно, что) => {
  console.log(`  ${ладно ? '✓' : '✗'} ${имя}${что !== undefined ? ' — ' + String(что).slice(0, 120) : ''}`);
  if (!ладно) беды.push(имя);
};

await шлём('Page.navigate', { url: `http://127.0.0.1:${ПОРТ}${СТРАНИЦА}` }, sessionId);
await сон(2500);

console.log(`════ страница ${СТРАНИЦА} (интернет странице закрыт)`);
проба('разметка на месте', await выполнить(`!!document.getElementById('пт-старт') && !!document.getElementById('пт-файл')`));
проба('обработчик жив', await выполнить(`typeof window.__пт === 'function'`));

/* ---- Образцы ------------------------------------------------------------------------------- */
// Текстовый приезжает готовым с нашего сервера -- ровно так же, как файл от человека.
await выполнить(`window.__образцы = {}; (async () => {
  const б = await (await fetch('/образец-текстовый.pdf')).arrayBuffer();
  window.__образцы.текстовый = new File([б], 'текстовый.pdf', { type: 'application/pdf' });
  return window.__образцы.текстовый.size;
})()`);

const уронить = async (какой) => выполнить(`(() => {
  const дт = new DataTransfer();
  дт.items.add(window.__образцы.${какой});
  document.getElementById('пт-старт').dispatchEvent(new DragEvent('drop', { dataTransfer: дт, bubbles: true, cancelable: true }));
  return true;
})()`);
/** Абзацы списком: textContent склеил бы соседние <p> без пробела и наврал бы в отчёте. */
const ждатьАбзацы = async (прежних = -1) => {
  for (let и = 0; и < 120; и++) {
    await сон(1000);
    const а = JSON.parse(await выполнить(
      `JSON.stringify([...document.querySelectorAll('.пт-абзац')].map((э) => э.textContent.trim()))`));
    if (а.length && а.length !== прежних) return а;
  }
  return [];
};

console.log('\n════ PDF с текстовым слоем');
await уронить('текстовый');
const изТекста = await ждатьАбзацы();
проба('текст достан целиком', изТекста.join(' ').replace(/\s+/g, ' ').includes(АБЗАЦ.slice(0, 90)),
  изТекста[0]);
проба('переносы сшиты: длинный абзац -- один, подпись -- отдельно',
  изТекста.length === 2 && изТекста[1] === ПОДПИСЬ, изТекста.length + ' абз.');
проба('распознавание НЕ поднималось: буквы взяты изнутри',
  (await выполнить(`JSON.stringify(window.__пт())`)).includes('"распознано":0'),
  await выполнить(`JSON.stringify(window.__пт())`));

console.log('\n════ PDF-скан (внутри картинка, букв нет)');
await выполнить(`document.getElementById('пт-ещё').click(); true`);
await сон(300);
// Скан собираем честно: рисуем буквы на холст, кладём холст картинкой в PDF. Текстового слоя
// в таком файле нет вовсе -- страница обязана это заметить и позвать распознаватель.
await выполнить(`(async () => {
  const х = document.createElement('canvas'); х.width = 1240; х.height = 500;
  const к = х.getContext('2d');
  к.fillStyle = '#fff'; к.fillRect(0, 0, х.width, х.height);
  к.fillStyle = '#111'; к.font = '600 52px Helvetica';
  к.fillText('Договір про надання послуг', 60, 120);
  к.fillText('Місто Київ, 2026 рік', 60, 240);
  const jpeg = await new Promise((г) => х.toBlob(г, 'image/jpeg', 0.95));
  const байтыJpeg = new Uint8Array(await jpeg.arrayBuffer());
  // Простейший PDF с одной картинкой: JPEG кладётся внутрь как есть (DCTDecode).
  const куски = [];
  const т = (с) => куски.push(Uint8Array.from(с, (з) => з.charCodeAt(0) & 255));
  const места = []; let длина = 0;
  const доб = (б) => { куски.push(б); длина += б.length; };
  const добТ = (с) => { const б = Uint8Array.from(с, (з) => з.charCodeAt(0) & 255); куски.push(б); длина += б.length; };
  добТ('%PDF-1.7\\n');
  const объекты = [
    '<</Type /Catalog /Pages 2 0 R>>',
    '<</Type /Pages /Kids [3 0 R] /Count 1>>',
    '<</Type /Page /Parent 2 0 R /MediaBox [0 0 ' + х.width + ' ' + х.height + ']'
      + ' /Resources <</XObject <</I 5 0 R>>>> /Contents 4 0 R>>',
    null, null,
  ];
  const поток = 'q ' + х.width + ' 0 0 ' + х.height + ' 0 0 cm /I Do Q';
  for (let н = 1; н <= 5; н++) {
    места.push(длина);
    добТ(н + ' 0 obj\\n');
    if (н === 4) добТ('<</Length ' + поток.length + '>>\\nstream\\n' + поток + '\\nendstream');
    else if (н === 5) {
      добТ('<</Type /XObject /Subtype /Image /Width ' + х.width + ' /Height ' + х.height
        + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '
        + байтыJpeg.length + '>>\\nstream\\n');
      доб(байтыJpeg);
      добТ('\\nendstream');
    } else добТ(объекты[н - 1]);
    добТ('\\nendobj\\n');
  }
  const таблица = длина;
  let x = 'xref\\n0 6\\n0000000000 65535 f \\n';
  for (const м of места) x += String(м).padStart(10, '0') + ' 00000 n \\n';
  x += 'trailer\\n<</Size 6 /Root 1 0 R>>\\nstartxref\\n' + таблица + '\\n%%EOF\\n';
  добТ(x);
  const всё = new Uint8Array(длина);
  let куда = 0; for (const ч of куски) { всё.set(ч, куда); куда += ч.length; }
  window.__образцы.скан = new File([всё], 'скан.pdf', { type: 'application/pdf' });
  return всё.length;
})()`);
await уронить('скан');
const изСкана = (await ждатьАбзацы()).join(' ');
проба('скан прочитан распознавателем', /Договір|Договip|Київ/i.test(изСкана), изСкана);
проба('страница поняла, что это скан',
  (await выполнить(`JSON.stringify(window.__пт())`)).includes('"распознано":1'),
  await выполнить(`JSON.stringify(window.__пт())`));

console.log('\n════ что уносит человек');
// PDF на выходе здесь НЕТ: «принёс PDF -- унёс PDF» бессмысленно, решение владельца.
// Заодно страница не тянет шрифт для сборки PDF.
проба('кнопки PDF нет', await выполнить(`!document.getElementById('пт-pdf')`));
проба('остались копирование и .txt',
  await выполнить(`!!document.getElementById('пт-копи') && !!document.getElementById('пт-txt')`));
проба('шрифт для сборки PDF страницей не запрашивался',
  await выполнить(`!performance.getEntriesByType('resource').some((з) => з.name.includes('/pdf/text.ttf'))`));

// Выделение на белом листе: буквы обязаны остаться видимыми. Общее правило когда-то красило
// их в белый, и на светлой панели выделенный текст пропадал совсем.
проба('при выделении цвет букв не подменяется',
  await выполнить(`(() => {
    const л = [...document.styleSheets].flatMap((т) => { try { return [...т.cssRules]; } catch (е) { return []; } })
      .filter((п) => п.selectorText && /::selection/.test(п.selectorText) && !/\.рг-поле/.test(п.selectorText));
    return л.length > 0 && л.every((п) => !п.style.color);
  })()`));

console.log('\n════ крестик');
await выполнить(`document.getElementById('пт-ещё').click(); true`);
await сон(300);
проба('вернулось приглашение', await выполнить(`document.getElementById('пт-старт').hidden !== true
  && document.getElementById('пт-текст').hidden === true`));

console.log('\nисключений в консоли:', ошибки.length ? ошибки : 'нет');
if (ошибки.length) беды.push('исключения в консоли');
console.log(беды.length ? `\n✗ бед: ${беды.length}` : '\n✓ всё сошлось');
for (const б of беды) console.log('   · ' + б);
process.exit(беды.length ? 1 : 0);
