
const ЕДИНИЦЫ = [
  { имя: 'с', вМс: (н) => н * 1000, изМс: (мс) => Math.floor(мс / 1000) },
  { имя: 'мс', вМс: (н) => н, изМс: (мс) => Math.round(мс) },
  { имя: 'мкс', вМс: (н) => н / 1e3, изМс: (мс) => Math.round(мс * 1e3) },
  { имя: 'нс', вМс: (н) => н / 1e6, изМс: (мс) => Math.round(мс * 1e6) },
];

const ПРЕДЕЛ = 8.64e15;

const ОКНО_ОТ = Date.UTC(1000, 0, 1);
const ОКНО_ДО = Date.UTC(3000, 0, 1);

export function разобрать(ввод, сейчас = Date.now()) {

  const с = String(ввод ?? '').trim().replace(/[\s_ ]/g, '');
  if (!с || !/^[+-]?\d+$/.test(с)) return { годно: false, пусто: !с };

  const н = Number(с);
  if (!Number.isFinite(н)) return { годно: false, велико: true };

  const варианты = ЕДИНИЦЫ.map((е) => {
    const мс = е.вМс(н);
    return { единицы: е.имя, мс, годен: Math.abs(мс) <= ПРЕДЕЛ, далеко: Math.abs(мс - сейчас) };
  });

  const подходящие = варианты.filter((в) => в.годен);
  if (!подходящие.length) return { годно: false, велико: true, варианты };

  let лучший = подходящие.find((в) => в.мс >= ОКНО_ОТ && в.мс <= ОКНО_ДО);

  if (!лучший) {
    лучший = подходящие[0];
    for (const в of подходящие) if (в.далеко < лучший.далеко) лучший = в;
  }

  return { годно: true, мс: лучший.мс, единицы: лучший.единицы, число: н, варианты };
}

export function собрать(мс, единицы = 'с') {
  const е = ЕДИНИЦЫ.find((к) => к.имя === единицы) || ЕДИНИЦЫ[0];
  return е.изМс(мс);
}

const дв = (н) => String(н).padStart(2, '0');

const год = (г) => (г >= 0 && г <= 9999 ? String(г).padStart(4, '0') : (г < 0 ? '-' : '+') + String(Math.abs(г)).padStart(6, '0'));

export function вUTC(мс) {
  const д = new Date(мс);
  if (Number.isNaN(д.getTime())) return '';
  return `${год(д.getUTCFullYear())}-${дв(д.getUTCMonth() + 1)}-${дв(д.getUTCDate())} `
    + `${дв(д.getUTCHours())}:${дв(д.getUTCMinutes())}:${дв(д.getUTCSeconds())}`;
}

export function вISO(мс) {
  const д = new Date(мс);
  return Number.isNaN(д.getTime()) ? '' : д.toISOString();
}

export function вМестное(мс, язык = 'ru') {
  const д = new Date(мс);
  if (Number.isNaN(д.getTime())) return { строка: '', сдвиг: '', пояс: '' };
  const строка = `${год(д.getFullYear())}-${дв(д.getMonth() + 1)}-${дв(д.getDate())} `
    + `${дв(д.getHours())}:${дв(д.getMinutes())}:${дв(д.getSeconds())}`;

  const смещение = -д.getTimezoneOffset();
  const знак = смещение < 0 ? '-' : '+';
  const сдвиг = `UTC${знак}${дв(Math.floor(Math.abs(смещение) / 60))}:${дв(Math.abs(смещение) % 60)}`;
  let пояс = '';
  try {
    пояс = new Intl.DateTimeFormat(язык, { timeZoneName: 'long' })
      .formatToParts(д).find((ч) => ч.type === 'timeZoneName')?.value || '';
  } catch (е) { пояс = ''; }
  return { строка, сдвиг, пояс };
}

export function насколькоДавно(мс, язык = 'ru', сейчас = Date.now()) {
  const секунд = (мс - сейчас) / 1000;
  const мерки = [
    ['year', 31556952], ['month', 2629746], ['week', 604800],
    ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1],
  ];
  try {
    const запись = new Intl.RelativeTimeFormat(язык, { numeric: 'auto' });
    for (const [мера, вСекундах] of мерки) {
      if (Math.abs(секунд) >= вСекундах || мера === 'second') {
        return запись.format(Math.round(секунд / вСекундах), мера);
      }
    }
  } catch (е) {  }
  return '';
}

export function изЧастей({ год: г, месяц, день, час = 0, минута = 0, секунда = 0 }, поясUTC = false) {

  const д = new Date(поясUTC
    ? Date.UTC(2000, месяц - 1, день, час, минута, секунда)
    : new Date(2000, месяц - 1, день, час, минута, секунда).getTime());
  if (поясUTC) д.setUTCFullYear(г); else д.setFullYear(г);
  return д.getTime();
}

export const ПРЕДЕЛ32 = 2147483647;
export function за2038(мс) {
  return Math.floor(мс / 1000) > ПРЕДЕЛ32;
}
