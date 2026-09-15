// СКАНЕР ДОКУМЕНТОВ В PDF -- ЖИВАЯ ПРОВЕРКА СОБРАННОЙ СТРАНИЦЫ.
//
// Главное обещание страницы одно: лист, снятый под углом, становится ровным прямоугольником.
// Проверить это словами нельзя, поэтому здесь рисуется НАСТОЯЩИЙ перекошенный лист -- белая
// трапеция с чёрной сеткой и надписями по углам, -- прогоняется через страницу, а результат
// меряется по точкам: сетка обязана стать прямой, а надписи -- оказаться в своих углах.
//
// Углы подаются через крючок `window.__дсУглы`: настоящей мышью их тоже проверяем, но
// отдельно -- иначе непонятно, что сломалось, счёт или перетаскивание.
//
// Странице закрыт интернет: всё нужное лежит у нас.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const КОРЕНЬ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ДИСТ = path.join(КОРЕНЬ, 'dist');
const СТРАНИЦА = process.argv[2] || '/uk/document-scanner/';
const ПОРТ = 8808, БРАУЗЕР = 9368;
const ПРОФИЛЬ = path.join(os.tmpdir(), 'opitro-проверка-сканера-документов');
const сон = (м) => new Promise((р) => setTimeout(р, м));

if (!fs.existsSync(path.join(ДИСТ, 'index.html'))) {
  console.log('Нет собранного сайта. Сначала: npm run build');
  process.exit(1);
}

const ТИПЫ = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.pdf': 'application/pdf' };
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
    if (!э || э.hidden) return null; э.scrollIntoView({ block: 'center' });
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
await сон(2000);

console.log(`════ страница ${СТРАНИЦА} (интернет странице закрыт)`);
проба('разметка на месте', await выполнить(`!!document.getElementById('дс-старт') && !!document.getElementById('дс-кадр')`));
проба('обработчик жив', await выполнить(`typeof window.__дс === 'function'`));

/* ---- Перекошенный лист ---------------------------------------------------------------------
   ОБРАЗЕЦ РИСУЕМ НАСТОЯЩЕЙ ПЕРСПЕКТИВОЙ, а не растяжкой между краями.
   Первый заход рисовал клетку билинейно -- то есть равномерно между сторонами трапеции. Это
   ПОХОЖЕ на перспективу, но ею не является: после верного выправления метки не попадали на
   свои места, и проверка объявляла бедой исправную работу. Теперь точка листа переводится в
   точку снимка тем же законом, каким работает настоящая камера (деление на знаменатель), --
   и тогда у задачи есть точный ответ, с которым можно сверяться.

   Коэффициенты заданы ЗДЕСЬ и прямо, а страница ищет их сама по четырём углам и обращает.
   Это разные вычисления, поэтому проверка не сверяет код сам с собой. */
