
const АДРЕС_БИБЛИОТЕКИ = 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/+esm';
const ХРАНИЛИЩЕ = 'onnx-community/Kokoro-82M-v1.0-ONNX';

const шли = (весть, перенос) => self.postMessage(весть, перенос || []);

let модель = null;
let грузится = null;
let Splitter = null;

const PIECE_CHARS = 200;

let этоПК = false;

async function броситьНаВидеокарту() {
  if (!этоПК) return false;
  try {
    if (!self.navigator || !self.navigator.gpu) return false;
    const п = await self.navigator.gpu.requestAdapter();
    return Boolean(п);
  } catch (е) { return false; }
}

async function готовая(приХоде) {
  if (модель) return модель;
  if (грузится) return грузится;

  грузится = (async () => {
    const lib = await import(АДРЕС_БИБЛИОТЕКИ);
    Splitter = lib.TextSplitterStream || null;
    const видеокарта = await броситьНаВидеокарту();
    модель = await lib.KokoroTTS.from_pretrained(ХРАНИЛИЩЕ, {

      dtype: видеокарта ? 'fp32' : 'q8',
      device: видеокарта ? 'webgpu' : 'wasm',
      progress_callback: (п) => {
        if (!п || п.status !== 'progress' || !п.total) return;

        if (п.total < 5 * 1048576) return;
        приХоде(Math.min(100, (п.loaded / п.total) * 100));
      },
    });
    return модель;
  })();

  try { return await грузится; } finally { грузится = null; }
}

function cutLong(text) {
  const out = [];
  let rest = String(text).trim();
  while (rest.length > PIECE_CHARS) {
    let at = rest.lastIndexOf(',', PIECE_CHARS);
    if (at < PIECE_CHARS * 0.4) at = rest.lastIndexOf(' ', PIECE_CHARS);
    if (at < PIECE_CHARS * 0.4) at = PIECE_CHARS;
    out.push(rest.slice(0, at + 1).trim());
    rest = rest.slice(at + 1).trim();
  }
  if (rest) out.push(rest);
  return out;
}

function toPieces(text) {
  const clean = String(text || '').trim();
  if (!clean) return [];
  let sentences = [clean];
  if (Splitter) {
    try {
      const s = new Splitter();
      s.push(clean);
      const got = [...s].map((x) => String(x).trim()).filter(Boolean);
      if (got.length) sentences = got;
    } catch (е) { sentences = [clean]; }
  }
  const pieces = [];
  let next = '';
  const flush = () => { if (next.trim()) pieces.push(next.trim()); next = ''; };
  for (const s of sentences) {
    if (s.length > PIECE_CHARS) { flush(); pieces.push(...cutLong(s)); continue; }
    if ((next + ' ' + s).trim().length > PIECE_CHARS) flush();
    next = next ? next + ' ' + s : s;
  }
  flush();
  return pieces;
}

function mergeAudio(parts) {
  if (parts.length === 1) return parts[0];
  let всего = 0;
  for (const ч of parts) всего += ч.length;
  const итог = new Float32Array(всего);
  let сдвиг = 0;
  for (const ч of parts) { итог.set(ч, сдвиг); сдвиг += ч.length; }
  return итог;
}

function вWav(отсчёты, частота) {
  const н = отсчёты.length;
  const буфер = new ArrayBuffer(44 + н * 2);
  const в = new DataView(буфер);
  const строка = (сдвиг, с) => { for (let и = 0; и < с.length; и++) в.setUint8(сдвиг + и, с.charCodeAt(и)); };
  строка(0, 'RIFF'); в.setUint32(4, 36 + н * 2, true); строка(8, 'WAVE');
  строка(12, 'fmt '); в.setUint32(16, 16, true); в.setUint16(20, 1, true); в.setUint16(22, 1, true);
  в.setUint32(24, частота, true); в.setUint32(28, частота * 2, true);
  в.setUint16(32, 2, true); в.setUint16(34, 16, true);
  строка(36, 'data'); в.setUint32(40, н * 2, true);
  for (let и = 0; и < н; и++) {

    const з = Math.max(-1, Math.min(1, отсчёты[и]));
    в.setInt16(44 + и * 2, з < 0 ? з * 0x8000 : з * 0x7fff, true);
  }
  return буфер;
}

async function ужеВКэше() {
  if (модель) return true;
  try {
    if (!self.caches) return false;
    for (const имя of await self.caches.keys()) {
      const х = await self.caches.open(имя);
      for (const з of await х.keys()) {
        if (з.url.includes('Kokoro-82M') && з.url.includes('.onnx')) return true;
      }
    }
  } catch (е) {}
  return false;
}

self.onmessage = async (е) => {
  const д = е.data || {};
  if (typeof д.пк === 'boolean') этоПК = д.пк;
  try {
    if (д.тип === 'что-скачано') {

      шли({ тип: 'что-скачано', список: (await ужеВКэше()) ? ['kokoro'] : [] });
      return;
    }

    if (д.тип === 'забыть') {
      модель = null;

      if (self.caches) {
        for (const имя of await self.caches.keys()) {
          const х = await self.caches.open(имя);
          for (const з of await х.keys()) {
            if (з.url.includes('Kokoro-82M')) await х.delete(з);
          }
        }
      }
      шли({ тип: 'забыто', голос: д.голос, список: [] });
      return;
    }

    if (д.тип === 'скачать') {
      шли({ тип: 'ход', этап: 'скачивание', доля: 0 });
      await готовая((доля) => шли({ тип: 'ход', этап: 'скачивание', доля }));
      шли({ тип: 'готов', голос: д.голос, список: ['kokoro'] });
      return;
    }

    if (д.тип === 'синтез') {
      шли({ тип: 'ход', этап: 'подготовка', доля: 0 });
      const м = await готовая((доля) => шли({ тип: 'ход', этап: 'скачивание', доля }));
      шли({ тип: 'ход', этап: 'синтез', доля: 0 });
      const начало = performance.now();
      const pieces = toPieces(д.текст);
      if (!pieces.length) throw new Error('пустой текст');
      const voice = д.голос || 'af_heart';
      const speed = д.скорость && д.скорость > 0 ? д.скорость : 1;
      const parts = [];
      let rate = 24000;
      for (let и = 0; и < pieces.length; и++) {
        const звук = await м.generate(pieces[и], { voice, speed });
        parts.push(звук.audio);
        if (звук.sampling_rate) rate = звук.sampling_rate;
        if (pieces.length > 1) {
          шли({ тип: 'ход', этап: 'синтез', доля: ((и + 1) / pieces.length) * 100 });
        }
      }
      const байты = вWav(mergeAudio(parts), rate);
      шли({
        тип: 'готово',
        байты,
        секунд: (performance.now() - начало) / 1000,
        список: ['kokoro'],
      }, [байты]);
      return;
    }
  } catch (ошибка) {

    модель = null;
    грузится = null;
    шли({ тип: 'беда', текст: String((ошибка && (ошибка.message || ошибка)) || 'ошибка') });
  }
};
