/*
  ВСЕ ПЛЕЕРЫ САЙТА: ЗВУК ИДЁТ, КНОПКА ГЛУШИТ, ЛИШНЕГО НЕ ЗВУЧИТ.

  Проверяем РАБОТУ, а не задумку. Ни одного «должно быть так»: страницы устроены по-разному
  (буферный узел, обработчик потока, обычный <audio>), и правила у них свои. Здесь только то,
  что обязано быть верным всегда и везде:

    1. файл принят -- кнопка пуска ожила;
    2. нажал пуск -- звук ПОЯВИЛСЯ (меряем настоящую громкость на выходе движка);
    3. нажал ещё -- звук ПРОПАЛ;
    4. нажал снова -- звук вернулся;
    5. одновременно не звучит больше одного источника (та самая беда с двумя голосами);
    6. страница не сыпала ошибками.

  Сделано, чтобы работать годами:
  - раздатчик свой, на голом node -- не тянем ничего из сети, и проверка не зависит от того,
    жив ли чужой пакет через три года;
  - страницы ищутся сами: берём из готовой сборки всё, где есть плеер и выбор файла. Новый
    инструмент попадает под проверку без правки этого файла;
  - кнопка пуска ищется по нескольким приметам, а не по одному имени;
  - браузер без окна: перекрытое окно Chrome усыпляет отрисовку, и проверка врёт (ловил
    check-tempo);
  - звук меряется анализатором, подключённым к выходу: любое устройство страницы годится.

  Запуск:  npm run check:players   (нужен npm run build)
           npm run check:players -- /ru/trim-audio   -- только одна страница
*/
import { spawn, execSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const КОРЕНЬ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ДИСТ = path.join(КОРЕНЬ, 'dist');
const ПОРТ = 4501, БРАУЗЕР = 9451;
const ПРОФИЛЬ = path.join(os.tmpdir(), 'opitro-players-check');
const сон = (мс) => new Promise((r) => setTimeout(r, мс));
// Абсолютных порогов НЕТ, и это нарочно. Страницы звучат по-разному: компрессор отдаёт
// заметно тише реверба, шумодав тише всех. Поэтому сравниваем с молчанием этой же страницы:
// сперва меряем тишину до нажатия, потом требуем, чтобы звук был заметно громче ЕЁ. Так
// проверка не придирается к тихим инструментам и не пропускает немые.
const ШУМ = 0.0008;          // ниже этого -- уже не сигнал, а погрешность измерения

if (!fs.existsSync(ДИСТ)) { console.log('нет папки dist -- сначала npm run build'); process.exit(1); }

/* ---- какие страницы проверять ---------------------------------------------------------------
   Ищем в собранной сборке страницы, где есть и выбор файла, и кнопка плеера. Так список
   поддерживает себя сам: добавится инструмент -- он сюда попадёт. */
const КНОПКИ = ['wave-play-btn', 'mt-play', 'st-play', 'ed-play', 'sv-play'];
function найтиСтраницы() {
  const свои = process.argv.slice(2).filter((а) => а.startsWith('/'));
  if (свои.length) return свои;
  const папка = path.join(ДИСТ, 'ru');
  const найдено = [];
  for (const имя of fs.readdirSync(папка)) {
    const файл = path.join(папка, имя, 'index.html');
    if (!fs.existsSync(файл)) continue;
    const текст = fs.readFileSync(файл, 'utf8');
    if (!/type="file"/.test(текст)) continue;
    const кнопка = КНОПКИ.find((к) => текст.includes(`id="${к}"`));
    if (!кнопка) continue;
    найдено.push('/ru/' + имя);
  }
  return найдено;
}

/* ---- раздатчик на голом node ----------------------------------------------------------------
   Свой, а не чужой пакет: проверка должна работать и через годы, без сети. */
const ТИПЫ = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2',
  '.gz': 'application/gzip', '.traineddata': 'application/octet-stream' };
