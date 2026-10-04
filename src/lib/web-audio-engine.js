
import { startKeeper, pauseKeeper, resumeKeeper } from './ios-keeper.js';

export { startKeeper } from './ios-keeper.js';

export function openRecordSession() {
  pauseKeeper();
  try {
    if (navigator.audioSession && navigator.audioSession.type !== 'play-and-record') {
      navigator.audioSession.type = 'play-and-record';
    }
  } catch (e) {}
}

export function openAudioSession() {
  try {
    if (navigator.audioSession && navigator.audioSession.type !== 'playback') {
      navigator.audioSession.type = 'playback';
    }
  } catch (e) {}
  startKeeper();
  resumeKeeper();
}

export async function decodeFile(file) {
  openAudioSession();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

export function sliceBuffer(buffer, start, end) {
  const sr = buffer.sampleRate;
  const startSample = Math.max(0, Math.floor(start * sr));
  const endSample = Math.min(buffer.length, Math.ceil(end * sr));
  const length = Math.max(1, endSample - startSample);
  const out = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length, sampleRate: sr });
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    out.getChannelData(c).set(buffer.getChannelData(c).subarray(startSample, startSample + length));
  }
  return out;
}

export function peakOf(buffer) {
  let peak = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const d = buffer.getChannelData(c);
    for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > peak) peak = a; }
  }
  return peak;
}

export function normalizeGain(peak, { target = 0.89, maxGain = 8, floor = 0.01 } = {}) {
  if (!Number.isFinite(peak) || peak <= floor) return 1;
  if (peak >= target) return 1;
  return Math.min(target / peak, maxGain);
}

export function scaleVolume(buffer, factor) {
  if (factor === 1) return buffer;
  const out = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: buffer.length, sampleRate: buffer.sampleRate });
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const src = buffer.getChannelData(c);
    const dst = out.getChannelData(c);
    for (let i = 0; i < src.length; i++) dst[i] = Math.max(-1, Math.min(1, src[i] * factor));
  }
  return out;
}

export async function applyFade(buffer, fadeInSec, fadeOutSec) {
  if (!fadeInSec && !fadeOutSec) return buffer;
  const oc = new OfflineAudioContext(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  const src = oc.createBufferSource();
  src.buffer = buffer;
  const gain = oc.createGain();
  const dur = buffer.duration;
  const fi = Math.min(fadeInSec || 0, dur / 2);
  const fo = Math.min(fadeOutSec || 0, dur / 2);
  gain.gain.setValueAtTime(0.0001, 0);
  if (fi > 0) gain.gain.exponentialRampToValueAtTime(1, fi);
  else gain.gain.setValueAtTime(1, 0);
  if (fo > 0) {
    gain.gain.setValueAtTime(1, Math.max(fi, dur - fo));
    gain.gain.exponentialRampToValueAtTime(0.0001, dur);
  }
  src.connect(gain);
  gain.connect(oc.destination);
  src.start(0);
  return oc.startRendering();
}

export async function resampleBuffer(buffer, targetRate) {
  if (buffer.sampleRate === targetRate) return buffer;
  const oc = new OfflineAudioContext(buffer.numberOfChannels, Math.ceil(buffer.duration * targetRate), targetRate);
  const src = oc.createBufferSource();
  src.buffer = buffer;
  src.connect(oc.destination);
  src.start(0);
  return oc.startRendering();
}

function* wsolaCore(buffer, stretchFactor) {
  if (!isFinite(stretchFactor) || stretchFactor <= 0 || Math.abs(stretchFactor - 1) < 0.001) return buffer;
  const sr = buffer.sampleRate;
  const frameSize = Math.max(64, Math.round(sr * 0.03));

  if (buffer.length < frameSize * 3) return buffer;
  const synthHop = Math.max(32, Math.round(frameSize / 2));
  const analysisHop = Math.max(1, Math.round(synthHop / stretchFactor));
  const searchRadius = Math.max(1, Math.round(sr * 0.003));
  const cmpLen = Math.min(256, synthHop);
  const inLen = buffer.length;
  const outLen = Math.max(1, Math.round(inLen * stretchFactor));
  const ch = buffer.numberOfChannels;
  const out = new AudioBuffer({ numberOfChannels: ch, length: outLen, sampleRate: sr });

  const win = new Float32Array(frameSize);
  for (let i = 0; i < frameSize; i++) win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (frameSize - 1));

  let frames = 0;
  for (let c = 0; c < ch; c++) {
    const src = buffer.getChannelData(c);
    const dst = out.getChannelData(c);
    const weight = new Float32Array(outLen);
    let inPos = 0;
    let outPos = 0;
    while (outPos < outLen && inPos < inLen) {
      let bestOffset = 0;
      if (outPos > 0) {
        let bestScore = -Infinity;
        const tailStart = Math.max(0, outPos - synthHop);
        const len = Math.min(cmpLen, outLen - tailStart);
        for (let off = -searchRadius; off <= searchRadius; off++) {
          const candidate = inPos + off;
          if (candidate < 0 || candidate + frameSize > inLen) continue;
          let score = 0;
          for (let i = 0; i < len; i++) score += dst[tailStart + i] * src[candidate + i];
          if (score > bestScore) { bestScore = score; bestOffset = off; }
        }
      }
      const framePos = Math.max(0, Math.min(inLen - frameSize, inPos + bestOffset));
      const n = Math.min(frameSize, outLen - outPos);
      for (let i = 0; i < n; i++) {
        dst[outPos + i] += src[framePos + i] * win[i];
        weight[outPos + i] += win[i];
      }
      inPos += analysisHop;
      outPos += synthHop;

      if ((++frames % 200) === 0) yield (c + outPos / outLen) / ch;
    }
    for (let i = 0; i < outLen; i++) if (weight[i] > 0.0001) dst[i] /= weight[i];
  }
  return out;
}