const ДОЛИ_МЕТОК = [[0.06, 0.06], [0.94, 0.06], [0.94, 0.94], [0.06, 0.94]];
const УГЛЫ = JSON.parse(await выполнить(`(async () => {
  const х = document.createElement('canvas'); х.width = 1100; х.height = 780;
  const к = х.getContext('2d');
  к.fillStyle = '#8a8a90'; к.fillRect(0, 0, х.width, х.height);   // серый стол

  // Наклон листа: знаменатель и делает дальний край короче ближнего.
  const A = 900, B = 60, C = 0, D = -40, E = 640, F = 0, G = 0.32, H = 0.12;
  const сырая = (u, v) => { const з = G * u + H * v + 1;
    return [(A * u + B * v + C) / з, (D * u + E * v + F) / з]; };
  // Вписываем в кадр с полями, чтобы лист целиком помещался на снимке.
  const рога = [[0,0],[1,0],[1,1],[0,1]].map(([u, v]) => сырая(u, v));
  const минХ = Math.min(...рога.map((т) => т[0])), максХ = Math.max(...рога.map((т) => т[0]));
  const минУ = Math.min(...рога.map((т) => т[1])), максУ = Math.max(...рога.map((т) => т[1]));
  const поле = 70;
  const s = Math.min((х.width - поле * 2) / (максХ - минХ), (х.height - поле * 2) / (максУ - минУ));
  const точка = (u, v) => { const [x, y] = сырая(u, v);
    return [поле + (x - минХ) * s, поле + (y - минУ) * s]; };

  const углы = [[0,0],[1,0],[1,1],[0,1]].map(([u, v]) => точка(u, v));
  к.save();
  к.beginPath(); к.moveTo(...углы[0]);
  for (let и = 1; и < 4; и++) к.lineTo(...углы[и]);
  к.closePath(); к.fillStyle = '#fff'; к.fill(); к.clip();
  к.strokeStyle = '#111'; к.lineWidth = 3;
  for (let и = 1; и < 8; и++) {
    к.beginPath(); к.moveTo(...точка(и / 8, 0)); к.lineTo(...точка(и / 8, 1)); к.stroke();
    к.beginPath(); к.moveTo(...точка(0, и / 8)); к.lineTo(...точка(1, и / 8)); к.stroke();
  }
  к.fillStyle = '#000';
  for (const [u, v] of ${JSON.stringify(ДОЛИ_МЕТОК)}) {
    const [tx, ty] = точка(u, v);
    к.beginPath(); к.arc(tx, ty, 15, 0, Math.PI * 2); к.fill();
  }
  к.restore();
  const капля = await new Promise((г) => х.toBlob(г, 'image/jpeg', 0.95));
  const дт = new DataTransfer();
  дт.items.add(new File([капля], 'лист.jpg', { type: 'image/jpeg' }));
  document.getElementById('дс-старт').dispatchEvent(new DragEvent('drop', { dataTransfer: дт, bubbles: true, cancelable: true }));
  return JSON.stringify(углы.map((т) => [Math.round(т[0]), Math.round(т[1])]));
})()`));
await сон(600);

console.log('\n════ подгонка углов');
проба('снимок открылся, рамка и ручки видны',
  await выполнить(`!document.getElementById('дс-окно').hidden
    && !document.getElementById('дс-рамка').hidden
    && document.querySelectorAll('.дс-ручка').length === 4`));

// Тянем одну ручку НАСТОЯЩЕЙ мышью: если её перехватит перетаскивание картинки, угол не сдвинется.
const доТяги = JSON.parse(await выполнить(`JSON.stringify(window.__дс().углы)`));
const где = JSON.parse(await выполнить(`(() => { const р = document.querySelectorAll('.дс-ручка')[0].getBoundingClientRect();
  return JSON.stringify({ x: р.left + р.width / 2, y: р.top + р.height / 2 }); })()`));
await мышь('mousePressed', где.x, где.y);
await мышь('mouseMoved', где.x + 40, где.y + 25, { держим: true });
await мышь('mouseMoved', где.x + 80, где.y + 50, { держим: true });
await мышь('mouseReleased', где.x + 80, где.y + 50);
const послеТяги = JSON.parse(await выполнить(`JSON.stringify(window.__дс().углы)`));
проба('ручка тянется настоящей мышью',
  послеТяги[0][0] !== доТяги[0][0] || послеТяги[0][1] !== доТяги[0][1],
  доТяги[0] + ' → ' + послеТяги[0]);

// Теперь ставим углы ТОЧНО по листу и выправляем.
await выполнить(`window.__дсУглы(${JSON.stringify(УГЛЫ)}); true`);
await нажать('дс-добавить');
await сон(900);

console.log('\n════ лист стал ровным');
const о = JSON.parse(await выполнить(`JSON.stringify(window.__дс())`));
проба('лист добавлен', о.листов === 1, JSON.stringify(о.размеры));

