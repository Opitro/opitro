/*
  Постоянная проверка аудиоредактора: проходит весь путь человека и сверяет всё, о чём
  договаривались с владельцем.

  Зачем она появилась. За два дня работы над редактором владелец нашёл десять поломок, и
  девять из них были СВЕЖИМИ -- я чинил одно и ломал соседнее. Сборка и обычные тесты этого
  не ловят: код исполняется без ошибок и делает ровно то, что написано. Ловится только
  прохождением пути и замером результата.

  Проверяется не «нарисовалось», а результат: длительность и пики скачанного файла,
  усиление живых узлов, положение бегунка, высота нарисованной волны в точках.

  Запуск:  node scripts/check-editor.mjs
  Нужен собранный сайт (npm run build) и свободный порт 4321 -- сервер поднимается сам.
*/

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'opitro-editor-'));
const PORT = 4399;
const CDP = 9260;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let pass = 0;
const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; return; }
  fails.push(detail ? `${name} -- ${detail}` : name);
}

/** Тестовый звук: минута мелодии, чтобы волна была не полкой и слышны были края. */
function makeWav(file, seconds) {
  const sr = 44100, ch = 2, n = sr * seconds;
  const b = Buffer.alloc(44 + n * ch * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * ch * 2, 4); b.write('WAVE', 8);
  b.write('fmt ', 12); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20);
  b.writeUInt16LE(ch, 22); b.writeUInt32LE(sr, 24);
  b.writeUInt32LE(sr * ch * 2, 28); b.writeUInt16LE(ch * 2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(n * ch * 2, 40);
  const notes = [261.6, 329.6, 392, 523.2, 392, 329.6, 261.6, 196];
  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const f = notes[Math.floor(t) % notes.length];
    const env = 0.55 + 0.45 * Math.sin(t * 3);
    const v = Math.sin(2 * Math.PI * f * t) * env * 0.7;
    const s = Math.max(-1, Math.min(1, v)) * 30000;
    b.writeInt16LE(s, 44 + i * 4); b.writeInt16LE(s, 44 + i * 4 + 2);
  }
  fs.writeFileSync(file, b);
}

const WAV_A = path.join(TMP, 'proba-a.wav');
const WAV_B = path.join(TMP, 'proba-b.wav');
makeWav(WAV_A, 60);
makeWav(WAV_B, 12);

// --- сервер и браузер ---------------------------------------------------------------------
const dist = path.join(ROOT, 'dist');
if (!fs.existsSync(path.join(dist, 'ru', 'trim-audio', 'index.html'))) {
  console.error('Нет собранного сайта. Сначала: npm run build');
  process.exit(1);
}
const server = spawn('npx', ['--yes', 'serve@14', dist, '-l', String(PORT)], { stdio: 'ignore' });
const chromeBin = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = spawn(chromeBin, [
  `--remote-debugging-port=${CDP}`, `--user-data-dir=${path.join(TMP, 'prof')}`,
  '--no-first-run', '--no-default-browser-check', '--disable-extensions',
  // Без этих флагов окно в фоне душит таймеры и звуковой движок, и замеры врут в разы.
  '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding',
  '--disable-background-timer-throttling', '--autoplay-policy=no-user-gesture-required',
  '--window-size=1300,900', 'about:blank',
], { stdio: 'ignore' });

function done(code) {
  try { chrome.kill(); } catch (e) {}
  try { server.kill(); } catch (e) {}
  try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) {}
  process.exit(code);
}

let ws, msgId = 0;
const pending = new Map();
const errors = [];
const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
  const id = ++msgId; pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});

let version;
for (let i = 0; i < 80; i++) {
  try { version = await (await fetch(`http://127.0.0.1:${CDP}/json/version`)).json(); break; }
  catch { await sleep(400); }
}
if (!version) { console.error('Chrome не поднялся'); done(1); }

ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
ws.addEventListener('message', (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) {
    const { res, rej } = pending.get(d.id); pending.delete(d.id);
    d.error ? rej(new Error(d.error.message)) : res(d.result);
    return;
  }
  if (d.method === 'Runtime.exceptionThrown') {
    errors.push((d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text || '').slice(0, 160));
  }
});

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId: S } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, S);
await send('Runtime.enable', {}, S);
await send('DOM.enable', {}, S);
const DL = path.join(TMP, 'dl');
fs.mkdirSync(DL, { recursive: true });
await send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: DL }, S).catch(() => {});

