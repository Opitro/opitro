
const ЗНАЧКИ = {

  картинка: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M21 16l-5-5-5 5-2-2-5 5"/>',
  wave: '<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 11v2"/>',
  ruler: '<rect x="2.5" y="8" width="19" height="8" rx="2"/><path d="M7 8v3M11 8v5M15 8v3M19 8v5"/>',
  beaker: '<path d="M9 3v6l-5 9a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M8 3h8"/>',
  weight: '<path d="M7 8h10l3 12H4L7 8z"/><circle cx="12" cy="5" r="2.5"/>',
  temp: '<path d="M14 14.8V4a2 2 0 1 0-4 0v10.8a4.5 4.5 0 1 0 4 0z"/>',
  gauge: '<path d="M12 20a8 8 0 1 1 8-8"/><path d="M12 12l4.5-3"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  lines: '<path d="M4 6h16M4 12h11M4 18h7"/>',
  braces: '<path d="M9 4H8a3 3 0 0 0-3 3v2a3 3 0 0 1-3 3 3 3 0 0 1 3 3v2a3 3 0 0 0 3 3h1"/><path d="M15 4h1a3 3 0 0 1 3 3v2a3 3 0 0 0 3 3 3 3 0 0 0-3 3v2a3 3 0 0 1-3 3h-1"/>',

  scan: '<path d="M4 9V6.5A2.5 2.5 0 0 1 6.5 4H9"/><path d="M15 4h2.5A2.5 2.5 0 0 1 20 6.5V9"/>'
    + '<path d="M20 15v2.5a2.5 2.5 0 0 1-2.5 2.5H15"/><path d="M9 20H6.5A2.5 2.5 0 0 1 4 17.5V15"/>'
    + '<path d="M4 12h16"/>',
  tool: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
};

const ВИД = {
  audio: { значок: 'wave', цвет: '#4ade9e' },
  length: { значок: 'ruler', цвет: '#58b8f0' },
  volume: { значок: 'beaker', цвет: '#a98cf0' },
  weight: { значок: 'weight', цвет: '#f0915a' },
  temperature: { значок: 'temp', цвет: '#ec5f7f' },
  'device-tests': { значок: 'gauge', цвет: '#f5c451' },

  text: { значок: 'lines', цвет: '#3fd0c9' },

  dev: { значок: 'braces', цвет: '#e879f9' },

  scanners: { значок: 'scan', цвет: '#8ea6ff' },
  images: { значок: 'картинка', цвет: '#e8b563' },
};

export function видРубрики(слуг = '') {
  const в = ВИД[слуг] || { значок: 'tool', цвет: '#4ade9e' };
  return { путь: ЗНАЧКИ[в.значок], цвет: в.цвет };
}
