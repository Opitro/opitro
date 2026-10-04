
export function экранироватьWifi(с) {
  return String(с ?? '').replace(/([\\;,:"])/g, '\\$1');
}

export function экранироватьВизитку(с) {
  return String(с ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function ссылка(с) {
  const т = String(с ?? '').trim();
  if (!т) return '';

  if (/^[a-z][a-z0-9+.-]*:/i.test(т)) return т;

  if (т.startsWith('//')) return 'https:' + т;
  return 'https://' + т;
}

export function сетьWifi({ имя, пароль, защита = 'WPA', скрытая = false }) {
  const и = экранироватьWifi(имя);
  if (!и) return '';
  const части = [`S:${и}`];
  if (защита === 'nopass') {
    части.unshift('T:nopass');
  } else {
    части.unshift(`T:${защита}`);
    части.push(`P:${экранироватьWifi(пароль)}`);
  }
  if (скрытая) части.push('H:true');
  return `WIFI:${части.join(';')};;`;
}

export function визитка({ имя = '', фамилия = '', организация = '', должность = '',
                          телефон = '', почта = '', сайт = '' }) {
  const и = экранироватьВизитку(имя.trim());
  const ф = экранироватьВизитку(фамилия.trim());
  if (!и && !ф && !организация.trim() && !телефон.trim() && !почта.trim()) return '';
  const строки = ['BEGIN:VCARD', 'VERSION:3.0'];
  строки.push(`N:${ф};${и};;;`);
  const полное = [имя.trim(), фамилия.trim()].filter(Boolean).join(' ');
  if (полное) строки.push(`FN:${экранироватьВизитку(полное)}`);
  if (организация.trim()) строки.push(`ORG:${экранироватьВизитку(организация.trim())}`);
  if (должность.trim()) строки.push(`TITLE:${экранироватьВизитку(должность.trim())}`);
  if (телефон.trim()) строки.push(`TEL;TYPE=CELL:${экранироватьВизитку(телефон.trim())}`);
  if (почта.trim()) строки.push(`EMAIL:${экранироватьВизитку(почта.trim())}`);
  if (сайт.trim()) строки.push(`URL:${экранироватьВизитку(ссылка(сайт))}`);
  строки.push('END:VCARD');
  return строки.join('\n');
}

export function вSVG(тёмная, размерМодулей, { поле = 4, пиксель = 8 } = {}) {
  const всего = размерМодулей + поле * 2;
  const куски = [];
  for (let р = 0; р < размерМодулей; р++) {
    for (let к = 0; к < размерМодулей; к++) {
      if (тёмная(р, к)) куски.push(`M${к + поле} ${р + поле}h1v1h-1z`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${всего * пиксель}" height="${всего * пиксель}" viewBox="0 0 ${всего} ${всего}" shape-rendering="crispEdges">`
    + `<rect width="${всего}" height="${всего}" fill="#ffffff"/>`
    + `<path fill="#000000" d="${куски.join('')}"/></svg>`;
}

export function настроитьUTF8(qrcode) {
  qrcode.stringToBytes = (с) => Array.from(new TextEncoder().encode(с));
  return qrcode;
}
