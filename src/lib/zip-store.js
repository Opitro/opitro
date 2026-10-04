
const ТАБЛИЦА = (() => {
  const т = new Uint32Array(256);
  for (let и = 0; и < 256; и++) {
    let з = и;
    for (let к = 0; к < 8; к++) з = з & 1 ? 0xedb88320 ^ (з >>> 1) : з >>> 1;
    т[и] = з >>> 0;
  }
  return т;
})();

export function crc32(данные) {
  let з = 0xffffffff;
  for (let и = 0; и < данные.length; и++) з = ТАБЛИЦА[(з ^ данные[и]) & 0xff] ^ (з >>> 8);
  return (з ^ 0xffffffff) >>> 0;
}

function времяДос(когда) {
  const д = когда || new Date();

  const время = (д.getHours() << 11) | (д.getMinutes() << 5) | (д.getSeconds() >> 1);
  const дата = ((д.getFullYear() - 1980) << 9) | ((д.getMonth() + 1) << 5) | д.getDate();
  return { время, дата };
}

export function собратьZip(файлы, когда) {
  const { время, дата } = времяДос(когда);
  const куски = [];
  const опись = [];
  let смещение = 0;

  for (const ф of файлы) {
    const имя = new TextEncoder().encode(ф.имя);
    const сумма = crc32(ф.данные);

    const шапка = new Uint8Array(30 + имя.length);
    const в = new DataView(шапка.buffer);
    в.setUint32(0, 0x04034b50, true);
    в.setUint16(4, 20, true);

    в.setUint16(6, 0, true);
    в.setUint16(8, 0, true);
    в.setUint16(10, время, true);
    в.setUint16(12, дата, true);
    в.setUint32(14, сумма, true);
    в.setUint32(18, ф.данные.length, true);
    в.setUint32(22, ф.данные.length, true);
    в.setUint16(26, имя.length, true);
    в.setUint16(28, 0, true);
    шапка.set(имя, 30);

    куски.push(шапка, ф.данные);
    опись.push({ имя, сумма, длина: ф.данные.length, смещение });
    смещение += шапка.length + ф.данные.length;
  }

  const началоОписи = смещение;
  for (const з of опись) {
    const с = new Uint8Array(46 + з.имя.length);
    const в = new DataView(с.buffer);
    в.setUint32(0, 0x02014b50, true);
    в.setUint16(4, 20, true);
    в.setUint16(6, 20, true);
    в.setUint16(8, 0, true);
    в.setUint16(10, 0, true);
    в.setUint16(12, время, true);
    в.setUint16(14, дата, true);
    в.setUint32(16, з.сумма, true);
    в.setUint32(20, з.длина, true);
    в.setUint32(24, з.длина, true);
    в.setUint16(28, з.имя.length, true);
    в.setUint32(42, з.смещение, true);
    с.set(з.имя, 46);
    куски.push(с);
    смещение += с.length;
  }

  const хвост = new Uint8Array(22);
  const в = new DataView(хвост.buffer);
  в.setUint32(0, 0x06054b50, true);
  в.setUint16(8, опись.length, true);
  в.setUint16(10, опись.length, true);
  в.setUint32(12, смещение - началоОписи, true);
  в.setUint32(16, началоОписи, true);
  куски.push(хвост);

  return new Blob(куски, { type: 'application/zip' });
}
