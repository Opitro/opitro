// Native Web Audio API engine for audio tools that don't need real format/codec transcoding --
// trim, volume, speed, pitch, effects, etc. No ffmpeg, no ~32 MB download: the browser's own
// AudioContext decodes the file, an OfflineAudioContext renders the effect, and the result can
// be previewed (played back) before the user commits to downloading. This is what makes the
// "upload -> see the waveform -> listen -> download" flow possible -- ffmpeg's virtual
// filesystem model doesn't expose a decoded buffer to draw or preview the way this does.
// MP3 export uses @breezystack/lamejs (npm, not a CDN script) since Web Audio has no native
// MP3 encoder; WAV export is a plain manual RIFF/WAVE writer, no library needed.

export async function decodeFile(file) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

// Cheap direct copy of a sample range -- no OfflineAudioContext render needed, used for
// "listen to just the selected region" previews (e.g. before committing to a ringtone export).
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

/** Самый громкий отсчёт во всём буфере, по всем каналам. */
export function peakOf(buffer) {
  let peak = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const d = buffer.getChannelData(c);
    for (let i = 0; i < d.length; i++) { const a = Math.abs(d[i]); if (a > peak) peak = a; }
  }
  return peak;
}

// Во сколько раз поднять запись с микрофона, чтобы она звучала как у всех.
//
// Микрофон ноутбука отдаёт голос на уровне примерно -25 дБ. Браузер умеет поднимать его сам
// (autoGainControl), но на iPhone эта настройка не работает вовсе, поэтому полагаться на неё
// нельзя -- без этого расчёта запись с телефона осталась бы тихой.
//
// Считается по пику, а не по средней громкости: пик гарантирует, что после подъёма ничего не
// упрётся в потолок и не захрипит. Плата -- один резкий звук (стук по столу) не даст поднять
// остальное. Это осознанный размен: тихо, но чисто, лучше чем громко и с хрипом.
export function normalizeGain(peak, { target = 0.89, maxGain = 8, floor = 0.01 } = {}) {
  if (!Number.isFinite(peak) || peak <= floor) return 1;  // тишина -- усиливать нечего
  if (peak >= target) return 1;                            // уже громко -- не трогаем
  return Math.min(target / peak, maxGain);
}

// Flat gain multiply, sample by sample -- no OfflineAudioContext needed for a constant scale.
// Used to make the ringtone "listen to selection" preview match its volume slider before export.
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

// Renders a fade-in/fade-out envelope onto a buffer via a GainNode -- used both by the
// standalone fade tool and by the ringtone "listen to selection" preview, so what plays back
// before download matches what the actual export applies (previously the preview played the
// raw slice with no fade at all, which is why a checked "fade in" box was silent on preview).
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

// Opus doesn't support 44.1kHz (only 8/12/16/24/48kHz) -- ffmpeg's libopus encoder silently
// resamples to 48kHz internally before encoding, and that specific internal path has a known
// ffmpeg.wasm bug (crashes with "Out of bounds memory access", confirmed live on both iOS and
// Android; other Opus rates like 24kHz don't trigger it). Resampling here first, via
// OfflineAudioContext, means ffmpeg receives already-24kHz PCM and never has to do that
// resample itself.
export async function resampleBuffer(buffer, targetRate) {
  if (buffer.sampleRate === targetRate) return buffer;
  const oc = new OfflineAudioContext(buffer.numberOfChannels, Math.ceil(buffer.duration * targetRate), targetRate);
  const src = oc.createBufferSource();
  src.buffer = buffer;
  src.connect(oc.destination);
  src.start(0);
  return oc.startRendering();
}

