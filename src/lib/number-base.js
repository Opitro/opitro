
export const ОСНОВАНИЯ = [2, 10, 16, 8];

const ЗНАКИ = '0123456789abcdefghijklmnopqrstuvwxyz';

export function годные(основание) {
  return ЗНАКИ.slice(0, основание);
}

export function процедить(текст, основание) {
  const с = String(текст ?? '');
  const годен = new Set(годные(основание).split(''));
  let итог = '';
  for (let и = 0; и < с.length; и++) {
    const з = с[и];
    if (з === '-' && итог === '') { итог += '-'; continue; }
    if (годен.has(з.toLowerCase())) итог += з;
  }
  return итог;
}

export function вЧисло(текст, основание) {
  const с = процедить(текст, основание);
  const минус = с.startsWith('-');
  const цифры = минус ? с.slice(1) : с;
  if (!цифры) return null;

  const б = BigInt(основание);
  let итог = 0n;
  for (const з of цифры.toLowerCase()) {
    итог = итог * б + BigInt(ЗНАКИ.indexOf(з));
  }
  return минус ? -итог : итог;
}

export function изЧисла(значение, основание) {
  if (значение === null || значение === undefined) return '';
  const с = значение.toString(основание);
  return основание > 10 ? с.toUpperCase() : с;
}

export function перевести(текст, основание) {
  const значение = вЧисло(текст, основание);
  const итог = {};
  for (const о of ОСНОВАНИЯ) итог[о] = значение === null ? '' : изЧисла(значение, о);
  return { значение, поля: итог };
}

export function разрядов(значение) {
  if (значение === null || значение === undefined) return 0;
  const м = значение < 0n ? -значение : значение;
  return м === 0n ? 1 : м.toString(2).length;
}

export function размер(значение) {
  if (значение === null || значение === undefined || значение < 0n) return null;
  const б = разрядов(значение);
  for (const р of [8, 16, 32, 64]) if (б <= р) return р;
  return null;
}
