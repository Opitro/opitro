// Простая, но самая важная проверка: НА ТЕЛЕФОНЕ НАЖАЛ ПЛЕЙ -- И ЗВУК ИДЁТ.
//
// Зачем она заведена. Плеер один на все 40 инструментов, поэтому любая правка в нём
// задевает сразу всех. Владелец 16.08.2026, дословно: «ты улучшаешь одно, а ломаешь
// другое». Так и было: правка нажатия по волне глушила звук через миллисекунды после
// запуска, потому что нажатие по кнопке «играть» всплывало на дорожку. Поймал это
// владелец на своём телефоне, а не я.
//
// Что меряем: после касания по «играть» бегунок должен ДВИГАТЬСЯ. Если он стоит --
// звук не пошёл или его тут же оборвали. Косвенно, зато честно: сам звук из браузера
// не вытащить, а положение бегунка берётся из хода воспроизведения.
//
// Своё окно, своя папка, свой порт -- к чужому браузеру не подключаемся (см. память).
import { spawn, execSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const ПОРТ_РАЗДАЧИ = 4472;
const ПОРТ_БРАУЗЕРА = 9358;
const ПАПКА = path.join(os.tmpdir(), 'opitro-check-audio-prof');
const ФАЙЛ = process.argv[2] || path.join(os.tmpdir(), 'opitro-proba.wav');
const сон = (ms) => new Promise((r) => setTimeout(r, ms));

const СТРАНИЦЫ = [
  ['шумоподавление', '/ru/denoise-audio'],
  ['плавное появление', '/ru/audio-fade'],
  ['выровнять громкость', '/ru/dynamic-compressor'],
  ['громкость', '/ru/audio-volume'],
];

if (!fs.existsSync('dist')) {
  console.error('Нет собранного сайта. Сначала: npm run build');
  process.exit(1);
}
// Проба звука: секунда тона, если своего файла не передали.
if (!fs.existsSync(ФАЙЛ)) {
  const sr = 44100, n = sr * 3, буф = Buffer.alloc(44 + n * 2);
  буф.write('RIFF', 0); буф.writeUInt32LE(36 + n * 2, 4); буф.write('WAVEfmt ', 8);
  буф.writeUInt32LE(16, 16); буф.writeUInt16LE(1, 20); буф.writeUInt16LE(1, 22);
  буф.writeUInt32LE(sr, 24); буф.writeUInt32LE(sr * 2, 28); буф.writeUInt16LE(2, 32);
  буф.writeUInt16LE(16, 34); буф.write('data', 36); буф.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) буф.writeInt16LE(Math.round(Math.sin(i / 18) * 12000), 44 + i * 2);
  fs.writeFileSync(ФАЙЛ, буф);
}

try { execSync(`lsof -ti tcp:${ПОРТ_РАЗДАЧИ} | xargs kill -9`, { stdio: 'ignore' }); } catch {}
const раздатчик = spawn('npx', ['--yes', 'serve@14', 'dist', '-l', String(ПОРТ_РАЗДАЧИ)], { stdio: 'ignore' });
const браузер = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  `--remote-debugging-port=${ПОРТ_БРАУЗЕРА}`, `--user-data-dir=${ПАПКА}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions',
  '--autoplay-policy=no-user-gesture-required', '--disable-backgrounding-occluded-windows',
  '--disable-renderer-backgrounding', '--disable-background-timer-throttling',
  '--window-size=420,900', 'about:blank',
], { stdio: 'ignore' });
const закрыть = () => { try { браузер.kill(); } catch {} try { раздатчик.kill(); } catch {} };
process.on('exit', закрыть);

// Ждём ГОТОВНОСТИ, а не отмеренных секунд: с фиксированной паузой проверка падала,
// когда раздатчик поднимался медленнее, и это выглядело как поломка сайта.
for (let i = 0; i < 120; i++) { try { await fetch(`http://127.0.0.1:${ПОРТ_РАЗДАЧИ}/`); break; } catch { await сон(300); } }
let верс; for (let i = 0; i < 120; i++) { try { верс = await (await fetch(`http://127.0.0.1:${ПОРТ_БРАУЗЕРА}/json/version`)).json(); break; } catch { await сон(300); } }

let ws, id = 0; const ожид = new Map();
const шлём = (m, p = {}, s) => new Promise((res, rej) => { const i = ++id; ожид.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method: m, params: p, sessionId: s })); });
ws = new WebSocket(верс.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && ожид.has(d.id)) { const { res, rej } = ожид.get(d.id); ожид.delete(d.id); d.error ? rej(new Error(d.error.message)) : res(d.result); } });

let прошло = 0; const беды = [];
for (const [имя, адрес] of СТРАНИЦЫ) {
  const { targetId } = await шлём('Target.createTarget', { url: 'about:blank' });
  const { sessionId: S } = await шлём('Target.attachToTarget', { targetId, flatten: true });
  await шлём('Runtime.enable', {}, S); await шлём('DOM.enable', {}, S);
  await шлём('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true }, S);
  await шлём('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }, S);
  await шлём('Page.navigate', { url: `http://127.0.0.1:${ПОРТ_РАЗДАЧИ}${адрес}` }, S);
  await сон(2500);
  const q = async (e) => (await шлём('Runtime.evaluate', { expression: e, returnByValue: true }, S)).result.value;
  const doc = await шлём('DOM.getDocument', {}, S);
  const поле = await шлём('DOM.querySelector', { nodeId: doc.root.nodeId, selector: 'input[type=file]' }, S);
  if (!поле.nodeId) { беды.push(`${имя} -- нет поля выбора файла`); continue; }
  await шлём('DOM.setFileInputFiles', { files: [ФАЙЛ], nodeId: поле.nodeId }, S);
  await сон(3500);
  // Кнопка «играть» называется по-разному: в обычных инструментах wave-play-btn,
  // в редакторе ed-play. Бегунок тоже: playhead и ed-playhead.
  const кн = await q('(function(){var el=document.getElementById("wave-play-btn")||document.getElementById("ed-play");if(!el)return "";var r=el.getBoundingClientRect();return JSON.stringify({x:r.x+r.width/2,y:r.y+r.height/2,off:el.disabled});})()');
  if (!кн) { беды.push(`${имя} -- нет кнопки «играть»`); continue; }
  const b = JSON.parse(кн);
  if (b.off) { беды.push(`${имя} -- кнопка «играть» заблокирована после загрузки файла`); continue; }
  await шлём('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: b.x, y: b.y, id: 1 }] }, S);
  await шлём('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, S);
  await сон(1200);
  const бег = '(function(){var p=document.getElementById("playhead")||document.getElementById("ed-playhead");return p?p.style.left:"";})()';
  const было = await q(бег);
  await сон(1600);
  const стало = await q(бег);
  if (было && стало && было !== стало) { прошло++; console.log(`  ${имя}: звук идёт (${было} -> ${стало})`); }
  else беды.push(`${имя} -- бегунок не двигается после нажатия (${было || 'пусто'} -> ${стало || 'пусто'})`);
  await шлём('Target.closeTarget', { targetId });
}

console.log(`страниц со звуком: ${прошло} из ${СТРАНИЦЫ.length}`);
if (беды.length) { console.log('НЕ ПРОШЛО:'); беды.forEach((b) => console.log('  - ' + b)); закрыть(); process.exit(1); }
console.log('звук на телефоне: всё на месте');
закрыть();
process.exit(0);
