// РАЗДЕЛЕНИЕ ЗАПИСИ НА ГОЛОС И МУЗЫКУ.
//
// Всё считается в браузере: движок и модели скачиваются один раз и остаются в Cache API,
// сам звук никуда не отправляется. Отсюда выходят СРАЗУ ОБЕ дорожки -- минусовка и голос, --
// потому что это один и тот же расчёт: маска говорит, какая доля каждой полосы принадлежит
// музыке, остаток принадлежит голосу.
//
// Два способа:
//   'light' -- Spleeter 2stems fp16, два файла по 18,8 МБ, считает процессор, около 6х
//              быстрее самой записи. Работает везде.
//   'heavy' -- MDX-Net Inst HQ 3, 64 МБ, только видеокарта. На процессоре кусок в 5,9 с
//              считается 19,6 с -- это часы на песню и почти гарантированный обрыв,
//              поэтому без navigator.gpu мы его просто не пускаем.
//
// Числа и порядок действий выверены на живой реализации (LeebTTS, remove-vocal): менять их
// «по логике» нельзя, модели не примут другую форму входа.

// СВОЕГО СЕРВЕРА С ЗАПАСНОЙ КОПИЕЙ У НАС НЕТ (сайт статический), поэтому на каждый файл
// берём ДВА независимых источника. Ляжет один -- возьмём со второго; лягут оба -- честно
// скажем и оставим «Браузер», которому вообще ничего качать не надо.
const CDN = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/';
const CDN2 = 'https://unpkg.com/onnxruntime-web@1.20.1/dist/';
// ВАЖНО: именно сборка webgpu. В обычной ort.min.js видеокарты нет вовсе.
const ORT_JS = [CDN + 'ort.webgpu.min.js', CDN2 + 'ort.webgpu.min.js'];
const HF = 'https://huggingface.co/';

export const МОДЕЛИ = {
  light: {
    мб: 38,
    файлы: [
      { id: 'spleeter-vocals', url: [
        HF + 'csukuangfj/sherpa-onnx-spleeter-2stems-fp16/resolve/main/vocals.fp16.onnx',
        HF + 'csukuangfj/sherpa-onnx-spleeter-2stems/resolve/main/vocals.onnx'] },
      { id: 'spleeter-accomp', url: [
        HF + 'csukuangfj/sherpa-onnx-spleeter-2stems-fp16/resolve/main/accompaniment.fp16.onnx',
        HF + 'csukuangfj/sherpa-onnx-spleeter-2stems/resolve/main/accompaniment.onnx'] },
    ],
    провайдеры: ['wasm'],
  },
  heavy: {
    мб: 64,
    файлы: [
      { id: 'mdx-inst-hq3', url: [
        HF + 'seanghay/uvr_models/resolve/main/UVR-MDX-NET-Inst_HQ_3.onnx',
        HF + 'Politrees/UVR_resources/resolve/main/MDXNET_models/UVR-MDX-NET-Inst_HQ_3.onnx'] },
    ],
    провайдеры: ['webgpu'],
  },
};

const MDX = { NFFT: 6144, HOP: 1024, DIMF: 3072, DIMT: 256, COMP: 1.022 };
MDX.TRIM = MDX.NFFT / 2;
MDX.CHUNK = MDX.HOP * (MDX.DIMT - 1);
MDX.GEN = MDX.CHUNK - 2 * MDX.TRIM;
const SPL = { NFFT: 4096, HOP: 1024, BINS: 1024, T: 512 };
export const ЧАСТОТА = 44100;

/** Есть ли видеокарта. Тяжёлую модель без неё не запускаем: см. заголовок файла. */
export function естьВидеокарта() {
  return typeof navigator !== 'undefined' && !!navigator.gpu;
}

