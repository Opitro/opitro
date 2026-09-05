// ЧТЕНИЕ КОДОВ С КАРТИНКИ -- ОДИН ДВИЖОК НА ДВЕ СТРАНИЦЫ.
//
// Сканер QR-кодов и сканер штрихкодов -- это две страницы, у каждой свой разговор с человеком.
// Но узнают они одно и то же, и узнавать должны оба вида: человек с кодом в руках часто не
// знает, квадратик у него или полоски, и попасть не туда он не должен.
//
// ТРИ ПУТИ, В ПОРЯДКЕ ПРЕДПОЧТЕНИЯ.
//
//   1. BarcodeDetector -- распознаватель, встроенный в САМ БРАУЗЕР. Ничего не качается, работа
//      идёт вне основного потока, и умеет он сразу всё: code_128, code_39, code_93, ean_13,
//      ean_8, itf, upc_e, data_matrix, pdf417, aztec, qr_code. Есть в Chrome и на Android.
//   2. jsQR -- запаска для QR там, где своего распознавателя нет (Safari, Firefox). Она у нас
//      и так была, 56 КБ в сжатии.
//   3. ZXing -- запаска для полосок. 116 КБ в сжатии, и грузится она ТОЛЬКО когда без неё
//      никак: браузер не умеет сам, и человек прислал снимок. В работе с камеры её не берём
//      совсем -- сто килобайт по мобильному интернету ради каждого кадра неприлично.
//
// Отсюда честная оговорка, которая записана и в тексте страниц: на iPhone сканер полосок
// работает по снимку, а не через живую камеру. Обещать иное было бы враньём.

/** Форматы, которые просим у встроенного распознавателя, по видам работы. */
const НАБОРЫ = {
  qr: ['qr_code'],
  штрих: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'code_93', 'itf'],
  оба: ['qr_code', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'code_93',
    'itf', 'data_matrix', 'pdf417', 'aztec'],
};

let свой = null;        // готовый BarcodeDetector, по ключу набора
let свойКлюч = '';
let умеет = null;       // что браузер умеет на самом деле, спрошено один раз
let jsQR = null;
let zxing = null;

/** Что встроенный распознаватель умеет здесь. Пустой список -- его нет вовсе. */
export async function чтоУмеетБраузер() {
  if (умеет) return умеет;
  if (typeof BarcodeDetector === 'undefined') { умеет = []; return умеет; }
  try {
    умеет = await BarcodeDetector.getSupportedFormats();
  } catch (е) {
    // Формально класс есть, а работать отказывается -- такое бывает на старых сборках.
    умеет = [];
  }
  return умеет;
}

async function взятьСвой(нужно) {
  const есть = await чтоУмеетБраузер();
  if (!есть.length) return null;
  const форматы = НАБОРЫ[нужно].filter((ф) => есть.includes(ф));
  if (!форматы.length) return null;
  const ключ = форматы.join(',');
  if (!свой || свойКлюч !== ключ) {
    свой = new BarcodeDetector({ formats: форматы });
    свойКлюч = ключ;
  }
  return свой;
}

/** Серость из RGBA. Зелёному больший вес -- глаз к нему чувствительнее, и ZXing ждёт того же. */
function всерое(точки) {
  const д = точки.data;
  const сер = new Uint8ClampedArray(точки.width * точки.height);
  for (let и = 0, п = 0; и < сер.length; и++, п += 4) {
    сер[и] = (д[п] + 2 * д[п + 1] + д[п + 2]) >> 2;
  }
  return сер;
}

/** Поворот на четверть оборота. RGBLuminanceSource поворачивать не умеет -- делаем сами. */
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
    ]],
    // Дороже по времени, но снимок разбирается один раз, а не по кадру в секунду.
    [м.DecodeHintType.TRY_HARDER, true],
  ]));
  zxing = { м, читатель };
  return zxing;
}

function однаПопытка(zx, сер, ш, в) {
  const { м, читатель } = zx;
  const свет = new м.RGBLuminanceSource(сер, ш, в);
  const карта = new м.BinaryBitmap(new м.HybridBinarizer(свет));
  try {
    const итог = читатель.decode(карта);
    return итог ? { текст: итог.getText(), формат: м.BarcodeFormat[итог.getBarcodeFormat()] } : null;
  } catch (е) {
    return null;                 // «не нашлось» ZXing сообщает исключением
  } finally {
    читатель.reset();            // без этого следующий разбор тянет за собой прошлый
  }
}

/**
 * Один проход по картинке.
 *
 * @param источник -- video, img или canvas: для встроенного распознавателя.
 * @param точки    -- ImageData того же кадра: для запасок.
 * @param нужно    -- 'qr' | 'штрих' | 'оба'.
 * @param снимок   -- true для разбора файла. Только тогда разрешено тянуть тяжёлую запаску
 *                    и пробовать поворот.
 * @returns {текст, формат, вид} либо null.
 */
export async function прочитатьКадр({ источник, точки, нужно = 'оба', снимок = false }) {
  if (!точки || !точки.width || !точки.height) return null;

  // 1. Родной распознаватель браузера.
  const детектор = await взятьСвой(нужно);
  if (детектор) {
    try {
      const найдено = await детектор.detect(источник || точки);
      if (найдено && найдено.length) {
        const л = найдено[0];
        return { текст: л.rawValue, формат: л.format, вид: л.format === 'qr_code' ? 'qr' : 'штрих' };
      }
      // Родной распознаватель отработал и ничего не нашёл -- запаски не нужны, он полнее их.
      return null;
    } catch (е) {
      // Провалился -- идём дальше на запаски, а не роняем страницу.
    }
  }

  // 2. Запаска для QR.
  if (нужно !== 'штрих') {
    if (!jsQR) { const м = await import('jsqr'); jsQR = м.default || м; }
    const код = jsQR(точки.data, точки.width, точки.height, { inversionAttempts: 'attemptBoth' });
    if (код && код.data) return { текст: код.data, формат: 'qr_code', вид: 'qr' };
  }

  // 3. Тяжёлая запаска для полосок -- только по снимку.
  if (нужно !== 'qr' && снимок) {
    const zx = await взятьZxing();
    const сер = всерое(точки);
    const прямо = однаПопытка(zx, сер, точки.width, точки.height);
    if (прямо) return { ...прямо, вид: прямо.формат === 'QR_CODE' ? 'qr' : 'штрих' };
    // Полоски читаются построчно, и код, снятый боком, так не находится. Пробуем поперёк.
    const боком = однаПопытка(zx, повернуть(сер, точки.width, точки.height),
      точки.height, точки.width);
    if (боком) return { ...боком, вид: боком.формат === 'QR_CODE' ? 'qr' : 'штрих' };
  }

  return null;
}

/** Живая камера ищет полоски только там, где браузер умеет сам. Для честной надписи. */
export async function камераВидитПолоски() {
  const есть = await чтоУмеетБраузер();
  return есть.some((ф) => НАБОРЫ.штрих.includes(ф));
}