// Меряем готовый лист по точкам: метки обязаны оказаться в своих углах, а клетка -- прямой.
const мера = JSON.parse(await выполнить(`(() => {
  const вид = document.querySelector('.дс-лист img');
  const х = document.createElement('canvas');
  const и = new Image();
  return new Promise((готово) => {
    и.onload = () => {
      х.width = и.naturalWidth; х.height = и.naturalHeight;
      const к = х.getContext('2d');
      к.drawImage(и, 0, 0);
      const д = к.getImageData(0, 0, х.width, х.height).data;
      const тёмная = (x, y) => { const п = ((y | 0) * х.width + (x | 0)) * 4; return д[п] < 110; };
      // Метки: ищем тёмное пятно вблизи каждого угла листа.
      const метки = ${JSON.stringify(ДОЛИ_МЕТОК)}
        .map(([u, v]) => тёмная(u * х.width, v * х.height));
      // Клетка прямая? Вертикальная линия на 1/8 ширины обязана быть тёмной сверху донизу
      // в ОДНОМ И ТОМ ЖЕ месте по горизонтали. Ищем её положение на трёх высотах.
      const найтиСтолб = (доляВысоты) => {
        const y = доляВысоты * х.height;
        const от = 0.06 * х.width, до = 0.22 * х.width;
        for (let x = от; x < до; x++) if (тёмная(x, y)) return x / х.width;
        return -1;
      };
      const столбы = [0.25, 0.5, 0.75].map(найтиСтолб);
      готово(JSON.stringify({ метки, столбы, ш: х.width, в: х.height }));
    };
    и.src = вид.src;
  });
})()`));
проба('метки нашлись во всех четырёх углах', мера.метки.every(Boolean), JSON.stringify(мера.метки));
const разброс = Math.max(...мера.столбы) - Math.min(...мера.столбы);
проба('линия клетки идёт прямо, а не наискось',
  мера.столбы.every((с) => с > 0) && разброс < 0.012,
  'разброс по ширине ' + разброс.toFixed(4) + ' (на снимке линии сходились)');

console.log('\n════ второй лист и PDF');
await нажать('дс-ещё');
await сон(300);
await выполнить(`(async () => {
  const х = document.createElement('canvas'); х.width = 900; х.height = 700;
  const к = х.getContext('2d');
  к.fillStyle = '#fff'; к.fillRect(0, 0, х.width, х.height);
  к.fillStyle = '#111'; к.font = '600 60px Helvetica'; к.fillText('Другий аркуш', 80, 360);
  const капля = await new Promise((г) => х.toBlob(г, 'image/jpeg', 0.95));
  const дт = new DataTransfer();
  дт.items.add(new File([капля], 'два.jpg', { type: 'image/jpeg' }));
  document.getElementById('дс-старт').dispatchEvent(new DragEvent('drop', { dataTransfer: дт, bubbles: true, cancelable: true }));
  return true;
})()`);
await сон(500);
await нажать('дс-добавить');
await сон(700);
проба('в полке два листа', (await выполнить(`window.__дс().листов`)) === 2);

await выполнить(`window.__пойман = null;
  const п = URL.createObjectURL.bind(URL);
  URL.createObjectURL = (о) => { if (о && о.type === 'application/pdf') window.__пойман = о; return п(о); }; true`);
await нажать('дс-сохранить');
for (let и = 0; и < 40; и++) { await сон(500); if (await выполнить(`!!window.__пойман`)) break; }
const файл = await выполнить(`(async () => { if (!window.__пойман) return null;
  const б = new Uint8Array(await window.__пойман.arrayBuffer());
  let с = ''; for (const з of б) с += String.fromCharCode(з);
  return JSON.stringify({ размер: б.length, начало: с.slice(0, 8), конец: с.trimEnd().slice(-5),
    страниц: (с.match(/\\/Type \\/Page[^s]/g) || []).length,
    картинок: (с.match(/\\/DCTDecode/g) || []).length,
    места: (с.match(/^\\d{10} 00000 n $/gm) || []).length }); })()`);
проба('PDF собрался', !!файл);
if (файл) {
  const п = JSON.parse(файл);
  проба('в файле два листа', п.страниц === 2, JSON.stringify(п));
  проба('каждый лист лежит картинкой JPEG', п.картинок === 2);
  проба('файл начинается и кончается как PDF', п.начало === '%PDF-1.7' && п.конец === '%%EOF');
  проба('смещения записаны на каждый объект', п.места >= 8, п.места);
}

console.log('\n════ крестик стирает всё');
await нажать('дс-заново');
await сон(300);
проба('листов не осталось, вернулось приглашение',
  (await выполнить(`window.__дс().листов`)) === 0
  && (await выполнить(`document.getElementById('дс-старт').hidden !== true`)));

console.log('\nисключений в консоли:', ошибки.length ? ошибки : 'нет');
if (ошибки.length) беды.push('исключения в консоли');
console.log(беды.length ? `\n✗ бед: ${беды.length}` : '\n✓ всё сошлось');
for (const б of беды) console.log('   · ' + б);
process.exit(беды.length ? 1 : 0);