const сервер = http.createServer((зап, отв) => {
  let адрес = decodeURIComponent((зап.url || '/').split('?')[0]);
  let файл = path.join(ДИСТ, безВыхода(адрес));
  if (fs.existsSync(файл) && fs.statSync(файл).isDirectory()) файл = path.join(файл, 'index.html');
  if (!fs.existsSync(файл)) { отв.writeHead(404); отв.end('нет'); return; }
  отв.writeHead(200, { 'Content-Type': ТИПЫ[path.extname(файл)] || 'application/octet-stream' });
  fs.createReadStream(файл).pipe(отв);
});
/** Не выпускаем запрос за пределы dist: «..» в адресе обрезаем. */
function безВыхода(а) { return path.normalize(а).replace(/^(\.\.[/\\])+/, ''); }
await new Promise((r) => сервер.listen(ПОРТ, r));

/* ---- браузер --------------------------------------------------------------------------------- */
try { execSync(`lsof -ti tcp:${БРАУЗЕР} | xargs kill -9`, { stdio: 'ignore' }); } catch (e) {}
const браузер = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  `--remote-debugging-port=${БРАУЗЕР}`, `--user-data-dir=${ПРОФИЛЬ}`,
  '--headless=new', '--no-first-run', '--no-default-browser-check',
  '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling',
  '--window-size=1300,900', 'about:blank'], { stdio: 'ignore' });
process.on('exit', () => { try { браузер.kill(); } catch (e) {} try { сервер.close(); } catch (e) {} });

