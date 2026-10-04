
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const КОРЕНЬ = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ИСХОДНИК = path.join(КОРЕНЬ, 'scripts', 'og-card.html');
const ПАПКА = path.join(КОРЕНЬ, 'public');

const СТРОКИ = {
  ru: 'Бесплатные онлайн-инструменты',
  en: 'Free online tools',
  es: 'Herramientas online gratis',
  uk: 'Безкоштовні онлайн-інструменти',
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

    const выход = path.join(ПАПКА, `og-${язык}.png`);
    await sharp(Buffer.from(снимок.data, 'base64'))
      .resize(1200, 630, { fit: 'fill' })

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