// WSOLA (Waveform Similarity Overlap-Add) time-stretch -- changes a buffer's duration by
// `stretchFactor` (output length = input length * stretchFactor) WITHOUT changing pitch.
// This is what makes speed and pitch two genuinely independent controls instead of both being
// the same playbackRate hack (the old behavior: speed always changed pitch too, and "pitch"
// was really just speed under another name -- a real functional mismatch, not a cosmetic one).
// Time-domain algorithm (no FFT needed): for each output frame, search a small window in the
// input around the expected position for the best cross-correlation match against the tail of
// what's already been synthesized, then overlap-add with a Hann window. Parameters are tuned
// conservatively (small search radius, capped comparison length) since this runs synchronously
// on the main thread and a multi-minute file needs to stay well under a few seconds.
export function wsolaStretch(buffer, stretchFactor) {
  if (!isFinite(stretchFactor) || stretchFactor <= 0 || Math.abs(stretchFactor - 1) < 0.001) return buffer;
  const sr = buffer.sampleRate;
  const frameSize = Math.max(64, Math.round(sr * 0.03));
  // Too short for even one full frame -- the framePos clamp below would go negative and read
  // out of bounds (silent NaN corruption). Not worth stretching a sub-frame-length clip anyway.
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
    }
    for (let i = 0; i < outLen; i++) if (weight[i] > 0.0001) dst[i] /= weight[i];
  }
  return out;
}

// Resample (linear interpolation) without preserving duration -- the "naive" transform that
// changes both pitch and length together. Used as pitchShift()'s first step, and exported for
// the speed tool's "don't preserve pitch" mode, which is exactly this tape/vinyl behaviour.
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

// Pitch-shift by `semitones` while keeping the original duration: resample to shift pitch
// (which also changes length), then WSOLA-stretch back to the original length so only the
// pitch actually changed, not the tempo.
export function pitchShift(buffer, semitones) {
  if (!semitones) return buffer;
  const resampled = resampleLinear(buffer, Math.pow(2, semitones / 12));
  return wsolaStretch(resampled, buffer.length / resampled.length);
}

// Reads its own CSS height (falls back to the classic 130px) rather than hardcoding one size,
// so a smaller waveform (e.g. the compact inline preview) just needs a shorter CSS height and
// draws correctly at that size -- no separate drawing code path needed.
export function drawWaveform(canvas, buffer) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const cssHeight = rect.height || 130;
  canvas.width = Math.max(1, rect.width * dpr);
  canvas.height = Math.max(1, cssHeight * dpr);
  const g = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  g.clearRect(0, 0, W, H);
  const data = buffer.getChannelData(0);

  // Столбики с зазором, а не сплошная заливка по пикселю. Сплошная заливка на длинном файле
  // сливается в мутное пятно -- ровно то, что выглядит как «нарисовали как получилось».
  // Ширина столбика привязана к плотности точек: 2 CSS-пикселя на столбик и 1 на промежуток.
  const bar = Math.max(1, Math.round(2 * dpr));
  const gap = Math.max(1, Math.round(1 * dpr));
  const stride = bar + gap;
  const cols = Math.max(1, Math.floor(W / stride));
  const step = Math.max(1, Math.floor(data.length / cols));
  const mid = H / 2;

  // Ось по центру: в звуковых редакторах она есть всегда, и именно она читается как «прибор».
  g.fillStyle = 'rgba(255,255,255,.07)';
  g.fillRect(0, Math.round(mid), W, Math.max(1, Math.round(dpr)));

  g.fillStyle = 'rgba(74,222,158,.62)';
  for (let c = 0; c < cols; c++) {
    let min = 1;
    let max = -1;
    const from = c * step;
    for (let j = 0; j < step; j++) {
      const d = data[from + j] || 0;
      if (d < min) min = d;
      if (d > max) max = d;
    }
    if (max < min) { min = 0; max = 0; }
    const y1 = ((1 + min) * H) / 2;
    const y2 = ((1 + max) * H) / 2;
    const h = Math.max(Math.round(dpr), y2 - y1);
    const x = c * stride;
    // Скруглённые концы: тонкая деталь, которую не замечают по отдельности, но без неё
    // столбики выглядят обрубленными.
    const r = Math.min(bar / 2, h / 2);
    g.beginPath();
    if (g.roundRect) g.roundRect(x, y1, bar, h, r);
    else g.rect(x, y1, bar, h);
    g.fill();
  }
}