const q = async (expr) =>
  (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, S)).result.value;
const click = (id) => q(`document.getElementById('${id}').click()`);
const setSlider = (id, val) =>
  q(`(()=>{const i=document.getElementById('${id}');i.value=${val};
     i.dispatchEvent(new Event('input',{bubbles:true}));
     i.dispatchEvent(new Event('change',{bubbles:true}));return 1})()`);
async function putFile(file) {
  const doc = await send('DOM.getDocument', {}, S);
  const node = await send('DOM.querySelector', { nodeId: doc.root.nodeId, selector: '#ed-file' }, S);
  await send('DOM.setFileInputFiles', { files: [file], nodeId: node.nodeId }, S);
  await sleep(2600);
}
/** Тянем ручку: доля 0..1 по ширине дорожки. */
const dragHandle = (fromFrac, toFrac, pid) => q(`(()=>{
  const w=document.getElementById('ed-wave');const r=w.getBoundingClientRect();
  const o={clientY:r.top+40,bubbles:true,pointerId:${pid},pointerType:'mouse'};
  w.dispatchEvent(new PointerEvent('pointerdown',{...o,clientX:r.left+r.width*${fromFrac}}));
  w.dispatchEvent(new PointerEvent('pointermove',{...o,clientX:r.left+r.width*${toFrac}}));
  w.dispatchEvent(new PointerEvent('pointerup',o));return 1})()`);
/** Пустые поля сверху и снизу у столбца в середине дорожки, в точках холста. */
const waveGaps = () => q(`(()=>{const c=document.getElementById('ed-canvas');const g=c.getContext('2d');
  const W=c.width,H=c.height,x=Math.round(W*0.5);
  const d=g.getImageData(x,0,1,H).data; let top=H,bot=0;
  for(let y=0;y<H;y++) if(d[y*4+3]>10){ if(y<top)top=y; if(y>bot)bot=y }
  return {top,bot,H}})()`);