// ---- Быстрое преобразование Фурье --------------------------------------------------------
function радикс2(n) {
  const бит = Math.round(Math.log2(n));
  const cs = new Float64Array(n / 2), sn = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) { cs[i] = Math.cos(-2 * Math.PI * i / n); sn[i] = Math.sin(-2 * Math.PI * i / n); }
  const rev = new Uint32Array(n);
  for (let i = 0; i < n; i++) { let r = 0; for (let j = 0; j < бит; j++) if (i & (1 << j)) r |= 1 << (бит - 1 - j); rev[i] = r; }
  return function (re, im) {
    for (let i = 0; i < n; i++) { const j = rev[i]; if (j > i) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (let size = 2; size <= n; size <<= 1) {
      const half = size >> 1, step = n / size;
      for (let i = 0; i < n; i += size) {
        for (let j = i, k = 0; j < i + half; j++, k += step) {
          const c = cs[k], s = sn[k], ar = re[j + half], ai = im[j + half];
          const tr = ar * c - ai * s, ti = ar * s + ai * c;
          re[j + half] = re[j] - tr; im[j + half] = im[j] - ti;
          re[j] += tr; im[j] += ti;
        }
      }
    }
  };
}
function ханн(n) { const w = new Float64Array(n); for (let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n); return w; }

// ---- Разложение для тяжёлой модели: окно 6144 = 3 x 2048 ---------------------------------
// 6144 не степень двойки, поэтому обычное преобразование не подойдёт: раскладываем на три
// по 2048 и собираем обратно поворотными множителями.
let мдхДсп = null;
function дспMDX() {
  if (мдхДсп) return мдхДсп;
  const { NFFT, HOP, DIMF, DIMT, TRIM, CHUNK } = MDX, M = NFFT / 3, NBINS = NFFT / 2 + 1;
  const ф2048 = радикс2(M);
  const twc = new Float64Array(NFFT), tws = new Float64Array(NFFT);
  for (let k = 0; k < NFFT; k++) { twc[k] = Math.cos(-2 * Math.PI * k / NFFT); tws[k] = Math.sin(-2 * Math.PI * k / NFFT); }
  const s0r = new Float64Array(M), s0i = new Float64Array(M), s1r = new Float64Array(M),
    s1i = new Float64Array(M), s2r = new Float64Array(M), s2i = new Float64Array(M);
  function fft(re, im) {
    for (let n = 0; n < M; n++) {
      s0r[n] = re[3 * n]; s0i[n] = im[3 * n];
      s1r[n] = re[3 * n + 1]; s1i[n] = im[3 * n + 1];
      s2r[n] = re[3 * n + 2]; s2i[n] = im[3 * n + 2];
    }
    ф2048(s0r, s0i); ф2048(s1r, s1i); ф2048(s2r, s2i);
    for (let k = 0; k < NFFT; k++) {
      const km = k % M, k2 = (2 * k) % NFFT;
      const w1r = twc[k], w1i = tws[k], w2r = twc[k2], w2i = tws[k2];
      const a1r = s1r[km], a1i = s1i[km], a2r = s2r[km], a2i = s2i[km];
      re[k] = s0r[km] + (a1r * w1r - a1i * w1i) + (a2r * w2r - a2i * w2i);
      im[k] = s0i[km] + (a1r * w1i + a1i * w1r) + (a2r * w2i + a2i * w2r);
    }
  }
  function ifft(re, im) {
    for (let i = 0; i < NFFT; i++) im[i] = -im[i];
    fft(re, im);
    const k = 1 / NFFT;
    for (let i = 0; i < NFFT; i++) { re[i] *= k; im[i] *= -k; }
  }
  const win = ханн(NFFT);
  const fre = new Float64Array(NFFT), fim = new Float64Array(NFFT);
  // Отражение считается от границ КУСКА, а не всей записи -- иначе на стыках щёлкает.
  function взять(x, start, idx, n) {
    let k = idx;
    if (k < 0) k = -k;
    if (k >= CHUNK) k = 2 * CHUNK - k - 2;
    const g = start + k - TRIM;
    return (g < 0 || g >= n) ? 0 : x[g];
  }
  function stft(L, R, start, n, out) {
    for (let ch = 0; ch < 2; ch++) {
      // Порядок четвёрки: левый действительная, левый мнимая, правый действительная, правый мнимая.
      const x = ch ? R : L, bRe = ch ? 2 : 0, bIm = ch ? 3 : 1;
      for (let t = 0; t < DIMT; t++) {
        const c = t * HOP - TRIM;
        for (let i = 0; i < NFFT; i++) { fre[i] = взять(x, start, c + i, n) * win[i]; fim[i] = 0; }
        fft(fre, fim);
        for (let f = 0; f < DIMF; f++) {
          out[(bRe * DIMF + f) * DIMT + t] = fre[f];
          out[(bIm * DIMF + f) * DIMT + t] = fim[f];
        }
      }
    }
  }
  const accL = new Float64Array(CHUNK + NFFT), accR = new Float64Array(CHUNK + NFFT), wsum = new Float64Array(CHUNK + NFFT);
  function istft(spec, outL, outR) {
    accL.fill(0); accR.fill(0); wsum.fill(0);
    for (let ch = 0; ch < 2; ch++) {
      const bRe = ch ? 2 : 0, bIm = ch ? 3 : 1, acc = ch ? accR : accL;
      for (let t = 0; t < DIMT; t++) {
        for (let f = 0; f < DIMF; f++) {
          fre[f] = spec[(bRe * DIMF + f) * DIMT + t];
          fim[f] = spec[(bIm * DIMF + f) * DIMT + t];
        }
        fre[DIMF] = 0; fim[DIMF] = 0;
        for (let f = NBINS; f < NFFT; f++) { const m = NFFT - f; fre[f] = fre[m]; fim[f] = -fim[m]; }
        ifft(fre, fim);
        const base = t * HOP;
        for (let i = 0; i < NFFT; i++) {
          acc[base + i] += fre[i] * win[i];
          if (ch === 0) wsum[base + i] += win[i] * win[i];
        }
      }
    }
    for (let i = 0; i < CHUNK; i++) {
      const w = wsum[i + TRIM], d = w > 1e-8 ? w : 1e-8;
      outL[i] = accL[i + TRIM] / d; outR[i] = accR[i + TRIM] / d;
    }
  }
  мдхДсп = { stft, istft };
  return мдхДсп;
}

