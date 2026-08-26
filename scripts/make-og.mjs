// РИСУЕТ КАРТОЧКУ ДЛЯ СОЦСЕТЕЙ: scripts/og-card.html -> public/og.png (1200×630).
//
// Пока карточка одна, на весь сайт, и рисуется вручную -- этим скриптом, локально. Когда
// дойдём до отдельной карточки на каждую страницу, рисование переедет в сборку: там нельзя
// зависеть от браузера, установленного на конкретном компьютере.
//
// Почему браузером, а не библиотекой: браузер уже умеет верстать и переносить строки, и
// картинка получается ровно такой, какой её видно в этом же браузере. Библиотеки рисования
// SVG (resvg, satori) шрифты подставляют по-своему, и текст уезжает.
//
// Запуск:  node scripts/make-og.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const КОРЕНЬ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ИСХОДНИК = path.join(КОРЕНЬ, 'scripts', 'og-card.html');
const ВЫХОД = path.join(КОРЕНЬ, 'public', 'og.png');
const ХРОМ = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const сон = (мс) => new Promise((r) => setTimeout(r, мс));

if (!fs.existsSync(ХРОМ)) {
  console.error('Не найден Chrome по адресу ' + ХРОМ + ' -- поправьте путь в скрипте.');
  process.exit(1);
}

const профиль = fs.mkdtempSync(path.join(os.tmpdir(), 'opitro-og-'));
const порт = 9666 + Math.floor(Math.random() * 300);
const бр = spawn(ХРОМ, [
  '--headless=new', `--remote-debugging-port=${порт}`, `--user-data-dir=${профиль}`,
  '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' });

let ws, счёт = 0;
const ждём = new Map();
const шлём = (метод, параметры = {}, сеанс) => new Promise((готово, беда) => {
  const id = ++счёт;
  ждём.set(id, { готово, беда });
  ws.send(JSON.stringify({ id, method: метод, params: параметры, sessionId: сеанс }));
});

try {
  let версия;
  for (let i = 0; i < 80; i++) {
    try { версия = await (await fetch(`http://127.0.0.1:${порт}/json/version`)).json(); break; }
    catch { await сон(400); }
  }
  ws = new WebSocket(версия.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  ws.addEventListener('message', (м) => {
    const д = JSON.parse(м.data);
    if (д.id && ждём.has(д.id)) {
      const { готово, беда } = ждём.get(д.id); ждём.delete(д.id);
      д.error ? беда(new Error(д.error.message)) : готово(д.result);
    }
  });
  await сон(600);
  const цели = await (await fetch(`http://127.0.0.1:${порт}/json/list`)).json();
  const { sessionId } = await шлём('Target.attachToTarget', { targetId: цели.find((т) => т.type === 'page').id, flatten: true });
  await шлём('Page.enable', {}, sessionId);
  // Ровно 1200×630 и двойная плотность: карточка должна быть чёткой на экранах телефонов.
  await шлём('Emulation.setDeviceMetricsOverride',
    { width: 1200, height: 630, deviceScaleFactor: 2, mobile: false }, sessionId);
  await шлём('Page.navigate', { url: 'file://' + ИСХОДНИК }, sessionId);
  await сон(1200);
  const снимок = await шлём('Page.captureScreenshot',
    { format: 'png', clip: { x: 0, y: 0, width: 1200, height: 630, scale: 2 } }, sessionId);
  // Снимаем вдвое крупнее и ужимаем до 1200×630: буквы получаются чётче, чем при съёмке
  // сразу в нужном размере, а файл выходит лёгким. Размер именно 1200×630 -- его ждут
  // Facebook, Telegram и предпросмотр Google; вдвое больший они всё равно ужмут сами,
  // но потратят на это чужой трафик.
  const { default: sharp } = await import('sharp');
  await sharp(Buffer.from(снимок.data, 'base64'))
    .resize(1200, 630, { fit: 'fill' })
    .png({ compressionLevel: 9, palette: true, quality: 92 })
    .toFile(ВЫХОД);
  const кб = Math.round(fs.statSync(ВЫХОД).size / 1024);
  console.log(`готово: public/og.png, 1200×630 точек, ${кб} КБ`);
} finally {
  try { бр.kill(); } catch (e) {}
  try { fs.rmSync(профиль, { recursive: true, force: true }); } catch (e) {}
}
process.exit(0);