await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/ru/trim-audio` }, S);
await sleep(3200);
// Перехват узлов усиления ставится ДО первого воспроизведения: живая цепочка строится
// один раз, и позже её узлы уже не поймать -- проверка фейда молча мерила бы не то.
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: `window.__g=[];const P=(window.AudioContext||window.webkitAudioContext).prototype;
    const o=P.createGain;P.createGain=function(){const g=o.call(this);window.__g.push(g);return g};`
}, S);
await send('Page.reload', {}, S);
await sleep(3200);

// ============================ проверки =====================================================
ok('редактор есть на странице', await q(`!!document.querySelector('.audio-ed-wrap')`));
// На айфоне `accept="audio/*"` сводит выбор к музыкальной библиотеке: файлы из «Файлов»
// и iCloud становятся недоступны. Владелец нашёл это сравнением с работающими страницами.
ok('у выбора файла нет ограничения accept',
   !(await q(`document.getElementById('ed-file').hasAttribute('accept')`)));
await putFile(WAV_A);
ok('панель открылась после загрузки', await q(`document.getElementById('ed-root').classList.contains('on')`));
ok('семь вкладок', (await q(`document.querySelectorAll('.ed-tool').length`)) === 7);
ok('на /trim-audio активна обрезка', (await q(`document.querySelector('.ed-tool.on')?.dataset.id`)) === 'trim');
ok('длительность показана', (await q(`document.getElementById('ed-t1').textContent`)) === '01:00.0');

// --- бегунок -------------------------------------------------------------------------------
await click('ed-play');
await sleep(400);
const ph1 = await q(`parseInt(document.getElementById('ed-playhead').style.left)||0`);
await sleep(2000);
const ph2 = await q(`parseInt(document.getElementById('ed-playhead').style.left)||0`);
const cw = await q(`document.getElementById('ed-canvas').clientWidth`);
const expect = (cw * 2) / 60;
ok('бегунок идёт с правильной скоростью', Math.abs((ph2 - ph1) - expect) < expect * 0.6,
   `прошёл ${ph2 - ph1} точек за 2с, ожидалось около ${Math.round(expect)}`);
await click('ed-play');
await sleep(300);
ok('пауза останавливает', !(await q(`document.getElementById('ed-play-ico').innerHTML.includes('M6 5h4')`)));

// --- клик по дорожке ставит бегунок, но не играет -------------------------------------------
await click('ed-stop');
await q(`(()=>{const w=document.getElementById('ed-wave');const r=w.getBoundingClientRect();
  const o={clientY:r.top+40,bubbles:true,pointerId:31,pointerType:'mouse',clientX:r.left+r.width*0.6};
  w.dispatchEvent(new PointerEvent('pointerdown',o));w.dispatchEvent(new PointerEvent('pointerup',o));return 1})()`);
await sleep(500);
ok('клик по дорожке НЕ запускает звук',
   !(await q(`document.getElementById('ed-play-ico').innerHTML.includes('M6 5h4')`)));
ok('клик по дорожке ставит бегунок', (await q(`parseInt(document.getElementById('ed-playhead').style.left)||0`)) > 0);

// Логика старых плееров: клик во время звучания ОСТАНАВЛИВАЕТ его, а не перематывает.
await click('ed-play');
await sleep(600);
await q(`(()=>{const w=document.getElementById('ed-wave');const r=w.getBoundingClientRect();
  const o={clientY:r.top+40,bubbles:true,pointerId:33,pointerType:'mouse',clientX:r.left+r.width*0.35};
  w.dispatchEvent(new PointerEvent('pointerdown',o));w.dispatchEvent(new PointerEvent('pointerup',o));return 1})()`);
await sleep(500);
ok('клик во время звучания останавливает',
   !(await q(`document.getElementById('ed-play-ico').innerHTML.includes('M6 5h4')`)));
ok('черточка после остановки кликом остаётся видимой',
   (await q(`document.getElementById('ed-playhead').style.display`)) !== 'none');

// --- громкость ------------------------------------------------------------------------------
await q(`document.querySelector('.ed-tool[data-id="volume"]').click()`);
await sleep(400);
const gapNormal = await waveGaps();
await setSlider('ed-vol', 100);
await sleep(600);
const gapLoud = await waveGaps();
ok('громкая волна не доходит до края', gapLoud.top > 2 && (gapLoud.H - 1 - gapLoud.bot) > 2,
   `сверху ${gapLoud.top}, снизу ${gapLoud.H - 1 - gapLoud.bot}`);
ok('громкая волна выше обычной', gapLoud.bot > gapNormal.bot);
const flatTop = await q(`(()=>{const c=document.getElementById('ed-canvas');const g=c.getContext('2d');
  const W=c.width,H=c.height;let run=0,best=0;
  for(let x=0;x<W;x+=2){const d=g.getImageData(x,0,1,H).data;let top=H;
    for(let y=0;y<H;y++) if(d[y*4+3]>10){top=y;break}
    if(top===0){run++;if(run>best)best=run}else run=0}
  return best})()`);
ok('нет плоской макушки при громком звуке', flatTop === 0, `${flatTop} столбцов упёрлись в верх`);
await setSlider('ed-vol', -100);
await sleep(700);
const gapZero = await waveGaps();
ok('на нулевой громкости волна схлопывается', Math.abs(gapZero.bot - gapZero.H / 2) < 6,
   `нижний край на ${gapZero.bot} при оси ${gapZero.H / 2}`);
await setSlider('ed-vol', 0);
await sleep(400);

// --- скорость и высота: мгновенно и не прерывают звук ---------------------------------------
await q(`document.querySelector('.ed-tool[data-id="speed"]').click()`);
await sleep(400);
await click('ed-play');
await sleep(700);
const msSpeed = await q(`(()=>{const t0=performance.now();
  const i=document.getElementById('ed-speed');i.value=170;
  i.dispatchEvent(new Event('input',{bubbles:true}));
  return Math.round(performance.now()-t0)})()`);
await sleep(600);
ok('смена скорости мгновенная', msSpeed < 60, `${msSpeed} мс`);
ok('смена скорости не прерывает звук',
   await q(`document.getElementById('ed-play-ico').innerHTML.includes('M6 5h4')`));
ok('на смене скорости не появляется замок',
   !(await q(`document.getElementById('ed-root').classList.contains('is-busy')`)));
await click('ed-stop');

// --- обрезка ручками + фейды -----------------------------------------------------------------
// Возвращаем скорость: иначе скачанный файл будет короче выделения -- и это ВЕРНО,
// просто проверять длину выделения надо на нетронутой скорости.
await setSlider('ed-speed', 100);
await sleep(400);
await q(`document.querySelector('.ed-tool[data-id="trim"]').click()`);
await sleep(400);
await dragHandle(0.0, 0.25, 41);
await dragHandle(1.0, 0.75, 42);
await sleep(500);
ok('ручки двигаются', (await q(`document.getElementById('ed-s0').textContent`)) === '00:15.0');
ok('кнопки «Обрезать» нет', !(await q(`!!document.getElementById('ed-apply-trim')`)));
await click('ed-fadein');
await click('ed-fadeout');
await sleep(500);
ok('фейды остаются нажатыми',
   await q(`document.getElementById('ed-fadein').classList.contains('ed-on') && document.getElementById('ed-fadeout').classList.contains('ed-on')`));
// волна ЗА ручками не должна пропадать
const outside = await q(`(()=>{const c=document.getElementById('ed-canvas');const g=c.getContext('2d');
  const W=c.width,H=c.height,x=Math.round(W*0.1);
  const d=g.getImageData(x,0,1,H).data;let n=0;
  for(let y=0;y<H;y++) if(d[y*4+3]>10) n++;
  return n})()`);
ok('волна за ручками не пропадает при фейде', outside > 4, `закрашено ${outside} точек`);

// --- фейд слышен -------------------------------------------------------------------------------
await click('ed-play');
await sleep(300);
const fg1 = await q(`window.__g.length? window.__g[0].gain.value : 1`);
await sleep(1500);
const fg2 = await q(`window.__g.length? window.__g[0].gain.value : 1`);
ok('фейд слышен при прослушивании', fg2 > fg1 + 0.05, `усиление ${fg1.toFixed(3)} -> ${fg2.toFixed(3)}`);
await click('ed-stop');

// --- скачивание ---------------------------------------------------------------------------------
await q(`document.getElementById('ed-fmt').value='wav'`);
await click('ed-save');
await sleep(14000);
const got = fs.readdirSync(DL).filter((f) => f.endsWith('.wav'));
ok('файл скачался', got.length > 0);
if (got.length) {
  const b = fs.readFileSync(path.join(DL, got[0]));
  const sr = b.readUInt32LE(24), ch = b.readUInt16LE(22);
  const n = (b.length - 44) / (ch * 2);
  const peak = (a, z) => { let m = 0; for (let i = a; i < z; i++) { const x = Math.abs(b.readInt16LE(44 + i * ch * 2)); if (x > m) m = x; } return m / 32768; };
  const dur = n / sr;
  ok('скачивается ВЫДЕЛЕННОЕ, а не весь файл', Math.abs(dur - 30) < 2, `${dur.toFixed(1)} с вместо 30`);
  const edge = Math.floor(n / 20);
  const pl = peak(0, edge), pm = peak(Math.floor(n * 0.45), Math.floor(n * 0.55)), pr = peak(n - edge, n);
  ok('фейд попал в файл слева', pl < pm * 0.7, `край ${pl.toFixed(3)} против середины ${pm.toFixed(3)}`);
  ok('фейд попал в файл справа', pr < pm * 0.7, `край ${pr.toFixed(3)} против середины ${pm.toFixed(3)}`);
  ok('фейды одинаковые слева и справа', Math.abs(pl - pr) < 0.08, `${pl.toFixed(3)} и ${pr.toFixed(3)}`);
}

// --- после скачивания звук не должен пропасть -----------------------------------------------------
await click('ed-play');
await sleep(1200);
ok('после скачивания звук ещё играет',
   await q(`document.getElementById('ed-play-ico').innerHTML.includes('M6 5h4')`));
await click('ed-stop');

// --- новый файл открывается чистым ------------------------------------------------------------------
await click('ed-close');
await sleep(600);
await putFile(WAV_B);
ok('новый файл: фейды сброшены',
   !(await q(`document.getElementById('ed-fadein')?.classList.contains('ed-on')`)) &&
   !(await q(`document.getElementById('ed-fadeout')?.classList.contains('ed-on')`)));
await q(`document.querySelector('.ed-tool[data-id="volume"]').click()`);
await sleep(400);
ok('новый файл: громкость сброшена', (await q(`document.getElementById('ed-vol').value`)) === '0');
ok('новый файл: своя длительность', (await q(`document.getElementById('ed-t1').textContent`)) === '00:12.0');

// Десять полос эквалайзера обязаны помещаться на телефоне без обрезки. Замерено: на
// экране 412 ряду нужно было 598 точек при 320 доступных -- половина полос уезжала.
await send('Emulation.setDeviceMetricsOverride', { width: 412, height: 900, deviceScaleFactor: 2, mobile: true }, S);
await sleep(600);
await q(`document.querySelector('.ed-tools-list select') ? (()=>{const s=document.querySelector('.ed-tools-list select');s.value='equalizer';s.dispatchEvent(new Event('change'))})() : document.querySelector('.ed-tool[data-id="equalizer"]').click()`);
await sleep(700);
const eqFit = await q(`(()=>{const eq=document.querySelector('.ed-eq');
  return eq ? { need: Math.round(eq.scrollWidth), have: Math.round(eq.clientWidth) } : null})()`);
ok('эквалайзер помещается на телефоне', eqFit && eqFit.need <= eqFit.have + 2,
   eqFit ? ('нужно ' + eqFit.need + ' при ' + eqFit.have) : 'панель не найдена');

// Черта нуля обязана совпадать с положением ручки при нулевом значении. Дважды не
// совпадала: отмерялась от всей строки вместе с подписью, а не от самой дорожки.
await send('Emulation.setDeviceMetricsOverride', { width: 1180, height: 950, deviceScaleFactor: 2, mobile: false }, S);
await sleep(500);
await q(`document.querySelector('.ed-tool[data-id="volume"]')?.click()`);
await sleep(600);
const midOff = await q(`(()=>{const el=document.getElementById('ed-vol');
  const m=document.querySelector('.ed-slot .ed-mid');
  if(!el||!m) return null;
  const t=el.getBoundingClientRect(), r=m.getBoundingClientRect();
  return Math.round(Math.abs(r.left+r.width/2 - (t.left+t.width/2)))})()`);
ok('черта нуля совпадает с ручкой', midOff != null && midOff <= 3, 'расхождение ' + midOff + ' точек');

// Область захвата ползунка -- не меньше 44 точек: столько нужно пальцу. Раньше она
// совпадала с шириной дорожки, и по вертикальной полосе приходилось попадать точно.
const grab = await q(`(()=>{const i=document.querySelector('#ed-eq input');
  if(!i) return null; const r=i.getBoundingClientRect();
  return {w:Math.round(r.width), h:Math.round(r.height)}})()`);
ok('область захвата фейдера под палец', grab && grab.w >= 40,
   grab ? (grab.w + ' x ' + grab.h + ' точек') : 'полосы не найдены');

ok('в консоли нет исключений', errors.length === 0, errors.join(' | '));

// ============================ итог ==================================================================
console.log(`проверок пройдено: ${pass}`);
if (fails.length) {
  console.log(`НЕ ПРОШЛО: ${fails.length}`);
  fails.forEach((f) => console.log('  - ' + f));
  done(1);
}
console.log('редактор: всё на месте');
done(0);