// ---- Разложение для лёгкой модели: окно 4096, обычная степень двойки ---------------------
let сплДсп = null;
function дспSPL() {
  if (сплДсп) return сплДсп;
  const { NFFT } = SPL;
  const fft = радикс2(NFFT);
  function ifft(re, im) {
    for (let i = 0; i < NFFT; i++) im[i] = -im[i];
    fft(re, im);
    const k = 1 / NFFT;
    for (let i = 0; i < NFFT; i++) { re[i] *= k; im[i] *= -k; }
  }
  сплДсп = { fft, ifft, win: ханн(NFFT) };
  return сплДсп;
}

// ---- Движок и файлы ----------------------------------------------------------------------
let ortГотов = null;
function загрузитьСкрипт(u) {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = u; s.onload = () => res(u); s.onerror = () => rej(new Error(u));
    document.head.appendChild(s);
  });
}
async function загрузитьOrt() {
  if (ortГотов) return ortГотов;
  ortГотов = (async () => {
    let откуда = -1;
    if (typeof window.ort === 'undefined') {
      for (let i = 0; i < ORT_JS.length; i++) {
        try { await загрузитьСкрипт(ORT_JS[i]); откуда = i; break; } catch (e) {}
      }
    } else откуда = 0;
    if (typeof window.ort === 'undefined') throw new Error('ДВИЖОК_НЕ_ЗАГРУЗИЛСЯ');
    // Вспомогательные файлы движка берём ОТТУДА ЖЕ, откуда взялся сам движок: смешивать
    // две сборки нельзя, они разных версий сборки внутри.
    window.ort.env.wasm.wasmPaths = откуда === 1 ? CDN2 : CDN;
    // Общая память браузеру недоступна, потоков не просим.
    window.ort.env.wasm.numThreads = 1;
    window.ort.env.logLevel = 'error';
    return window.ort;
  })();
  try { return await ortГотов; } catch (e) { ortГотов = null; throw e; }
}

