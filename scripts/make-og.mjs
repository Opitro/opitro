// РИСУЕТ КАРТОЧКИ ДЛЯ СОЦСЕТЕЙ: scripts/og-card.html -> public/og-{язык}.png (1200×630).
//
// По одной на каждый язык: на карточке есть текст, и русская строка на английской странице --
// это брак. Дальше, когда дойдём до карточки на каждый инструмент, здесь же будет цикл по
// страницам, а рисование переедет в сборку.
//
// Почему PNG, а не SVG: мессенджеры и поисковики принимают в og:image только растр --
// Telegram, WhatsApp, X и Facebook на SVG отвечают пустым предпросмотром. SVG остаётся
// исходником, публикуется растр.
//
// Почему PNG, а не WebP: WebP легче, но предпросмотр строят не браузеры, а роботы
// мессенджеров, и у них поддержка WebP вразнобой. PNG понимают все. На нашей карточке
// (плоский фон и текст) PNG с палитрой к тому же весит меньше JPEG и не мылит буквы.
//
// Почему браузером, а не библиотекой рисования: браузер уже умеет верстать и переносить
// строки, и картинка выходит ровно такой, какой её видно в этом же браузере.
//
// Запуск:  node scripts/make-og.mjs
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const КОРЕНЬ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ИСХОДНИК = path.join(КОРЕНЬ, 'scripts', 'og-card.html');
const ПАПКА = path.join(КОРЕНЬ, 'public');
const СТРОКИ = {
  ru: 'Аудио, конвертеры и калькуляторы&nbsp;— <b>всё считается прямо в браузере</b>, без загрузки на сервер',
  en: 'Audio tools, converters and calculators&nbsp;— <b>everything runs in your browser</b>, nothing is uploaded',
  es: 'Audio, conversores y calculadoras&nbsp;— <b>todo se calcula en tu navegador</b>, sin subir nada',
  uk: 'Аудіо, конвертери й калькулятори&nbsp;— <b>усе рахується просто в браузері</b>, без завантаження на сервер',
};
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
  const { default: sharp } = await import('sharp');
  const шаблон = fs.readFileSync(ИСХОДНИК, 'utf8');
  for (const [язык, строка] of Object.entries(СТРОКИ)) {
    const времянка = path.join(профиль, `card-${язык}.html`);
    fs.writeFileSync(времянка, шаблон.replace('СТРОКА', строка).replace('lang="ru"', `lang="${язык}"`));
    await шлём('Page.navigate', { url: 'file://' + времянка }, sessionId);
    await сон(900);
    const снимок = await шлём('Page.captureScreenshot',
      { format: 'png', clip: { x: 0, y: 0, width: 1200, height: 630, scale: 2 } }, sessionId);
    // Снимаем вдвое крупнее и ужимаем до 1200×630: буквы получаются чётче, чем при съёмке
    // сразу в нужном размере, а файл выходит лёгким. Размер именно 1200×630 -- его ждут
    // Facebook, Telegram и предпросмотр Google.
    const выход = path.join(ПАПКА, `og-${язык}.png`);
    await sharp(Buffer.from(снимок.data, 'base64'))
      .resize(1200, 630, { fit: 'fill' })
      // Без палитры: в палитре 256 цветов, и мягкие свечения на фоне рассыпаются в точки.
      // Полноцветный PNG тяжелее, но остаётся в пределах сотни килобайт -- для картинки,
      // которую скачивает робот предпросмотра, это ничто.
      .png({ compressionLevel: 9 })
      .toFile(выход);
    console.log(`  og-${язык}.png — ${Math.round(fs.statSync(выход).size / 1024)} КБ`);
  }
  console.log('готово: карточки 1200×630 на четыре языка');
} finally {
  try { бр.kill(); } catch (e) {}
  try { fs.rmSync(профиль, { recursive: true, force: true }); } catch (e) {}
}
process.exit(0);
