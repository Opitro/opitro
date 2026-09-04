// Значки для плиток «Попробуйте ещё».
//
// Своего значка на каждый из 71 инструмента не рисуем: получилось бы 71 картинка, половину из
// которых человек всё равно не различит с одного взгляда. Вместо этого значок обозначает РОД
// действия -- резать, склеивать, слушать, говорить, мерить. Такой набор читается быстрее именно
// потому, что повторяется: увидев ножницы дважды, человек уже знает, что это про обрезку.
//
// Все значки одного семейства: 24x24, обводка 1.8, скруглённые концы -- как и весь набор на сайте.

const I = {
  cut: '<path d="M6 4v7.5a2 2 0 0 0 2 2h8"/><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M18 4v7.5a2 2 0 0 1-2 2H8"/>',
  merge: '<path d="M3 6h5l4 6 4-6h5"/><path d="M3 18h5l4-6"/><path d="M18 15l3 3-3 3"/>',
  volume: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 9.5a4 4 0 0 1 0 5"/><path d="M19.5 7a7 7 0 0 1 0 10"/>',
  noise: '<path d="M2 12h3l2-6 3 12 3-9 2 5 2-3h5"/>',
  mic: '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4"/>',
  notes: '<circle cx="7" cy="18" r="3"/><circle cx="18" cy="15" r="3"/><path d="M10 18V5l11-2v12"/>',
  speed: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  convert: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
  wave: '<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  video: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M10 9.5l5 2.5-5 2.5z"/>',
  bell: '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/>',
  text: '<path d="M4 6h16M4 12h12M4 18h8"/>',
  code: '<path d="M8.5 7.5L4 12l4.5 4.5M15.5 7.5L20 12l-4.5 4.5M13.5 5l-3 14"/>',
  link: '<path d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.5 1.5"/><path d="M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1.5-1.5"/>',
  cipher: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 3.5V7h-3.5"/><path d="M9.5 15l2.5-6.5 2.5 6.5M10.4 13h3.2"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  filler: '<path d="M4 6h16M4 10h16M4 14h11M4 18h7"/>',
  flip: '<path d="M12 3v18"/><path d="M8.5 7.5L5 11l3.5 3.5"/><path d="M15.5 7.5L19 11l-3.5 3.5"/>',
  broom: '<path d="M14.5 3.5l6 6"/><path d="M17.5 6.5l-8 8"/><path d="M9.5 14.5l-5 5h9l3-3-4-2z"/>',
  diff: '<path d="M4 4h6v16H4zM14 4h6v16h-6"/><path d="M6 9h2M6 13h2M16 9h2M16 15h2"/>',
  bars: '<path d="M4 19V9M10 19V4M16 19v-7M22 19H2"/>',
  comma: '<path d="M4 17h16"/><path d="M7 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM7 8.5c0 1.6-.8 2.6-2 3.2"/><path d="M15 5.5v3M19 5.5v3"/>',
  digits: '<path d="M5 8.5a2.5 2.5 0 1 1 4.3 1.7L5 15h4.6"/><path d="M14 4.5h3.5v15"/><path d="M14.5 19.5h5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3.5v3M16 3.5v3"/><path d="M7.5 14h3M7.5 17h6"/>',
  cases: '<path d="M4 5.5h16M4 10h16M4 14.5h11M4 19h7"/><path d="M18.5 13.5v6M16 17l2.5 2.5L21 17"/>',
  ordinal: '<path d="M6 9.5L8 8v8"/><path d="M13 19h7M13 19l3.5-9 3.5 9"/><path d="M14.2 16h4.6"/><path d="M6 19h4"/>',
  ruler: '<rect x="2.5" y="8" width="19" height="8" rx="2"/><path d="M7 8v3M11 8v5M15 8v3M19 8v5"/>',
  weight: '<path d="M7 8h10l3 12H4L7 8z"/><circle cx="12" cy="5" r="2.5"/>',
  beaker: '<path d="M9 3v6l-5 9a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M8 3h8"/>',
  temp: '<path d="M14 14.8V4a2 2 0 1 0-4 0v10.8a4.5 4.5 0 1 0 4 0z"/>',
  tool: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',

  // Проверки устройств. Тридцать пять страниц рубрики раньше делили один общий значок из
  // четырёх квадратиков -- страница выглядела списком одинаковых кнопок. Теперь у каждой
  // семьи свой рисунок и свой цвет.
  screen: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M9 21h6M12 17v4"/>',
  pixel: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M9 21h6M12 17v4"/><rect x="9" y="8.5" width="3" height="3" rx=".6" fill="currentColor" stroke="none"/>',
  palette: '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="7.6" r="1.3" fill="currentColor" stroke="none"/><circle cx="15.5" cy="10" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="15" r="1.6" fill="currentColor" stroke="none"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>',
  projector: '<rect x="2.5" y="7" width="14" height="10" rx="2"/><circle cx="9.5" cy="12" r="2.6"/><path d="M17 10l4.5-2.5v9L17 14"/>',
  speaker: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><circle cx="12" cy="15" r="3.4"/><circle cx="12" cy="6.5" r="1.3"/>',
  ear: '<path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 6.5A3.5 3.5 0 0 1 10.5 19"/><path d="M10.5 9.5a1.8 1.8 0 0 1 3.5.6"/>',
  sine: '<path d="M2 12c3-8 5 8 8 0s5 8 8 0"/>',
  waves: '<path d="M4 12a3 3 0 0 1 0-4M7.5 14a7 7 0 0 1 0-8M11 16a11 11 0 0 1 0-12"/><path d="M15 8h6M15 12h6M15 16h6"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/>',
  mouse: '<rect x="7" y="2.5" width="10" height="19" rx="5"/><path d="M12 6.5v4"/>',
  cursor: '<path d="M6 3l13 8-6 1.5L10 19z"/>',
  keys: '<rect x="3" y="8" width="6" height="6" rx="1.5"/><rect x="15" y="8" width="6" height="6" rx="1.5"/><path d="M9 11h6"/>',
  touch: '<path d="M9 11V5.5a2 2 0 1 1 4 0V13"/><path d="M13 10.5a2 2 0 1 1 4 0V16a5 5 0 0 1-5 5h-1.2a4 4 0 0 1-3.2-1.6L5 15.5a1.8 1.8 0 0 1 2.6-2.4L9 14.5"/>',
  multitouch: '<circle cx="7.5" cy="9" r="3"/><circle cx="16.5" cy="15" r="3"/><path d="M7.5 12v6M16.5 12V6"/>',
  stylus: '<path d="M4 20l3-1 11-11-2-2L5 17z"/><path d="M14.5 5.5l2 2"/><path d="M4 20l1-3"/>',
  gamepad: '<path d="M6 8h12a4 4 0 0 1 3.9 3.1l.8 4A3 3 0 0 1 17.8 18l-1.4-2H7.6l-1.4 2a3 3 0 0 1-4.9-2.9l.8-4A4 4 0 0 1 6 8z"/><path d="M7 11.5v2M6 12.5h2"/><circle cx="16.5" cy="11.6" r=".8" fill="currentColor" stroke="none"/><circle cx="18.4" cy="13.4" r=".8" fill="currentColor" stroke="none"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  vibro: '<rect x="8" y="4" width="8" height="16" rx="2"/><path d="M4 9v6M2 10.5v3M20 9v6M22 10.5v3"/>',
  camera: '<rect x="2.5" y="6.5" width="19" height="13" rx="2.5"/><circle cx="12" cy="13" r="3.6"/><path d="M8.5 6.5l1.4-2.2h4.2l1.4 2.2"/>',
  battery: '<rect x="2.5" y="7" width="16" height="10" rx="2.5"/><path d="M21.5 10.5v3"/><rect x="5" y="9.5" width="7" height="5" rx="1" fill="currentColor" stroke="none"/>',
  bluetooth: '<path d="M7.5 7.5l9 9-4.5 4V3l4.5 4-9 9"/>',
  codec: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 9h19M6 5v4M10 5v4M14 5v4M18 5v4"/>',
};

