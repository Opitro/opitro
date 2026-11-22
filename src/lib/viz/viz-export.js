import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

const tick = () => new Promise((r) => setTimeout(r, 0));

async function pickVideo(width, height, fps, bitrate) {
  for (const codec of ['avc1.640028', 'avc1.4d0028', 'avc1.42002a', 'avc1.42001f']) {
    for (const hardwareAcceleration of ['prefer-hardware', 'no-preference']) {
      const cfg = { codec, width, height, bitrate, framerate: fps, hardwareAcceleration, avc: { format: 'avc' } };
      try {
        const res = await VideoEncoder.isConfigSupported(cfg);
        if (res.supported) return res.config;
      } catch (e) {}
    }
  }
  return null;
}

async function pickAudio(sampleRate, channels) {
  const options = [
    { codec: 'mp4a.40.2', mux: 'aac', sampleRate: sampleRate === 44100 || sampleRate === 48000 ? sampleRate : 48000 },
    { codec: 'opus', mux: 'opus', sampleRate: 48000 },
  ];
  for (const o of options) {
    const cfg = { codec: o.codec, sampleRate: o.sampleRate, numberOfChannels: channels, bitrate: 160000 };
    try {
      const res = await AudioEncoder.isConfigSupported(cfg);
      if (res.supported) return { cfg: res.config, mux: o.mux };
    } catch (e) {}
  }
  return null;
}

export function canEncode() {
  return typeof VideoEncoder !== 'undefined' && typeof AudioEncoder !== 'undefined' && typeof VideoFrame !== 'undefined';
}

async function convert(buffer, rate, channels) {
  if (buffer.sampleRate === rate && buffer.numberOfChannels === channels) return buffer;
  const ctx = new OfflineAudioContext(channels, Math.ceil(buffer.duration * rate), rate);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(ctx.destination);
  src.start();
  return ctx.startRendering();
}

export async function encodeVideo({ buffer, width, height, fps, bitrate, draw, onProgress, signal }) {
  if (!canEncode()) throw new Error('unsupported');
  const channels = Math.min(2, buffer.numberOfChannels);
  const vcfg = await pickVideo(width, height, fps, bitrate);
  const acfg = await pickAudio(buffer.sampleRate, channels);
  if (!vcfg || !acfg) throw new Error('unsupported');

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width, height, frameRate: fps },
    audio: { codec: acfg.mux, numberOfChannels: channels, sampleRate: acfg.cfg.sampleRate },
    fastStart: 'in-memory',
    firstTimestampBehavior: 'offset',
  });
  let failure = null;
  const venc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: (e) => { failure = e; } });
  venc.configure(vcfg);
  const aenc = new AudioEncoder({ output: (c, m) => muxer.addAudioChunk(c, m), error: (e) => { failure = e; } });
  aenc.configure(acfg.cfg);
  const close = () => {
    try { venc.close(); } catch (e) {}
    try { aenc.close(); } catch (e) {}
  };
  const check = () => {
    if (signal && signal.aborted) throw new DOMException('aborted', 'AbortError');
    if (failure) throw failure;
  };

  try {
    const audio = await convert(buffer, acfg.cfg.sampleRate, channels);
    const rate = audio.sampleRate, total = audio.length, chunk = 4096, data = [];
    for (let c = 0; c < channels; c++) data.push(audio.getChannelData(c));
    for (let i = 0; i < total; i += chunk) {
      const n = Math.min(chunk, total - i), planar = new Float32Array(n * channels);
      for (let c = 0; c < channels; c++) planar.set(data[c].subarray(i, i + n), c * n);
      const ad = new AudioData({ format: 'f32-planar', sampleRate: rate, numberOfFrames: n, numberOfChannels: channels, timestamp: Math.round(i / rate * 1e6), data: planar });
      aenc.encode(ad);
      ad.close();
      if (aenc.encodeQueueSize > 32) await tick();
      check();
    }
    await aenc.flush();

    const frames = Math.ceil(buffer.duration * fps);
    const canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(width, height) : Object.assign(document.createElement('canvas'), { width, height });
    const ctx = canvas.getContext('2d', { alpha: false });
    const frameUs = Math.round(1e6 / fps);
    let shown = 0;
    for (let i = 0; i < frames; i++) {
      draw(ctx, width, height, i / fps, 1 / fps);
      const vf = new VideoFrame(canvas, { timestamp: i * frameUs, duration: frameUs });
      venc.encode(vf, { keyFrame: i % (fps * 2) === 0 });
      vf.close();
      while (venc.encodeQueueSize > 6) await new Promise((r) => setTimeout(r, 2));
      check();
      const now = performance.now();
      if (now - shown > 120) {
        shown = now;
        if (onProgress) onProgress(i / frames);
        await tick();
      }
    }
    await venc.flush();
    muxer.finalize();
    close();
    if (onProgress) onProgress(1);
    return new Blob([muxer.target.buffer], { type: 'video/mp4' });
  } catch (e) {
    close();
    throw e;
  }
}
