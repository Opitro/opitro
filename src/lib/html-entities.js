
const ОПАСНЫЕ = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function закодировать(текст, наладки = {}) {
  const { всеНеASCII = false } = наладки;
  let итог = '';

  for (const знак of String(текст ?? '')) {
    if (ОПАСНЫЕ[знак]) { итог += ОПАСНЫЕ[знак]; continue; }
    const код = знак.codePointAt(0);
    if (всеНеASCII && код > 127) { итог += `&#${код};`; continue; }
    итог += знак;
  }
  return итог;
}

export function раскодировать(текст) {
  const с = String(текст ?? '');
  if (!с) return '';
  if (typeof document === 'undefined') throw new Error('НУЖЕН_БРАУЗЕР');

  const поле = document.createElement('textarea');
  поле.innerHTML = с;
  return поле.value;
}

export function сколькоТронуто(было, стало) {
  if (было === стало) return 0;
  let счёт = 0;
  for (const знак of было) if (ОПАСНЫЕ[знак]) счёт++;
  return счёт;
}

export function естьМнемоники(текст) {
  return /&(#\d+|#x[0-9a-f]+|[a-z][a-z0-9]{1,31});/i.test(String(текст ?? ''));
}