// Скачивание с полосой: HuggingFace отдаёт длину и разрешает чужой домен.
async function скачать(url, onp) {
  const r = await fetch(url, { mode: 'cors' });
  if (!r.ok) throw new Error('источник ответил ' + r.status);
  const всего = +(r.headers.get('content-length') || 0);
  if (!r.body || !всего) return new Uint8Array(await r.arrayBuffer());
  const всё = new Uint8Array(всего);
  const чтец = r.body.getReader();
  let есть = 0;
  for (;;) {
    const { done, value } = await чтец.read();
    if (done) break;
    if (есть + value.length > всего) break;
    всё.set(value, есть); есть += value.length;
    if (onp) onp(есть / всего);
  }
  return есть === всего ? всё : всё.subarray(0, есть);
}

// Cache API, а не обычный кэш браузера: обычный система чистит молча, и человек платит
// за 38 МБ второй раз.
async function байты(файл, onp) {
  const ключ = '/opitro-model/' + файл.id;
  let кэш = null;
  try { кэш = await caches.open('opitro-models-v1'); } catch (e) {}
  if (кэш) {
    const есть = await кэш.match(ключ);
    if (есть) return new Uint8Array(await есть.arrayBuffer());
  }
  const адреса = Array.isArray(файл.url) ? файл.url : [файл.url];
  let bytes = null, беда = null;
  for (const u of адреса) {
    try { bytes = await скачать(u, onp); break; } catch (e) { беда = e; }
  }
  if (!bytes) throw new Error('МОДЕЛЬ_НЕ_СКАЧАЛАСЬ' + (беда ? ': ' + беда.message : ''));
  if (кэш) {
    try { await кэш.put(ключ, new Response(bytes, { headers: { 'content-type': 'application/octet-stream' } })); } catch (e) {}
  }
  return bytes;
}

const сеансы = {};
async function получитьСеансы(вид, onp) {
  if (сеансы[вид]) return сеансы[вид];
  const ort = await загрузитьOrt();
  const cfg = МОДЕЛИ[вид];
  const всего = cfg.файлы.length;
  const готовые = [];
  for (let i = 0; i < всего; i++) {
    const bytes = await байты(cfg.файлы[i], (p) => onp && onp((i + p) / всего));
    готовые.push(await ort.InferenceSession.create(bytes, { executionProviders: cfg.провайдеры }));
  }
  сеансы[вид] = готовые;
  return готовые;
}

/** Есть ли модель уже в браузере -- чтобы не пугать человека размером зря. */
export async function модельУжеСкачана(вид) {
  try {
    const кэш = await caches.open('opitro-models-v1');
    for (const ф of МОДЕЛИ[вид].файлы) {
      if (!(await кэш.match('/opitro-model/' + ф.id))) return false;
    }
    return true;
  } catch (e) { return false; }
}

// ---- Приведение к 44100 и двум каналам ---------------------------------------------------
async function к44(buffer) {
  if (buffer.sampleRate === ЧАСТОТА && buffer.numberOfChannels >= 2) return buffer;
  const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const oc = new OC(2, Math.max(1, Math.ceil(buffer.duration * ЧАСТОТА)), ЧАСТОТА);
  const s = oc.createBufferSource(); s.buffer = buffer; s.connect(oc.destination); s.start();
  return oc.startRendering();
}

function пустойБуфер(каналов, длина) {
  const OC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  return new OC(каналов, длина, ЧАСТОТА).createBuffer(каналов, длина, ЧАСТОТА);
}

// Модель может отработать «успешно» и вернуть пустоту или бесконечности -- на части
// мобильных видеокарт бывает именно так, и человек видит плоскую волну вместо музыки.
function живой(buf) {
  if (!buf) return false;
  const d = buf.getChannelData(0);
  let пик = 0;
  for (let i = 0; i < d.length; i += 97) {
    const v = d[i];
    if (!isFinite(v)) return false;
    const a = Math.abs(v);
    if (a > пик) пик = a;
  }
  return пик > 1e-4;
}

