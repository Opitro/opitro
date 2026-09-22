// ВВОД ФАЙЛА В ffmpeg: монтирование вместо копирования.
//
// Входной файл больше не копируется в память дважды -- он монтируется (WORKERFS), и ffmpeg
// читает его кусками. Замер на чистом стенде: копирование стоит около 1,7 мс на мегабайт и
// исчезает целиком (3033 мс -> 1 мс на 1800 МБ).
//
// Проверяются три вещи, и каждая ловит свою беду:
//   1. ввод ДЕЙСТВИТЕЛЬНО смонтирован. При любой осечке код молча откатывается к копированию,
//      и без этой пробы проверка прошла бы зелёной, ничего не проверив;
//   2. пересчёт доходит до конца и отдаёт настоящий файл;
//   3. ВТОРОЙ файл подряд тоже проходит -- обычная защита от порчи при правках.
//
// ЧЕГО ЭТА ПРОВЕРКА НЕ ЛОВИТ, и это важно знать. Забытую уборку (unmount + deleteDir) она не
// поймает: сайт зовёт resetFFmpeg() после каждого файла, то есть поднимает ядро заново, и
// точка монтирования до следующего файла просто не доживает. Я сперва написал обратное и
// проверил -- нарочно убрал уборку, и проверка осталась зелёной. Сама уборка всё равно нужна
// и проверена отдельно, на голом ядре: два монтирования подряд без неё дают «ErrnoError: FS
// error», с ней проходят оба (scratchpad/проба-уборки.mjs).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const КОРЕНЬ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ДИСТ = path.join(КОРЕНЬ, 'dist');
const СТРАНИЦА = process.argv[2] || '/ru/audio-converter/';
const ПОРТ = 8827, БРАУЗЕР = 9387;
const сон = (м) => new Promise((р) => setTimeout(р, м));

if (!fs.existsSync(path.join(ДИСТ, 'index.html'))) {
  console.log('Нет собранного сайта. Сначала: npm run build');
  process.exit(1);
}

/** Короткий WAV с настоящим звуком: тишина сжалась бы в ничто и ничего бы не проверила. */
function пробаWav(секунд) {
  const чп = 44100, данных = чп * 4 * секунд;
  const б = Buffer.alloc(44 + данных);
  б.write('RIFF', 0); б.writeUInt32LE(36 + данных, 4); б.write('WAVEfmt ', 8);
  б.writeUInt32LE(16, 16); б.writeUInt16LE(1, 20); б.writeUInt16LE(2, 22);
  б.writeUInt32LE(чп, 24); б.writeUInt32LE(чп * 4, 28); б.writeUInt16LE(4, 32); б.writeUInt16LE(16, 34);
  б.write('data', 36); б.writeUInt32LE(данных, 40);
  for (let и = 0; и < данных; и += 2) б.writeInt16LE(Math.round(Math.sin(и / 40) * 12000), 44 + и);
  return б;
}
const ОБРАЗЦЫ = { '/один.wav': пробаWav(4), '/два.wav': пробаWav(3) };

const ТИПЫ = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.wav': 'audio/wav',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };
const сервер = http.createServer((зап, отв) => {
  const адрес = decodeURIComponent((зап.url || '/').split('?')[0]);
  if (ОБРАЗЦЫ[адрес]) { отв.writeHead(200, { 'Content-Type': 'audio/wav' }); отв.end(ОБРАЗЦЫ[адрес]); return; }
  let файл = path.join(ДИСТ, path.normalize(адрес).replace(/^(\.\.[/\\])+/, ''));
  if (fs.existsSync(файл) && fs.statSync(файл).isDirectory()) файл = path.join(файл, 'index.html');
  if (!fs.existsSync(файл)) { отв.writeHead(404); отв.end('нет'); return; }
  отв.writeHead(200, { 'Content-Type': ТИПЫ[path.extname(файл)] || 'application/octet-stream' });
  fs.createReadStream(файл).pipe(отв);
});
await new Promise((р) => сервер.listen(ПОРТ, р));

