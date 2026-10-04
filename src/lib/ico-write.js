
function маска(точки, ш, в) {
  const вСтроке = Math.ceil(ш / 32) * 4;
  const итог = new Uint8Array(вСтроке * в);
  for (let y = 0; y < в; y++) {

    const строка = (в - 1 - y) * вСтроке;
    for (let x = 0; x < ш; x++) {

      if (точки[(y * ш + x) * 4 + 3] === 0) итог[строка + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  return итог;
}

function слой(точки, ш, в) {
  const тело = new Uint8Array(ш * в * 4);
  for (let y = 0; y < в; y++) {
    const строка = (в - 1 - y) * ш * 4;
    for (let x = 0; x < ш; x++) {
      const и = (y * ш + x) * 4;
      const о = строка + x * 4;

      тело[о] = точки[и + 2];
      тело[о + 1] = точки[и + 1];
      тело[о + 2] = точки[и];
      тело[о + 3] = точки[и + 3];
    }
  }
  const м = маска(точки, ш, в);
  const шапка = new Uint8Array(40);
  const в32 = new DataView(шапка.buffer);
  в32.setUint32(0, 40, true);
  в32.setInt32(4, ш, true);
  в32.setInt32(8, в * 2, true);
  в32.setUint16(12, 1, true);
  в32.setUint16(14, 32, true);
  в32.setUint32(16, 0, true);
  в32.setUint32(20, тело.length + м.length, true);
  const кусок = new Uint8Array(шапка.length + тело.length + м.length);
  кусок.set(шапка, 0);
  кусок.set(тело, шапка.length);
  кусок.set(м, шапка.length + тело.length);
  return кусок;
}

export function собратьIco(картинки) {
  if (!картинки.length) throw new Error('нечего складывать в ico');
  const слои = картинки.map((к) => слой(к.точки, к.ширина, к.высота));
  const началоДанных = 6 + 16 * картинки.length;

  const итог = new Uint8Array(началоДанных + слои.reduce((с, к) => с + к.length, 0));
  const в = new DataView(итог.buffer);
  в.setUint16(0, 0, true);
  в.setUint16(2, 1, true);
  в.setUint16(4, картинки.length, true);

  let смещение = началоДанных;
  картинки.forEach((к, и) => {
    const о = 6 + 16 * и;

    итог[о] = к.ширина >= 256 ? 0 : к.ширина;
    итог[о + 1] = к.высота >= 256 ? 0 : к.высота;
    итог[о + 2] = 0;
    итог[о + 3] = 0;
    в.setUint16(о + 4, 1, true);
    в.setUint16(о + 6, 32, true);
    в.setUint32(о + 8, слои[и].length, true);
    в.setUint32(о + 12, смещение, true);
    итог.set(слои[и], смещение);
    смещение += слои[и].length;
  });
  return итог;
}