// ---- Лёгкая модель -----------------------------------------------------------------------
async function лёгкая(сеансы2, src, onp, живо) {
  const [мГолос, мМузыка] = сеансы2;
  const { NFFT, HOP, BINS, T } = SPL;
  const n = src.length;
  const кан = [src.getChannelData(0), src.numberOfChannels > 1 ? src.getChannelData(1) : src.getChannelData(0)];
  let кадров = Math.max(1, Math.floor((n - NFFT) / HOP) + 1);
  кадров = Math.ceil(кадров / T) * T;
  const d = дспSPL(), win = d.win;
  const музыка = пустойБуфер(2, n), голос = пустойБуфер(2, n);
  const выхМ = [музыка.getChannelData(0), музыка.getChannelData(1)];
  const выхГ = [голос.getChannelData(0), голос.getChannelData(1)];
  const re = new Float64Array(NFFT), im = new Float64Array(NFFT);
  const sRe = [new Float32Array(T * BINS), new Float32Array(T * BINS)];
  const sIm = [new Float32Array(T * BINS), new Float32Array(T * BINS)];
  const x = new Float32Array(2 * T * BINS);
  const блоков = Math.ceil(кадров / T);
  const ort = window.ort;

  for (let b = 0; b < блоков; b++) {
    if (живо && !живо()) return null;
    const f0 = b * T;
    for (let ch = 0; ch < 2; ch++) {
      const s = кан[ch];
      for (let t = 0; t < T; t++) {
        const off = (f0 + t) * HOP, base = t * BINS;
        for (let i = 0; i < NFFT; i++) { const g = off + i; re[i] = (g < n ? s[g] : 0) * win[i]; im[i] = 0; }
        d.fft(re, im);
        for (let k = 0; k < BINS; k++) {
          sRe[ch][base + k] = re[k]; sIm[ch][base + k] = im[k];
          x[ch * T * BINS + base + k] = Math.hypot(re[k], im[k]);
        }
      }
    }
    // Первое измерение -- КАНАЛЫ, не пакет.
    const вход = new ort.Tensor('float32', x, [2, 1, T, BINS]);
    const рГ = await мГолос.run({ x: вход });
    if (живо && !живо()) return null;
    const рМ = await мМузыка.run({ x: вход });
    if (живо && !живо()) return null;
    const V = рГ.y.data, A = рМ.y.data;

    for (let ch = 0; ch < 2; ch++) {
      for (let t = 0; t < T; t++) {
        const base = t * BINS, o = ch * T * BINS + base;
        // Одна маска даёт обе дорожки: доля музыки и остаток.
        for (const [маска, куда] of [[1, выхМ[ch]], [0, выхГ[ch]]]) {
          for (let k = 0; k < BINS; k++) {
            const vv = V[o + k] * V[o + k], aa = A[o + k] * A[o + k];
            const м = маска ? (aa + 5e-11) / (vv + aa + 1e-10) : (vv + 5e-11) / (vv + aa + 1e-10);
            re[k] = sRe[ch][base + k] * м; im[k] = sIm[ch][base + k] * м;
          }
          for (let k = BINS; k <= NFFT / 2; k++) { re[k] = 0; im[k] = 0; }
          for (let k = NFFT / 2 + 1; k < NFFT; k++) { const m = NFFT - k; re[k] = re[m]; im[k] = -im[m]; }
          d.ifft(re, im);
          const off = (f0 + t) * HOP;
          for (let i = 0; i < NFFT; i++) { const g = off + i; if (g >= n) break; куда[g] += re[i] * win[i]; }
        }
      }
    }
    if (onp) onp((b + 1) / блоков);
    await new Promise((r) => setTimeout(r, 0));
  }

  // Сумма квадратов окон: в середине ровно 1,5, считаем только края.
  const голова = new Float64Array(NFFT), хвост = new Float64Array(NFFT);
  for (let g = 0; g < NFFT; g++) {
    let sh = 0, st = 0;
    for (let t = 0; t < кадров; t++) {
      const i = g - t * HOP;
      if (i >= 0 && i < NFFT) sh += win[i] * win[i];
      const j = (n - NFFT + g) - t * HOP;
      if (j >= 0 && j < NFFT) st += win[j] * win[j];
    }
    голова[g] = sh; хвост[g] = st;
  }
  for (let g = 0; g < n; g++) {
    let w = 1.5;
    if (g < NFFT) w = голова[g];
    else if (g >= n - NFFT) w = хвост[g - (n - NFFT)];
    const dd = w > 1e-8 ? w : 1e-8;
    выхМ[0][g] /= dd; выхМ[1][g] /= dd;
    выхГ[0][g] /= dd; выхГ[1][g] /= dd;
  }
  return { музыка, голос };
}