export function wsolaStretch(buffer, stretchFactor) {
  const it = wsolaCore(buffer, stretchFactor);
  let r = it.next();
  while (!r.done) r = it.next();
  return r.value;
}

export async function wsolaStretchChunked(buffer, stretchFactor, onProgress) {
  const it = wsolaCore(buffer, stretchFactor);
  let r = it.next();
  while (!r.done) {
    if (onProgress) onProgress(r.value);

    await new Promise((res) => requestAnimationFrame(() => res()));
    r = it.next();
  }
  return r.value;
}

export function resampleLinear(buffer, rateFactor) {
  const outLen = Math.max(1, Math.round(buffer.length / rateFactor));
  const out = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: outLen, sampleRate: buffer.sampleRate });
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const src = buffer.getChannelData(c);
    const dst = out.getChannelData(c);
    for (let i = 0; i < outLen; i++) {
      const pos = i * rateFactor;
      const i0 = Math.floor(pos);
      const frac = pos - i0;
      const s0 = src[i0] || 0;
      const s1 = i0 + 1 < src.length ? src[i0 + 1] : s0;
      dst[i] = s0 + (s1 - s0) * frac;
    }
  }
  return out;
}

export async function pitchShiftChunked(buffer, semitones, onProgress) {
  if (!semitones) return buffer;
  const rate = Math.pow(2, semitones / 12);
  return wsolaStretchChunked(resampleLinear(buffer, rate), rate, onProgress);
}

export function pitchShift(buffer, semitones) {
  if (!semitones) return buffer;
  const resampled = resampleLinear(buffer, Math.pow(2, semitones / 12));
  return wsolaStretch(resampled, buffer.length / resampled.length);
}

function softCap(v) {
  const a = Math.abs(v) * 0.64;
  const knee = 0.52, ceil = 0.88;
  if (a <= knee) return v < 0 ? -a : a;
  const room = ceil - knee;
  const out = knee + room * (1 - Math.exp(-(a - knee) / room));
  return v < 0 ? -out : out;
}

const кэшПиков = new WeakMap();
function пикиПоСтолбцам(data, cols) {
  const было = кэшПиков.get(data);
  if (было && было.cols === cols) return было;
  const step = Math.max(1, Math.floor(data.length / cols));
  const lo = new Float32Array(cols), hi = new Float32Array(cols);
  for (let c = 0; c < cols; c++) {
    let min = 1, max = -1;
    const from = c * step, to = Math.min(data.length, from + step);
    for (let i = from; i < to; i++) { const d = data[i]; if (d < min) min = d; if (d > max) max = d; }
    if (max < min) { min = 0; max = 0; }
    lo[c] = min; hi[c] = max;
  }
  const свежее = { cols, lo, hi };
  кэшПиков.set(data, свежее);
  return свежее;
}