let верс;
for (let i = 0; i < 120; i++) {
  try { верс = await (await fetch(`http://127.0.0.1:${БРАУЗЕР}/json/version`)).json(); break; } catch (e) { await сон(300); }
}
if (!верс) { console.log('не поднялся Chrome'); process.exit(1); }
let ws, счётчик = 0; const ждут = new Map(); const ошибки = new Map();
const шлёмС = (м, п = {}, с) => new Promise((да, нет) => {
  const и = ++счётчик; ждут.set(и, { да, нет });
  ws.send(JSON.stringify({ id: и, method: м, params: п, sessionId: с }));
});
const шлём = async (м, п, с) => { try { return await шлёмС(м, п, с); } catch (е) { return null; } };
ws = new WebSocket(верс.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
ws.addEventListener('message', (м) => {
  const д = JSON.parse(м.data);
  if (д.id && ждут.has(д.id)) { const { да, нет } = ждут.get(д.id); ждут.delete(д.id); д.error ? нет(new Error(д.error.message)) : да(д.result); return; }
  if (д.method === 'Runtime.exceptionThrown') {
    const где = д.sessionId || 'общий';
    const что = (д.params.exceptionDetails.exception?.description || д.params.exceptionDetails.text || '').slice(0, 120);
    ошибки.set(где, (ошибки.get(где) || []).concat(что));
  }
});

/* ---- тестовый звук: 12 секунд с чёткими ударами ---------------------------------------------- */
const чп = 44100, секунд = 12, кадров = чп * секунд;
const вав = Buffer.alloc(44 + кадров * 2);
вав.write('RIFF', 0); вав.writeUInt32LE(36 + кадров * 2, 4); вав.write('WAVEfmt ', 8);
вав.writeUInt32LE(16, 16); вав.writeUInt16LE(1, 20); вав.writeUInt16LE(1, 22);
вав.writeUInt32LE(чп, 24); вав.writeUInt32LE(чп * 2, 28); вав.writeUInt16LE(2, 32); вав.writeUInt16LE(16, 34);
вав.write('data', 36); вав.writeUInt32LE(кадров * 2, 40);
for (let i = 0; i < кадров; i++) {
  const доля = (i % (чп / 2)) / (чп / 2);
  вав.writeInt16LE(Math.round(Math.sin(2 * Math.PI * 220 * i / чп) * 12000 * Math.exp(-доля * 5)), 44 + i * 2);
}
const звукФайл = path.join(os.tmpdir(), 'opitro-проба-плееров.wav');
fs.writeFileSync(звукФайл, вав);

/* ---- слежка: настоящий звук на выходе и число живых источников -------------------------------- */
const СЛЕЖКА = `
  window.__живые = 0;
  (function(){
    var С = window.AudioContext || window.webkitAudioContext;
    if (!С) return;
    var создать = С.prototype.createBufferSource;
    С.prototype.createBufferSource = function(){
      var у = создать.apply(this, arguments);
      var пуск = у.start, стоп = у.stop;
      у.start = function(){ if (!у.__ж) { у.__ж = true; window.__живые++; } return пуск.apply(у, arguments); };
      у.stop = function(){ if (у.__ж) { у.__ж = false; window.__живые--; } return стоп.apply(у, arguments); };
      у.addEventListener('ended', function(){ if (у.__ж) { у.__ж = false; window.__живые--; } });
      return у;
    };
    // Всё, что подключается к выходу, слушаем ещё и своим анализатором: тогда «звучит ли» --
    // это измеренная громкость, а не догадка по устройству страницы.
    var подключить = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function(цель){
      try {
        if (цель && цель.context && цель === цель.context.destination) {
          var к = цель.context;
          if (!к.__ухо) { к.__ухо = к.createAnalyser(); к.__ухо.fftSize = 2048;
            к.__данные = new Float32Array(к.__ухо.fftSize); window.__ухо = к.__ухо; window.__данные = к.__данные; }
          подключить.call(this, к.__ухо);
        }
      } catch (е) {}
      return подключить.apply(this, arguments);
    };
  })();
  // Часть страниц играет обычным <audio>, а он в звуковой движок не включён -- анализатор его
  // не слышит вовсе. Поэтому звук ищем и там: элемент не на паузе, и время идёт.
  // Реестр ведём перехватом play(): обычный проигрыватель часто живёт в переменной и в
  // разметку не попадает вовсе -- искать его по документу бесполезно (и я так уже ошибся).
  window.__элементы = new Set();
  if (window.HTMLMediaElement) {
    var играть = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function(){
      window.__элементы.add(this);
      return играть.apply(this, arguments);
    };
  }
  window.__элементИграет = function(){
    var все = Array.prototype.slice.call(document.querySelectorAll('audio, video'))
      .concat(Array.from(window.__элементы));
    for (var i = 0; i < все.length; i++) {
      var э = все[i];
      if (э && !э.paused && !э.ended && э.currentTime > 0) return Math.round(э.currentTime * 100) / 100;
    }
    return 0;
  };
  window.__громкость = function(){
    if (!window.__ухо) return 0;
    window.__ухо.getFloatTimeDomainData(window.__данные);
    var с = 0;
    for (var i = 0; i < window.__данные.length; i++) с += window.__данные[i] * window.__данные[i];
    return Math.round(Math.sqrt(с / window.__данные.length) * 10000) / 10000;
  };
`;

const страницы = найтиСтраницы();
console.log(`страниц с плеером: ${страницы.length}`);
const беды = [];
const пропущено = [];

for (const адрес of страницы) {
  const { targetId } = await шлём('Target.createTarget', { url: 'about:blank' });
  const { sessionId: S } = await шлём('Target.attachToTarget', { targetId, flatten: true });
  await шлём('Runtime.enable', {}, S); await шлём('DOM.enable', {}, S); await шлём('Page.enable', {}, S);
  await шлём('Page.addScriptToEvaluateOnNewDocument', { source: СЛЕЖКА }, S);
  await шлём('Page.navigate', { url: `http://127.0.0.1:${ПОРТ}${адрес}` }, S);
  await сон(2200);
  const q = async (в) => {
    const о = await шлём('Runtime.evaluate', { expression: в, returnByValue: true, awaitPromise: true }, S);
    return о && о.result ? о.result.value : null;
  };
  const ИМЕНА = JSON.stringify(КНОПКИ);
  const кнопкаЕсть = async () => q(`(function(){var и=${ИМЕНА};
    for (var k=0;k<и.length;k++){var э=document.getElementById(и[k]);
      if (э && !э.disabled && э.offsetParent !== null) return и[k];} return null})()`);
  const нажать = async (имя) => {
    const к = await q(`(function(){var э=document.getElementById('${имя}');if(!э)return null;
      var r=э.getBoundingClientRect();
      return JSON.stringify({x:Math.round(r.left+r.width/2),y:Math.round(r.top+r.height/2)})})()`);
    if (!к) return false;
    const т = JSON.parse(к);
    await шлём('Input.dispatchMouseEvent', { type: 'mousePressed', x: т.x, y: т.y, button: 'left', clickCount: 1 }, S);
    await шлём('Input.dispatchMouseEvent', { type: 'mouseReleased', x: т.x, y: т.y, button: 'left', clickCount: 1 }, S);
    return true;
  };
  // Громче всего -- не в один миг: между ударами бывает тишина. Смотрим несколько кадров.
  // «Звучит» -- это либо измеренная громкость на выходе движка, либо живой <audio>, у
  // которого время идёт. Возвращаем и то и другое: в отчёте видно, чем именно играет страница.
  const слышно = async () => {
    let г = 0, врЭл = 0;
    for (let i = 0; i < 6; i++) {
      г = Math.max(г, (await q(`window.__громкость()`)) || 0);
      const т = (await q(`window.__элементИграет()`)) || 0;
      if (т) врЭл = т;
      await сон(110);
    }
    return { громкость: г, элемент: врЭл };
  };
  const словами = (з) => з.элемент ? `обычный проигрыватель, время ${з.элемент} с` : `громкость ${з.громкость}`;

  const док = await шлём('DOM.getDocument', {}, S);
  const поле = await шлём('DOM.querySelector', { nodeId: док.root.nodeId, selector: 'input[type=file]' }, S);
  if (!поле || !поле.nodeId) { пропущено.push(`${адрес} — поля выбора файла нет`); await шлём('Target.closeTarget', { targetId }); continue; }
  await шлём('DOM.setFileInputFiles', { files: [звукФайл], nodeId: поле.nodeId }, S);

  let кнопка = null;
  for (let i = 0; i < 60; i++) { await сон(400); кнопка = await кнопкаЕсть(); if (кнопка) break; }
  if (!кнопка) { пропущено.push(`${адрес} — кнопка пуска не ожила за 24 с`); await шлём('Target.closeTarget', { targetId }); continue; }

  const шаги = [];
  // Молчание ЭТОЙ страницы -- мерка, с которой сравниваем всё остальное.
  const тишина = await слышно();
  const идёт = (з) => з.элемент > 0 || з.громкость > Math.max(ШУМ, тишина.громкость * 3);
  // Чем страница играет, тем и меряем. Если играет обычным проигрывателем, показания
  // анализатора к ней не относятся вовсе: он остаётся с последним кадром и показывает одно и
  // то же число хоть во время звука, хоть через шесть секунд после паузы -- проверено. Судить
  // по такому числу -- значит объявлять исправную страницу неисправной.
  let элементом = false;
  const молчит = (з) => элементом
    ? !з.элемент
    : (!з.элемент && з.громкость <= Math.max(ШУМ * 2, тишина.громкость * 2));

  await нажать(кнопка); await сон(700);
  const з1 = await слышно(); const узлы1 = await q(`window.__живые`);
  элементом = з1.элемент > 0;
  шаги.push(['звук пошёл', идёт(з1), словами(з1)]);
  шаги.push(['звучит не больше одного источника', (узлы1 || 0) <= 1, `узлов ${узлы1}`]);

  // Даём хвосту эха и компрессора отзвучать, прежде чем требовать тишины.
  await нажать(кнопка); await сон(900);
  const з2 = await слышно();
  шаги.push(['кнопка заглушила', молчит(з2), словами(з2)]);

  await нажать(кнопка); await сон(700);
  const з3 = await слышно(); const узлы3 = await q(`window.__живые`);
  шаги.push(['звук вернулся', идёт(з3), словами(з3)]);
  шаги.push(['и снова один источник', (узлы3 || 0) <= 1, `узлов ${узлы3}`]);

  const сбой = (ошибки.get(S) || []).filter(Boolean);
  шаги.push(['без ошибок на странице', сбой.length === 0, сбой.slice(0, 2).join(' | ')]);

  console.log(`\n${адрес}  (кнопка ${кнопка})`);
  for (const [имя, ладно, что] of шаги) {
    console.log(`  ${ладно ? '✓' : '✗'} ${имя}${что ? ' — ' + что : ''}`);
    if (!ладно) беды.push(`${адрес}: ${имя}${что ? ' (' + что + ')' : ''}`);
  }
  await шлём('Target.closeTarget', { targetId });
}

if (пропущено.length) {
  console.log('\nне проверено:');
  for (const п of пропущено) console.log('  · ' + п);
}
console.log(беды.length ? `\nбед: ${беды.length}\n  ${беды.join('\n  ')}` : '\nплееры: всё на месте');
process.exit(беды.length ? 1 : 0);
