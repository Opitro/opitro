
import { UnicodeProcessor, TextToSpeech, loadOnnx, loadVoiceStyle } from './supertonic/supertonic-helper.js';

const БАЗА = 'https://huggingface.co/Supertone/supertonic-3/resolve/main';
const КЭШ = 'opitro-supertonic-3';
const ФАЙЛЫ = [
  'onnx/duration_predictor.onnx',
  'onnx/text_encoder.onnx',
  'onnx/vector_estimator.onnx',
  'onnx/vocoder.onnx',
  'onnx/tts.json',
  'onnx/unicode_indexer.json',
];

const ШАГОВ = 8;
const СКОРОСТЬ = 1.05;

const шли = (весть, перенос) => self.postMessage(весть, перенос || []);

let модель = null;
let голосаКэш = new Map();
let грузится = null;

async function ужеЕсть() {
  if (!self.caches) return false;
  const х = await self.caches.open(КЭШ);
  for (const ф of ФАЙЛЫ) {
    if (!(await х.match(БАЗА + '/' + ф))) return false;
  }
  return true;
}

async function положитьВКэш(приХоде) {
  if (!self.caches) return;
  const х = await self.caches.open(КЭШ);

  const надо = [];
  for (const ф of ФАЙЛЫ) {
    if (!(await х.match(БАЗА + '/' + ф))) надо.push(ф);
  }
  if (!надо.length) { приХоде(100); return; }

  const веса = [];
  for (const ф of надо) {
    const о = await fetch(БАЗА + '/' + ф, { method: 'HEAD' });
    веса.push(Number(о.headers.get('content-length')) || 0);
  }
  const всего = веса.reduce((а, б) => а + б, 0);
  let набрано = 0;

  for (let и = 0; и < надо.length; и++) {
    const адрес = БАЗА + '/' + надо[и];
    const о = await fetch(адрес);
    if (!о.ok) throw new Error('не скачался ' + надо[и]);
    const читатель = о.body.getReader();
    const куски = [];
    for (;;) {
      const { done, value } = await читатель.read();
      if (done) break;
      куски.push(value);
      набрано += value.length;
      if (всего) приХоде(Math.min(99, (набрано / всего) * 100));
    }
    await х.put(адрес, new Response(new Blob(куски), { headers: о.headers }));
  }
  приХоде(100);
}

async function изКэша(ф) {
  const адрес = БАЗА + '/' + ф;
  if (self.caches) {
    const х = await self.caches.open(КЭШ);
    const о = await х.match(адрес);
    if (о) return URL.createObjectURL(await о.blob());
  }
  return адрес;
}

async function готовая(приХоде) {
  if (модель) return модель;
  if (грузится) return грузится;

  грузится = (async () => {
    await положитьВКэш(приХоде);

    const настройки = { executionProviders: ['wasm'], graphOptimizationLevel: 'all' };
    const [дп, кодировщик, оценщик, вокодер] = await Promise.all([
      изКэша('onnx/duration_predictor.onnx').then((а) => loadOnnx(а, настройки)),
      изКэша('onnx/text_encoder.onnx').then((а) => loadOnnx(а, настройки)),
      изКэша('onnx/vector_estimator.onnx').then((а) => loadOnnx(а, настройки)),
      изКэша('onnx/vocoder.onnx').then((а) => loadOnnx(а, настройки)),
    ]);
    const настройкиМодели = await (await fetch(await изКэша('onnx/tts.json'))).json();
    const словарь = await (await fetch(await изКэша('onnx/unicode_indexer.json'))).json();

    модель = new TextToSpeech(настройкиМодели, new UnicodeProcessor(словарь),
      дп, кодировщик, оценщик, вокодер);
    return модель;
  })();

  try { return await грузится; } finally { грузится = null; }
}

async function голос(имя) {
  const к = имя || 'M1';
  if (голосаКэш.has(к)) return голосаКэш.get(к);
  const стиль = await loadVoiceStyle([`${БАЗА}/voice_styles/${к}.json`]);
  голосаКэш.set(к, стиль);
  return стиль;
}

self.onmessage = async (е) => {
  const д = е.data || {};
  try {
    if (д.тип === 'что-скачано') {
      шли({ тип: 'что-скачано', список: (await ужеЕсть()) ? ['supertonic'] : [] });
      return;
    }

    if (д.тип === 'забыть') {
      модель = null;
      голосаКэш = new Map();
      if (self.caches) await self.caches.delete(КЭШ);
      шли({ тип: 'забыто', голос: д.голос, список: [] });
      return;
    }

    if (д.тип === 'скачать') {
      шли({ тип: 'ход', этап: 'скачивание', доля: 0 });
      await готовая((доля) => шли({ тип: 'ход', этап: 'скачивание', доля }));
      шли({ тип: 'готов', голос: д.голос, список: ['supertonic'] });
      return;
    }

    if (д.тип === 'синтез') {
      шли({ тип: 'ход', этап: 'подготовка', доля: 0 });
      const м = await готовая((доля) => шли({ тип: 'ход', этап: 'скачивание', доля }));
      const стиль = await голос(д.голос);
      шли({ тип: 'ход', этап: 'синтез', доля: 0 });
      const начало = performance.now();
      const из = await м.call(
        д.текст,
        д.язык || 'en',
        стиль,
        ШАГОВ,
        д.скорость && д.скорость > 0 ? СКОРОСТЬ * д.скорость : СКОРОСТЬ,
      );
      const отсчёты = из.wav || из.audio || из;
      const байты = вWav(отсчёты, из.sampleRate || 44100);
      шли({
        тип: 'готово',
        байты,
        секунд: (performance.now() - начало) / 1000,
        список: ['supertonic'],
      }, [байты]);
      return;
    }
  } catch (ошибка) {
    модель = null;
    грузится = null;
    шли({ тип: 'беда', текст: String((ошибка && (ошибка.message || ошибка)) || 'ошибка') });
  }
};

function вWav(отсчёты, частота) {
  const н = отсчёты.length;
  const буфер = new ArrayBuffer(44 + н * 2);
  const в = new DataView(буфер);
  const строка = (с2, с) => { for (let и = 0; и < с.length; и++) в.setUint8(с2 + и, с.charCodeAt(и)); };
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
