
import { вHex, вСтрокуRgb } from './color-convert.js';

function записьЦвета(цвет) {
  const a = цвет.a ?? 1;
  return a >= 1 ? вHex({ ...цвет, a: 1 }) : вСтрокуRgb(цвет);
}

export function слойВСтроку(слой) {
  const части = [
    `${Math.round(слой.x)}px`,
    `${Math.round(слой.y)}px`,
    `${Math.round(слой.размытие)}px`,
    `${Math.round(слой.растяжение)}px`,
    записьЦвета(слой.цвет),
  ];

  return (слой.внутрь ? 'inset ' : '') + части.join(' ');
}

export function вСтроку(слои) {
  if (!слои || !слои.length) return 'none';
  return слои.map(слойВСтроку).join(', ');
}

export function кодCSS(слои) {
  return `box-shadow: ${вСтроку(слои)};`;
}

export function мягкаяТень(сила = 3, цвет = { r: 0, g: 0, b: 0 }) {
  const с = Math.min(5, Math.max(1, Math.round(сила)));
  const слои = [];
  for (let и = 1; и <= 3; и++) {
    const шаг = и * с;
    слои.push({
      x: 0,
      y: шаг,
      размытие: шаг * 2,
      растяжение: -Math.round(шаг / 3),

      цвет: { ...цвет, a: Math.round((0.14 / и) * 100) / 100 },
      внутрь: false,
    });
  }
  return слои;
}
