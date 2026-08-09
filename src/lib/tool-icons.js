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
  ruler: '<rect x="2.5" y="8" width="19" height="8" rx="2"/><path d="M7 8v3M11 8v5M15 8v3M19 8v5"/>',
  weight: '<path d="M7 8h10l3 12H4L7 8z"/><circle cx="12" cy="5" r="2.5"/>',
  beaker: '<path d="M9 3v6l-5 9a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M8 3h8"/>',
  temp: '<path d="M14 14.8V4a2 2 0 1 0-4 0v10.8a4.5 4.5 0 1 0 4 0z"/>',
  tool: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
};

// Порядок важен: первое совпадение выигрывает, поэтому частное стоит выше общего --
// "remove-silence" должен попасть в резку, а не в шум по слову "silence".
const RULES = [
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
  [/text|subtitle/, 'text'],
];

const BY_CATEGORY = { length: 'ruler', weight: 'weight', volume: 'beaker', temperature: 'temp', audio: 'wave' };

/** Значок для инструмента: сначала по роду действия, потом по категории, в крайнем случае общий. */
export function iconFor(slug = '', category = '') {
  for (const [rx, name] of RULES) if (rx.test(slug)) return I[name];
  return I[BY_CATEGORY[category]] || I.tool;
}