// Порядок важен: первое совпадение выигрывает, поэтому частное стоит выше общего --
// "remove-silence" должен попасть в резку, а не в шум по слову "silence".
const RULES = [
  // Проверки устройств -- первыми: их имена содержат слова из общих правил ниже
  // («speaker-cleaner» иначе ушёл бы в громкость, «tone-generator» -- в ноты).
  [/dead-pixel|stuck-pixel/, 'pixel'],
  [/burn-in|monitor-color/, 'palette'],
  [/refresh-rate/, 'refresh'],
  [/hdr-test/, 'sun'],
  [/projector/, 'projector'],
  [/speaker-cleaner|subwoofer|sound-test/, 'speaker'],
  [/hearing-test/, 'ear'],
  [/tone-generator/, 'sine'],
  [/ultrasound/, 'waves'],
  [/audio-delay/, 'refresh'],
  [/sound-meter|mic-test|mic-noise/, 'mic'],
  [/keyboard-test|key-rollover|key-chatter/, 'keyboard'],
  [/mouse-test|polling-rate/, 'mouse'],
  [/click-speed/, 'cursor'],
  [/typing/, 'keys'],
  [/touchscreen/, 'touch'],
  [/multi-touch/, 'multitouch'],
  [/stylus/, 'stylus'],
  [/gamepad/, 'gamepad'],
  [/phone-sensors/, 'compass'],
  [/vibration-test/, 'vibro'],
  [/webcam/, 'camera'],
  [/battery-test/, 'battery'],
  [/bluetooth/, 'bluetooth'],
  [/codecs/, 'codec'],
  // Голос стоит ПЕРЕД резкой: «split-vocal» содержит «split», и без этого страница про вокал
  // получала ножницы.
  [/vocal|remove-music|voice-changer/, 'mic'],
  [/trim|split|cut|remove-silence|add-silence|loop/, 'cut'],
  [/merge|mixer|join/, 'merge'],
  [/volume|normalize|compress|dynamic/, 'volume'],
  [/noise|denoise/, 'noise'],
  [/vocal-range|speech|dictaphone|voice|record/, 'mic'],
  [/midi|key|pitch|chiptune/, 'notes'],
  [/speed|tempo/, 'speed'],
  [/converter|convert|sample-rate|mono|stereo|to-audio/, 'convert'],
  [/fade|reverse|reverb|echo|visualizer|enhancer|audiobook/, 'wave'],
  [/equalizer/, 'sliders'],
  [/video/, 'video'],
  [/ringtone/, 'bell'],
  [/ordinal-numbers/, 'ordinal'],
  [/number-declension/, 'cases'],
  [/date-to-words/, 'calendar'],
  [/number-to-words/, 'digits'],
  [/punctuation-remover/, 'comma'],
  [/word-frequency/, 'bars'],
  [/text-diff/, 'diff'],
  [/reading-time/, 'clock'],
  [/lorem-ipsum/, 'filler'],
  [/text-reverse/, 'flip'],
  [/html-strip/, 'broom'],
  [/rot13|caesar|cipher|шифр/, 'cipher'],
  [/base64/, 'code'],
  [/url-encode/, 'link'],
  [/text|subtitle/, 'text'],
];