try { execSync(`lsof -ti tcp:${БРАУЗЕР} | xargs kill -9`, { stdio: 'ignore' }); } catch (е) {}
// Ядро ffmpeg (32 МБ) приезжает с чужого CDN, поэтому интернет здесь НЕ закрываем -- в
// отличие от прочих живых проверок. Это само по себе слабое место, но чинится отдельно.
const браузер = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  `--remote-debugging-port=${БРАУЗЕР}`, `--user-data-dir=${path.join(os.tmpdir(), 'opitro-проверка-ffmpeg')}`,
  '--headless=new', '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });
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
const шлём = (м, п = {}, с) => new Promise((да, нет) => { const и = ++счёт; ждут.set(и, { да, нет }); ws.send(JSON.stringify({ id: и, method: м, params: п, sessionId: с })); });
const { targetId } = await шлём('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await шлём('Target.attachToTarget', { targetId, flatten: true });
await шлём('Runtime.enable', {}, sessionId);
const выполнить = async (к) => {
  const о = await шлём('Runtime.evaluate', { expression: к, awaitPromise: true, returnByValue: true }, sessionId);
  if (о.exceptionDetails) throw new Error(о.exceptionDetails.exception?.description || о.exceptionDetails.text);
  return о.result.value;
};

const беды = [];
const проба = (имя, ладно, что) => {
  console.log(`  ${ладно ? '✓' : '✗'} ${имя}${что !== undefined ? ' — ' + String(что).slice(0, 110) : ''}`);
  if (!ладно) беды.push(имя);
};

await шлём('Page.navigate', { url: `http://127.0.0.1:${ПОРТ}${СТРАНИЦА}` }, sessionId);
await сон(2500);

// Готовый файл уходит человеку скачиванием -- ловим его на выходе.
await выполнить(`window.__ушло = [];
  const п = URL.createObjectURL.bind(URL);
  URL.createObjectURL = (о) => { if (о instanceof Blob) window.__ушло.push(о); return п(о); }; true`);

/** Один прогон: кладём файл в поле, жмём, ждём готовности по надписи самой страницы. */
async function прогон(адрес) {
  await выполнить(`window.__ffInput = null; true`);
  await выполнить(`(async () => {
    const б = await (await fetch(${JSON.stringify(адрес)})).blob();
    const дт = new DataTransfer();
    дт.items.add(new File([б], 'проба.wav', { type: 'audio/wav' }));
    const поле = document.getElementById('audio-file-input');
    поле.files = дт.files;
    поле.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await сон(2500);
  const былоУшло = await выполнить('window.__ушло.length');
  await выполнить(`document.querySelector('#audio-run-btn').click(); true`);
  // Признак готовности -- надпись самой страницы. Ряд скачивания тут не показывается вовсе:
  // конвертер отдаёт файл сразу, и проверка по нему молчала бы вечно.
  for (let и = 0; и < 80; и++) {
    await сон(1500);
    const с = await выполнить(`JSON.stringify({
      надпись: (document.querySelector('[id*=progress], .progress-text') || {}).textContent || '',
      ушло: window.__ушло.length,
      ввод: window.__ffInput || '-',
    })`);
    const о = JSON.parse(с);
    if (о.ушло > былоУшло && /готов|done|listo/i.test(о.надпись)) return о;
  }
  return { надпись: '(не дождался)', ушло: былоУшло, ввод: await выполнить(`window.__ffInput || '-'`) };
}

console.log(`════ страница ${СТРАНИЦА}`);
console.log('\n════ первый файл');
const первый = await прогон('/один.wav');
проба('ввод СМОНТИРОВАН, а не скопирован', первый.ввод === 'mount', первый.ввод);
проба('пересчёт дошёл до конца', /готов|done|listo/i.test(первый.надпись), первый.надпись);
проба('файл на выходе настоящий', await выполнить(`(async () => {
  const к = window.__ушло[window.__ушло.length - 1];
  if (!к || к.size < 2000) return false;
  const б = new Uint8Array(await к.slice(0, 3).arrayBuffer());
  // MP3: либо метка ID3, либо начало кадра (0xFF 0xEx).
  return (б[0] === 0x49 && б[1] === 0x44 && б[2] === 0x33) || (б[0] === 0xFF && (б[1] & 0xE0) === 0xE0);
})()`), await выполнить(`(window.__ушло[window.__ушло.length - 1] || {}).size + ' байт'`));

console.log('\n════ второй файл подряд');
const второй = await прогон('/два.wav');
проба('второй файл тоже смонтировался', второй.ввод === 'mount', второй.ввод);
проба('второй пересчёт дошёл до конца', /готов|done|listo/i.test(второй.надпись), второй.надпись);

console.log('\nисключений в консоли:', ошибки.length ? ошибки.slice(0, 3) : 'нет');
if (ошибки.length) беды.push('исключения в консоли');
console.log(беды.length ? `\n✗ бед: ${беды.length}` : '\n✓ всё сошлось');
for (const б of беды) console.log('   · ' + б);
process.exit(беды.length ? 1 : 0);