// `render(offlineCtx, sourceNode, params)` returns the final AudioNode to connect to the
// destination -- one function per tool covers everything expressible as a Web Audio graph
// (gain, filters, delay/feedback, playbackRate). Some tools (reverse, loop, normalize) need
// direct sample manipulation instead of a graph and set `directRender(buffer, params) =>
// AudioBuffer | Promise<AudioBuffer>` instead of `render`. `params.start`/`params.end` are only
// meaningful for tools with a trim-style range control (trim, ringtone); everything else
// processes the whole buffer.
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

// Simple play/pause preview player for a rendered AudioBuffer, with a playhead-position
// callback for animating a cursor over the waveform.
export function createPlayer() {
  let ctx = null;
  let source = null;
  let buffer = null;
  let startedAt = 0;
  let pausedAt = 0;
  let rafId = 0;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // iOS Safari only allows an AudioContext to be created/resumed synchronously inside a real
  // user-gesture call stack -- if that happens after an `await` (rendering a fade, encoding,
  // etc.), the context can end up silently stuck "suspended" and nothing plays, with no error
  // thrown anywhere. Call this as the very first line of a click handler, before any await, so
  // the context is captured while iOS still considers it gesture-triggered; everything else
  // (rendering, fades) can safely happen after.
  function unlock() {
    getCtx();
  }

  // Calling .stop() on a source fires its 'ended' event too, same as a natural finish -- if a
  // NEW source has already started playing by the time that fires (stop, then immediately play
  // again, e.g. pause-then-resume or switching presets quickly), the OLD source's onended still
  // fires and clobbers state for the new playback. Detaching onended before stopping prevents
  // that stale callback from firing at all. Confirmed live: intermittent "pause doesn't work".
  function stop() {
    if (source) { source.onended = null; try { source.stop(); } catch (e) {} }
    source = null;
    pausedAt = 0;
    cancelAnimationFrame(rafId);
  }

  // `seekTo` (seconds), when given, jumps to that position instead of resuming from wherever
  // pause() last left off -- used by the click/tap-to-seek handler on the waveform.
  // `buildChain(ctx, sourceNode, startOffset) => outputNode`, when given, inserts a live
  // processing graph between the source and the speakers. The caller keeps its own references
  // to the nodes it created, so it can change their parameters WHILE audio plays -- that's what
  // makes an EQ slider audible the instant you drag it, with no re-render of the file.
  // `startOffset` is where in the track playback is beginning, which time-based effects (a fade
  // envelope) need in order to schedule themselves correctly after a seek or resume.
  // `options.loop` repeats the buffer forever instead of ending. That's how the noise generators
  // play for hours on a few megabytes: a short seamless loop rather than an hours-long buffer.
  function play(buf, onProgress, onEnded, seekTo, buildChain, options = {}) {
    buffer = buf;
    if (seekTo != null) pausedAt = Math.max(0, Math.min(seekTo, buffer.duration));
    const c = getCtx();
    source = c.createBufferSource();
    source.buffer = buffer;
    if (options.loop) source.loop = true;
    const chainOut = buildChain ? buildChain(c, source, pausedAt) : source;
    chainOut.connect(c.destination);
    // Clear internal state BEFORE handing control to onEnded -- reaching the end of a track is
    // just as much "not playing anymore" as an explicit stop, but this used to leave `source`
    // set, so isPlaying() kept returning true forever after a track finished on its own. Every
    // caller was independently papering over that by calling reset() from its own onEnded;
    // fixing it here means callers that don't (the A/B compare path) behave correctly too.
    const startedSource = source;
    source.onended = () => {
      if (source === startedSource) {
        source = null;
        cancelAnimationFrame(rafId);
        // Rewind on a natural finish. `pausedAt` holds the offset playback STARTED from, and
        // nothing was updating it when a track simply ran out -- so after playing from, say,
        // 0:50 to the end, getPosition() still reported 0:50 and the next play resumed there
        // instead of at the beginning. Reaching the end means the playhead is at the end, and
        // the sensible next play is from the top.
        pausedAt = 0;
      }
      if (onEnded) onEnded();
    };
    source.start(0, pausedAt);
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
    try { source.stop(); } catch (e) {}
    source = null;
    cancelAnimationFrame(rafId);
  }

  function reset() {
    stop();
    pausedAt = 0;
  }

  // Current elapsed position (seconds), whether actively playing or paused -- lets a caller
  // switch to a *different* buffer (e.g. A/B original vs. result) starting from the same
  // point, instead of losing the position on every switch.
  function getPosition() {
    if (!source) return pausedAt;
    return ctx.currentTime - startedAt;
  }

  return { play, pause, stop, reset, unlock, isPlaying: () => !!source, getPosition };
}