const BY_CATEGORY = { length: 'ruler', weight: 'weight', volume: 'beaker', temperature: 'temp', audio: 'wave' };

// ЦВЕТ ЗНАЧКА -- по его рисунку, а не по рубрике. Владелец: «сейчас все значки зелёные и
// они сливаются». Цвет берётся от того, что нарисовано: экран синий, солнце жёлтое, камера
// красная, батарея зелёная. Один зелёный на всю страницу превращал тридцать пять разных
// проверок в один сплошной список.
const ЦВЕТА = {
  cut: '#9fb6cf', merge: '#a78bfa', volume: '#4ade9e', noise: '#ffd166', mic: '#ff7b8f',
  notes: '#c084fc', speed: '#ff9f5a', convert: '#58b8f0', wave: '#2ee6c5', sliders: '#a3e635',
  video: '#f87171', bell: '#ffc247', text: '#cbd5e1', ruler: '#60a5fa', weight: '#eab308',
  beaker: '#38bdf8', temp: '#fb7185', tool: '#94a3b8',
  screen: '#58b8f0', pixel: '#a78bfa', palette: '#f472b6', refresh: '#2ee6c5', sun: '#ffd166',
  projector: '#ff9f5a', speaker: '#4ade9e', ear: '#7dd3fc', sine: '#a3e635', waves: '#00d9ff',
  keyboard: '#94a3b8', mouse: '#c084fc', cursor: '#ffc247', keys: '#86efac', touch: '#2ee6c5',
  multitouch: '#58b8f0', stylus: '#00f0ff', gamepad: '#7c8cff', compass: '#34d399',
  vibro: '#fb923c', camera: '#f87171', battery: '#4ade9e', bluetooth: '#3b82f6', codec: '#a78bfa',
  code: '#fbbf24', link: '#22d3ee', cipher: '#e879f9',
  clock: '#facc15', filler: '#94a3b8', flip: '#38bdf8', broom: '#fb7185',
  diff: '#a78bfa', bars: '#34d399', comma: '#fb923c', digits: '#60a5fa', calendar: '#f0abfc', cases: '#818cf8', ordinal: '#2dd4bf',
};

/** Имя семьи значка: по роду действия, потом по категории, в крайнем случае общее. */
function семья(slug = '', category = '') {
  for (const [rx, name] of RULES) if (rx.test(slug)) return name;
  return BY_CATEGORY[category] || 'tool';
}

/** Цвет плашки под значком -- по тому, что на значке нарисовано. */
export function colorFor(slug = '', category = '') {
  return ЦВЕТА[семья(slug, category)] || ЦВЕТА.tool;
}

/** Значок для инструмента: сначала по роду действия, потом по категории, в крайнем случае общий. */
export function iconFor(slug = '', category = '') {
  return I[семья(slug, category)] || I.tool;
}
