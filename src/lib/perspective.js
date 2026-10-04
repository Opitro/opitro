
function решить(матрица, правые) {
  const н = правые.length;
  const а = матрица.map((строка, и) => [...строка, правые[и]]);
  for (let ст = 0; ст < н; ст++) {

    let лучшая = ст;
    for (let и = ст + 1; и < н; и++) if (Math.abs(а[и][ст]) > Math.abs(а[лучшая][ст])) лучшая = и;
    if (Math.abs(а[лучшая][ст]) < 1e-12) return null;
    [а[ст], а[лучшая]] = [а[лучшая], а[ст]];
    for (let и = 0; и < н; и++) {
      if (и === ст) continue;
      const к = а[и][ст] / а[ст][ст];
      if (!к) continue;
      for (let j = ст; j <= н; j++) а[и][j] -= к * а[ст][j];
    }
  }

  return а.map((строка, и) => строка[н] / строка[и]);
}

function коэффициенты(углы, ш, в) {

  const цель = [[0, 0], [ш, 0], [ш, в], [0, в]];
  const матрица = [];
  const правые = [];
  for (let и = 0; и < 4; и++) {
    const [у, вэ] = цель[и];
    const [х, игрек] = углы[и];
    матрица.push([у, вэ, 1, 0, 0, 0, -у * х, -вэ * х]);
    правые.push(х);
    матрица.push([0, 0, 0, у, вэ, 1, -у * игрек, -вэ * игрек]);
    правые.push(игрек);
  }
  return решить(матрица, правые);
}

const длина = (а, б) => Math.hypot(б[0] - а[0], б[1] - а[1]);

export function размерЛиста(углы, предел = 2200) {
  let ш = Math.max(длина(углы[0], углы[1]), длина(углы[3], углы[2]));
  let в = Math.max(длина(углы[0], углы[3]), длина(углы[1], углы[2]));
  const к = Math.min(1, предел / Math.max(ш, в));
  return { ш: Math.max(8, Math.round(ш * к)), в: Math.max(8, Math.round(в * к)) };
}

export function выправить(источник, углы, { предел = 2200 } = {}) {
  if (!углы || углы.length !== 4) return null;
  const { ш, в } = размерЛиста(углы, предел);
  const к = коэффициенты(углы, ш, в);
  if (!к) return null;
  const [a, b, c, d, e, f, g, h] = к;

  const свой = document.createElement('canvas');
  свой.width = источник.width; свой.height = источник.height;
  свой.getContext('2d', { willReadFrequently: true }).drawImage(источник, 0, 0);
  const исх = свой.getContext('2d').getImageData(0, 0, свой.width, свой.height);
  const и = исх.data, иш = исх.width, ив = исх.height;

  const холст = document.createElement('canvas');
  холст.width = ш; холст.height = в;
  const кон = холст.getContext('2d');
  const цель = кон.createImageData(ш, в);
  const ц = цель.data;

  for (let v = 0; v < в; v++) {
    for (let u = 0; u < ш; u++) {
      const знам = g * u + h * v + 1;
      const х = (a * u + b * v + c) / знам;
      const у = (d * u + e * v + f) / знам;
      const п = (v * ш + u) * 4;
      if (х < 0 || у < 0 || х > иш - 1 || у > ив - 1) {

        ц[п] = ц[п + 1] = ц[п + 2] = 255; ц[п + 3] = 255;
        continue;
      }

      const х0 = х | 0, у0 = у | 0;
      const х1 = Math.min(х0 + 1, иш - 1), у1 = Math.min(у0 + 1, ив - 1);
      const дх = х - х0, ду = у - у0;
      const л1 = (у0 * иш + х0) * 4, л2 = (у0 * иш + х1) * 4;
      const л3 = (у1 * иш + х0) * 4, л4 = (у1 * иш + х1) * 4;
      for (let к2 = 0; к2 < 3; к2++) {
        const верх = и[л1 + к2] * (1 - дх) + и[л2 + к2] * дх;
        const низ = и[л3 + к2] * (1 - дх) + и[л4 + к2] * дх;
        ц[п + к2] = верх * (1 - ду) + низ * ду;
      }
      ц[п + 3] = 255;
    }
  }
  кон.putImageData(цель, 0, 0);
  return холст;
}

export const углыПоУмолчанию = (ш, в, доля = 0.08) => ([
  [ш * доля, в * доля],
  [ш * (1 - доля), в * доля],
  [ш * (1 - доля), в * (1 - доля)],
  [ш * доля, в * (1 - доля)],
]);