// ---- Noise ---------------------------------------------------------------------------------
// The generators used to build the entire requested duration as one AudioBuffer. Measured on an
// hour of noise: the JS heap went from 14 MB to 609 MB, and to 912 MB once a WAV was written --
// a 317 MB file. A phone would not survive that, and the sleep/focus use case wants far longer
// than an hour anyway. So nothing here ever materialises the full length: a short seamless loop
// is generated once, played on repeat for as long as you like, and repeated straight into the
// encoder when a file is actually wanted.

// A loop only sounds seamless if its end runs into its beginning without a step. Extra audio is
// generated beyond the loop length and crossfaded back over the start, which is inaudible on
// noise and removes the click that plain repetition produces on pink and brown (both carry
// low-frequency content, where a discontinuity is very audible).
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
      // Leaky integration of white noise: energy falls about 6 dB per octave, twice as steep as
      // pink, which is what gives brown noise its deep "waterfall" character. The leak keeps it
      // from wandering off into a DC offset.
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
      // Paul Kellet's refined filter, ALL of it. The old code kept only the first three poles of
      // the seven-term version and the coefficients of the three-term one. Those missing terms
      // are precisely the ones carrying the high end, so the result rolled off at roughly
      // 4.7 dB/octave instead of 3 -- measured on the exported file, pink came out within
      // 1.5 dB of brown across the spectrum, when the two should differ by about 18 dB at
      // 6.4 kHz. It was not pink noise.
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

// Repeats `loop` up to `totalSamples` straight into a WAV. Peak memory is the file itself rather
// than the file plus a full-length AudioBuffer.
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
  // A fade at both ends so a file doesn't begin or end with a hard edge.
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

// Same idea for MP3, and here it pays off properly: lamejs consumes 1152-sample frames, so the
// only thing held in memory is the compressed output -- about 29 MB for half an hour at 128 kbps
// instead of several hundred.
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
    // Yield to the browser every few seconds of audio so a long export can't freeze the page.
    if ((i / block) % 400 === 0) await new Promise((res) => setTimeout(res, 0));
  }
  const end = encoder.flush();
  if (end.length) chunks.push(end);
  return new Blob(chunks, { type: 'audio/mpeg' });
}

// ---- Analysis ------------------------------------------------------------------------------
// These three answer questions rather than change audio, so they return numbers, not buffers.
// They take anything with sampleRate/length/getChannelData, which keeps them testable outside a
// browser -- every threshold below was checked against synthetic signals with a known answer.

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function hzToNote(hz) {
  if (!hz || hz <= 0) return null;
  const midi = Math.round(69 + 12 * Math.log2(hz / 440));
  return { midi, name: NOTE_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1) };
}

// Pitch detection needs nothing above about 4 kHz for a voice, so the signal is first decimated
// to ~8 kHz. That cuts the cost of the search roughly thirtyfold, which is the difference between
// a usable tool and one that locks the page up on a three-minute file.
function decimateForPitch(data, sampleRate, target = 8000) {
  const factor = Math.max(1, Math.floor(sampleRate / target));
  if (factor === 1) return { data, sampleRate };
  const out = new Float32Array(Math.floor(data.length / factor));
  for (let i = 0; i < out.length; i++) {
    // Averaging the samples being collapsed is a crude low-pass, which is what keeps higher
    // frequencies from folding back down and inventing pitches that were never sung.
    let sum = 0;
    for (let j = 0; j < factor; j++) sum += data[i * factor + j];
    out[i] = sum / factor;
  }
  return { data: out, sampleRate: sampleRate / factor };
}

