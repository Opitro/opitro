// ПОЛКИ ВНУТРИ РУБРИКИ.
//
// Сорок два инструмента подряд -- это не список, а склад: одинаковые плашки, и глазу не за что
// зацепиться. Разложенные по делу, они превращаются в семь коротких полок, и нужную полку
// человек находит с одного взгляда.
//
// Порядок внутри полки -- по надобности, а не по алфавиту. Раньше список шёл по английскому
// имени страницы, поэтому «Добавить тишину» стояла первой, а «Обрезка», за которой приходят
// чаще всего, -- в самом низу.
//
// Полки заданы только там, где их много. Рубрики на четыре-восемь инструментов делить не на что.

/** Полки рубрики «Аудио». Слуги перечислены в том порядке, в каком должны стоять. */
const АУДИО = [
  { ключ: 'cut', слуги: ['trim-audio', 'split-audio', 'merge-audio', 'audio-mixer', 'loop-audio', 'remove-silence', 'add-silence', 'reverse-audio'] },
  { ключ: 'voice', слуги: ['vocal-remover', 'remove-music', 'split-vocal', 'voice-changer', 'detect-key', 'vocal-range'] },
  { ключ: 'sound', слуги: ['audio-volume', 'normalize-audio', 'audio-equalizer', 'denoise-audio', 'audio-enhancer', 'dynamic-compressor', 'reverb-echo', 'audio-fade', 'chiptune-effect'] },
  { ключ: 'time', слуги: ['audio-speed', 'change-tempo', 'audio-pitch'] },
  { ключ: 'text', слуги: ['speech-to-text', 'audio-to-text', 'audio-to-midi', 'audiobook-check'] },
  { ключ: 'file', слуги: ['audio-converter', 'compress-audio', 'change-sample-rate', 'video-to-audio', 'mono-to-stereo', 'stereo-to-mono', 'audio-visualizer'] },
  { ключ: 'make', слуги: ['dictaphone', 'ringtone', 'white-noise-generator', 'pink-noise-generator', 'brown-noise-generator'] },
];

/** Полки рубрики «Для разработчиков». Тридцать шесть плиток подряд -- склад, а не список. */
const РАЗРАБОТКА = [
  { ключ: 'code', слуги: ['json-formatter', 'sql-formatter', 'json-schema-validator', 'code-diff', 'regex-tester', 'markdown-html', 'csv-json'] },
  { ключ: 'encode', слуги: ['base64-encode-decode', 'base64-file', 'url-encode-decode', 'html-entities', 'escape-unescape', 'jwt-decoder', 'hash-generator', 'number-base-converter'] },
  { ключ: 'css', слуги: ['color-converter', 'color-palette', 'contrast-checker', 'css-gradient', 'box-shadow', 'border-radius'] },
  { ключ: 'codes', слуги: ['qr-code', 'qr-scan', 'barcode', 'barcode-scan', 'favicon-generator'] },
  { ключ: 'minify', слуги: ['minify-css', 'minify-html', 'minify-js', 'html-strip'] },
  { ключ: 'gen', слуги: ['uuid-generator', 'mock-data', 'htaccess-generator', 'unix-timestamp', 'url-parser', 'case-converter'] },
];

/** Полки рубрики «Текст». */
const ТЕКСТ = [
  { ключ: 'clean', слуги: ['remove-extra-spaces', 'remove-empty-lines', 'remove-duplicate-lines', 'punctuation-remover', 'sort-lines'] },
  { ключ: 'shape', слуги: ['text-case-converter', 'transliteration', 'remove-diacritics', 'text-reverse', 'rot13', 'list-generator'] },
  { ключ: 'count', слуги: ['character-counter', 'word-frequency', 'reading-time', 'text-diff'] },
  { ключ: 'numbers', слуги: ['number-to-words', 'date-to-words', 'ordinal-numbers', 'number-declension', 'phone-formatter'] },
  { ключ: 'speak', слуги: ['text-to-speech', 'lorem-ipsum'] },
];

/** Полки рубрики «Проверки устройства». */
const ПРОВЕРКИ = [
  { ключ: 'screen', слуги: ['dead-pixel-test', 'stuck-pixel-fixer', 'screen-burn-in-test', 'monitor-color-test', 'refresh-rate', 'hdr-test', 'projector-test'] },
  { ключ: 'keys', слуги: ['keyboard-test', 'key-rollover', 'key-chatter', 'typing-speed', 'mobile-typing-test'] },
  { ключ: 'point', слуги: ['mouse-test', 'polling-rate', 'click-speed', 'touchscreen-test', 'multi-touch-test', 'stylus-test', 'gamepad-test'] },
  { ключ: 'ears', слуги: ['sound-test', 'speaker-cleaner', 'subwoofer-test', 'hearing-test', 'tone-generator', 'ultrasound-generator', 'audio-delay-test', 'sound-meter'] },
  { ключ: 'mic', слуги: ['mic-test', 'mic-noise', 'webcam-test'] },
  { ключ: 'phone', слуги: ['phone-sensors-test', 'vibration-test', 'battery-test', 'bluetooth-test', 'browser-codecs-test'] },
];

const ПОЛКИ = { audio: АУДИО, dev: РАЗРАБОТКА, text: ТЕКСТ, 'device-tests': ПРОВЕРКИ };

