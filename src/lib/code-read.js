
const НАБОРЫ = {
  qr: ['qr_code'],

  datamatrix: ['data_matrix'],
  pdf417: ['pdf417'],
  aztec: ['aztec'],
  штрих: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'code_93', 'itf'],
  оба: ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'code_93',
    'itf', 'data_matrix', 'pdf417', 'aztec'],
};

let свой = null;
let свойКлюч = '';
let умеет = null;
let jsQR = null;
let zxing = null;

export async function умеетВид(вид) {
  const есть = await чтоУмеетБраузер();
  const нужно = НАБОРЫ[вид] || НАБОРЫ.оба;
  return нужно.some((ф) => есть.includes(ф));
}

export async function чтоУмеетБраузер() {
  if (умеет) return умеет;
  if (typeof BarcodeDetector === 'undefined') { умеет = []; return умеет; }
  try {
    умеет = await BarcodeDetector.getSupportedFormats();
  } catch (е) {

    умеет = [];
  }
  return умеет;
}

async function взятьСвой(нужно) {
  const есть = await чтоУмеетБраузер();
  if (!есть.length) return null;
  const форматы = НАБОРЫ[нужно].filter((ф) => есть.includes(ф));
  if (!форматы.length) return null;
  if (!свой) { свой = new BarcodeDetector(); свойКлюч = 'всё'; }
  return { детектор: свой, форматы };
}

function всерое(точки) {
  const д = точки.data;
  const сер = new Uint8ClampedArray(точки.width * точки.height);
  for (let и = 0, п = 0; и < сер.length; и++, п += 4) {
    сер[и] = (д[п] + 2 * д[п + 1] + д[п + 2]) >> 2;
  }
  return сер;
}

function повернуть(сер, ш, в) {
  const новый = new Uint8ClampedArray(сер.length);
  for (let y = 0; y < в; y++) {
    for (let x = 0; x < ш; x++) новый[x * в + (в - 1 - y)] = сер[y * ш + x];
  }
  return новый;
}

async function взятьZxing() {
  if (zxing) return zxing;
  const м = await import('@zxing/library');
  const читатель = new м.MultiFormatReader();
  читатель.setHints(new Map([
    [м.DecodeHintType.POSSIBLE_FORMATS, [
      м.BarcodeFormat.EAN_13, м.BarcodeFormat.EAN_8, м.BarcodeFormat.UPC_A,
      м.BarcodeFormat.UPC_E, м.BarcodeFormat.CODE_128, м.BarcodeFormat.CODE_39,
      м.BarcodeFormat.CODE_93, м.BarcodeFormat.ITF, м.BarcodeFormat.QR_CODE,

      м.BarcodeFormat.DATA_MATRIX, м.BarcodeFormat.PDF_417, м.BarcodeFormat.AZTEC,
    ]],

    [м.DecodeHintType.TRY_HARDER, true],
  ]));
  zxing = { м, читатель };
  return zxing;
}

function нашеИмя(формат) {
  return String(формат || '').toLowerCase().replace('pdf_417', 'pdf417');
}

function годится(формат, нужно) {
  const набор = НАБОРЫ[нужно] || НАБОРЫ.оба;
  return набор.includes(нашеИмя(формат));
}

function однаПопытка(zx, сер, ш, в) {
  const { м, читатель } = zx;
  const свет = new м.RGBLuminanceSource(сер, ш, в);
  const карта = new м.BinaryBitmap(new м.HybridBinarizer(свет));
  try {
    const итог = читатель.decode(карта);
    return итог ? { текст: итог.getText(), формат: м.BarcodeFormat[итог.getBarcodeFormat()] } : null;
  } catch (е) {
    return null;
  } finally {
    читатель.reset();
  }
}

