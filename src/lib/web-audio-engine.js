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

export function drawWaveform(canvas, buffer) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, rect.width * dpr);
  canvas.height = 130 * dpr;
  const g = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  g.clearRect(0, 0, W, H);
  const data = buffer.getChannelData(0);
  const step = Math.max(1, Math.ceil(data.length / W));
  g.fillStyle = 'rgba(74,222,158,.55)';
  for (let x = 0; x < W; x++) {
    let min = 1;
    let max = -1;
    for (let j = 0; j < step; j++) {
      const d = data[x * step + j] || 0;
      if (d < min) min = d;
      if (d > max) max = d;
    }
    const y1 = ((1 + min) * H) / 2;
    const y2 = ((1 + max) * H) / 2;
    g.fillRect(x, y1, 1, Math.max(1, y2 - y1));
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

  function stop() {
    if (source) { try { source.stop(); } catch (e) {} }
    source = null;
    pausedAt = 0;
    cancelAnimationFrame(rafId);
  }

  function play(buf, onProgress, onEnded) {
    buffer = buf;
    const c = getCtx();
    source = c.createBufferSource();
    source.buffer = buffer;
    source.connect(c.destination);
    source.onended = () => { if (onEnded) onEnded(); };
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
    try { source.stop(); } catch (e) {}
    source = null;
    cancelAnimationFrame(rafId);
  }

  function reset() {
    stop();
    pausedAt = 0;
  }

  return { play, pause, stop, reset, unlock, isPlaying: () => !!source };
}