// Свой цвет на полку. Без него семь полок отличались только словом в заголовке, а значки у всех
// были зелёные -- страница снова сливалась в одно пятно. Цвет приглушённый и стоит только на
// заголовке и на значках: заливать им плитки означало бы получить пёстрый ковёр.
const ЦВЕТА = {
  cut: '#58b8f0', voice: '#4ade9e', sound: '#f5c451', time: '#f0915a',
  text: '#a98cf0', file: '#6fd0d6', make: '#ec5f7f', rest: '#9aa3b2',
  // Для разработчиков
  code: '#58b8f0', encode: '#a98cf0', css: '#f5c451', codes: '#6fd0d6',
  minify: '#7dd3fc', gen: '#ec5f7f',
  // Текст
  clean: '#6fd0d6', shape: '#a98cf0', count: '#58b8f0', numbers: '#f0915a', speak: '#4ade9e',
  // Проверки устройства
  screen: '#58b8f0', keys: '#f5c451', point: '#a98cf0', ears: '#4ade9e',
  mic: '#ec5f7f', phone: '#6fd0d6',
};

const НАЗВАНИЯ = {
  ru: { cut: 'Резать и собирать', voice: 'Голос и музыка', sound: 'Звучание', time: 'Темп и высота',
        text: 'Текст и ноты', file: 'Файл и формат', make: 'Записать и создать', rest: 'Остальное',
        code: 'Код и данные', encode: 'Кодирование и подписи', css: 'Цвет и стили', codes: 'Коды и значки', minify: 'Сжатие', gen: 'Генераторы', clean: 'Почистить текст', shape: 'Переписать', count: 'Посчитать и сравнить', numbers: 'Числа и даты прописью', speak: 'Речь и рыба', screen: 'Экран', keys: 'Клавиатура', point: 'Мышь и касание', ears: 'Звук и слух', mic: 'Микрофон и камера', phone: 'Телефон и браузер' },
  en: { cut: 'Cut and assemble', voice: 'Voice and music', sound: 'How it sounds', time: 'Speed and pitch',
        text: 'Text and notes', file: 'File and format', make: 'Record and create', rest: 'Everything else',
        code: 'Code and data', encode: 'Encoding and signatures', css: 'Colour and styles', codes: 'Codes and icons', minify: 'Minifying', gen: 'Generators', clean: 'Clean the text', shape: 'Rewrite', count: 'Count and compare', numbers: 'Numbers and dates in words', speak: 'Speech and filler', screen: 'Screen', keys: 'Keyboard', point: 'Mouse and touch', ears: 'Sound and hearing', mic: 'Microphone and camera', phone: 'Phone and browser' },
  es: { cut: 'Cortar y montar', voice: 'Voz y música', sound: 'Cómo suena', time: 'Velocidad y tono',
        text: 'Texto y notas', file: 'Archivo y formato', make: 'Grabar y crear', rest: 'Lo demás',
        code: 'Código y datos', encode: 'Codificación y firmas', css: 'Color y estilos', codes: 'Códigos e iconos', minify: 'Minificar', gen: 'Generadores', clean: 'Limpiar el texto', shape: 'Reescribir', count: 'Contar y comparar', numbers: 'Números y fechas en letras', speak: 'Voz y relleno', screen: 'Pantalla', keys: 'Teclado', point: 'Ratón y táctil', ears: 'Sonido y oído', mic: 'Micrófono y cámara', phone: 'Teléfono y navegador' },
  uk: { cut: 'Різати і збирати', voice: 'Голос і музика', sound: 'Звучання', time: 'Темп і висота',
        text: 'Текст і ноти', file: 'Файл і формат', make: 'Записати і створити', rest: 'Решта',
        code: 'Код і дані', encode: 'Кодування й підписи', css: 'Колір і стилі', codes: 'Коди та значки', minify: 'Стиснення', gen: 'Генератори', clean: 'Почистити текст', shape: 'Переписати', count: 'Порахувати й порівняти', numbers: 'Числа й дати словами', speak: 'Мова й риба', screen: 'Екран', keys: 'Клавіатура', point: 'Миша й дотик', ears: 'Звук і слух', mic: 'Мікрофон і камера', phone: 'Телефон і браузер' },
};

/**
 * Разложить инструменты рубрики по полкам.
 * Возвращает [] там, где полок не задано -- значит рисуем обычной сеткой.
 * Инструмент, не попавший ни на одну полку (новый, ещё не разложенный), не теряется:
 * он уходит на полку «Остальное». Молча пропасть со страницы он не должен.
 *
 * @param {string} рубрика слуг рубрики
 * @param {Array} инструменты записи коллекции
 * @param {string} язык
 */
export function поПолкам(рубрика, инструменты, язык = 'ru') {
  const схема = ПОЛКИ[рубрика];
  if (!схема) return [];
  const слова = НАЗВАНИЯ[язык] || НАЗВАНИЯ.ru;
  const поСлугу = new Map(инструменты.map((т) => [т.data.toolSlug, т]));
  const взятые = new Set();
  const полки = [];
  for (const { ключ, слуги } of схема) {
    const свои = [];
    for (const с of слуги) {
      const т = поСлугу.get(с);
      if (!т) continue;          // страницы ещё нет -- полка просто короче
      свои.push(т); взятые.add(с);
    }
    if (свои.length) полки.push({ ключ, имя: слова[ключ], цвет: ЦВЕТА[ключ], инструменты: свои });
  }
  const остальные = инструменты.filter((т) => !взятые.has(т.data.toolSlug));
  if (остальные.length) полки.push({ ключ: 'rest', имя: слова.rest, цвет: ЦВЕТА.rest, инструменты: остальные });
  return полки;
}
