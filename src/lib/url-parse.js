
const ЧАСТИ = [
  ['protocol', 'схема'], ['username', 'логин'], ['password', 'пароль'],
  ['hostname', 'хост'], ['port', 'порт'], ['pathname', 'путь'],
  ['search', 'запрос'], ['hash', 'якорь'], ['origin', 'источник'],
];

export function разобрать(строка) {
  const с = String(строка ?? '').trim();
  if (!с) return { годен: false, беда: 'ПУСТО' };

  let адрес = null;
  let дописали = false;
  try { адрес = new URL(с); }
  catch (е) {

    const похожеНаУзел = /^(localhost|\[[0-9a-f:]+\]|[a-z0-9\u00a1-\uffff]([a-z0-9\u00a1-\uffff-]*[a-z0-9\u00a1-\uffff])?(\.[a-z0-9\u00a1-\uffff]([a-z0-9\u00a1-\uffff-]*[a-z0-9\u00a1-\uffff])?)+)(:\d+)?([/?#]|$)/i;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(с) && похожеНаУзел.test(с)) {
      try { адрес = new URL('https://' + с); дописали = true; }
      catch (е2) { адрес = null; }
    }
  }
  if (!адрес) return { годен: false, беда: 'НЕ_ССЫЛКА' };

  const части = ЧАСТИ
    .map(([ключ, имя]) => {
      const значение = адрес[ключ] || '';
      let читаемое = '';
      if (ключ === 'hostname') читаемое = вЮникоде(значение);
      else читаемое = раскодировать(значение, ключ);
      return [имя, ключ, значение, читаемое === значение ? '' : читаемое];
    })
    .filter(([, ключ, значение]) => значение !== '' || ключ === 'pathname');

  const параметры = [];
  for (const [имя, значение] of адрес.searchParams) параметры.push({ имя, значение });

  const счёт = new Map();
  for (const п of параметры) счёт.set(п.имя, (счёт.get(п.имя) || 0) + 1);
  for (const п of параметры) п.повтор = счёт.get(п.имя) > 1;

  const заметки = [];
  if (дописали) заметки.push('ДОПИСАЛИ_СХЕМУ');
  if (адрес.username || адрес.password) заметки.push('ЛОГИН_В_ССЫЛКЕ');
  if ([...счёт.values()].some((н) => н > 1)) заметки.push('ЕСТЬ_ПОВТОРЫ');
  if (адрес.hash) заметки.push('ЯКОРЬ_НЕ_УХОДИТ');

  if (/^xn--/i.test(адрес.hostname) || адрес.hostname.split('.').some((к) => /^xn--/i.test(к))) {
    заметки.push('PUNYCODE');
  }
  if (адрес.search.includes('+')) заметки.push('ПЛЮС_ЭТО_ПРОБЕЛ');

  if (/%2f/i.test(адрес.pathname)) заметки.push('КОСАЯ_В_ОТРЕЗКЕ');

  return {
    годен: true, адрес, части, параметры, заметки, дописали,
    хостВЮникоде: вЮникоде(адрес.hostname),
    беда: null,
  };
}

const СТРОЕНИЕ = {
  pathname: ['2F', '5C', '3F', '23'],
  search: ['26', '3D', '3F', '23'],
  hash: ['23'],
};

function раскодировать(с, ключ) {
  if (!с || !с.includes('%')) return с;
  const беречь = СТРОЕНИЕ[ключ] || [];

  const спрятанные = [];
  const скрыто = с.replace(/%[0-9a-f]{2}/gi, (кусок) => {
    if (!беречь.includes(кусок.slice(1).toUpperCase())) return кусок;
    спрятанные.push(кусок);
    return `\u0001${спрятанные.length - 1}\u0001`;
  });
  let итог;
  try { итог = decodeURIComponent(скрыто); } catch (е) { return с; }
  return итог.replace(/\u0001(\d+)\u0001/g, (всё, н) => спрятанные[Number(н)]);
}

function вЮникоде(хост) {
  if (typeof URL !== 'function') return хост;
  try {

    return хост.split('.').map(разкодировать).join('.');
  } catch (е) { return хост; }
}

function разкодировать(кусок) {
  if (!/^xn--/i.test(кусок)) return кусок;
  const тело = кусок.slice(4);
  const граница = тело.lastIndexOf('-');
  let вывод = граница > 0 ? [...тело.slice(0, граница)].map((з) => з.codePointAt(0)) : [];
  let место = граница > 0 ? граница + 1 : 0;
  let н = 128, смещение = 72, и = 0;
  const ЦИФРА = (з) => {
    const к = з.charCodeAt(0);
    if (к >= 48 && к <= 57) return к - 22;
    if (к >= 97 && к <= 122) return к - 97;
    if (к >= 65 && к <= 90) return к - 65;
    return -1;
  };
  while (место < тело.length) {
    const прежнее = и;
    for (let вес = 1, к = 36; ; к += 36) {
      if (место >= тело.length) return кусок;
      const цифра = ЦИФРА(тело[место++]);
      if (цифра < 0) return кусок;
      и += цифра * вес;
      const порог = к <= смещение ? 1 : (к >= смещение + 26 ? 26 : к - смещение);
      if (цифра < порог) break;
      вес *= 36 - порог;
    }
    const длина = вывод.length + 1;

    let разница = прежнее === 0 ? Math.floor((и - прежнее) / 700) : Math.floor((и - прежнее) / 2);
    разница += Math.floor(разница / длина);
    let к = 0;
    while (разница > 455) { разница = Math.floor(разница / 35); к += 36; }
    смещение = к + Math.floor((36 * разница) / (разница + 38));
    н += Math.floor(и / длина);
    и %= длина;
    вывод.splice(и, 0, н);
    и++;
  }
  try { return String.fromCodePoint(...вывод); } catch (е) { return кусок; }
}
