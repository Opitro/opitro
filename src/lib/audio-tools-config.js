
import { wsolaStretch, pitchShift, resampleLinear, sliceBuffer } from './web-audio-engine.js';

export function noiseFloorFor(nr) {

  return Math.round(Math.max(-30, Math.min(-20, -32 + nr / 2)));
}
export function denoiseFilter(nr) {
  return `afftdn=nr=${nr}:nf=${noiseFloorFor(nr)}:tn=1`;
}

export function splitPlan(duration, { splitMode, splitValue }) {
  const out = [];
  if (splitMode === 'duration') {
    const chunk = Math.max(1, Number(splitValue) || 5) * 60;
    for (let t = 0; t < duration - 0.05; t += chunk) out.push({ start: t, end: Math.min(duration, t + chunk) });
  } else {
    const n = Math.max(2, Math.min(50, Math.round(Number(splitValue) || 2)));
    const chunk = duration / n;
    for (let i = 0; i < n; i++) out.push({ start: i * chunk, end: (i + 1) * chunk });
  }
  return out;
}

const MP3_OUT = { outputName: 'out.mp3', mimeType: 'audio/mpeg', ext: 'mp3' };

const EQ_BANDS = [
  { id: 'b31', freq: 31, label: '31' },
  { id: 'b62', freq: 62, label: '62' },
  { id: 'b125', freq: 125, label: '125' },
  { id: 'b250', freq: 250, label: '250' },
  { id: 'b500', freq: 500, label: '500' },
  { id: 'b1k', freq: 1000, label: '1k' },
  { id: 'b2k', freq: 2000, label: '2k' },
  { id: 'b4k', freq: 4000, label: '4k' },
  { id: 'b8k', freq: 8000, label: '8k' },
  { id: 'b16k', freq: 16000, label: '16k' },
];

function scheduleFadeAutomation(param, offset, total, fadeIn, fadeOut, now) {
  const fi = Math.max(0, Math.min(fadeIn, total));

  const fo = Math.max(0, Math.min(fadeOut, total - fi));
  const foStart = total - fo;
  param.cancelScheduledValues(now);

  let level = 1;
  if (fi > 0 && offset < fi) level = offset / fi;
  else if (fo > 0 && offset >= foStart) level = Math.max(0, (total - offset) / fo);
  param.setValueAtTime(level, now);

  if (fi > 0 && offset < fi) param.linearRampToValueAtTime(1, now + (fi - offset));
  if (fo > 0) {
    if (offset < foStart) param.setValueAtTime(1, now + (foStart - offset));
    param.linearRampToValueAtTime(0, now + (total - offset));
  }
}

