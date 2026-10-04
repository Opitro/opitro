
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const КОРЕНЬ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ДИСТ = path.join(КОРЕНЬ, 'dist');
const СТРАНИЦА = process.argv[2] || '/uk/image-to-text/';
const ПОРТ = 8799, БРАУЗЕР = 9359;
const ПРОФИЛЬ = path.join(os.tmpdir(), 'opitro-проверка-сканера-текста');
const сон = (м) => new Promise((р) => setTimeout(р, м));

if (!fs.existsSync(path.join(ДИСТ, 'index.html'))) {
  console.log('Нет собранного сайта. Сначала: npm run build');
  process.exit(1);
}

const ТИПЫ = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ttf': 'font/ttf',
  '.onnx': 'application/octet-stream', '.tar': 'application/x-tar', '.gz': 'application/gzip' };
const сервер = http.createServer((зап, отв) => {
  const адрес = decodeURIComponent((зап.url || '/').split('?')[0]);
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

const мышь = (тип, х, у, { держим = false } = {}) => шлём('Input.dispatchMouseEvent', {
  type: тип, x: Math.round(х), y: Math.round(у), button: 'left', clickCount: 1,
  buttons: тип === 'mousePressed' ? 1 : (тип === 'mouseMoved' && держим ? 1 : 0),
}, sessionId);
const нажать = async (что) => {
  const р = await выполнить(`(() => { const э = document.getElementById('${что}');
    if (!э) return null; э.scrollIntoView({ block: 'center' });
    const р = э.getBoundingClientRect();
    return JSON.stringify({ x: р.left + р.width / 2, y: р.top + р.height / 2 }); })()`);
  if (!р) throw new Error('нет кнопки ' + что);
  const { x, y } = JSON.parse(р);
  await мышь('mousePressed', x, y);
  await мышь('mouseReleased', x, y);
};

const беды = [];
const проба = (имя, ладно, что) => {
  console.log(`  ${ладно ? '✓' : '✗'} ${имя}${что !== undefined ? ' — ' + String(что).slice(0, 120) : ''}`);
  if (!ладно) беды.push(имя);
};

await шлём('Page.navigate', { url: `http://127.0.0.1:${ПОРТ}${СТРАНИЦА}` }, sessionId);
await сон(2500);

console.log(`════ страница ${СТРАНИЦА} (интернет странице закрыт)`);
проба('разметка на месте', await выполнить(`!!document.getElementById('тс-старт') && !!document.getElementById('тс-окно')`));
проба('обработчик жив: кнопки отвечают',
  await выполнить(`!!document.getElementById('тс-файл') && typeof window.__тсПрочитать === 'function'`));

await выполнить(`window.__пойман = null;
  const прежний = URL.createObjectURL.bind(URL);
  URL.createObjectURL = (о) => { if (о && о.type === 'application/pdf') window.__пойман = о; return прежний(о); }; true`);

await выполнить(`(async () => {
  const абзац = 'Сторони домовилися, що виконавець передає замовнику результат роботи у строк, '
    + 'погоджений сторонами у додатку номер один, який є невідʼємною частиною цього договору '
    + 'та підписується обома сторонами у двох примірниках однакової юридичної сили.';
  const х = document.createElement('canvas'); х.width = 1100; х.height = 520;
  const к = х.getContext('2d');
  к.fillStyle = '#fff'; к.fillRect(0, 0, 1100, 520);
  к.fillStyle = '#111'; к.font = '400 38px Georgia';
  const предел = 1000;
  const строки = [];
  let текущая = '';
  for (const слово of абзац.split(' ')) {
    const проба = текущая ? текущая + ' ' + слово : слово;
    if (текущая && к.measureText(проба).width > предел) { строки.push(текущая); текущая = слово; }
    else текущая = проба;
  }
  if (текущая) строки.push(текущая);
  строки.push('Місто Київ');
  const подпись = строки.length - 1;
  строки.forEach((с, и) => к.fillText(с, 50, 80 + и * 62 + (и === подпись ? 70 : 0)));
  const капля = await new Promise((г) => х.toBlob(г, 'image/png'));
  const дт = new DataTransfer(); дт.items.add(new File([капля], 'проба.png', { type: 'image/png' }));
  document.getElementById('тс-старт').dispatchEvent(new DragEvent('drop', { dataTransfer: дт, bubbles: true, cancelable: true }));
  return true;
})()`);

const ждатьТекст = async (прежний = '') => {
  for (let и = 0; и < 90; и++) {
    await сон(1000);
    const т = (await выполнить(`document.getElementById('тс-текст')?.textContent || ''`)).trim();
    if (т && т !== прежний) return т;
  }
  return '(не дождался)';
};

console.log('\n════ чтение без интернета');
const прочитано = await ждатьТекст();
проба('текст прочитан', прочитано.includes('Сторони') && прочитано.includes('Місто'), прочитано);
проба('читала нейросеть, а не запасной движок',
  (await выполнить(`(window.__тс && window.__тс.движок) || ''`)) === 'сеть',
  await выполнить(`JSON.stringify(window.__тс || null)`));
проба('снимок остался на экране вместе с текстом',
  await выполнить(`!document.getElementById('тс-окно').hidden && !document.getElementById('тс-текст').hidden`));

console.log('\n════ текст абзацами, а не столбиком');
const абзацы = JSON.parse(await выполнить(`JSON.stringify([...document.querySelectorAll('.тс-абзац')].map((э) => э.textContent.trim()))`));
проба('переносы сшиты: сплошной текст -- один абзац',
  абзацы.some((т) => т.includes('Сторони') && т.includes('договору')), абзацы[0]);
проба('короткая строка осталась сама по себе', абзацы.some((т) => т.startsWith('Місто')));
проба('всего два абзаца, а не столбик строк', абзацы.length === 2, абзацы.length);

console.log('\n════ кнопки');
проба('PDF -- надписью', (await выполнить(`document.getElementById('тс-pdf')?.textContent.trim()`)) === 'PDF');
проба('крестик -- в углу снимка',
  await выполнить(`(() => { const к = document.getElementById('тс-ещё');
    return !!к && document.getElementById('тс-окно').contains(к) && getComputedStyle(к).position === 'absolute'; })()`));
проба('убранного нет: ни луны, ни переключателя вида',
  await выполнить(`!document.getElementById('тс-луна') && !document.getElementById('тс-налисте')`));
проба('у кнопок со словом нет подсказки, повторяющей слово',
  await выполнить(`!document.getElementById('тс-файл').hasAttribute('title') && !document.getElementById('тс-камера').hasAttribute('title')`));

console.log('\n════ обводка куска на уже прочитанном снимке');
await нажать('тс-кусок');
await сон(300);
проба('обводка включилась', await выполнить(`document.getElementById('тс-кусок').classList.contains('взята')`));
const кадр = JSON.parse(await выполнить(`(() => { const э = document.getElementById('тс-снимок');
  э.scrollIntoView({ block: 'center' }); const р = э.getBoundingClientRect();
  return JSON.stringify({ л: р.left, в: р.top, ш: р.width, вы: р.height }); })()`));
await мышь('mousePressed', кадр.л + 5, кадр.в + 5);
await мышь('mouseMoved', кадр.л + кадр.ш / 2, кадр.в + кадр.вы * 0.25, { держим: true });
await мышь('mouseMoved', кадр.л + кадр.ш - 5, кадр.в + кадр.вы * 0.62, { держим: true });
проба('рамка тянется за мышью', await выполнить(`!document.getElementById('тс-выдел').hidden`));
await мышь('mouseReleased', кадр.л + кадр.ш - 5, кадр.в + кадр.вы * 0.62);
const поКуску = await ждатьТекст(прочитано);
проба('перечитался только обведённый кусок',
  поКуску.includes('Сторони') && !поКуску.includes('Місто'), поКуску);
await нажать('тс-кусок');
проба('вторым нажатием вернулся весь снимок', (await ждатьТекст(поКуску)).includes('Місто'));

console.log('\n════ PDF');
await выполнить(`document.getElementById('тс-pdf').click(); true`);
for (let и = 0; и < 40; и++) { await сон(500); if (await выполнить(`!!window.__пойман`)) break; }
проба('PDF собрался', await выполнить(`!!window.__пойман`));
проба('PDF не пустой и со шрифтом внутри',
  await выполнить(`(async () => { if (!window.__пойман) return false;
    const б = new Uint8Array(await window.__пойман.arrayBuffer());
    let с = ''; for (const з of б) с += String.fromCharCode(з);
    return б.length > 20000 && с.startsWith('%PDF-') && с.includes('/FontFile2'); })()`));

console.log('\n════ крестик убирает снимок');
await нажать('тс-ещё');
await сон(400);
проба('вернулось приглашение', await выполнить(`document.getElementById('тс-окно').hidden === true
  && document.getElementById('тс-старт').hidden !== true`));

console.log('\nисключений в консоли:', ошибки.length ? ошибки : 'нет');
if (ошибки.length) беды.push('исключения в консоли');
console.log(беды.length ? `\n✗ бед: ${беды.length}` : '\n✓ всё сошлось');
for (const б of беды) console.log('   · ' + б);
process.exit(беды.length ? 1 : 0);