export async function прочитатьКадр({ источник, точки, нужно = 'оба', снимок = false }) {
  if (!точки || !точки.width || !точки.height) return null;

  const свои = await взятьСвой(нужно);
  if (свои) {
    try {
      const всё = await свои.детектор.detect(источник || точки);
      const найдено = (всё || []).filter((л) => свои.форматы.includes(л.format) && л.rawValue);
      if (найдено.length) {
        const л = найдено[0];
        return { текст: л.rawValue, формат: л.format, вид: л.format === 'qr_code' ? 'qr' : 'штрих' };
      }

      return null;
    } catch (е) {

    }
  }

  if (нужно !== 'штрих') {
    if (!jsQR) { const м = await import('jsqr'); jsQR = м.default || м; }
    const код = jsQR(точки.data, точки.width, точки.height, { inversionAttempts: 'attemptBoth' });
    if (код && код.data) return { текст: код.data, формат: 'qr_code', вид: 'qr' };
  }

  if (нужно !== 'qr' && снимок) {
    const zx = await взятьZxing();
    const сер = всерое(точки);
    const прямо = однаПопытка(zx, сер, точки.width, точки.height);
    if (прямо && годится(прямо.формат, нужно)) {
      return { ...прямо, вид: прямо.формат === 'QR_CODE' ? 'qr' : 'штрих' };
    }

    const боком = однаПопытка(zx, повернуть(сер, точки.width, точки.height),
      точки.height, точки.width);
    if (боком && годится(боком.формат, нужно)) {
      return { ...боком, вид: боком.формат === 'QR_CODE' ? 'qr' : 'штрих' };
    }
  }

  return null;
}

export async function камераВидитПолоски() {
  const есть = await чтоУмеетБраузер();
  return есть.some((ф) => НАБОРЫ.штрих.includes(ф));
}

const ПОВОРОТЫ = [0, 90, 25, -25, 50, -50];
const ДЛИННАЯ = 1500;

function перерисовать(картинка, угол, длинная) {
  const ш = картинка.naturalWidth || картинка.width;
  const в = картинка.naturalHeight || картинка.height;
  const к = Math.min(1, длинная / Math.max(ш, в));
  const нш = Math.max(1, Math.round(ш * к));
  const нв = Math.max(1, Math.round(в * к));
  const рад = (угол * Math.PI) / 180;

  const кш = Math.abs(Math.cos(рад)) * нш + Math.abs(Math.sin(рад)) * нв;
  const кв = Math.abs(Math.sin(рад)) * нш + Math.abs(Math.cos(рад)) * нв;
  const х = document.createElement('canvas');
  х.width = Math.round(кш);
  х.height = Math.round(кв);
  const р = х.getContext('2d', { willReadFrequently: true });

  р.fillStyle = '#fff';
  р.fillRect(0, 0, х.width, х.height);
  р.translate(х.width / 2, х.height / 2);
  р.rotate(рад);
  р.imageSmoothingQuality = 'high';
  р.drawImage(картинка, -нш / 2, -нв / 2, нш, нв);
  return р.getImageData(0, 0, х.width, х.height);
}

export async function прочитатьСнимок({ картинка, нужно = 'оба' }) {
  const выдохнуть = () => new Promise((г) => setTimeout(г, 0));

  const свои = await взятьСвой(нужно);
  if (свои) {
    try {
      const всё = await свои.детектор.detect(картинка);
      const найдено = (всё || []).filter((л) => свои.форматы.includes(л.format) && л.rawValue);
      if (найдено.length) {
        const л = найдено[0];
        return { текст: л.rawValue, формат: л.format, вид: л.format === 'qr_code' ? 'qr' : 'штрих' };
      }

    } catch (е) {  }
  }

  const прямо = перерисовать(картинка, 0, ДЛИННАЯ);

  if (нужно !== 'штрих') {
    if (!jsQR) { const м = await import('jsqr'); jsQR = м.default || м; }
    const код = jsQR(прямо.data, прямо.width, прямо.height, { inversionAttempts: 'attemptBoth' });
    if (код && код.data) return { текст: код.data, формат: 'qr_code', вид: 'qr' };
  }

  if (нужно === 'qr') return null;
  const zx = await взятьZxing();
  for (const угол of ПОВОРОТЫ) {
    await выдохнуть();
    const точки = угол === 0 ? прямо : перерисовать(картинка, угол, ДЛИННАЯ);
    const сер = всерое(точки);
    const итог = однаПопытка(zx, сер, точки.width, точки.height);
    if (итог && годится(итог.формат, нужно)) {
      return { ...итог, вид: итог.формат === 'QR_CODE' ? 'qr' : 'штрих' };
    }
  }
  return null;
}