function renderGraph(buffer, build) {
  const oc = new OfflineAudioContext(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  const src = oc.createBufferSource();
  src.buffer = buffer;
  build(oc, src).connect(oc.destination);
  src.start(0);
  return oc.startRendering();
}

function distortionCurve(drive) {
  const curve = new Float32Array(1024);
  for (let i = 0; i < 1024; i++) {
    const x = (i / 1023) * 2 - 1;
    curve[i] = Math.tanh(x * drive);
  }
  return curve;
}

function bandPass(oc, src, lowHz, highHz) {
  const hp = oc.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = lowHz; hp.Q.value = 0.7;
  const lp = oc.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = highHz; lp.Q.value = 0.7;
  src.connect(hp); hp.connect(lp);
  return lp;
}

function blendBuffers(dry, wet, amount) {
  const out = new AudioBuffer({ numberOfChannels: dry.numberOfChannels, length: dry.length, sampleRate: dry.sampleRate });
  for (let c = 0; c < dry.numberOfChannels; c++) {
    const d = dry.getChannelData(c);
    const w = wet.getChannelData(Math.min(c, wet.numberOfChannels - 1));
    const o = out.getChannelData(c);
    for (let i = 0; i < d.length; i++) o[i] = d[i] * (1 - amount) + (w[i] || 0) * amount;
  }
  return out;
}

async function applyVoiceEffect(buffer, effect, intensityPct) {

  const amount = Math.max(0, Math.min(1, (Number(intensityPct) || 0) / 100));
  const mix = 0.15 + amount * 0.85;
  const sr = buffer.sampleRate;
  let wet;

  if (effect === 'robot') {

    const carrier = 110 + amount * 40;
    const ровный = await renderGraph(buffer, (oc, src) => {
      const cp = oc.createDynamicsCompressor();
      cp.threshold.value = -34; cp.ratio.value = 14; cp.attack.value = 0.003; cp.release.value = 0.08;
      src.connect(cp);
      const g = oc.createGain(); g.gain.value = 1.6;
      cp.connect(g);
      return g;
    });
    wet = new AudioBuffer({ numberOfChannels: ровный.numberOfChannels, length: ровный.length, sampleRate: sr });
    for (let c = 0; c < ровный.numberOfChannels; c++) {
      const d = ровный.getChannelData(c);
      const o = wet.getChannelData(c);
      for (let i = 0; i < d.length; i++) o[i] = d[i] * Math.sin((2 * Math.PI * carrier * i) / sr);
    }
    wet = await renderGraph(wet, (oc, src) => bandPass(oc, src, 300, 3800));
    return wet;
  } else if (effect === 'reverse') {

    wet = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: buffer.length, sampleRate: sr });
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const d = buffer.getChannelData(c);
      const o = wet.getChannelData(c);
      const n = d.length;
      for (let i = 0; i < n; i++) o[i] = d[n - 1 - i];
    }
    return wet;
  } else if (effect === 'echo') {

    const задержка = 0.28;
    const хвост = Math.ceil(задержка * 3 * sr);
    wet = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: buffer.length + хвост, sampleRate: sr });
    const шаг = Math.round(задержка * sr);
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const d = buffer.getChannelData(c);
      const o = wet.getChannelData(c);
      for (let i = 0; i < d.length; i++) o[i] = d[i];
      for (let повтор = 1; повтор <= 3; повтор++) {
        const сила = Math.pow(0.45 + amount * 0.2, повтор);
        const сдвиг = шаг * повтор;
        for (let i = 0; i < d.length; i++) o[i + сдвиг] += d[i] * сила;
      }
      for (let i = 0; i < o.length; i++) o[i] = Math.max(-1, Math.min(1, o[i]));
    }
    return wet;
  } else if (effect === 'hall') {

    const длина = 1.2 + amount * 1.3;
    const хвост = Math.ceil(длина * sr);
    wet = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: buffer.length + хвост, sampleRate: sr });
    const отражения = [];
    for (let i = 0; i < 24; i++) отражения.push({ сдвиг: Math.round((0.02 + i * 0.045) * sr), сила: Math.pow(0.72, i) * 0.6 });
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const d = buffer.getChannelData(c);
      const o = wet.getChannelData(c);
      for (let i = 0; i < d.length; i++) o[i] = d[i];
      отражения.forEach((отр) => {
        for (let i = 0; i < d.length; i++) o[i + отр.сдвиг] += d[i] * отр.сила;
      });
      for (let i = 0; i < o.length; i++) o[i] = Math.max(-1, Math.min(1, o[i] * 0.7));
    }
    return wet;
  } else if (effect === 'monster') {

    const shifted = pitchShift(buffer, -(7 + amount * 3));
    wet = await renderGraph(shifted, (oc, src) => {
      const sh = oc.createWaveShaper(); sh.curve = distortionCurve(2.2); sh.oversample = '4x';
      const low = oc.createBiquadFilter(); low.type = 'lowshelf'; low.frequency.value = 200; low.gain.value = 7;
      const cut = oc.createBiquadFilter(); cut.type = 'lowpass'; cut.frequency.value = 3200;
      src.connect(sh); sh.connect(low); low.connect(cut);
      return cut;
    });
  } else if (effect === 'alien') {

    const shifted = pitchShift(buffer, 4 + amount * 3);
    const carrier = 400 + amount * 500;
    wet = new AudioBuffer({ numberOfChannels: shifted.numberOfChannels, length: shifted.length, sampleRate: sr });
    for (let c = 0; c < shifted.numberOfChannels; c++) {
      const d = shifted.getChannelData(c);
      const o = wet.getChannelData(c);
      for (let i = 0; i < d.length; i++) o[i] = d[i] * (0.6 + 0.4 * Math.sin((2 * Math.PI * carrier * i) / sr));
    }
  } else if (effect === 'underwater') {

    wet = await renderGraph(buffer, (oc, src) => {
      const lp = oc.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = 3;
      const кач = oc.createOscillator(); кач.frequency.value = 0.7;
      const глубина = oc.createGain(); глубина.gain.value = 260;
      кач.connect(глубина); глубина.connect(lp.frequency); кач.start();
      src.connect(lp);
      return lp;
    });
  } else if (effect === 'chorus') {

    const вверх = pitchShift(buffer, 0.3);
    const вниз = pitchShift(buffer, -0.3);
    const сдвиг = Math.round(0.018 * sr);
    wet = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: buffer.length + сдвиг, sampleRate: sr });
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const a1 = buffer.getChannelData(c);
      const a2 = вверх.getChannelData(Math.min(c, вверх.numberOfChannels - 1));
      const a3 = вниз.getChannelData(Math.min(c, вниз.numberOfChannels - 1));
      const o = wet.getChannelData(c);
      for (let i = 0; i < a1.length; i++) {
        const б = a2[Math.min(a2.length - 1, i)] || 0;
        const в = a3[Math.max(0, Math.min(a3.length - 1, i - сдвиг))] || 0;
        o[i] = Math.max(-1, Math.min(1, a1[i] * 0.6 + б * 0.35 + в * 0.35));
      }
    }
    return wet;
  } else if (effect === 'phone') {

    wet = await renderGraph(buffer, (oc, src) => {
      const hp = oc.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 400; hp.Q.value = 0.9;
      const hp2 = oc.createBiquadFilter(); hp2.type = 'highpass'; hp2.frequency.value = 400; hp2.Q.value = 0.9;
      const lp = oc.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000; lp.Q.value = 0.9;
      const lp2 = oc.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 3000; lp2.Q.value = 0.9;
      const горб = oc.createBiquadFilter();
      горб.type = 'peaking'; горб.frequency.value = 1800; горб.Q.value = 1.6; горб.gain.value = 9;
      const жм = oc.createDynamicsCompressor();
      жм.threshold.value = -30; жм.ratio.value = 12; жм.attack.value = 0.004; жм.release.value = 0.12;
      const sh = oc.createWaveShaper(); sh.curve = distortionCurve(1.2 + amount * 1.2); sh.oversample = '2x';
      const g = oc.createGain(); g.gain.value = 1.5;
      src.connect(hp); hp.connect(hp2); hp2.connect(lp); lp.connect(lp2);
      lp2.connect(горб); горб.connect(жм); жм.connect(sh); sh.connect(g);
      return g;
    });
    return wet;
  } else if (effect === 'radio') {

    const шип = new AudioBuffer({ numberOfChannels: 1, length: buffer.length, sampleRate: sr });
    const ш = шип.getChannelData(0);
    let b0 = 0;
    for (let i = 0; i < ш.length; i++) {
      const бел = Math.random() * 2 - 1;
      b0 = 0.94 * b0 + 0.06 * бел;
      ш[i] = b0 * (0.05 + amount * 0.07);
    }
    wet = await renderGraph(buffer, (oc, src) => {
      const bp = bandPass(oc, src, 450, 4200);
      const горб = oc.createBiquadFilter();
      горб.type = 'peaking'; горб.frequency.value = 2400; горб.Q.value = 1.3; горб.gain.value = 7;
      const жм = oc.createDynamicsCompressor();
      жм.threshold.value = -28; жм.ratio.value = 10; жм.attack.value = 0.005; жм.release.value = 0.15;
      const sh = oc.createWaveShaper(); sh.curve = distortionCurve(2 + amount * 2); sh.oversample = '4x';
      const g = oc.createGain(); g.gain.value = 1.4;

      const кач = oc.createOscillator(); кач.frequency.value = 0.35;
      const глуб = oc.createGain(); глуб.gain.value = 0.12;
      кач.connect(глуб); глуб.connect(g.gain); кач.start();

      const шумИст = oc.createBufferSource(); шумИст.buffer = шип; шумИст.start();
      const шумГр = oc.createGain(); шумГр.gain.value = 1;
      шумИст.connect(шумГр); шумГр.connect(g);
      bp.connect(горб); горб.connect(жм); жм.connect(sh); sh.connect(g);
      return g;
    });
    return wet;
  } else if (effect === 'megaphone') {
    wet = await renderGraph(buffer, (oc, src) => {
      const bp = bandPass(oc, src, 500, 4000);
      const sh = oc.createWaveShaper(); sh.curve = distortionCurve(4.5); sh.oversample = '4x';
      const peak = oc.createBiquadFilter();
      peak.type = 'peaking'; peak.frequency.value = 1800; peak.Q.value = 1.2; peak.gain.value = 8;
      const g = oc.createGain(); g.gain.value = 0.9;
      bp.connect(sh); sh.connect(peak); peak.connect(g);
      return g;
    });
  } else if (effect === 'retro') {

    const bits = 6 - Math.round(amount * 2);
    const targetRate = 11025 - Math.round(amount * 3000);
    const step = Math.max(1, Math.round(sr / targetRate));
    const levels = Math.pow(2, bits);
    wet = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: buffer.length, sampleRate: sr });
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const d = buffer.getChannelData(c);
      const o = wet.getChannelData(c);
      let held = 0;
      for (let i = 0; i < d.length; i++) {
        if (i % step === 0) held = Math.max(-1, Math.min(1, Math.round(d[i] * (levels / 2)) / (levels / 2)));
        o[i] = held;
      }
    }
  } else if (effect === 'deep' || effect === 'high' || effect === 'cartoon') {
    const semis = effect === 'deep' ? -(3 + amount * 3)
      : effect === 'high' ? (3 + amount * 3)
      : (6 + amount * 4);
    const shifted = pitchShift(buffer, semis);
    wet = await renderGraph(shifted, (oc, src) => {
      const eq = oc.createBiquadFilter();
      if (effect === 'deep') { eq.type = 'lowshelf'; eq.frequency.value = 250; eq.gain.value = 4; }
      else { eq.type = 'peaking'; eq.frequency.value = 3000; eq.Q.value = 1; eq.gain.value = 3; }
      src.connect(eq);
      return eq;
    });
  } else {
    return buffer;
  }

  return blendBuffers(buffer, wet, mix);
}

