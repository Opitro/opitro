
export const КУСОК_ЗНАКОВ = 300;

export const МОДЕЛИ = [
  {
    ключ: 'piper',
    имя: 'Piper',

    вес: 109,
    весМин: 60,
    весСамыйЛёгкий: 20,
    лицензия: 'MIT',
    хранилище: 'diffusionstudio/piper-voices',
    языки: ['ru', 'uk', 'en', 'es'],
    голосаПоЯзыкам: { ru: 4, uk: 2, en: 35, es: 7 },
    движок: '@diffusionstudio/vits-web',

    сеть: ['cdn.jsdelivr.net', 'huggingface.co'],
  },
  {
    ключ: 'kokoro',
    имя: 'Kokoro-82M',

    вес: 93,
    лицензия: 'Apache 2.0',
    хранилище: 'onnx-community/Kokoro-82M-v1.0-ONNX',
    файл: 'onnx/model_quantized.onnx',

    языки: ['en'],
    голосов: 28,
    движок: 'kokoro-js',

    медленнееРеального: 2.5,
  },
  {
    ключ: 'supertonic',
    имя: 'Supertonic 3',

    вес: 380,
    лицензия: 'OpenRAIL-M',
    хранилище: 'Supertone/supertonic-3',
    файлы: ['onnx/vector_estimator.onnx', 'onnx/vocoder.onnx', 'onnx/text_encoder.onnx',
            'onnx/duration_predictor.onnx'],
    языки: ['en', 'ru', 'uk', 'es', 'de', 'fr', 'it', 'pl', 'pt', 'tr', 'nl', 'cs', 'sv',
            'da', 'fi', 'el', 'bg', 'hr', 'hu', 'ro', 'sk', 'sl', 'lt', 'lv', 'et', 'ar',
            'hi', 'id', 'vi', 'ja', 'ko'],

    буквами: true,
    движок: 'onnxruntime-web',
    голоса: ['F1', 'F2', 'F3', 'F4', 'F5', 'M1', 'M2', 'M3', 'M4', 'M5'],
    голосов: 10,

    шагов: 8,
    скоростьПоУмолчанию: 1.05,

    медленнееРеального: 0.75,
  },
];

export const поКлючу = (к) => МОДЕЛИ.find((м) => м.ключ === к);

export const говоритНа = (м, язык) => м.языки.includes(язык);

export function поУмолчанию(язык) {
  return язык === 'en' ? 'kokoro' : 'piper';
}
