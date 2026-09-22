// ЯДРО FFMPEG — К СЕБЕ.
//
// Раньше оно ехало с чужого сервера (cdn.jsdelivr.net). Это значило три вещи: все звуковые
// инструменты держались на чужом дяде, посторонний сервис видел каждого, кто их открыл, а
// живым проверкам приходилось оставлять странице интернет — в отличие от всех прочих.
//
// ПОЧЕМУ ФАЙЛ РЕЖЕТСЯ. Cloudflare не принимает статический файл больше 25 МиБ, а ядро весит
// 30,6 МиБ. Части кладутся рядом и склеиваются в браузере обратно — склейка ничего не стоит,
// Blob умеет собираться из кусков сам.
//
// Запускать: node scripts/fetch-ffmpeg-core.mjs
// Версия берётся из src/lib/audio-engine.js, чтобы она была в одном месте, а не в двух.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const КОРЕНЬ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ЧАСТЕЙ = 2;                       // 30,6 МиБ / 2 = 15,3 МиБ, с запасом до предела в 25
const ИСТОЧНИК = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@';

const движок = fs.readFileSync(path.join(КОРЕНЬ, 'src/lib/audio-engine.js'), 'utf8');
const версия = (движок.match(/CORE_VERSION = '([^']+)'/) || [])[1];
if (!версия) { console.log('не нашёл CORE_VERSION в src/lib/audio-engine.js'); process.exit(1); }

// Версия В ПУТИ — тогда файлы можно отдавать «навсегда» (см. public/_headers): новая версия
// придёт по новому адресу, и ничей браузер не останется со старым куском в кармане.
const куда = path.join(КОРЕНЬ, 'public/ffmpeg', версия);
fs.mkdirSync(куда, { recursive: true });

const взять = async (имя) => {
  const о = await fetch(`${ИСТОЧНИК}${версия}/dist/esm/${имя}`);
  if (!о.ok) throw new Error(`${имя}: ${о.status}`);
  return Buffer.from(await о.arrayBuffer());
};

console.log('ядро ffmpeg', версия);

const ядроJs = await взять('ffmpeg-core.js');
fs.writeFileSync(path.join(куда, 'ffmpeg-core.js'), ядроJs);
console.log('  ffmpeg-core.js            ', (ядроJs.length / 1048576).toFixed(2), 'МиБ');

const ядроWasm = await взять('ffmpeg-core.wasm');
const кусок = Math.ceil(ядроWasm.length / ЧАСТЕЙ);
for (let и = 0; и < ЧАСТЕЙ; и++) {
  const часть = ядроWasm.subarray(и * кусок, Math.min((и + 1) * кусок, ядроWasm.length));
  fs.writeFileSync(path.join(куда, `ffmpeg-core.wasm.${и + 1}`), часть);
  const миб = часть.length / 1048576;
  console.log(`  ffmpeg-core.wasm.${и + 1}         `, миб.toFixed(2), 'МиБ',
    миб > 25 ? '  ПРЕВЫШЕН ПРЕДЕЛ CLOUDFLARE' : '');
  if (миб > 25) process.exitCode = 1;
}
console.log('  всего                      ', (ядроWasm.length / 1048576).toFixed(2), 'МиБ в', ЧАСТЕЙ, 'частях');
console.log('\nсложено в public/ffmpeg/' + версия);