// YIN. The two details that matter are both easy to get wrong, and I got both wrong first time:
// the cumulative mean has to run from lag 1 -- starting it at the minimum lag of interest makes
// the normaliser grow with lag and quietly rewards low frequencies -- and the answer is the FIRST
// dip below the threshold, not the deepest. Taking the deepest is what made C4 read as C3 and
// A4 as A2: a signal repeating every period also repeats every two periods, and the octave below
// often correlates slightly better.
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
      // Walk to the bottom of this dip rather than stopping on its leading edge.
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
    // Skip near-silence outright: pitch detection on room tone returns confident nonsense.
    if (Math.sqrt(energy / size) < 0.01) continue;
    const hz = windowPitch(data, start, size, sr, 60, 1200);
    if (hz) pitches.push(hz);
  }
  if (pitches.length < 10) return null;
  pitches.sort((a, b) => a - b);
  // Percentiles rather than min/max: one cracked note or one octave error at the edge would
  // otherwise decide the whole answer.
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

// Krumhansl-Schmuckler: average the energy of each pitch class over the file, then see which of
// the 24 keys its shape matches best. Relative keys (C major / A minor) share every note and are
// told apart only by which degrees carry the weight, so this is a guess -- a well-founded one.
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
  // At most two minutes, taken from the middle -- intros and fade-outs are the least
  // representative parts of a track, and the key does not change while it plays.
  const maxLen = Math.min(full.length, Math.round(sr * 120));
  const from = Math.floor((full.length - maxLen) / 2);
  const data = maxLen < full.length ? full.subarray(from, from + maxLen) : full;
  const chroma = new Float64Array(12);
  // Every semitone from C2 to B6 -- low enough for bass lines, high enough for melody, and
  // above that the harmonics of lower notes dominate and only blur the picture.
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

// Loudness, peak and noise floor against the numbers audiobook platforms ask for.
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
  // Noise floor is the quietest half-second in the file -- in a real recording that is a gap
  // between sentences, which is exactly the part platforms measure.
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
    // ACX, and near enough what other audiobook platforms ask for.
    rmsOk: rmsDb >= -23 && rmsDb <= -18,
    peakOk: peakDb <= -3,
    floorOk: floorDb <= -60,
  };
}

// Tempo from an onset-strength envelope -- energy rise per 5 ms frame -- then autocorrelation
// over 60-190 BPM. Measured on click tracks: exact at 70, 75, 90, 100, 120, 128, 140 and 160,
// and 176 for a 175 track. It finds a steady beat well and has no opinion at all about music
// without one, which is why the page tells people to check the number rather than trust it.
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
  // Only rises count -- a beat is where energy jumps, not where it falls away.
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
  // Half and double describe the same rhythm, and raw correlation leans towards the slower
  // reading -- 120 BPM kept coming back as 60. A log-normal prior centred on 120 breaks the
  // tie the way a listener would.
  let bestLag = 0, bestScore = -1;
  for (let lag = minLag; lag <= maxLag; lag++) {
    const bpm = 60 / (lag * frameSec);
    const score = corr[lag] * Math.exp(-0.5 * Math.pow(Math.log2(bpm / 120) / 0.9, 2));
    if (score > bestScore) { bestScore = score; bestLag = lag; }
  }
  if (!bestLag || bestScore <= 0) return 0;
  // The prior alone still lost 140 to 70: at exactly half tempo every beat still lines up, so
  // the correlation is nearly as strong. Test the double-tempo candidate explicitly and take
  // it when it holds up, which is what someone tapping along would do.
  const halfLag = Math.round(bestLag / 2);
  if (halfLag >= minLag && corr[halfLag] > corr[bestLag] * 0.5) bestLag = halfLag;
  // Parabolic interpolation around the peak, so the answer is not limited to whole frames --
  // that quantisation alone was costing 1-2 BPM.
  const y0 = corr[bestLag - 1] || 0, y1 = corr[bestLag], y2 = corr[bestLag + 1] || 0;
  const denom = y0 - 2 * y1 + y2;
  const shift = denom !== 0 ? 0.5 * (y0 - y2) / denom : 0;
  const lag = bestLag + Math.max(-1, Math.min(1, shift));
  return Math.round(60 / (lag * frameSec));
}

