
const ПОТОКИ = {
  piper: () => new Worker(new URL('./tts-piper-worker.js', import.meta.url), { type: 'module' }),
  kokoro: () => new Worker(new URL('./tts-kokoro-worker.js', import.meta.url), { type: 'module' }),
  supertonic: () => new Worker(new URL('./tts-supertonic-worker.js', import.meta.url), { type: 'module' }),
};

const живые = new Map();

export function поток(движок) {
  if (живые.has(движок)) return живые.get(движок);
  const делать = ПОТОКИ[движок];
  if (!делать) throw new Error('неизвестный движок: ' + движок);
  const п = делать();
  живые.set(движок, п);
  return п;
}

export const естьДвижок = (д) => Boolean(ПОТОКИ[д]);

export function спросить(движок, задание, приХоде) {
  return new Promise((готово, беда) => {
    const п = поток(движок);

    const слушать = (е) => {
      const д = е.data || {};
      if (д.тип === 'ход') { if (приХоде) приХоде(д.этап, д.доля); return; }
      п.removeEventListener('message', слушать);
      п.removeEventListener('error', наОшибку);
      if (д.тип === 'беда') беда(new Error(д.текст || 'ошибка'));
      else готово(д);
    };
    const наОшибку = (е) => {
      п.removeEventListener('message', слушать);
      п.removeEventListener('error', наОшибку);
      беда(new Error((е && е.message) || 'поток не отвечает'));
    };

    п.addEventListener('message', слушать);
    п.addEventListener('error', наОшибку);
    п.postMessage(задание);
  });
}

export function накуски(текст, предел = 300) {
  const с = String(текст || '').trim();
  if (!с) return [];
  if (с.length <= предел) return [с];

  const предложения = с.split(/(?<=[.!?…])\s+|\n+/).filter((к) => к.trim());
  const куски = [];
  let текущий = '';

  const положить = () => { if (текущий.trim()) куски.push(текущий.trim()); текущий = ''; };

  for (let п of предложения) {
    п = п.trim();
    if (!п) continue;

    if (п.length > предел) {
      положить();
      let остаток = п;
      while (остаток.length > предел) {
        let где = остаток.lastIndexOf(',', предел);
        if (где < предел * 0.4) где = остаток.lastIndexOf(' ', предел);
        if (где < предел * 0.4) где = предел;
        куски.push(остаток.slice(0, где + 1).trim());
        остаток = остаток.slice(где + 1).trim();
      }
      текущий = остаток;
      continue;
    }

    if ((текущий + ' ' + п).trim().length > предел) положить();
    текущий = текущий ? текущий + ' ' + п : п;
  }
  положить();
  return куски;
}

export function склеить(куски) {
  if (!куски.length) return null;
  if (куски.length === 1) return куски[0];

  const шапка = new DataView(куски[0]);
  const частота = шапка.getUint32(24, true);
  const тел = куски.map((б) => new Uint8Array(б, 44));
  const всего = тел.reduce((с, т) => с + т.length, 0);

  const итог = new ArrayBuffer(44 + всего);
  const в = new DataView(итог);
  const строка = (сдвиг, с) => { for (let и = 0; и < с.length; и++) в.setUint8(сдвиг + и, с.charCodeAt(и)); };
  строка(0, 'RIFF'); в.setUint32(4, 36 + всего, true); строка(8, 'WAVE');
  строка(12, 'fmt '); в.setUint32(16, 16, true); в.setUint16(20, 1, true); в.setUint16(22, 1, true);
  в.setUint32(24, частота, true); в.setUint32(28, частота * 2, true);
  в.setUint16(32, 2, true); в.setUint16(34, 16, true);
  строка(36, 'data'); в.setUint32(40, всего, true);

  const куда = new Uint8Array(итог, 44);
  let сдвиг = 0;
  for (const т of тел) { куда.set(т, сдвиг); сдвиг += т.length; }
  return итог;
}
