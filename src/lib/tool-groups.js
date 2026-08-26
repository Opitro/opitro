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

const ПОЛКИ = { audio: АУДИО };

const НАЗВАНИЯ = {
  ru: { cut: 'Резать и собирать', voice: 'Голос и музыка', sound: 'Звучание', time: 'Темп и высота',
        text: 'Текст и ноты', file: 'Файл и формат', make: 'Записать и создать', rest: 'Остальное' },
  en: { cut: 'Cut and assemble', voice: 'Voice and music', sound: 'How it sounds', time: 'Speed and pitch',
        text: 'Text and notes', file: 'File and format', make: 'Record and create', rest: 'Everything else' },
  es: { cut: 'Cortar y montar', voice: 'Voz y música', sound: 'Cómo suena', time: 'Velocidad y tono',
        text: 'Texto y notas', file: 'Archivo y formato', make: 'Grabar y crear', rest: 'Lo demás' },
  uk: { cut: 'Різати і збирати', voice: 'Голос і музика', sound: 'Звучання', time: 'Темп і висота',
        text: 'Текст і ноти', file: 'Файл і формат', make: 'Записати і створити', rest: 'Решта' },
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
    if (свои.length) полки.push({ ключ, имя: слова[ключ], инструменты: свои });
  }
  const остальные = инструменты.filter((т) => !взятые.has(т.data.toolSlug));
  if (остальные.length) полки.push({ ключ: 'rest', имя: слова.rest, инструменты: остальные });
  return полки;
}
