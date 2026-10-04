
const СО_СЛЕШЕМ = new Set(['mysql', 'mariadb', 'tidb', 'hive', 'spark']);

export function сжатьSQL(исходный, диалект = 'sql') {
  const текст = String(исходный ?? '');
  if (!текст.trim()) return '';
  const слеш = СО_СЛЕШЕМ.has(диалект);

  const из = [];
  const литералы = new Set();
  let и = 0;

  const как_есть = (кусок) => { литералы.add(из.length); из.push(кусок); };

  while (и < текст.length) {
    const з = текст[и];

    if (з === '-' && текст[и + 1] === '-') {

      while (и < текст.length && текст[и] !== '\n') и++;
      из.push(' ');
      continue;
    }
    if (з === '/' && текст[и + 1] === '*') {
      const подсказка = текст[и + 2] === '+';
      const конец = текст.indexOf('*/', и + 2);
      const кусок = конец === -1 ? текст.slice(и) : текст.slice(и, конец + 2);
      и = конец === -1 ? текст.length : конец + 2;
      if (подсказка) как_есть(кусок.replace(/\s+/g, ' '));
      else из.push(' ');
      continue;
    }

    if (з === "'" || з === '"' || з === '`') {
      const закрывающая = з;

      const сЭкраном = слеш || (з === "'" && /[eE]$/.test(из[из.length - 1] || ''));
      let к = и + 1;
      while (к < текст.length) {
        if (сЭкраном && текст[к] === '\\') { к += 2; continue; }
        if (текст[к] === закрывающая) {
          if (текст[к + 1] === закрывающая) { к += 2; continue; }
          к++;
          break;
        }
        к++;
      }
      как_есть(текст.slice(и, к));
      и = к;
      continue;
    }
    if (з === '[') {

      const конец = текст.indexOf(']', и + 1);
      const к = конец === -1 ? текст.length : конец + 1;
      как_есть(текст.slice(и, к));
      и = к;
      continue;
    }
    if (з === '$') {

      const метка = /^\$[A-Za-z_][A-Za-z_0-9]*\$|^\$\$/.exec(текст.slice(и));
      if (метка) {
        const конец = текст.indexOf(метка[0], и + метка[0].length);
        const к = конец === -1 ? текст.length : конец + метка[0].length;
        как_есть(текст.slice(и, к));
        и = к;
        continue;
      }
    }

    if (/\s/.test(з)) {
      while (и < текст.length && /\s/.test(текст[и])) и++;
      из.push(' ');
      continue;
    }

    из.push(з);
    и++;
  }

  const готово = [];
  for (let к = 0; к < из.length; к++) {
    const кусок = из[к];
    if (литералы.has(к)) { готово.push(кусок); continue; }
    if (кусок === ' ') {

      if (готово.length && готово[готово.length - 1] === ' ') continue;

      let след = к + 1;
      while (след < из.length && !литералы.has(след) && из[след] === ' ') след++;
      if (след < из.length && !литералы.has(след) && ',;)'.includes(из[след])) continue;

      const пред = готово[готово.length - 1];
      if (пред === '(' && !литералы.has(к - 1)) continue;
      готово.push(' ');
      continue;
    }
    готово.push(кусок);
  }
  return готово.join('').trim();
}
