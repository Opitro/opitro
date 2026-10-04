
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const КОРЕНЬ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ЧАСТЕЙ = 2;
const ИСТОЧНИК = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@';

const движок = fs.readFileSync(path.join(КОРЕНЬ, 'src/lib/audio-engine.js'), 'utf8');
const версия = (движок.match(/CORE_VERSION = '([^']+)'/) || [])[1];
if (!версия) { console.log('не нашёл CORE_VERSION в src/lib/audio-engine.js'); process.exit(1); }

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