export function drawWaveform(canvas, buffer, label, opts = {}) {

  const gain = opts.gain == null ? 1 : opts.gain;
  const fade = opts.fade || null;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const cssHeight = rect.height || 130;
  canvas.width = Math.max(1, rect.width * dpr);
  canvas.height = Math.max(1, cssHeight * dpr);
  const g = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  g.clearRect(0, 0, W, H);
  if (label) {
    g.save();
    g.font = `600 ${Math.round(13 * dpr)}px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'top';
    g.fillStyle = 'rgba(240,240,242,0.62)';
    g.fillText(label, W / 2, Math.round(7 * dpr));
    g.restore();
  }
  const data = buffer.getChannelData(0);

  const bar = Math.max(1, Math.round(2 * dpr));
  const gap = Math.max(1, Math.round(1 * dpr));
  const stride = bar + gap;
  const cols = Math.max(1, Math.floor(W / stride));
  const step = Math.max(1, Math.floor(data.length / cols));
  const mid = H / 2;

  g.fillStyle = 'rgba(255,255,255,.07)';
  g.fillRect(0, Math.round(mid), W, Math.max(1, Math.round(dpr)));

  if (opts.rich) {

    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1f6b4a');
    grad.addColorStop(0.5, '#3aa771');
    grad.addColorStop(1, '#1f6b4a');
    g.fillStyle = grad;

    const n = Math.max(1, Math.floor(W));

    const store = opts.peaks;
    let pk = store && store.n === n && store.src === data ? store : null;
    if (!pk) {
      const per = Math.max(1, Math.floor(data.length / n));
      const lo = new Float32Array(n), hi = new Float32Array(n);
      for (let c = 0; c < n; c++) {
        let min = 1, max = -1;
        const from = c * per;
        for (let j = 0; j < per; j++) {
          const d = data[from + j] || 0;
          if (d < min) min = d;
          if (d > max) max = d;
        }
        if (max < min) { min = 0; max = 0; }
        lo[c] = min; hi[c] = max;
      }
      pk = { n, src: data, lo, hi };
      if (store) { store.n = n; store.src = data; store.lo = lo; store.hi = hi; }
    }
    const top = new Float32Array(n);
    const bot = new Float32Array(n);
    for (let c = 0; c < n; c++) {
      let min = pk.lo[c], max = pk.hi[c];

      min *= gain; max *= gain;

      if (fade) {
        const t = c / n;

        if (t >= fade.selStart && t <= fade.selEnd) {
          let e = 1;
          if (fade.inEnd > fade.inStart && t < fade.inEnd) {
            e = Math.min(e, (t - fade.inStart) / (fade.inEnd - fade.inStart));
          }
          if (fade.outEnd > fade.outStart && t > fade.outStart) {
            e = Math.min(e, (fade.outEnd - t) / (fade.outEnd - fade.outStart));
          }
          e = Math.max(0, Math.min(1, e));
          min *= e; max *= e;
        }
      }

      min = softCap(min); max = softCap(max);

      const half = Math.max(dpr * 0.5, 0);
      top[c] = Math.min(mid - half, mid - max * mid);
      bot[c] = Math.max(mid + half, mid - min * mid);
    }

    g.beginPath();
    g.moveTo(0, top[0]);
    for (let c = 1; c < n; c++) g.lineTo(c, top[c]);
    for (let c = n - 1; c >= 0; c--) g.lineTo(c, bot[c]);
    g.closePath();
    g.fill();
    return;
  }

  g.fillStyle = 'rgba(74,222,158,.62)';
  const готовые = пикиПоСтолбцам(data, cols);
  for (let c = 0; c < cols; c++) {
    let min = готовые.lo[c];
    let max = готовые.hi[c];

    min *= gain; max *= gain;
    if (fade) {
      const t = c / cols;
      if (t >= fade.selStart && t <= fade.selEnd) {
        let e = 1;
        if (fade.inEnd > fade.inStart && t < fade.inEnd) e = Math.min(e, (t - fade.inStart) / (fade.inEnd - fade.inStart));
        if (fade.outEnd > fade.outStart && t > fade.outStart) e = Math.min(e, (fade.outEnd - t) / (fade.outEnd - fade.outStart));
        e = Math.max(0, Math.min(1, e));
        min *= e; max *= e;
      }
    }
    const y1 = ((1 + min) * H) / 2;
    const y2 = ((1 + max) * H) / 2;
    const h = Math.max(Math.round(dpr), y2 - y1);
    const x = c * stride;

    const r = Math.min(bar / 2, h / 2);
    g.beginPath();
    if (g.roundRect) g.roundRect(x, y1, bar, h, r);
    else g.rect(x, y1, bar, h);
    g.fill();
  }
}

export function createLiveWaveform(canvas, opts = {}) {
  const режим = opts.mode === 'bars' ? 'bars' : (opts.mode === 'wave' ? 'wave' : 'run');
  let отсчёты = null;
  let высоты = new Float32Array(0);
  let сглаж = 0;
  let веса = [];
  let levels = [];
  let cols = 0;
  let raf = 0;
  let dpr = 1;
  let bar = 2;
  let gap = 1;

  function measure() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, rect.width * dpr);
    canvas.height = Math.max(1, (rect.height || 72) * dpr);
    bar = Math.max(1, Math.round(2 * dpr));
    gap = Math.max(1, Math.round(1 * dpr));
    const next = Math.max(1, Math.floor(canvas.width / (bar + gap)));

    if (next !== cols) { cols = next; levels = levels.slice(-cols); }
  }

  function draw() {
    const g = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const mid = H / 2;
    g.clearRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.07)';
    g.fillRect(0, Math.round(mid), W, Math.max(1, Math.round(dpr)));
    g.fillStyle = 'rgba(74,222,158,.62)';

    if (режим === 'wave') {

      if (высоты.length !== cols) высоты = new Float32Array(cols);
      if (отсчёты && отсчёты.length) {
        const шаг = отсчёты.length / cols;
        for (let c = 0; c < cols; c++) {
          let пик = 0;
          const от = Math.floor(c * шаг), до = Math.min(отсчёты.length, Math.floor((c + 1) * шаг));
          for (let i = от; i < до; i++) { const a = Math.abs(отсчёты[i]); if (a > пик) пик = a; }
          const цель = Math.min(1, Math.pow(пик, 0.45) * 1.9);
          высоты[c] += (цель - высоты[c]) * (цель > высоты[c] ? 0.5 : 0.12);
        }
      } else {
        for (let c = 0; c < cols; c++) высоты[c] *= 0.92;
      }
      for (let c = 0; c < cols; c++) {
        const h = Math.max(Math.round(dpr), высоты[c] * H * 0.9);
        const x = c * (bar + gap);
        const y = mid - h / 2;
        const r = Math.min(bar / 2, h / 2);
        g.beginPath();
        if (g.roundRect) g.roundRect(x, y, bar, h, r);
        else g.rect(x, y, bar, h);
        g.fill();
      }
      return;
    }
    if (режим === 'bars') {

      const цель = levels.length ? levels[levels.length - 1] : 0;

      сглаж += (цель - сглаж) * 0.28;
      if (веса.length !== cols) {
        веса = new Array(cols);
        for (let c = 0; c < cols; c++) веса[c] = 0.55 + 0.45 * Math.sin((c / cols) * Math.PI) * (0.8 + 0.2 * ((c * 37) % 11) / 11);
      }
      for (let c = 0; c < cols; c++) {
        const h = Math.max(Math.round(dpr), сглаж * веса[c] * H * 0.9);
        const x = c * (bar + gap);
        const y = mid - h / 2;
        const r = Math.min(bar / 2, h / 2);
        g.beginPath();
        if (g.roundRect) g.roundRect(x, y, bar, h, r);
        else g.rect(x, y, bar, h);
        g.fill();
      }
      return;
    }
    const start = cols - levels.length;
    for (let i = 0; i < levels.length; i++) {
      const h = Math.max(Math.round(dpr), levels[i] * H);
      const x = (start + i) * (bar + gap);
      const y = mid - h / 2;
      const r = Math.min(bar / 2, h / 2);
      g.beginPath();
      if (g.roundRect) g.roundRect(x, y, bar, h, r);
      else g.rect(x, y, bar, h);
      g.fill();
    }
  }

  return {

    feed(данные) { отсчёты = данные; },

    start() {
      levels = [];
      measure();
      const tick = () => { draw(); raf = requestAnimationFrame(tick); };
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    },

    push(level) {
      const v = Math.max(0, Math.min(1, Number(level) || 0));
      levels.push(v);
      if (levels.length > cols) levels = levels.slice(-cols);
    },
    stop() { cancelAnimationFrame(raf); raf = 0; },
  };
}

export async function renderEffect(buffer, { render, params = {}, outputSampleRate, outputChannels, directRender }) {
  if (directRender) {
    return directRender(buffer, params);
  }
  const start = params.start ?? 0;
  const end = params.end ?? buffer.duration;
  const sr = outputSampleRate || buffer.sampleRate;
  const ch = outputChannels || buffer.numberOfChannels;
  const rate = render.rate ? render.rate(params) : 1;
  const length = Math.max(1, Math.ceil(((end - start) / rate) * sr));
  const oc = new OfflineAudioContext(ch, length, sr);
  const src = oc.createBufferSource();
  src.buffer = buffer;
  const outputNode = render(oc, src, params);
  outputNode.connect(oc.destination);
  src.start(0, start, end - start);
  return oc.startRendering();
}

export function encodeWAV(buffer) {
  const ch = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const len = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = ch * bytesPerSample;
  const dataLen = len * blockAlign;
  const out = new ArrayBuffer(44 + dataLen);
  const v = new DataView(out);
  let o = 0;
  const writeStr = (s) => { for (let i = 0; i < s.length; i++) v.setUint8(o++, s.charCodeAt(i)); };
  const u32 = (x) => { v.setUint32(o, x, true); o += 4; };
  const u16 = (x) => { v.setUint16(o, x, true); o += 2; };
  writeStr('RIFF'); u32(36 + dataLen); writeStr('WAVE');
  writeStr('fmt '); u32(16); u16(1); u16(ch); u32(sr); u32(sr * blockAlign); u16(blockAlign); u16(16);
  writeStr('data'); u32(dataLen);
  const channels = [];
  for (let c = 0; c < ch; c++) channels.push(buffer.getChannelData(c));
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  }
  return new Blob([out], { type: 'audio/wav' });
}

export async function encodeMP3(buffer, bitrate = 192) {
  const { Mp3Encoder } = await import('@breezystack/lamejs');
  const ch = Math.min(2, buffer.numberOfChannels);
  const sr = buffer.sampleRate;
  const encoder = new Mp3Encoder(ch, sr, bitrate);
  const left = buffer.getChannelData(0);
  const right = ch > 1 ? buffer.getChannelData(1) : null;
  const len = buffer.length;
  const block = 1152;
  const chunks = [];
  const toInt16 = (arr, start, n) => {
    const out = new Int16Array(n);
    for (let i = 0; i < n; i++) {
      const s = Math.max(-1, Math.min(1, arr[start + i] || 0));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  };
  for (let i = 0; i < len; i += block) {
    const n = Math.min(block, len - i);
    const l = toInt16(left, i, n);
    const mp3buf = right ? encoder.encodeBuffer(l, toInt16(right, i, n)) : encoder.encodeBuffer(l);
    if (mp3buf.length) chunks.push(mp3buf);
  }
  const end = encoder.flush();
  if (end.length) chunks.push(end);
  return new Blob(chunks, { type: 'audio/mpeg' });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function createPlayer() {
  let ctx = null;

  let былаСкрыта = false;
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => { if (document.hidden) былаСкрыта = true; });
  }
  let source = null;
  let buffer = null;
  let startedAt = 0;
  let pausedAt = 0;
  let rafId = 0;
  let stuckHandler = null;

  function wake() {
    if (ctx && ctx.state !== 'running') {

      try { const r = ctx.resume(); if (r && r.catch) r.catch(() => {}); } catch (e) {}
    }
  }

  function getCtx() {

    openAudioSession();
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    wake();
    return ctx;
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
    window.addEventListener('pageshow', wake);
  }

  function unlock() {

    getCtx();
  }

  function stop() {
    if (source) { source.onended = null; try { if (source.stop) source.stop(); else source.disconnect(); } catch (e) {} }
    source = null;
    pausedAt = 0;
    cancelAnimationFrame(rafId);
  }

  function play(buf, onProgress, onEnded, seekTo, buildChain, options = {}) {

    if (source) {
      source.onended = null;
      try { if (source.stop) source.stop(); else source.disconnect(); } catch (e) {}
      source = null;
      cancelAnimationFrame(rafId);
    }
    buffer = buf;
    if (seekTo != null) pausedAt = Math.max(0, Math.min(seekTo, buffer.duration));
    const c = getCtx();

    source = options.makeSource ? options.makeSource(c, buffer, pausedAt) : (() => {
      const s2 = c.createBufferSource();
      s2.buffer = buffer;
      return s2;
    })();
    if (options.loop && 'loop' in source) source.loop = true;
    const chainOut = buildChain ? buildChain(c, source, pausedAt) : source;
    chainOut.connect(c.destination);

    if (stuckHandler) {
      setTimeout(() => {
        if (ctx && ctx.state !== 'running') {
          try { stuckHandler(ctx.state); } catch (e) {}
        }
      }, 500);
    }

    const startedSource = source;
    source.onended = () => {
      if (source === startedSource) {
        source = null;
        cancelAnimationFrame(rafId);

        pausedAt = 0;
      }
      if (onEnded) onEnded();
    };
    if (source.start) source.start(0, pausedAt);
    startedAt = c.currentTime - pausedAt;
    const tick = () => {
      if (!source) return;
      const played = c.currentTime - startedAt;
      if (onProgress) onProgress(Math.min(1, played / buffer.duration));
      rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  function pause() {
    if (!source) return;
    const c = getCtx();
    pausedAt = Math.min(buffer.duration, c.currentTime - startedAt);
    source.onended = null;
    try { if (source.stop) source.stop(); else source.disconnect(); } catch (e) {}
    source = null;
    cancelAnimationFrame(rafId);
  }

  function reset() {
    stop();
    pausedAt = 0;
  }

  function context() { return getCtx(); }

  function getPosition() {
    if (!source) return pausedAt;
    return ctx.currentTime - startedAt;
  }

  return {
    play, pause, stop, reset, unlock, isPlaying: () => !!source, getPosition,

    onStuck(fn) { stuckHandler = fn; },
    context,
  };
}

export function makeNoiseLoop(color, seconds = 10, sampleRate = 44100, channels = 2) {
  const fade = Math.round(sampleRate * 0.5);
  const len = Math.round(sampleRate * seconds);
  const gen = len + fade;
  const out = new AudioBuffer({ numberOfChannels: channels, length: len, sampleRate });
  for (let c = 0; c < channels; c++) {
    const raw = new Float32Array(gen);
    if (color === 'white') {
      for (let i = 0; i < gen; i++) raw[i] = Math.random() * 2 - 1;
    } else if (color === 'brown') {

      let last = 0;
      let peak = 0;
      for (let i = 0; i < gen; i++) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        raw[i] = last;
        const a = Math.abs(last);
        if (a > peak) peak = a;
      }
      const norm = peak > 0 ? 0.9 / peak : 1;
      for (let i = 0; i < gen; i++) raw[i] *= norm;
    } else {

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < gen; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        raw[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }
    const dst = out.getChannelData(c);
    dst.set(raw.subarray(0, len));
    for (let i = 0; i < fade; i++) {
      const w = i / fade;
      dst[i] = dst[i] * w + raw[len + i] * (1 - w);
    }
  }
  return out;
}

export function encodeLoopedWAV(loop, totalSamples) {
  const ch = loop.numberOfChannels;
  const sr = loop.sampleRate;
  const blockAlign = ch * 2;
  const dataLen = totalSamples * blockAlign;
  const out = new ArrayBuffer(44 + dataLen);
  const v = new DataView(out);
  let o = 0;
  const writeStr = (s) => { for (let i = 0; i < s.length; i++) v.setUint8(o++, s.charCodeAt(i)); };
  const u32 = (x) => { v.setUint32(o, x, true); o += 4; };
  const u16 = (x) => { v.setUint16(o, x, true); o += 2; };
  writeStr('RIFF'); u32(36 + dataLen); writeStr('WAVE');
  writeStr('fmt '); u32(16); u16(1); u16(ch); u32(sr); u32(sr * blockAlign); u16(blockAlign); u16(16);
  writeStr('data'); u32(dataLen);
  const chans = [];
  for (let c = 0; c < ch; c++) chans.push(loop.getChannelData(c));

  const fade = Math.min(Math.round(sr * 1.5), Math.floor(totalSamples / 4));
  for (let i = 0; i < totalSamples; i++) {
    const j = i % loop.length;
    let g = 1;
    if (i < fade) g = i / fade;
    else if (i >= totalSamples - fade) g = (totalSamples - i) / fade;
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, chans[c][j] * g));
      v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  }
  return new Blob([out], { type: 'audio/wav' });
}

export async function encodeLoopedMP3(loop, totalSamples, bitrate = 128) {
  const { Mp3Encoder } = await import('@breezystack/lamejs');
  const ch = Math.min(2, loop.numberOfChannels);
  const encoder = new Mp3Encoder(ch, loop.sampleRate, bitrate);
  const chans = [];
  for (let c = 0; c < ch; c++) chans.push(loop.getChannelData(c));
  const block = 1152;
  const chunks = [];
  const fade = Math.min(Math.round(loop.sampleRate * 1.5), Math.floor(totalSamples / 4));
  const l = new Int16Array(block);
  const r = ch > 1 ? new Int16Array(block) : null;
  for (let i = 0; i < totalSamples; i += block) {
    const n = Math.min(block, totalSamples - i);
    for (let k = 0; k < n; k++) {
      const pos = i + k;
      const j = pos % loop.length;
      let g = 1;
      if (pos < fade) g = pos / fade;
      else if (pos >= totalSamples - fade) g = (totalSamples - pos) / fade;
      const a = Math.max(-1, Math.min(1, chans[0][j] * g));
      l[k] = a < 0 ? a * 0x8000 : a * 0x7fff;
      if (r) {
        const b = Math.max(-1, Math.min(1, chans[1][j] * g));
        r[k] = b < 0 ? b * 0x8000 : b * 0x7fff;
      }
    }
    const mp3buf = r ? encoder.encodeBuffer(l.subarray(0, n), r.subarray(0, n)) : encoder.encodeBuffer(l.subarray(0, n));
    if (mp3buf.length) chunks.push(mp3buf);

    if ((i / block) % 400 === 0) await new Promise((res) => setTimeout(res, 0));
  }
  const end = encoder.flush();
  if (end.length) chunks.push(end);
  return new Blob(chunks, { type: 'audio/mpeg' });
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function hzToNote(hz) {
  if (!hz || hz <= 0) return null;
  const midi = Math.round(69 + 12 * Math.log2(hz / 440));
  return { midi, name: NOTE_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1) };
}

function decimateForPitch(data, sampleRate, target = 8000) {
  const factor = Math.max(1, Math.floor(sampleRate / target));
  if (factor === 1) return { data, sampleRate };
  const out = new Float32Array(Math.floor(data.length / factor));
  for (let i = 0; i < out.length; i++) {

    let sum = 0;
    for (let j = 0; j < factor; j++) sum += data[i * factor + j];
    out[i] = sum / factor;
  }
  return { data: out, sampleRate: sampleRate / factor };
}

function windowPitch(buf, start, size, sampleRate, minHz, maxHz) {
  const maxLag = Math.min(Math.floor(sampleRate / minHz), size - 1);
  const minLag = Math.max(2, Math.floor(sampleRate / maxHz));
  if (start + size + maxLag > buf.length || maxLag <= minLag) return 0;
  const diff = new Float32Array(maxLag + 1);
  for (let lag = 1; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < size; i++) {
      const d = buf[start + i] - buf[start + i + lag];
      sum += d * d;
    }
    diff[lag] = sum;
  }
  const norm = new Float32Array(maxLag + 1);
  norm[0] = 1;
  let running = 0;
  for (let lag = 1; lag <= maxLag; lag++) {
    running += diff[lag];
    norm[lag] = running > 0 ? diff[lag] * lag / running : 1;
  }
  const THRESHOLD = 0.15;
  let chosen = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    if (norm[lag] < THRESHOLD) {

      while (lag + 1 <= maxLag && norm[lag + 1] < norm[lag]) lag++;
      chosen = lag;
      break;
    }
  }
  if (!chosen) return 0;
  const y0 = norm[chosen - 1] ?? norm[chosen];
  const y1 = norm[chosen];
  const y2 = norm[chosen + 1] ?? norm[chosen];
  const denom = y0 - 2 * y1 + y2;
  const lag = chosen + (denom !== 0 ? 0.5 * (y0 - y2) / denom : 0);
  return sampleRate / lag;
}

export function analyzeVocalRange(buffer) {
  const decimated = decimateForPitch(buffer.getChannelData(0), buffer.sampleRate);
  const sr = decimated.sampleRate;
  const data = decimated.data;
  const size = Math.round(sr * 0.05);
  const hop = Math.round(sr * 0.02);
  const pitches = [];
  for (let start = 0; start + size * 2 < data.length; start += hop) {
    let energy = 0;
    for (let i = 0; i < size; i++) energy += data[start + i] * data[start + i];

    if (Math.sqrt(energy / size) < 0.01) continue;
    const hz = windowPitch(data, start, size, sr, 60, 1200);
    if (hz) pitches.push(hz);
  }
  if (pitches.length < 10) return null;
  pitches.sort((a, b) => a - b);

  const at = (p) => pitches[Math.min(pitches.length - 1, Math.max(0, Math.round(p * (pitches.length - 1))))];
  const low = at(0.03);
  const high = at(0.97);
  const lowNote = hzToNote(low);
  const highNote = hzToNote(high);
  return {
    lowHz: low,
    highHz: high,
    low: lowNote,
    high: highNote,
    semitones: Math.max(0, highNote.midi - lowNote.midi),
    frames: pitches.length,
  };
}

const KS_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KS_MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

function correlate(a, b) {
  const n = a.length;
  const ma = a.reduce((s, x) => s + x, 0) / n;
  const mb = b.reduce((s, x) => s + x, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - ma, y = b[i] - mb;
    num += x * y; da += x * x; db += y * y;
  }
  return da && db ? num / Math.sqrt(da * db) : 0;
}

export function detectKey(buffer) {
  const sr = buffer.sampleRate;
  const full = buffer.getChannelData(0);

  const maxLen = Math.min(full.length, Math.round(sr * 120));
  const from = Math.floor((full.length - maxLen) / 2);
  const data = maxLen < full.length ? full.subarray(from, from + maxLen) : full;
  const chroma = new Float64Array(12);

  for (let midi = 36; midi <= 95; midi++) {
    const hz = 440 * Math.pow(2, (midi - 69) / 12);
    const k = 2 * Math.PI * hz / sr;
    const c = 2 * Math.cos(k);
    let s1 = 0, s2 = 0;
    for (let i = 0; i < data.length; i++) {
      const s0 = data[i] + c * s1 - s2;
      s2 = s1; s1 = s0;
    }
    const re = s1 - s2 * Math.cos(k);
    const im = s2 * Math.sin(k);
    chroma[midi % 12] += Math.sqrt(re * re + im * im) / data.length;
  }
  let best = null;
  for (let root = 0; root < 12; root++) {
    for (const [mode, profile] of [['major', KS_MAJOR], ['minor', KS_MINOR]]) {
      const rotated = profile.map((_, i) => profile[(i - root + 12) % 12]);
      const score = correlate(Array.from(chroma), rotated);
      if (!best || score > best.score) best = { root, mode, score };
    }
  }
  if (!best) return null;
  return { name: NOTE_NAMES[best.root], mode: best.mode, score: best.score, chroma: Array.from(chroma) };
}

export function analyzeAudiobook(buffer) {
  const sr = buffer.sampleRate;
  const data = buffer.getChannelData(0);
  let sumSq = 0, peak = 0;
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    sumSq += v * v;
    const a = Math.abs(v);
    if (a > peak) peak = a;
  }
  const rms = Math.sqrt(sumSq / data.length);

  const win = Math.round(sr * 0.5);
  let quietest = Infinity;
  for (let start = 0; start + win <= data.length; start += Math.round(win / 2)) {
    let s = 0;
    for (let i = 0; i < win; i++) s += data[start + i] * data[start + i];
    const r = Math.sqrt(s / win);
    if (r < quietest) quietest = r;
  }
  if (!isFinite(quietest)) quietest = rms;
  const db = (x) => (x > 0 ? 20 * Math.log10(x) : -Infinity);
  const rmsDb = db(rms), peakDb = db(peak), floorDb = db(quietest);
  return {
    rmsDb, peakDb, floorDb,

    rmsOk: rmsDb >= -23 && rmsDb <= -18,
    peakOk: peakDb <= -3,
    floorOk: floorDb <= -60,
  };
}

export function detectBpm(buffer) {
  const sr = buffer.sampleRate;
  const frameSec = 0.005;
  const hop = Math.round(sr * frameSec);
  const data = buffer.getChannelData(0);
  const frames = Math.floor(data.length / hop);
  if (frames < 600) return 0;
  const energy = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    for (let i = f * hop; i < (f + 1) * hop; i++) sum += data[i] * data[i];
    energy[f] = Math.sqrt(sum / hop);
  }

  const onset = new Float32Array(frames);
  for (let f = 1; f < frames; f++) onset[f] = Math.max(0, energy[f] - energy[f - 1]);
  let mean = 0;
  for (let f = 0; f < frames; f++) mean += onset[f];
  mean /= frames;
  for (let f = 0; f < frames; f++) onset[f] = Math.max(0, onset[f] - mean);

  const minLag = Math.floor(60 / 190 / frameSec);
  const maxLag = Math.ceil(60 / 60 / frameSec);
  const corr = new Float64Array(maxLag + 2);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let acc = 0;
    for (let f = 0; f + lag < frames; f++) acc += onset[f] * onset[f + lag];
    corr[lag] = acc / (frames - lag);
  }

  let bestLag = 0, bestScore = -1;
  for (let lag = minLag; lag <= maxLag; lag++) {
    const bpm = 60 / (lag * frameSec);
    const score = corr[lag] * Math.exp(-0.5 * Math.pow(Math.log2(bpm / 120) / 0.9, 2));
    if (score > bestScore) { bestScore = score; bestLag = lag; }
  }
  if (!bestLag || bestScore <= 0) return 0;

  const halfLag = Math.round(bestLag / 2);
  if (halfLag >= minLag && corr[halfLag] > corr[bestLag] * 0.5) bestLag = halfLag;

  const y0 = corr[bestLag - 1] || 0, y1 = corr[bestLag], y2 = corr[bestLag + 1] || 0;
  const denom = y0 - 2 * y1 + y2;
  const shift = denom !== 0 ? 0.5 * (y0 - y2) / denom : 0;
  const lag = bestLag + Math.max(-1, Math.min(1, shift));
  return Math.round(60 / (lag * frameSec));
}
