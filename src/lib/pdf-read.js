
const ПУТЬ_РАБОТНИКА = '/pdf/pdf.worker.min.mjs';
let движок = null;

async function поднять() {
  if (!движок) {
    движок = import('pdfjs-dist/build/pdf.min.mjs').then((м) => {

      м.GlobalWorkerOptions.workerSrc = ПУТЬ_РАБОТНИКА;
      return м;
    }).catch((е) => { движок = null; throw е; });
  }
  return движок;
}

export class НуженПароль extends Error {
  constructor() { super('нужен пароль'); this.name = 'НуженПароль'; }
}

export async function открытьPdf(данные, { пароль = '' } = {}) {
  const pdfjs = await поднять();
  let док;
  try {
    док = await pdfjs.getDocument({
      data: данные instanceof Uint8Array ? данные : new Uint8Array(данные),
      password: пароль,

      disableFontFace: true,
      isEvalSupported: false,
    }).promise;
  } catch (е) {
    if (е && (е.name === 'PasswordException' || /password/i.test(е.message || ''))) throw new НуженПароль();
    throw е;
  }

  return {
    страниц: док.numPages,

    async строки(номер) {
      const стр = await док.getPage(номер);
      const вид = стр.getViewport({ scale: 1 });
      const { items } = await стр.getTextContent();
      return вСтроки(items, вид.width || 1, вид.height || 1);
    },

    async нарисовать(номер, { предел = 1600 } = {}) {
      const стр = await док.getPage(номер);
      const свой = стр.getViewport({ scale: 1 });
      const к = Math.min(3, Math.max(1, предел / Math.max(свой.width, свой.height)));
      const вид = стр.getViewport({ scale: к });
      const холст = document.createElement('canvas');
      холст.width = Math.round(вид.width);
      холст.height = Math.round(вид.height);
      const кон = холст.getContext('2d');

      кон.fillStyle = '#fff';
      кон.fillRect(0, 0, холст.width, холст.height);
      await стр.render({ canvasContext: кон, viewport: вид, canvas: холст }).promise;
      return холст;
    },

    закрыть() { try { док.destroy(); } catch (е) {} },
  };
}

function вСтроки(куски, ширина, высота) {
  const годные = [];
  for (const к of куски) {
    const т = (к.str || '');
    if (!т.trim()) continue;
    const п = к.transform || [1, 0, 0, 1, 0, 0];
    const кегль = Math.abs(п[3]) || Math.hypot(п[2], п[3]) || 10;
    годные.push({ текст: т, х: п[4], низ: п[5], ш: к.width || 0, кегль });
  }
  if (!годные.length) return [];

  годные.sort((а, б) => (б.низ - а.низ) || (а.х - б.х));
  const полосы = [];
  for (const к of годные) {
    const п = полосы[полосы.length - 1];
    if (п && Math.abs(п.низ - к.низ) <= Math.max(к.кегль, п.кегль) * 0.5) {
      п.куски.push(к);
      п.низ = (п.низ * (п.куски.length - 1) + к.низ) / п.куски.length;
    } else {
      полосы.push({ низ: к.низ, кегль: к.кегль, куски: [к] });
    }
  }

  return полосы.map((п) => {
    const куски = п.куски.slice().sort((а, б) => а.х - б.х);
    let текст = '';
    for (let и = 0; и < куски.length; и++) {
      const к = куски[и];
      if (и) {

        const пред = куски[и - 1];
        const зазор = к.х - (пред.х + пред.ш);
        if (зазор > к.кегль * 0.2 && !/\s$/.test(текст) && !/^\s/.test(к.текст)) текст += ' ';
      }
      текст += к.текст;
    }
    const левый = Math.min(...куски.map((к) => к.х));
    const правый = Math.max(...куски.map((к) => к.х + к.ш));
    const кегль = Math.max(...куски.map((к) => к.кегль));

    const верх = высота - (п.низ + кегль * 0.8);
    return {
      текст: текст.trim(),
      место: {
        х: левый / ширина,
        у: Math.max(0, верх / высота),
        ш: Math.max(0, (правый - левый)) / ширина,
        в: (кегль * 1.15) / высота,
      },
    };
  }).filter((с) => с.текст);
}

export const буквВСтроках = (строки) =>
  (строки.map((с) => с.текст).join('').match(/\p{L}/gu) || []).length;
