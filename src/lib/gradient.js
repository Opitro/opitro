
import { вHex, вСтрокуRgb } from './color-convert.js';

const вграницах = (з, наим, наиб) => Math.min(наиб, Math.max(наим, з));

export function поПорядку(точки) {
  return [...точки]
    .map((т) => ({ ...т, доля: вграницах(Number(т.доля) || 0, 0, 100) }))
    .sort((а, б) => а.доля - б.доля);
}

function записьЦвета(точка) {
  const a = точка.цвет.a ?? 1;
  return a >= 1 ? вHex({ ...точка.цвет, a: 1 }) : вСтрокуRgb(точка.цвет);
}

export function вСтроку({ вид, угол, точки }) {
  const ряд = поПорядку(точки)
    .map((т) => `${записьЦвета(т)} ${Math.round(т.доля)}%`)
    .join(', ');
  if (вид === 'radial') {

    return `radial-gradient(circle at center, ${ряд})`;
  }
  return `linear-gradient(${Math.round(((угол % 360) + 360) % 360)}deg, ${ряд})`;
}

export function цветНа(точки, доля) {
  const ряд = поПорядку(точки);
  if (!ряд.length) return { r: 0, g: 0, b: 0, a: 1 };
  if (доля <= ряд[0].доля) return { ...ряд[0].цвет };
  const последняя = ряд[ряд.length - 1];
  if (доля >= последняя.доля) return { ...последняя.цвет };

  let левая = ряд[0];
  let правая = последняя;
  for (let и = 0; и < ряд.length - 1; и++) {
    if (доля >= ряд[и].доля && доля <= ряд[и + 1].доля) {
      левая = ряд[и];
      правая = ряд[и + 1];
      break;
    }
  }
  const шаг = правая.доля - левая.доля;
  const к = шаг === 0 ? 0 : (доля - левая.доля) / шаг;

  const aЛ = левая.цвет.a ?? 1;
  const aП = правая.цвет.a ?? 1;
  const a = aЛ + (aП - aЛ) * к;
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };

  const смесь = (кл) => {
    const л = левая.цвет[кл] * aЛ;
    const п = правая.цвет[кл] * aП;
    return Math.round((л + (п - л) * к) / a);
  };
  return { r: смесь('r'), g: смесь('g'), b: смесь('b'), a };
}

export function запаснойЦвет(точки) {
  const ц = цветНа(точки, 50);
  return вHex({ r: ц.r, g: ц.g, b: ц.b, a: 1 });
}

export function кодCSS(состояние) {
  return `background-color: ${запаснойЦвет(состояние.точки)};\n`
    + `background-image: ${вСтроку(состояние)};`;
}
