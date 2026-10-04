
import fs from 'node:fs';
import path from 'node:path';
import bwipjs from 'bwip-js';

const КУДА = path.join(process.cwd(), 'public', 'i');
const АДРЕС = 'https://opitro.com';

const ОБРАЗЦЫ = [
  { bcid: 'datamatrix', файл: 'data-matrix-code-example.png', потолок: 360 },
  { bcid: 'pdf417', файл: 'pdf417-code-example.png', потолок: 640 },
  { bcid: 'azteccode', файл: 'aztec-code-example.png', потолок: 360 },
];

fs.mkdirSync(КУДА, { recursive: true });

async function нарисовать(bcid, scale) {
  const png = await bwipjs.toBuffer({
    bcid, text: АДРЕС, scale, paddingwidth: 3, paddingheight: 3,

    backgroundcolor: 'FFFFFF',
  });
  return { png, ш: png.readUInt32BE(16), в: png.readUInt32BE(20) };
}

for (const о of ОБРАЗЦЫ) {

  let взято = null;
  for (let scale = 14; scale >= 2; scale--) {
    const проба = await нарисовать(о.bcid, scale);
    if (Math.max(проба.ш, проба.в) <= о.потолок) { взято = проба; break; }
  }
  if (!взято) throw new Error(`не подобрался масштаб для ${о.bcid}`);
  fs.writeFileSync(path.join(КУДА, о.файл), взято.png);
  console.log(`${о.файл} — файл ${взято.ш}x${взято.в}, на странице`
    + ` ${Math.round(взято.ш / 2)}x${Math.round(взято.в / 2)},`
    + ` ${(взято.png.length / 1024).toFixed(1)} КБ`);
}