// ---- Тяжёлая модель ----------------------------------------------------------------------
async function тяжёлая(сеансы2, src, onp, живо) {
  const сеанс = сеансы2[0];
  const n = src.length;
  const мL = src.getChannelData(0), мR = src.numberOfChannels > 1 ? src.getChannelData(1) : src.getChannelData(0);
  const { CHUNK, GEN, TRIM, DIMF, DIMT, COMP } = MDX;
  const pad = GEN - (n % GEN);
  const d = дспMDX();
  const spec = new Float32Array(4 * DIMF * DIMT);
  const cl = new Float32Array(CHUNK), cr = new Float32Array(CHUNK);
  const музыка = пустойБуфер(2, n), голос = пустойБуфер(2, n);
  const мЛ = музыка.getChannelData(0), мР = музыка.getChannelData(1);
  const гЛ = голос.getChannelData(0), гР = голос.getChannelData(1);
  const кусков = Math.ceil((n + pad) / GEN);
  const ort = window.ort;
  for (let c = 0, i = 0; i < n + pad; i += GEN, c++) {
    if (живо && !живо()) return null;
    d.stft(мL, мR, i, n, spec);
    const рез = await сеанс.run({ input: new ort.Tensor('float32', spec, [1, 4, DIMF, DIMT]) });
    if (живо && !живо()) return null;
    d.istft(рез[сеанс.outputNames[0]].data, cl, cr);
    for (let k = 0; k < GEN; k++) {
      const g = i + k;
      if (g >= n) break;
      // Модель отдаёт ИНСТРУМЕНТАЛ. Голос -- это исходник минус он.
      мЛ[g] = cl[TRIM + k] * COMP;
      мР[g] = cr[TRIM + k] * COMP;
      гЛ[g] = мL[g] - мЛ[g];
      гР[g] = мR[g] - мР[g];
    }
    if (onp) onp((c + 1) / кусков);
    await new Promise((r) => setTimeout(r, 0));
  }
  return { музыка, голос };
}

/**
 * Разделить запись. Возвращает { музыка, голос } -- обе дорожки за один расчёт.
 * @param {AudioBuffer} buffer исходная запись
 * @param {'light'|'heavy'} вид способ
 * @param {{onЗагрузка?:(p:number)=>void,onСчёт?:(p:number)=>void,живо?:()=>boolean}} события
 */
export async function разделить(buffer, вид, события = {}) {
  const { onЗагрузка, onСчёт, живо } = события;
  if (вид === 'heavy' && !естьВидеокарта()) throw new Error('НУЖЕН_КОМПЬЮТЕР');
  const сс = await получитьСеансы(вид, onЗагрузка);
  if (живо && !живо()) return null;
  const src = await к44(buffer);
  if (живо && !живо()) return null;
  const пара = вид === 'light'
    ? await лёгкая(сс, src, onСчёт, живо)
    : await тяжёлая(сс, src, onСчёт, живо);
  if (!пара) return null;
  if (!живой(пара.музыка)) throw new Error('ПУСТОЙ_РЕЗУЛЬТАТ');
  return пара;
}
