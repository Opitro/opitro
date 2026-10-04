
import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';

const ПАЛИТРА = ['#FFD400', '#FF1E5A', '#00D4FF', '#00E676'];
const ФОН_МАСКИ = '#15161A';

const цвет = (hex) => [1, 3, 5].map((i) => parseInt(hex.substr(i, 2), 16));

function покрытие(px, py, x, y, ш, в, радиус) {
  let попало = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const тx = px + (i + 0.5) / 4;
      const тy = py + (j + 0.5) / 4;
      if (тx < x || тy < y || тx > x + ш || тy > y + в) continue;

      const дx = тx < x + радиус ? x + радиус - тx : (тx > x + ш - радиус ? тx - (x + ш - радиус) : 0);
      const дy = тy < y + радиус ? y + радиус - тy : (тy > y + в - радиус ? тy - (y + в - радиус) : 0);
      if (дx * дx + дy * дy <= радиус * радиус) попало++;
    }
  }
  return попало / 16;
}

function нарисовать(размер, фон) {
  const доля = размер / 32;
  const квадраты = [
    { x: 2, y: 2, цвет: цвет(ПАЛИТРА[0]) },
    { x: 18, y: 2, цвет: цвет(ПАЛИТРА[1]) },
    { x: 2, y: 18, цвет: цвет(ПАЛИТРА[2]) },
    { x: 18, y: 18, цвет: цвет(ПАЛИТРА[3]) },
  ];
  const сторона = 12 * доля, радиус = 2.5 * доля;
  const данные = Buffer.alloc(размер * размер * 4);
  const фонЦвет = фон ? цвет(фон) : null;

  for (let py = 0; py < размер; py++) {
    for (let px = 0; px < размер; px++) {
      let r = 0, g = 0, b = 0, a = 0;
      if (фонЦвет) { [r, g, b] = фонЦвет; a = 255; }
      for (const к of квадраты) {
        const д = покрытие(px, py, к.x * доля, к.y * доля, сторона, сторона, радиус);
        if (д <= 0) continue;

        const на = д;
        r = Math.round(к.цвет[0] * на + r * (1 - на));
        g = Math.round(к.цвет[1] * на + g * (1 - на));
        b = Math.round(к.цвет[2] * на + b * (1 - на));
        a = Math.round(255 * на + a * (1 - на));
      }
      const н = (py * размер + px) * 4;
      данные[н] = r; данные[н + 1] = g; данные[н + 2] = b; данные[н + 3] = a;
    }
  }
  return данные;
}

const ТАБЛИЦА = (() => {
  const т = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    т[n] = c;
  }
  return т;
})();
function контроль(буфер) {
  let c = -1;
  for (const б of буфер) c = ТАБЛИЦА[(c ^ б) & 255] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function кусок(тип, тело) {
  const длина = Buffer.alloc(4); длина.writeUInt32BE(тело.length);
  const тело2 = Buffer.concat([Buffer.from(тип, 'ascii'), тело]);
  const крс = Buffer.alloc(4); крс.writeUInt32BE(контроль(тело2));
  return Buffer.concat([длина, тело2, крс]);
}
function собратьPNG(размер, данные) {
  const шапка = Buffer.alloc(13);
  шапка.writeUInt32BE(размер, 0); шапка.writeUInt32BE(размер, 4);
  шапка[8] = 8;
  шапка[9] = 6;
  const строки = Buffer.alloc((размер * 4 + 1) * размер);
  for (let y = 0; y < размер; y++) {
    строки[y * (размер * 4 + 1)] = 0;
    данные.copy(строки, y * (размер * 4 + 1) + 1, y * размер * 4, (y + 1) * размер * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    кусок('IHDR', шапка),

    кусок('sRGB', Buffer.from([0])),
    кусок('IDAT', deflateSync(строки, { level: 9 })),
    кусок('IEND', Buffer.alloc(0)),
  ]);
}

function собратьICO(кадры) {
  const шапка = Buffer.alloc(6);
  шапка.writeUInt16LE(0, 0); шапка.writeUInt16LE(1, 2); шапка.writeUInt16LE(кадры.length, 4);
  let смещение = 6 + 16 * кадры.length;
  const записи = [];
  for (const [размер, данные] of кадры) {
    const з = Buffer.alloc(16);
    з.writeUInt8(размер, 0); з.writeUInt8(размер, 1);
    з.writeUInt16LE(1, 4); з.writeUInt16LE(32, 6);
    з.writeUInt32LE(данные.length, 8); з.writeUInt32LE(смещение, 12);
    записи.push(з); смещение += данные.length;
  }
  return Buffer.concat([шапка, ...записи, ...кадры.map((к) => к[1])]);
}

const куда = new URL('../public/', import.meta.url);
const путь = (имя) => new URL(имя, куда);

const png = (размер, фон = null) => собратьPNG(размер, нарисовать(размер, фон));

writeFileSync(путь('favicon-32.png'), png(32));
writeFileSync(путь('favicon-192.png'), png(192));
writeFileSync(путь('icon-512.png'), png(512));
writeFileSync(путь('apple-touch-icon.png'), png(180, ФОН_МАСКИ));
writeFileSync(путь('icon-maskable-512.png'), png(512, ФОН_МАСКИ));

writeFileSync(путь('favicon.ico'), собратьICO([[16, png(16)], [32, png(32)], [48, png(48)]]));

console.log('значки перерисованы числами, без цветового профиля');
for (const имя of ['favicon-32.png', 'favicon-192.png', 'icon-512.png', 'apple-touch-icon.png',
                   'icon-maskable-512.png', 'favicon.ico']) {
  console.log(' ', имя);
}