function buildEqChain(ctx, src, bands) {
  let node = src;
  const filters = [];
  EQ_BANDS.forEach((b) => {
    const f = ctx.createBiquadFilter();
    f.type = 'peaking';
    f.frequency.value = b.freq;
    f.Q.value = 1.41;
    f.gain.value = bands[b.id] || 0;
    node.connect(f);
    node = f;
    filters.push(f);
  });
  return { output: node, filters };
}

export const AUDIO_TOOLS = {
  convert: {
    engine: 'ffmpeg',
    controls: 'convert',
    accept: 'audio/*',

    advancedConvert: true,
    runLabel: 'convertLabel',

    simplePreview: true,

    allowBatch: true,
    maxBatchFiles: 20,
    maxBatchMB: 2048,
    formats: ['mp3', 'm4a', 'm4r', 'wav', 'ogg', 'flac', 'opus', 'wma', 'aiff'],
    output: (params) => {
      const map = {
        mp3: 'audio/mpeg', m4a: 'audio/mp4', m4r: 'audio/x-m4r', wav: 'audio/wav', ogg: 'audio/ogg',
        flac: 'audio/flac', opus: 'audio/ogg', wma: 'audio/x-ms-wma', aiff: 'audio/aiff',
      };
      return { outputName: `out.${params.format}`, mimeType: map[params.format] || 'audio/mpeg', ext: params.format };
    },
    buildArgs: ([inp], out, params) => {
      const { format, bitrate, sampleRate, channels } = params;
      const extra = [];
      if (channels && channels !== 'auto') extra.push('-ac', channels);
      if (format === 'opus') {

        return ['-i', inp, ...extra, '-ar', '24000', '-c:a', 'libopus', '-b:a', `${bitrate}k`, out];
      }
      if (sampleRate && sampleRate !== 'auto') extra.push('-ar', sampleRate);
      if (format === 'mp3') return ['-i', inp, ...extra, '-b:a', `${bitrate}k`, out];
      if (format === 'm4a') return ['-i', inp, ...extra, '-c:a', 'aac', '-b:a', `${bitrate}k`, out];
      if (format === 'm4r') return ['-i', inp, ...extra, '-c:a', 'aac', '-b:a', `${bitrate}k`, '-f', 'ipod', out];
      if (format === 'wav') return ['-i', inp, ...extra, out];
      if (format === 'ogg') return ['-i', inp, ...extra, '-c:a', 'libvorbis', '-b:a', `${bitrate}k`, out];
      if (format === 'flac') return ['-i', inp, ...extra, out];
      if (format === 'wma') return ['-i', inp, ...extra, '-c:a', 'wmav2', '-b:a', `${bitrate}k`, out];
      if (format === 'aiff') return ['-i', inp, ...extra, out];
      return ['-i', inp, ...extra, out];
    },
  },

  trim: {

    engine: 'webaudio',
    controls: 'trim',
    accept: 'audio/*',

    downloadFormats: ['wav', 'mp3', 'ogg'],
    exportDeck: true,
    directRender: (buffer, { start, end, cutOut, fadeIn, fadeOut }) => {
      const sr = buffer.sampleRate;
      const s = Math.max(0, Math.floor((start || 0) * sr));
      const e = Math.min(buffer.length, Math.ceil((end ?? buffer.duration) * sr));
      let out;
      if (cutOut) {
        const keepLen = s + (buffer.length - e);
        out = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: Math.max(1, keepLen), sampleRate: sr });
        for (let c = 0; c < buffer.numberOfChannels; c++) {
          const src = buffer.getChannelData(c);
          const dst = out.getChannelData(c);
          dst.set(src.subarray(0, s), 0);
          dst.set(src.subarray(e), s);
        }
      } else {
        const len = Math.max(1, e - s);
        out = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: len, sampleRate: sr });
        for (let c = 0; c < buffer.numberOfChannels; c++) {
          out.getChannelData(c).set(buffer.getChannelData(c).subarray(s, s + len));
        }
      }
      const fi = Math.min(Number(fadeIn) || 0, out.duration / 2);
      const fo = Math.min(Number(fadeOut) || 0, out.duration / 2);
      if (fi > 0 || fo > 0) {
        const fiSamples = Math.round(fi * sr);
        const foSamples = Math.round(fo * sr);
        for (let c = 0; c < out.numberOfChannels; c++) {
          const d = out.getChannelData(c);
          for (let i = 0; i < fiSamples; i++) d[i] *= i / fiSamples;
          for (let i = 0; i < foSamples; i++) d[d.length - 1 - i] *= i / foSamples;
        }
      }
      return out;
    },
  },

  merge: {
    engine: 'webaudio-merge',
    controls: 'multi-file',
    accept: 'audio/*',

    downloadFormats: ['wav', 'mp3', 'ogg'],
    exportDeck: true,
    runLabel: 'mergeRunLabel',
  },

  volume: {

    engine: 'webaudio',
    controls: 'volume1',
    accept: 'audio/*',

    compactPreview: true,
    transport: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    exportDeck: true,
    volumeMin: 10,
    volumeMax: 300,
    buildLiveChain: (ctx, src, value) => {
      const g = ctx.createGain();
      g.gain.value = (value || 100) / 100;
      src.connect(g);
      return { output: g, filters: [g] };
    },
    render: (oc, src, { value }) => {
      const g = oc.createGain();
      g.gain.value = (value || 100) / 100;
      src.connect(g);
      return g;
    },
  },

  normalize: {
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    engine: 'webaudio',
    controls: 'none',
    accept: 'audio/*',
    directRender: (buffer) => {
      let peak = 0;
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        const d = buffer.getChannelData(c);
        for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
      }
      if (peak < 0.001) return buffer;
      const gain = 0.97 / peak;
      const out = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: buffer.length, sampleRate: buffer.sampleRate });
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        const src = buffer.getChannelData(c);
        const dst = out.getChannelData(c);
        for (let i = 0; i < src.length; i++) dst[i] = Math.max(-1, Math.min(1, src[i] * gain));
      }
      return out;
    },
  },

  speed: {

    abWaveform: true,
    renderedAb: true,

    engine: 'webaudio',
    controls: 'speed1',
    accept: 'audio/*',

    compactPreview: true,
    transport: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    exportDeck: true,
    speedMin: 25,
    speedMax: 400,
    speedPresets: [50, 75, 100, 125, 150, 200],
    directRender: (buffer, { value, keepPitch }) => {
      const pct = value || 100;
      if (pct === 100) return buffer;

      return keepPitch === false ? resampleLinear(buffer, pct / 100) : wsolaStretch(buffer, 100 / pct);
    },
  },

  pitch: {
    renderedAb: true,

    engine: 'webaudio',
    controls: 'pitch1',
    accept: 'audio/*',
    abCompare: true,
    compactPreview: true,
    transport: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    exportDeck: true,
    semitoneMin: -12,
    semitoneMax: 12,

    centsMin: -50,
    centsMax: 50,
    directRender: (buffer, { value, cents }) => pitchShift(buffer, (value || 0) + (cents || 0) / 100),
  },

  voice: {

    allowMicInput: true,

    elementPlayback: true,
    renderedAb: true,

    engine: 'webaudio',
    controls: 'voicefx',
    accept: 'audio/*',

    abCompare: false,
    compactPreview: true,
    transport: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    exportDeck: true,

    voiceEffects: [
      { key: 'robot', emoji: '🤖', label: 'voiceRobotLabel', desc: 'voiceRobotDesc' },
      { key: 'deep', emoji: '🔉', label: 'voiceDeepLabel', desc: 'voiceDeepDesc' },
      { key: 'high', emoji: '🐿', label: 'voiceHighLabel', desc: 'voiceHighDesc' },
      { key: 'monster', emoji: '👹', label: 'voiceMonsterLabel', desc: 'voiceMonsterDesc' },
      { key: 'alien', emoji: '👽', label: 'voiceAlienLabel', desc: 'voiceAlienDesc' },
      { key: 'reverse', emoji: '🔁', label: 'voiceReverseLabel', desc: 'voiceReverseDesc' },
      { key: 'echo', emoji: '🔊', label: 'voiceEchoLabel', desc: 'voiceEchoDesc' },
      { key: 'hall', emoji: '⛪', label: 'voiceHallLabel', desc: 'voiceHallDesc' },
      { key: 'phone', emoji: '📞', label: 'voicePhoneLabel', desc: 'voicePhoneDesc' },
      { key: 'radio', emoji: '📻', label: 'voiceRadioLabel', desc: 'voiceRadioDesc' },
      { key: 'megaphone', emoji: '📢', label: 'voiceMegaphoneLabel', desc: 'voiceMegaphoneDesc' },
      { key: 'underwater', emoji: '🌊', label: 'voiceUnderwaterLabel', desc: 'voiceUnderwaterDesc' },
      { key: 'chorus', emoji: '👥', label: 'voiceChorusLabel', desc: 'voiceChorusDesc' },
      { key: 'retro', emoji: '👾', label: 'voiceRetroLabel', desc: 'voiceRetroDesc' },
      { key: 'cartoon', emoji: '🎭', label: 'voiceCartoonLabel', desc: 'voiceCartoonDesc' },
    ],
    directRender: (buffer, params) => applyVoiceEffect(buffer, params.effect, params.intensity),
  },

  reverse: {

    abResultFirst: true,
    compactPreview: true,
    transport: true,
    renderedAb: true,

    abCompare: true,

    abWaveform: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    engine: 'webaudio',
    controls: 'none',
    accept: 'audio/*',
    directRender: (buffer) => {
      const out = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: buffer.length, sampleRate: buffer.sampleRate });
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        const src = buffer.getChannelData(c);
        const dst = out.getChannelData(c);
        for (let i = 0; i < src.length; i++) dst[i] = src[src.length - 1 - i];
      }
      return out;
    },
  },

  loop: {

    elementPlayback: true,

    abWaveform: true,
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],

    note: ({ buffer, params, labels, fmtTime }) => {
      if (!buffer) return '';
      const times = Math.max(1, Math.round(Number(params.value) || 1));

      const total = buffer.duration * times - 0.05 * (times - 1);
      return (labels.loopResultNote || '').replace('{len}', fmtTime(total));
    },
    engine: 'webaudio',
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'loopLabel',
    sliderMin: 1,
    sliderMax: 50,
    sliderDefault: 2,
    sliderUnit: 'x',
    sliderStep: 1,

    directRender: (buffer, { value }) => {
      const times = Math.max(1, Math.round(value));
      const sr = buffer.sampleRate;
      const xfade = Math.min(Math.round(sr * 0.05), Math.floor(buffer.length / 4));
      if (times === 1 || xfade < 2) {
        const out = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: buffer.length * times, sampleRate: sr });
        for (let c = 0; c < buffer.numberOfChannels; c++) {
          const src = buffer.getChannelData(c);
          const dst = out.getChannelData(c);
          for (let t = 0; t < times; t++) dst.set(src, t * src.length);
        }
        return out;
      }
      const perRepLength = buffer.length - xfade;
      const totalLength = perRepLength * times + xfade;
      const out = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: totalLength, sampleRate: sr });
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        const src = buffer.getChannelData(c);
        const dst = out.getChannelData(c);
        for (let t = 0; t < times; t++) {
          const offset = t * perRepLength;
          for (let i = 0; i < src.length; i++) {
            let w = 1;
            if (i < xfade && t > 0) w = i / xfade;
            if (i >= src.length - xfade && t < times - 1) w *= (src.length - i) / xfade;
            dst[offset + i] += src[i] * w;
          }
        }
      }
      return out;
    },
  },

  'remove-silence': {

    elementPlayback: true,

    abWaveform: true,
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],

    note: ({ buffer, rendered, labels, fmtTime }) => {
      if (!buffer || !rendered) return '';
      const cut = Math.max(0, buffer.duration - rendered.duration);
      if (cut < 0.05) return labels.silenceNoneNote || '';
      return (labels.silenceResultNote || '')
        .replace('{cut}', fmtTime(cut))
        .replace('{was}', fmtTime(buffer.duration))
        .replace('{now}', fmtTime(rendered.duration));
    },
    engine: 'webaudio',
    controls: 'slider',
    accept: 'audio/*',

    sliderLabel: 'silenceSensitivityLabel',
    sliderMin: 1,
    sliderMax: 10,
    sliderDefault: 4,
    sliderUnit: '',
    sliderStep: 1,
    directRender: (buffer, { value }) => {
      const threshold = (Number(value) || 4) * 0.006;
      const ch0 = buffer.getChannelData(0);
      const keep = new Uint8Array(buffer.length);
      const windowSize = Math.round(buffer.sampleRate * 0.02);
      let keptLength = 0;
      for (let i = 0; i < buffer.length; i += windowSize) {
        let loud = false;
        for (let j = i; j < Math.min(buffer.length, i + windowSize); j++) {
          if (Math.abs(ch0[j]) > threshold) { loud = true; break; }
        }
        if (loud) {
          for (let j = i; j < Math.min(buffer.length, i + windowSize); j++) keep[j] = 1;
          keptLength += Math.min(buffer.length, i + windowSize) - i;
        }
      }
      const out = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: Math.max(1, keptLength), sampleRate: buffer.sampleRate });
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        const src = buffer.getChannelData(c);
        const dst = out.getChannelData(c);
        let w = 0;
        for (let i = 0; i < buffer.length; i++) if (keep[i]) dst[w++] = src[i];
      }
      return out;
    },
  },

  fade: {

    engine: 'webaudio',
    controls: 'fade2',
    accept: 'audio/*',

    abCompare: false,
    compactPreview: true,
    transport: true,
    fadeRegions: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    exportDeck: true,

    fadeMax: 15,
    fadePresets: [
      { key: 'soft', emoji: '🎵', label: 'fadeSoftStartLabel', fadeIn: 2, fadeOut: 0 },
      { key: 'outro', emoji: '🌅', label: 'fadeSmoothEndLabel', fadeIn: 0, fadeOut: 3 },
      { key: 'movie', emoji: '🎬', label: 'fadeMovieLabel', fadeIn: 3, fadeOut: 3 },
      { key: 'music', emoji: '🎧', label: 'fadeMusicLabel', fadeIn: 1, fadeOut: 5 },
      { key: 'none', emoji: '➖', label: 'fadeNoneLabel', fadeIn: 0, fadeOut: 0 },
    ],
    scheduleFade: scheduleFadeAutomation,
    render: (oc, src, { fadeIn, fadeOut }) => {
      const g = oc.createGain();
      scheduleFadeAutomation(g.gain, 0, src.buffer.duration, Number(fadeIn) || 0, Number(fadeOut) || 0, 0);
      src.connect(g);
      return g;
    },
  },

  compress: {

    elementPlayback: true,
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,

    downloadFormats: ['mp3'],

    note: ({ buffer, fileSize, params, labels, size }) => {
      if (!buffer) return '';
      const kbps = Number(params.value) || 128;
      const out = (kbps * 1000 / 8) * buffer.duration;
      return (labels.compressSizeNote || '')
        .replace('{new}', size(out))
        .replace('{old}', size(fileSize || 0));
    },
    engine: 'webaudio',
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'compressLabel',
    sliderMin: 32,
    sliderMax: 320,
    sliderDefault: 128,
    sliderUnit: ' kbps',
    sliderStep: 8,

    snapValues: [32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],

    presets: [
      { key: 'email', label: 'presetEmailLabel', set: { value: 48 } },
      { key: 'messenger', label: 'presetMessengerLabel', set: { value: 96 } },
      { key: 'discord', label: 'presetDiscordLabel', set: { value: 128 } },
      { key: 'archive', label: 'presetArchiveLabel', set: { value: 256 } },
    ],
    render: (oc, src) => src,
    mp3Bitrate: ({ value }) => value,
  },

  'stereo-to-mono': {
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],

    note: ({ buffer, labels }) => (buffer && buffer.numberOfChannels < 2 ? labels.noteAlreadyMono : ''),
    engine: 'webaudio',
    controls: 'select',
    accept: 'audio/*',
    outputChannels: 1,

    selectAsChips: true,
    chipDefault: 'mix',
    selectLabel: 'channelModeLabel',
    selectOptions: [
      { value: 'left', label: 'channelLeftLabel' },
      { value: 'mix', label: 'channelMixLabel' },
      { value: 'right', label: 'channelRightLabel' },
    ],
    directRender: (buffer, { value }) => {
      const ch = Math.min(2, buffer.numberOfChannels);
      const L = buffer.getChannelData(0);
      const R = ch > 1 ? buffer.getChannelData(1) : L;
      const out = new AudioBuffer({ numberOfChannels: 1, length: buffer.length, sampleRate: buffer.sampleRate });
      const dst = out.getChannelData(0);
      const mode = value || 'mix';
      for (let i = 0; i < buffer.length; i++) {
        if (mode === 'left') dst[i] = L[i];
        else if (mode === 'right') dst[i] = R[i];
        else dst[i] = (L[i] + R[i]) / 2;
      }
      return out;
    },
  },

  'mono-to-stereo': {
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],

    note: ({ buffer, labels }) => (buffer && buffer.numberOfChannels >= 2 ? labels.noteAlreadyStereo : ''),
    engine: 'webaudio',
    controls: 'select',
    accept: 'audio/*',
    outputChannels: 2,

    selectAsChips: true,
    chipDefault: 'duplicate',

    chipIcons: {
      panleft: '<svg class="chip-ico" viewBox="0 0 24 24" aria-hidden="true"><g class="sp on" transform="translate(24 0) scale(-1 1)"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.6 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19.1 5a10 10 0 0 1 0 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></g></svg>',
      duplicate: '<svg class="chip-ico" viewBox="0 0 52 24" aria-hidden="true"><g class="sp on" transform="translate(24 0) scale(-1 1)"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.6 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19.1 5a10 10 0 0 1 0 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></g><g class="sp on" transform="translate(28 0)"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.6 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19.1 5a10 10 0 0 1 0 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></g></svg>',
      panright: '<svg class="chip-ico" viewBox="0 0 24 24" aria-hidden="true"><g class="sp on"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.6 8.5a5 5 0 0 1 0 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M19.1 5a10 10 0 0 1 0 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></g></svg>',
    },
    selectLabel: 'channelModeLabel',
    selectOptions: [
      { value: 'panleft', label: 'channelPanLeftLabel' },
      { value: 'duplicate', label: 'channelDuplicateLabel' },
      { value: 'panright', label: 'channelPanRightLabel' },
    ],
    directRender: (buffer, { value }) => {
      const src = buffer.getChannelData(0);
      const out = new AudioBuffer({ numberOfChannels: 2, length: buffer.length, sampleRate: buffer.sampleRate });
      const L = out.getChannelData(0);
      const R = out.getChannelData(1);
      const mode = value || 'duplicate';
      for (let i = 0; i < buffer.length; i++) {
        if (mode === 'panleft') { L[i] = src[i]; R[i] = 0; }
        else if (mode === 'panright') { L[i] = 0; R[i] = src[i]; }
        else { L[i] = src[i]; R[i] = src[i]; }
      }
      return out;
    },
  },

  equalizer: {

    engine: 'webaudio',
    controls: 'eq10',
    accept: 'audio/*',
    abCompare: true,

    compactPreview: true,
    transport: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    exportDeck: true,
    bands: EQ_BANDS,
    eqPresets: [
      { key: 'flat', emoji: '➖', label: 'eqFlatLabel', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { key: 'bass', emoji: '🎵', label: 'eqBassBoostLabel', gains: [7, 6, 5, 3, 1, 0, 0, 0, 0, 0] },
      { key: 'treble', emoji: '✨', label: 'eqTrebleBoostLabel', gains: [0, 0, 0, 0, 0, 1, 3, 5, 6, 7] },
      { key: 'vocal', emoji: '🎤', label: 'eqVocalLabel', gains: [-3, -3, -2, 0, 3, 4, 4, 2, 0, -1] },
      { key: 'rock', emoji: '🎧', label: 'eqRockLabel', gains: [5, 4, 2, -1, -2, 0, 2, 4, 5, 5] },
      { key: 'classical', emoji: '🎼', label: 'eqClassicalLabel', gains: [4, 3, 2, 0, 0, 0, -1, -1, 2, 3] },
      { key: 'movie', emoji: '🎬', label: 'eqMovieLabel', gains: [5, 4, 1, 0, 2, 3, 2, 2, 3, 3] },
      { key: 'radio', emoji: '📻', label: 'eqRadioLabel', gains: [-6, -5, -2, 2, 4, 4, 3, 0, -4, -8] },
    ],

    buildLiveChain: buildEqChain,
    render: (oc, src, params) => buildEqChain(oc, src, params.bands || {}).output,
  },

  'reverb-echo': {

    selectAsChips: true,

    chipHints: [
      { value: 'echo', label: 'reverbPresetEchoLabel', hint: 'reverbHintEcho' },
      { value: 'slapback', label: 'reverbPresetSlapbackLabel', hint: 'reverbHintSlapback' },
      { value: 'room', label: 'reverbPresetRoomLabel', hint: 'reverbHintRoom' },
      { value: 'hall', label: 'reverbPresetHallLabel', hint: 'reverbHintHall' },
    ],
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],

    engine: 'webaudio',
    controls: 'select',
    accept: 'audio/*',
    selectLabel: 'reverbPresetLabel',
    selectOptions: [
      { value: 'echo', label: 'reverbPresetEchoLabel' },
      { value: 'slapback', label: 'reverbPresetSlapbackLabel' },
      { value: 'room', label: 'reverbPresetRoomLabel' },
      { value: 'hall', label: 'reverbPresetHallLabel' },
    ],
    render: (oc, src, { value }) => {
      const preset = value || 'echo';
      const mix = oc.createGain();
      src.connect(mix);
      if (preset === 'echo' || preset === 'slapback') {
        const delay = oc.createDelay(2);
        delay.delayTime.value = preset === 'slapback' ? 0.09 : 0.28;
        const feedback = oc.createGain();
        feedback.gain.value = preset === 'slapback' ? 0.15 : 0.45;
        const wet = oc.createGain();
        wet.gain.value = 0.55;
        src.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(wet);
        wet.connect(mix);
        return mix;
      }
      const durationSec = preset === 'hall' ? 2.6 : 1.1;
      const decay = preset === 'hall' ? 2.2 : 3.5;
      const length = Math.max(1, Math.round(oc.sampleRate * durationSec));
      const impulse = oc.createBuffer(2, length, oc.sampleRate);
      for (let c = 0; c < 2; c++) {
        const data = impulse.getChannelData(c);
        for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
      const convolver = oc.createConvolver();
      convolver.buffer = impulse;
      convolver.normalize = true;
      const wet = oc.createGain();
      wet.gain.value = preset === 'hall' ? 0.5 : 0.35;
      src.connect(convolver);
      convolver.connect(wet);
      wet.connect(mix);
      return mix;
    },
  },

  ringtone: {

    elementPlayback: true,

    engine: 'ringtone-hybrid',
    controls: 'ringtone-targets',
    accept: 'audio/*',
    oggSampleRate: 24000,
    targets: [

      { key: 'iphone', emoji: '📱', name: 'iPhone', fmt: 'm4r', max: 30 },
      { key: 'android', emoji: '🤖', name: 'Android', fmt: 'mp3', max: 0 },
      { key: 'telegram', emoji: '✈️', name: 'Telegram', fmt: 'ogg', max: 0 },
      { key: 'whatsapp', emoji: '💬', name: 'WhatsApp', fmt: 'ogg', max: 0 },
      { key: 'alarm', emoji: '⏰', name: 'Alarm', fmt: 'mp3', max: 0, louder: true },
      { key: 'notify', emoji: '🔔', name: 'Notification', fmt: 'mp3', max: 8 },
      { key: 'tiktok', emoji: '🎬', name: 'TikTok / Reels', fmt: 'mp3', max: 60 },
      { key: 'pc', emoji: '🖥️', name: 'PC', fmt: 'wav', max: 0 },
    ],
    buildOpusArgs: ([inp], out) => ['-i', inp, '-ar', '24000', '-c:a', 'libopus', '-b:a', '48k', out],
    buildOggVorbisArgs: ([inp], out) => ['-i', inp, '-c:a', 'libvorbis', '-b:a', '96k', out],

    buildAacArgs: ([inp], out) => ['-i', inp, '-c:a', 'aac', '-b:a', '192k', out],
  },

  'video-to-audio': {

    elementPlayback: true,
    engine: 'ffmpeg',
    controls: 'convert',
    accept: 'video/*',
    compactPreview: true,
    transport: true,
    runLabel: 'extractRunLabel',
    formats: ['mp3', 'm4a', 'wav'],

    showNormalize: true,
    output: (params) => {
      const map = { mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav' };
      return { outputName: `out.${params.format}`, mimeType: map[params.format] || 'audio/mpeg', ext: params.format };
    },
    buildArgs: ([inp], out, { format, bitrate, normalize }) => {
      const af = normalize ? ['-af', 'loudnorm=I=-16:TP=-1.5:LRA=11'] : [];
      if (format === 'wav') return ['-i', inp, '-vn', ...af, out];
      if (format === 'm4a') return ['-i', inp, '-vn', ...af, '-c:a', 'aac', '-b:a', `${bitrate}k`, out];
      return ['-i', inp, '-vn', ...af, '-b:a', `${bitrate}k`, out];
    },
  },

  'sample-rate': {
    renderedAb: true,

    engine: 'webaudio',
    controls: 'rate1',
    accept: 'audio/*',
    compactPreview: true,
    transport: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],

    mp3Rates: [8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000],
    rateOptions: [
      { value: 8000, label: '8 000 Hz' },
      { value: 16000, label: '16 000 Hz' },
      { value: 22050, label: '22 050 Hz' },
      { value: 44100, label: '44 100 Hz (CD)' },
      { value: 48000, label: '48 000 Hz' },
      { value: 96000, label: '96 000 Hz' },
    ],
    render: (oc, src) => src,
    outputSampleRate: ({ value }) => Number(value),
  },

  chiptune: {

    selectAsChips: true,
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],

    engine: 'webaudio',
    controls: 'select',
    accept: 'audio/*',
    selectLabel: 'chiptunePresetLabel',
    selectOptions: [
      { value: 'nes', label: 'chiptuneNesLabel' },
      { value: 'gameboy', label: 'chiptuneGameboyLabel' },
      { value: 'lofi', label: 'chiptuneLofiLabel' },
    ],
    directRender: (buffer, { value }) => {
      const presets = { nes: { rate: 8000, bits: 4 }, gameboy: { rate: 9500, bits: 3 }, lofi: { rate: 11025, bits: 5 } };
      const { rate, bits } = presets[value] || presets.nes;
      const sr = buffer.sampleRate;
      const step = Math.max(1, Math.round(sr / rate));
      const levels = Math.pow(2, bits);
      const out = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: buffer.length, sampleRate: sr });
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        const src = buffer.getChannelData(c);
        const dst = out.getChannelData(c);
        let held = 0;
        for (let i = 0; i < src.length; i++) {
          if (i % step === 0) held = Math.max(-1, Math.min(1, Math.round(src[i] * (levels / 2)) / (levels / 2)));
          dst[i] = held;
        }
      }
      return out;
    },
  },

  visualizer: {

    engine: 'ffmpeg',
    controls: 'vizstyles',
    accept: 'audio/*',
    previewSeconds: 6,
    runLabel: 'vizDownloadLabel',

    noWaveform: true,
    vizStyles: [
      { key: 'wave-green', emoji: '\u3030\uFE0F', label: 'visualizerWaveGreenLabel' },
      { key: 'wave-blue', emoji: '\uD83C\uDF0A', label: 'visualizerWaveBlueLabel' },
      { key: 'bars', emoji: '\uD83D\uDCCA', label: 'visualizerBarsLabel' },
      { key: 'spectrum', emoji: '\uD83C\uDF08', label: 'visualizerSpectrumLabel' },
      { key: 'circle', emoji: '\u26AA', label: 'visualizerCircleLabel', stereo: true },
      { key: 'volume', emoji: '\uD83D\uDCC8', label: 'visualizerVolumeLabel' },
      { key: 'musical', emoji: '\uD83C\uDFB9', label: 'visualizerMusicalLabel', slow: true },
      { key: 'freqline', emoji: '\uD83D\uDCC9', label: 'visualizerFreqLineLabel' },
      { key: 'wavepoint', emoji: '\u2728', label: 'visualizerWavePointLabel' },
      { key: 'polar', emoji: '\uD83C\uDF00', label: 'visualizerPolarLabel', stereo: true },
    ],
    vizSizes: [
      { key: '854x480', label: '480p' },
      { key: '1280x720', label: '720p' },
      { key: '1920x1080', label: '1080p' },
    ],
    output: () => ({ outputName: 'out.mp4', mimeType: 'video/mp4', ext: 'mp4' }),
    buildArgs: ([inp], out, params) => {
      const size = params.size || '1280x720';
      const filters = {
        'wave-green': `showwaves=s=${size}:mode=cline:colors=0x4ade9e`,
        'wave-blue': `showwaves=s=${size}:mode=cline:colors=0x4a9eff`,
        bars: `showfreqs=s=${size}:mode=bar:ascale=log:colors=0x4ade9e`,
        spectrum: `showspectrum=s=${size}:mode=combined:color=intensity`,
        circle: `avectorscope=s=${size}:zoom=1.5:draw=line:rc=74:gc=222:bc=158`,

        musical: `showcqt=s=${size}`,
        freqline: `showfreqs=s=${size}:mode=line:ascale=log:colors=0x4ade9e`,
        wavepoint: `showwaves=s=${size}:mode=point:colors=0x4ade9e`,

        polar: `avectorscope=s=${size}:mode=polar:zoom=1.5:draw=line:rc=74:gc=222:bc=158`,
        volume: `showvolume=w=${Math.round(Number(size.split('x')[0]) * 0.75)}:h=60:f=0.5:c=VOLUME,pad=${size.replace('x', ':')}:(ow-iw)/2:(oh-ih)/2`,
      };
      const filter = filters[params.value] || filters['wave-green'];
      const args = ['-i', inp];

      if (params.previewSeconds) args.push('-t', String(params.previewSeconds));
      args.push(
        '-filter_complex', `[0:a]${filter}[v]`,
        '-map', '[v]', '-map', '0:a',

        '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '26',
        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', out,
      );
      return args;
    },
  },

  denoise: {

    engine: 'ffmpeg',
    controls: 'select',
    accept: 'audio/*',

    compactPreview: true,

    abCompare: false,

    formats: ['mp3', 'wav', 'm4a'],
    runLabel: 'denoiseRunLabel',

    elementPlayback: true,

    selectAsChips: true,
    selectLabel: 'denoiseStrengthLabel',
    selectOptions: [
      { value: 'light', label: 'strengthLightLabel' },
      { value: 'medium', label: 'strengthMediumLabel' },
      { value: 'strong', label: 'strengthStrongLabel' },
    ],
    output: (params) => {
      const format = params.format || 'mp3';
      if (format === 'wav') return { outputName: 'out.wav', mimeType: 'audio/wav', ext: 'wav' };
      if (format === 'm4a') return { outputName: 'out.m4a', mimeType: 'audio/mp4', ext: 'm4a' };
      return MP3_OUT;
    },
    buildArgs: ([inp], out, params) => {
      const nr = { light: 6, medium: 12, strong: 22 }[params.value] || 12;
      const format = params.format || 'mp3';
      if (format === 'wav') return ['-i', inp, '-af', denoiseFilter(nr), out];
      if (format === 'm4a') return ['-i', inp, '-af', denoiseFilter(nr), '-c:a', 'aac', '-b:a', '192k', out];
      return ['-i', inp, '-af', denoiseFilter(nr), '-b:a', '192k', out];
    },
  },

  enhance: {

    engine: 'ffmpeg',
    controls: 'select',
    accept: 'audio/*',
    presetCards: true,
    abCompare: true,
    compactPreview: true,
    runLabel: 'enhanceRunLabel',

    formats: ['mp3', 'wav', 'm4a'],
    selectLabel: 'enhancePresetLabel',

    selectOptions: [
      { value: 'auto', emoji: '✨', label: 'enhanceAutoOptionLabel', hero: true, desc: 'enhanceAutoDesc' },
      { value: 'voice', emoji: '🎤', label: 'enhanceVoiceLabel', desc: 'enhanceVoiceDesc' },
      { value: 'podcast', emoji: '🎙', label: 'enhancePodcastLabel', desc: 'enhancePodcastDesc' },
      { value: 'music', emoji: '🎵', label: 'enhanceMusicLabel', desc: 'enhanceMusicDesc' },
      { value: 'call', emoji: '📞', label: 'enhanceCallLabel', desc: 'enhanceCallDesc' },
      { value: 'old', emoji: '📼', label: 'enhanceOldLabel', desc: 'enhanceOldDesc' },
      { value: 'room', emoji: '👥', label: 'enhanceRoomLabel', desc: 'enhanceRoomDesc' },
    ],
    output: (params) => {
      const format = params.format || 'mp3';
      if (format === 'wav') return { outputName: 'out.wav', mimeType: 'audio/wav', ext: 'wav' };
      if (format === 'm4a') return { outputName: 'out.m4a', mimeType: 'audio/mp4', ext: 'm4a' };
      return MP3_OUT;
    },
    buildArgs: ([inp], out, params) => {
      const presets = {
        auto: { nr: 10, i: -16, hp: 0, presence: 0 },
        voice: { nr: 10, i: -16, hp: 100, presence: 3 },
        podcast: { nr: 8, i: -16, hp: 80, presence: 2 },
        music: { nr: 4, i: -14, hp: 0, presence: 0 },
        call: { nr: 16, i: -16, hp: 200, presence: 4 },
        old: { nr: 20, i: -16, hp: 90, presence: 1 },

        room: { nr: 14, i: -16, hp: 120, presence: 5 },
      };
      const p = presets[params.value] || presets.auto;
      const filters = [denoiseFilter(p.nr)];
      if (p.hp) filters.push(`highpass=f=${p.hp}`);
      if (p.presence) filters.push(`equalizer=f=3000:t=q:w=1.5:g=${p.presence}`);
      filters.push(`loudnorm=I=${p.i}:TP=-1.5:LRA=11`);
      const format = params.format || 'mp3';
      if (format === 'wav') return ['-i', inp, '-af', filters.join(','), out];
      if (format === 'm4a') return ['-i', inp, '-af', filters.join(','), '-c:a', 'aac', '-b:a', '192k', out];
      return ['-i', inp, '-af', filters.join(','), '-b:a', '192k', out];
    },
  },

  dictaphone: {

    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    engine: 'webaudio',
    controls: 'recorder',

    trimSelection: true,
    directRender: (buffer, { start, end }) => {
      const s = start || 0;
      const e = end ?? buffer.duration;
      if (s <= 0.001 && e >= buffer.duration - 0.001) return buffer;
      return sliceBuffer(buffer, s, e);
    },
  },
  'vocal-range': {
    engine: 'webaudio',
    controls: 'analyze',
    accept: 'audio/*',
    compactPreview: true,
    transport: true,
    report: ({ buffer, labels, tools }) => {
      const r = tools.analyzeVocalRange(buffer);
      if (!r) return null;
      const octaves = (r.semitones / 12);
      return {
        headline: (labels.rangeHeadline || '{low} – {high}').replace('{low}', r.low.name).replace('{high}', r.high.name),
        rows: [
          { label: labels.rangeLowestLabel, value: r.low.name + ' (' + r.lowHz.toFixed(1) + ' ' + (labels.unitHz || 'Hz') + ')' },
          { label: labels.rangeHighestLabel, value: r.high.name + ' (' + r.highHz.toFixed(1) + ' ' + (labels.unitHz || 'Hz') + ')' },
          { label: labels.rangeWidthLabel, value: r.semitones + ' / ' + octaves.toFixed(1) },
        ],
        hint: labels.rangeHint,
      };
    },
  },
  'detect-key': {
    engine: 'webaudio',
    controls: 'analyze',
    accept: 'audio/*',
    compactPreview: true,
    transport: true,
    report: ({ buffer, labels, tools }) => {
      const k = tools.detectKey(buffer);
      if (!k) return null;
      const modeName = k.mode === 'major' ? labels.keyMajorLabel : labels.keyMinorLabel;

      const conf = k.score > 0.75 ? labels.keyConfHigh : k.score > 0.55 ? labels.keyConfMid : labels.keyConfLow;
      return {
        headline: k.name + ' ' + modeName,
        rows: [
          { label: labels.keyTonicLabel, value: k.name },
          { label: labels.keyModeLabel, value: modeName },
          { label: labels.keyConfidenceLabel, value: conf, state: k.score > 0.55 ? 'ok' : 'bad' },
        ],
        hint: labels.keyHint,
      };
    },
  },
  'audiobook-check': {
    engine: 'webaudio',
    controls: 'analyze',
    accept: 'audio/*',
    compactPreview: true,
    transport: true,
    report: ({ buffer, labels, tools }) => {
      const a = tools.analyzeAudiobook(buffer);
      const db = (x) => (isFinite(x) ? x.toFixed(1) + ' ' + (labels.unitDb || 'dB') : '-∞');
      const allOk = a.rmsOk && a.peakOk && a.floorOk;
      return {
        headline: allOk ? labels.acxPassLabel : labels.acxFailLabel,
        rows: [
          { label: labels.acxRmsLabel, value: db(a.rmsDb), state: a.rmsOk ? 'ok' : 'bad' },
          { label: labels.acxPeakLabel, value: db(a.peakDb), state: a.peakOk ? 'ok' : 'bad' },
          { label: labels.acxFloorLabel, value: db(a.floorDb), state: a.floorOk ? 'ok' : 'bad' },
        ],
        hint: allOk ? labels.acxHintPass : labels.acxHintFail,
      };
    },
  },
  tempo: {

    abWaveform: true,
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    engine: 'webaudio',
    controls: 'tempo',
    accept: 'audio/*',
    note: ({ buffer, params, labels, fmtTime }) => {
      if (!buffer) return '';
      const from = Number(params.bpmFrom) || 0;
      const to = Number(params.bpmTo) || 0;

      if (!from || !to) return '';
      return (labels.bpmResultNote || '')
        .replace('{pct}', String(Math.round((to / from) * 100)))
        .replace('{len}', fmtTime(buffer.duration * (from / to)));
    },

    directRender: (buffer, { bpmFrom, bpmTo }) => {
      const from = Number(bpmFrom) || 0;
      const to = Number(bpmTo) || 0;
      if (!from || !to || from === to) return buffer;
      return wsolaStretch(buffer, from / to);
    },
  },
  mix: {

    engine: 'webaudio-mix',
    controls: 'multi-file',
    accept: 'audio/*',
    compactPreview: true,
    transport: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],

    perFileVolume: true,

    renderedAb: true,
    runLabel: 'mixRunLabel',
  },
  'split-audio': {

    compactPreview: true,
    transport: true,
    engine: 'webaudio',
    controls: 'split',
    accept: 'audio/*',
    splitFormats: ['mp3', 'wav'],
    note: ({ buffer, params, labels, fmtTime }) => {
      if (!buffer) return '';
      const parts = splitPlan(buffer.duration, params);
      if (parts.length < 2) return labels.splitTooFewNote || '';
      return (labels.splitPlanNote || '')
        .replace('{n}', String(parts.length))
        .replace('{len}', fmtTime(parts[0].end - parts[0].start));
    },
  },
  'add-silence': {

    elementPlayback: true,

    abWaveform: true,
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    engine: 'webaudio',
    controls: 'silence2',
    accept: 'audio/*',
    note: ({ buffer, params, labels, fmtTime }) => {
      if (!buffer) return '';
      const a = Number(params.silenceStart) || 0;
      const b = Number(params.silenceEnd) || 0;

      return (labels.addSilenceNote || '').replace('{len}', fmtTime(buffer.duration + a + b));
    },
    directRender: (buffer, { silenceStart, silenceEnd }) => {
      const sr = buffer.sampleRate;
      const head = Math.max(0, Math.round((Number(silenceStart) || 0) * sr));
      const tail = Math.max(0, Math.round((Number(silenceEnd) || 0) * sr));
      const out = new AudioBuffer({
        numberOfChannels: buffer.numberOfChannels,
        length: head + buffer.length + tail,
        sampleRate: sr,
      });
      for (let c = 0; c < buffer.numberOfChannels; c++) out.getChannelData(c).set(buffer.getChannelData(c), head);
      return out;
    },
  },
  'dynamic-compressor': {

    elementPlayback: true,
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    engine: 'webaudio',
    controls: 'select',
    accept: 'audio/*',

    selectAsChips: true,

    chipHints: [
      { value: 'voice', label: 'compressorVoiceLabel', hint: 'compressorVoiceHint' },
      { value: 'podcast', label: 'compressorPodcastLabel', hint: 'compressorPodcastHint' },
      { value: 'music', label: 'compressorMusicLabel', hint: 'compressorMusicHint' },
      { value: 'hard', label: 'compressorHardLabel', hint: 'compressorHardHint' },
    ],
    selectLabel: 'compressorPresetLabel',
    selectOptions: [
      { value: 'voice', label: 'compressorVoiceLabel' },
      { value: 'podcast', label: 'compressorPodcastLabel' },
      { value: 'music', label: 'compressorMusicLabel' },
      { value: 'hard', label: 'compressorHardLabel' },
    ],
    render: (oc, src, { value }) => {
      const presets = {
        voice:   { threshold: -24, ratio: 4,  attack: 0.005, release: 0.20, knee: 6,  makeup: 1.8 },
        podcast: { threshold: -20, ratio: 3,  attack: 0.010, release: 0.25, knee: 10, makeup: 1.5 },
        music:   { threshold: -18, ratio: 2.5, attack: 0.020, release: 0.30, knee: 12, makeup: 1.3 },
        hard:    { threshold: -30, ratio: 8,  attack: 0.003, release: 0.15, knee: 3,  makeup: 2.6 },
      };
      const cfg = presets[value] || presets.voice;
      const comp = oc.createDynamicsCompressor();
      comp.threshold.value = cfg.threshold;
      comp.ratio.value = cfg.ratio;
      comp.attack.value = cfg.attack;
      comp.release.value = cfg.release;
      comp.knee.value = cfg.knee;

      const gain = oc.createGain();
      gain.gain.value = cfg.makeup;
      src.connect(comp);
      comp.connect(gain);
      return gain;
    },
  },

  'sound-meter': {
    engine: 'webaudio',
    controls: 'sound-meter',
  },

  'mic-noise': {
    engine: 'webaudio',
    controls: 'mic-noise',
  },

  'mic-test': {
    engine: 'webaudio',
    controls: 'mic-test',
  },

  'sound-test': {
    engine: 'tone',
    controls: 'sound-test',
  },

  'white-noise': {

    engine: 'noise',
    controls: 'noise',
    color: 'white',
    downloadLengths: [60, 300, 600, 1800],
    downloadFormats: ['mp3', 'wav'],
  },

  'pink-noise': {

    engine: 'noise',
    controls: 'noise',
    color: 'pink',
    downloadLengths: [60, 300, 600, 1800],
    downloadFormats: ['mp3', 'wav'],
  },
  'brown-noise': {

    engine: 'noise',
    controls: 'noise',
    color: 'brown',
    downloadLengths: [60, 300, 600, 1800],
    downloadFormats: ['mp3', 'wav'],
  },
};

export const EDITOR_TOOLS = ['trim', 'equalizer', 'volume', 'normalize', 'speed', 'pitch'];
