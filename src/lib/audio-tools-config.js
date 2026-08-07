// One entry per audio tool. `engine: 'webaudio'` tools run entirely on the native Web Audio
// API (src/lib/web-audio-engine.js) -- no ffmpeg, no ~32 MB download, and the decoded buffer
// lets the UI draw a waveform and let the user listen to the result before downloading.
// `engine: 'ffmpeg'` is reserved for the few things Web Audio genuinely can't do: real
// format/codec transcoding (convert, ringtone's final export), reading a video container
// (video-to-audio), muxing a video output (visualizer), and spectral noise reduction
// (denoise/enhance -- no native noise-reduction node exists in Web Audio).
import { wsolaStretch, pitchShift, resampleLinear } from './web-audio-engine.js';

const MP3_OUT = { outputName: 'out.mp3', mimeType: 'audio/mpeg', ext: 'mp3' };

// Standard ISO octave centres for a 10-band graphic EQ. Q of 1.41 is the usual choice at
// one-octave spacing -- narrow enough that bands stay distinct, wide enough that all ten set
// flat sums back to a flat response.
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

// Writes a linear fade-in/fade-out envelope onto a GainNode's `gain` AudioParam.
//
// `offset` is where playback starts inside the track (0 for an offline render, the current
// position when re-scheduling a live preview mid-playback) and `now` is the context clock time
// that offset corresponds to. Everything is expressed relative to those two so the SAME function
// drives both the live preview and the exported file -- there's no second implementation that
// could drift from what the user actually heard.
//
// Linear rather than exponential: exponential can't reach or leave true zero, so it needs a
// 0.0001 fudge at both ends, and over a long fade the early part is nearly inaudible, which
// reads as "the fade doesn't start until later".
function scheduleFadeAutomation(param, offset, total, fadeIn, fadeOut, now) {
  const fi = Math.max(0, Math.min(fadeIn, total));
  // Overlapping fades would fight over the same stretch of time; give fade-in what it asked for
  // and let fade-out use whatever is left.
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

// ---- Voice effects -------------------------------------------------------------------------
// Every effect here is something Web Audio can genuinely do well offline. There is deliberately
// no "make it sound like a woman/man" effect: that needs real voice conversion, which a
// pitch shift plus some EQ cannot fake convincingly.

// Runs a node graph over a buffer in an OfflineAudioContext and hands back the rendered result.
function renderGraph(buffer, build) {
  const oc = new OfflineAudioContext(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  const src = oc.createBufferSource();
  src.buffer = buffer;
  build(oc, src).connect(oc.destination);
  src.start(0);
  return oc.startRendering();
}

// tanh-shaped soft clipping. `drive` above ~3 starts sounding genuinely broken up, which is
// exactly what the megaphone/radio effects want.
function distortionCurve(drive) {
  const curve = new Float32Array(1024);
  for (let i = 0; i < 1024; i++) {
    const x = (i / 1023) * 2 - 1;
    curve[i] = Math.tanh(x * drive);
  }
  return curve;
}

// Band-limits the signal, which is what actually sells "telephone"/"radio"/"megaphone" -- the
// characteristic sound of those devices is mostly their narrow frequency response.
function bandPass(oc, src, lowHz, highHz) {
  const hp = oc.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = lowHz; hp.Q.value = 0.7;
  const lp = oc.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = highHz; lp.Q.value = 0.7;
  src.connect(hp); hp.connect(lp);
  return lp;
}

// Mixes processed and dry signal by `amount` (0..1) so the intensity slider does something
// meaningful for every effect rather than only for a few.
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
  // 0 % must be a true no-op, and the slider should never fully mute the character of an
  // effect the user explicitly picked, so it maps onto a 0.15..1 blend rather than 0..1.
  const amount = Math.max(0, Math.min(1, (Number(intensityPct) || 0) / 100));
  const mix = 0.15 + amount * 0.85;
  const sr = buffer.sampleRate;
  let wet;

  if (effect === 'robot') {
    // Ring modulation: multiply by a steady low-frequency sine. That single operation is what
    // strips the natural pitch variation out of speech and makes it sound machine-generated.
    const carrier = 45 + amount * 35;
    wet = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: buffer.length, sampleRate: sr });
    for (let c = 0; c < buffer.numberOfChannels; c++) {
      const d = buffer.getChannelData(c);
      const o = wet.getChannelData(c);
      for (let i = 0; i < d.length; i++) o[i] = d[i] * Math.sin((2 * Math.PI * carrier * i) / sr);
    }
    wet = await renderGraph(wet, (oc, src) => bandPass(oc, src, 200, 4000));
  } else if (effect === 'phone') {
    wet = await renderGraph(buffer, (oc, src) => {
      const bp = bandPass(oc, src, 300, 3400);
      const g = oc.createGain(); g.gain.value = 1.5;
      bp.connect(g);
      return g;
    });
  } else if (effect === 'radio') {
    wet = await renderGraph(buffer, (oc, src) => {
      const bp = bandPass(oc, src, 200, 5000);
      const sh = oc.createWaveShaper(); sh.curve = distortionCurve(1.6); sh.oversample = '2x';
      const g = oc.createGain(); g.gain.value = 1.3;
      bp.connect(sh); sh.connect(g);
      return g;
    });
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
    // Bit-depth quantization plus sample-and-hold decimation -- the two things that actually
    // make audio sound like an early digital toy. Smooth resampling alone just sounds muffled.
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

// Returns the chain's last node plus the filter list, so the live-preview caller can keep the
// filters around and tweak `.gain.value` on them while audio is playing (that's what makes
// dragging a slider audible instantly instead of needing a re-render).
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
    // Sample-rate/channel dropdowns -- gated to just this tool (not video-to-audio, which
    // reuses the same 'convert' controls block) so that one stays simple. Format list expanded
    // from the original 6 based on ffmpegwasm/ffmpeg.wasm's actual Dockerfile (checked directly,
    // not guessed) -- libmp3lame/libvorbis/libopus are compiled in, plus ffmpeg's own native
    // codecs (wmav2, aiff/pcm) that need no external library at all.
    advancedConvert: true,
    runLabel: 'convertLabel',
    // Waveform replaced with a plain "file loaded, tap to listen" bar -- a converter doesn't
    // need the visual, and the canvas render was extra weight for no real benefit here.
    simplePreview: true,
    // Batch: files process sequentially (never in parallel -- ffmpeg.wasm is a single shared
    // instance) with a fresh instance between each (see the runBtn handler's comment on why).
    // Limits are deliberately explicit and shown in the UI/FAQ rather than left as "however
    // much your device can handle" -- 20 files / 2GB combined is generous for the free-tool
    // tier without inviting someone to queue up their entire music library.
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
        // libopus's 48kHz internal resample path is a confirmed ffmpeg.wasm crash (see the
        // ringtone config's comment for the full writeup) -- force a safe rate regardless of
        // the sample-rate dropdown rather than let a user pick their way into that crash.
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
    // Was a plain slice with no fade and no way to remove a middle section instead of keeping
    // it -- both real gaps vs. competitors. directRender replaces the old node-graph slice so
    // fades and the cut-out mode can be applied directly on the sample data.
    engine: 'webaudio',
    controls: 'trim',
    accept: 'audio/*',
    // Was MP3-or-WAV via two buttons that only appeared after a "Process" step. Now the same
    // export bar every other tool has: pick a format, download. The play button previews the
    // exact result, so there's nothing left for a separate Process step to do.
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
    // Unlike the single-file tools there IS nothing to download until the files have actually
    // been joined, so this one keeps its action button -- it just leads to a waveform you can
    // listen to before exporting, instead of straight to a file.
    downloadFormats: ['wav', 'mp3', 'ogg'],
    exportDeck: true,
    runLabel: 'mergeRunLabel',
  },

  volume: {
    // Deliberately minimal: one slider. A gain change is cheap enough to run as a LIVE node, so
    // the preview updates as you drag instead of re-rendering the file -- same approach as the
    // EQ and fade tools. Loudness normalisation and compression live on their own pages.
    engine: 'webaudio',
    controls: 'volume1',
    accept: 'audio/*',
    // No Original/Result switch: comparing loudness A/B is a rigged test anyway -- the louder
    // side always wins -- and the whole point here is one slider and nothing else.
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
    renderedAb: true,
    // TEMPO only. Pitch is preserved by default (WSOLA time-stretch) because that's what people
    // actually want when speeding up a lecture or slowing music down to learn a part -- the old
    // playbackRate behaviour made everything sound like a chipmunk or a monster.
    // The "keep pitch" checkbox can be turned off for the deliberate tape/vinyl effect. That is
    // NOT a duplicate of the pitch tool: this changes tempo (and lets pitch follow), the pitch
    // tool changes pitch while holding tempo. Neither borrows the other's control.
    engine: 'webaudio',
    controls: 'speed1',
    accept: 'audio/*',
    // No Original/Result switch here: at a different tempo the two aren't comparable moment to
    // moment the way they are for EQ or fades -- you'd be A/B-ing two tracks of different
    // lengths. A plain Reset back to 1x is what's actually useful.
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
      // 200% speed -> half the length. wsolaStretch takes an output/input length ratio.
      return keepPitch === false ? resampleLinear(buffer, pct / 100) : wsolaStretch(buffer, 100 / pct);
    },
  },

  pitch: {
    renderedAb: true,
    // MUSIC transposition only -- one semitone slider and nothing else. Voice-character presets
    // deliberately do NOT live here; they belong to the separate voice-effects tool, so the two
    // pages don't turn into duplicates competing for the same searches.
    // Real pitch-shift with tempo locked (resample + WSOLA), not the old playbackRate trick that
    // changed speed along with pitch.
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
    // Cents are hundredths of a semitone -- the fine-tuning musicians actually need: matching a
    // recording that drifted off-pitch, lining two takes up that sit a quarter-tone apart, or
    // retuning to A=432 instead of 440. Still the same single job (pitch), just a finer step.
    centsMin: -50,
    centsMax: 50,
    directRender: (buffer, { value, cents }) => pitchShift(buffer, (value || 0) + (cents || 0) / 100),
  },

  voice: {
    renderedAb: true,
    // VOICE EFFECTS, deliberately not "voice conversion". With Web Audio alone (no AI, no
    // server) you cannot convincingly turn one person's voice into another's -- pitch shifting
    // plus filtering just doesn't get there, and promising it would leave people disappointed.
    // So the whole page is framed as effects that genuinely do sound right computed locally.
    // Also: no semitone control anywhere here on purpose -- that's the pitch tool's job, and
    // exposing one would make these two pages duplicates competing for the same searches.
    engine: 'webaudio',
    controls: 'voicefx',
    accept: 'audio/*',
    abCompare: true,
    compactPreview: true,
    transport: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    exportDeck: true,
    voiceEffects: [
      { key: 'robot', emoji: '🤖', label: 'voiceRobotLabel', desc: 'voiceRobotDesc' },
      { key: 'phone', emoji: '📞', label: 'voicePhoneLabel', desc: 'voicePhoneDesc' },
      { key: 'radio', emoji: '📻', label: 'voiceRadioLabel', desc: 'voiceRadioDesc' },
      { key: 'megaphone', emoji: '📢', label: 'voiceMegaphoneLabel', desc: 'voiceMegaphoneDesc' },
      { key: 'retro', emoji: '👾', label: 'voiceRetroLabel', desc: 'voiceRetroDesc' },
      { key: 'deep', emoji: '🎙', label: 'voiceDeepLabel', desc: 'voiceDeepDesc' },
      { key: 'high', emoji: '🐿', label: 'voiceHighLabel', desc: 'voiceHighDesc' },
      { key: 'cartoon', emoji: '🎭', label: 'voiceCartoonLabel', desc: 'voiceCartoonDesc' },
    ],
    directRender: (buffer, params) => applyVoiceEffect(buffer, params.effect, params.intensity),
  },

  reverse: {
    compactPreview: true,
    transport: true,
    renderedAb: true,
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
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    // Length is exactly predictable without rendering: N copies less one crossfade per seam.
    note: ({ buffer, params, labels, fmtTime }) => {
      if (!buffer) return '';
      const times = Math.max(1, Math.round(Number(params.value) || 1));
      if (times < 2) return '';
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
    // 50ms crossfade at each seam so repeats don't click/pop at the boundary -- plain
    // concatenation (the old behavior) sounds like an audible edit at every loop point.
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
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    // Only knowable after a render, so this stays empty until the user presses play or exports.
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
    // Was a hardcoded 0.02 threshold with zero user control -- now a 1-10 sensitivity slider
    // mapped onto a 0.006-0.06 amplitude range (1 = only cut near-total silence, 10 = aggressive).
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
    // Fade in / fade out only -- everything else (trim, volume, EQ...) has its own page.
    // Preview is live: a single GainNode whose automation is (re)scheduled from the current
    // playback position, so moving a slider is audible immediately without re-rendering.
    // scheduleFadeAutomation is shared with the offline export render below, so the preview and
    // the downloaded file follow exactly the same curve.
    engine: 'webaudio',
    controls: 'fade2',
    accept: 'audio/*',
    abCompare: true,
    compactPreview: true,
    transport: true,
    fadeRegions: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    exportDeck: true,
    readyNote: true,
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
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    // MP3 only: the whole tool is "same audio, smaller file", and every other format here
    // would either ignore the bitrate (WAV) or need a different quality scale (OGG).
    downloadFormats: ['mp3'],
    // Constant-bitrate MP3 size is arithmetic, not a guess: kbps x seconds / 8.
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
    // MPEG-1 Layer III defines exactly these bitrates. A free-running slider offered values like
    // 150 kbps, which does not exist -- the encoder quietly rounded to 160 and the file came out
    // bigger than the number on screen promised. Measured: asked 150, got a 160 kbps file.
    // The slider now snaps to the ladder, so the displayed number is always the real one.
    snapValues: [32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
    // Quick-pick buttons under the slider -- each just sets the bitrate to a size target
    // people actually search for, rather than making them guess a kbps number.
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
    // Converting a file that is already mono produces an identical file.
    note: ({ buffer, labels }) => (buffer && buffer.numberOfChannels < 2 ? labels.noteAlreadyMono : ''),
    engine: 'webaudio',
    controls: 'select',
    accept: 'audio/*',
    outputChannels: 1,
    selectLabel: 'channelModeLabel',
    selectOptions: [
      { value: 'mix', label: 'channelMixLabel' },
      { value: 'left', label: 'channelLeftLabel' },
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
    // Feeding a real stereo file to this discards the right channel entirely -- channel 0 is
    // read and copied to both sides. Silently losing half a recording is the kind of thing
    // people only notice later, so it gets said up front.
    note: ({ buffer, labels }) => (buffer && buffer.numberOfChannels >= 2 ? labels.noteAlreadyStereo : ''),
    engine: 'webaudio',
    controls: 'select',
    accept: 'audio/*',
    outputChannels: 2,
    selectLabel: 'channelModeLabel',
    selectOptions: [
      { value: 'duplicate', label: 'channelDuplicateLabel' },
      { value: 'panleft', label: 'channelPanLeftLabel' },
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
    // Deliberately the most "hands-on" tool in the set: a real 10-band graphic EQ and nothing
    // else. No denoise/normalize/limiter/compressor here on purpose -- those all live on their
    // own pages, and mixing them in is what makes competitors' EQ pages feel like a dumping
    // ground. Preview is a LIVE Web Audio filter chain (see buildLiveChain), so dragging a
    // slider is audible instantly instead of re-rendering the whole file per input event; the
    // same band values feed an OfflineAudioContext render only when exporting.
    engine: 'webaudio',
    controls: 'eq10',
    accept: 'audio/*',
    abCompare: true,
    // Same one-row player as the enhance tool (play button beside the waveform, not floating on
    // top of it) -- an overlaid button both obscured the waveform and, being absolutely
    // positioned, was fragile against the shared hover rule.
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
    // Both the live preview chain and the offline export render go through buildEqChain, so
    // what you hear while dragging is exactly what gets written to the file.
    buildLiveChain: buildEqChain,
    render: (oc, src, params) => buildEqChain(oc, src, params.bands || {}).output,
  },

  'reverb-echo': {
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    // Was echo-only despite the name (a plain delay+feedback loop, no actual room simulation).
    // Presets now include real convolution reverb -- a ConvolverNode fed a synthetically
    // generated impulse response (exponentially-decaying noise, the standard technique when
    // there's no recorded IR file to load) -- alongside the original echo, so "Room"/"Hall"
    // genuinely sound like a space, not a repeating delay.
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
    // mp3/wav targets are pure Web Audio, no ffmpeg. Telegram/WhatsApp (ogg) touch ffmpeg only
    // for the final encode, on a small already-trimmed clip -- never the original file. Opus
    // doesn't support 44.1kHz, so ffmpeg's libopus wrapper resamples to 48kHz internally before
    // encoding, and that specific internal path has a confirmed ffmpeg.wasm bug: "Out of bounds
    // memory access" (ffmpegwasm/ffmpeg.wasm#591, #867) -- reproduced live on both iOS and
    // Android, not desktop. Other Opus rates (24kHz) don't trigger it, so the clip is
    // pre-resampled to 24kHz via Web Audio (resampleBuffer) before it ever reaches ffmpeg, so
    // ffmpeg's own resampler is never invoked. If libopus still crashes on some device, the
    // target-click handler falls back to libvorbis (buildOggVorbisArgs below) -- same .ogg
    // container, already proven stable (the Convert tool uses it), just not the round
    // voice-note bubble Opus gets in Telegram/WhatsApp.
    engine: 'ringtone-hybrid',
    controls: 'ringtone-targets',
    accept: 'audio/*',
    oggSampleRate: 24000,
    targets: [
      // Real M4R (AAC audio in an MP4 container, just renamed .m4r) -- matches timbrica.com's
      // own iPhone tile, not just an MP3 workaround. iOS 26+ can set it straight as a ringtone
      // via Files -> Share -> Use as Ringtone, same flow as MP3/M4A (verified 2026-08-03).
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
    // Same AAC recipe the Convert tool already uses successfully -- no known ffmpeg.wasm crash
    // risk here (unlike libopus). Output container is plain MP4/AAC; only the .m4r extension on
    // download makes it a "ringtone" file, that's the whole difference from a .m4a.
    buildAacArgs: ([inp], out) => ['-i', inp, '-c:a', 'aac', '-b:a', '192k', out],
  },

  'video-to-audio': {
    engine: 'ffmpeg',
    controls: 'convert',
    accept: 'video/*',
    compactPreview: true,
    transport: true,
    runLabel: 'extractRunLabel',
    formats: ['mp3', 'm4a', 'wav'],
    // Loudness-normalize checkbox (EBU R128 -16 LUFS, a common podcast/creator target) -- cheap
    // to add since it's just one more filter, and was flagged as a real gap vs competitors.
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
    // Deliberately one control. The processed side is a real resample, so it renders on demand
    // and the play button plays THAT -- hearing 8 kHz next to 44.1 kHz is the entire point of
    // the tool, and resampling is fast enough that waiting for it isn't a burden.
    engine: 'webaudio',
    controls: 'rate1',
    accept: 'audio/*',
    compactPreview: true,
    transport: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    // MPEG audio only defines these rates -- MPEG-1 gives 32/44.1/48, MPEG-2 adds 16/22.05/24
    // and MPEG-2.5 adds 8/11.025/12. 96 kHz simply has no representation in MP3, so offering it
    // would hand back a file that is either broken or silently retagged at another rate.
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
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    // Was just a smooth resample down to 11025Hz -- sounds muffled, not "8-bit", because
    // OfflineAudioContext's resampler interpolates. Real chiptune character comes from
    // sample-and-hold decimation (audible stair-steps/aliasing, no smoothing) plus bit-depth
    // quantization -- both done manually here since Web Audio has no crusher node.
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
    // Turning audio into a video is by far the slowest thing on this site -- x264 encoding
    // inside WebAssembly runs at a fraction of native speed, so a few minutes of audio can mean
    // a genuinely long wait. Making somebody sit through that only to discover they picked the
    // wrong style is the real problem here, so the tool renders a SHORT preview (previewSeconds)
    // through the exact same pipeline first. Same filters, same encoder, same everything -- just
    // truncated -- so what you preview cannot differ from what you download.
    engine: 'ffmpeg',
    controls: 'vizstyles',
    accept: 'audio/*',
    previewSeconds: 6,
    runLabel: 'vizDownloadLabel',
    // No waveform on this page: there's no region to pick and the result is judged from the
    // video preview, so the canvas was decoration -- and it forced a full decode of the file
    // just to draw it. Duration is read from the file's metadata instead, which is instant.
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
        // Constant-Q transform: frequencies laid out by musical note rather than linearly, so
        // the picture moves in time with the music. Much the best-looking option, and also the
        // most expensive -- flagged `slow` so the UI can warn before someone starts a render.
        musical: `showcqt=s=${size}`,
        freqline: `showfreqs=s=${size}:mode=line:ascale=log:colors=0x4ade9e`,
        wavepoint: `showwaves=s=${size}:mode=point:colors=0x4ade9e`,
        // The existing 'circle' entry is avectorscope's default (lissajous); polar is a
        // genuinely different shape rather than a recolour.
        polar: `avectorscope=s=${size}:mode=polar:zoom=1.5:draw=line:rc=74:gc=222:bc=158`,
        volume: `showvolume=w=${Math.round(Number(size.split('x')[0]) * 0.75)}:h=60:f=0.5:c=VOLUME,pad=${size.replace('x', ':')}:(ow-iw)/2:(oh-ih)/2`,
      };
      const filter = filters[params.value] || filters['wave-green'];
      const args = ['-i', inp];
      // A preview is the same command with a duration cap -- deliberately not a separate,
      // cheaper code path that could end up looking different from the real export.
      if (params.previewSeconds) args.push('-t', String(params.previewSeconds));
      args.push(
        '-filter_complex', `[0:a]${filter}[v]`,
        '-map', '[v]', '-map', '0:a',
        // ultrafast + a sane CRF: encoding speed is the whole bottleneck in wasm, and for a
        // waveform animation the visual cost of a fast preset is essentially invisible.
        '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '26',
        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', out,
      );
      return args;
    },
  },

  denoise: {
    // Was a single fixed afftdn pass with no control at all -- now a strength picker mapped
    // onto afftdn's own noise-reduction-amount parameter (nr, in dB).
    engine: 'ffmpeg',
    controls: 'select',
    accept: 'audio/*',
    // Same shape as the enhancer: picking a strength renders a preview and plays it, with an
    // Original/Result switch, so noise reduction can be judged by ear before committing. It used
    // to hand back a file you had not heard, from a filter you could not compare.
    compactPreview: true,
    abCompare: true,
    // Was locked to MP3, so cleaning up a WAV always came back lossy.
    formats: ['mp3', 'wav', 'm4a'],
    runLabel: 'denoiseRunLabel',
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
      if (format === 'wav') return ['-i', inp, '-af', `afftdn=nr=${nr}`, out];
      if (format === 'm4a') return ['-i', inp, '-af', `afftdn=nr=${nr}`, '-c:a', 'aac', '-b:a', '192k', out];
      return ['-i', inp, '-af', `afftdn=nr=${nr}`, '-b:a', '192k', out];
    },
  },

  enhance: {
    // One-click positioning per the redesign: preset CARDS (not a bare dropdown) with an
    // Auto default, a single big "Enhance" action, and A/B compare (original vs result) --
    // the settings themselves (afftdn strength, a rumble-cutting highpass, a presence EQ bump,
    // loudnorm target) all stay hidden behind the preset choice, never exposed as raw knobs.
    engine: 'ffmpeg',
    controls: 'select',
    accept: 'audio/*',
    presetCards: true,
    abCompare: true,
    compactPreview: true,
    runLabel: 'enhanceRunLabel',
    // Output format choice -- was hardcoded to MP3, which meant a WAV upload always came back
    // lossy even though nothing about "enhance" should force that. MP3/WAV/M4A cover the
    // popular cases without turning this into the full Convert tool.
    formats: ['mp3', 'wav', 'm4a'],
    selectLabel: 'enhancePresetLabel',
    // `hero: true` marks the entry driven by the big standalone button above the cards, not a
    // card of its own -- there's no separate "pick Auto" click, the hero button IS that choice.
    selectOptions: [
      { value: 'auto', emoji: '✨', label: 'enhanceAutoOptionLabel', hero: true, desc: 'enhanceAutoDesc' },
      { value: 'voice', emoji: '🎤', label: 'enhanceVoiceLabel', desc: 'enhanceVoiceDesc' },
      { value: 'podcast', emoji: '🎙', label: 'enhancePodcastLabel', desc: 'enhancePodcastDesc' },
      { value: 'music', emoji: '🎵', label: 'enhanceMusicLabel', desc: 'enhanceMusicDesc' },
      { value: 'call', emoji: '📞', label: 'enhanceCallLabel', desc: 'enhanceCallDesc' },
      { value: 'old', emoji: '📼', label: 'enhanceOldLabel', desc: 'enhanceOldDesc' },
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
      };
      const p = presets[params.value] || presets.auto;
      const filters = [`afftdn=nr=${p.nr}`];
      if (p.hp) filters.push(`highpass=f=${p.hp}`);
      if (p.presence) filters.push(`equalizer=f=3000:t=q:w=1.5:g=${p.presence}`);
      filters.push(`loudnorm=I=${p.i}:TP=-1.5:LRA=11`);
      const format = params.format || 'mp3';
      if (format === 'wav') return ['-i', inp, '-af', filters.join(','), out];
      if (format === 'm4a') return ['-i', inp, '-af', filters.join(','), '-c:a', 'aac', '-b:a', '192k', out];
      return ['-i', inp, '-af', filters.join(','), '-b:a', '192k', out];
    },
  },

  'add-silence': {
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
      if (a <= 0 && b <= 0) return '';
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
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    engine: 'webaudio',
    controls: 'select',
    accept: 'audio/*',
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
      // A compressor only ever turns things down, so without make-up gain the result is quieter
      // than the input and reads as "it did nothing, just worse".
      const gain = oc.createGain();
      gain.gain.value = cfg.makeup;
      src.connect(comp);
      comp.connect(gain);
      return gain;
    },
  },
  'vocal-remover': {
    compactPreview: true,
    transport: true,
    renderedAb: true,
    exportDeck: true,
    downloadFormats: ['wav', 'mp3', 'ogg'],
    engine: 'webaudio',
    controls: 'select',
    accept: 'audio/*',
    selectLabel: 'vocalModeLabel',
    selectOptions: [
      { value: 'keepbass', label: 'vocalKeepBassLabel' },
      { value: 'full', label: 'vocalFullLabel' },
    ],
    // Nothing to subtract in a mono file -- the method needs two channels that differ.
    note: ({ buffer, labels }) => (buffer && buffer.numberOfChannels < 2 ? labels.vocalMonoNote : ''),
    directRender: (buffer, { value }) => {
      const sr = buffer.sampleRate;
      const n = buffer.length;
      const L = buffer.getChannelData(0);
      const R = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : L;
      const out = new AudioBuffer({ numberOfChannels: 1, length: n, sampleRate: sr });
      const dst = out.getChannelData(0);
      // Anything panned dead centre cancels when the channels are subtracted -- which is usually
      // the lead vocal, but also the bass and the kick. Keeping the low end from the summed
      // signal and taking only the highs from the difference leaves the track with a bottom.
      const keepBass = value !== 'full';
      const cutoff = 200;
      const k = Math.exp(-2 * Math.PI * cutoff / sr);
      // Three one-pole stages, not one. A single pole only rolls off 6 dB/octave, so the vocal
      // -- centred, and therefore surviving only through the bass path -- leaked back in at
      // about -11 dB, which is audible. Measured on a test mix: one pole took a 0.350 vocal down
      // to 0.096; three take it far lower while 60 Hz bass, well below the corner, still passes.
      const m = [0, 0, 0];
      const sd = [0, 0, 0];
      for (let i = 0; i < n; i++) {
        const mid = (L[i] + R[i]) / 2;
        const side = (L[i] - R[i]) / 2;
        if (!keepBass) { dst[i] = Math.max(-1, Math.min(1, side * 2)); continue; }
        let mv = mid, sv = side;
        for (let j = 0; j < 3; j++) {
          m[j] = mv * (1 - k) + m[j] * k; mv = m[j];
          sd[j] = sv * (1 - k) + sd[j] * k; sv = sd[j];
        }
        dst[i] = Math.max(-1, Math.min(1, (side - sv) * 2 + mv));
      }
      return out;
    },
  },
  'white-noise': {
    // A player first: a short seamless loop plays on repeat for as long as you like, so listening
    // for eight hours costs the same few megabytes as listening for one minute. Downloading a
    // file is the secondary action, capped at 30 minutes -- see makeNoiseLoop for the measured
    // reason the old "build the whole duration as one buffer" approach had to go.
    engine: 'noise',
    controls: 'noise',
    color: 'white',
    downloadLengths: [60, 300, 600, 1800],
    downloadFormats: ['mp3', 'wav'],
  },

  'pink-noise': {
    // A player first: a short seamless loop plays on repeat for as long as you like, so listening
    // for eight hours costs the same few megabytes as listening for one minute. Downloading a
    // file is the secondary action, capped at 30 minutes -- see makeNoiseLoop for the measured
    // reason the old "build the whole duration as one buffer" approach had to go.
    engine: 'noise',
    controls: 'noise',
    color: 'pink',
    downloadLengths: [60, 300, 600, 1800],
    downloadFormats: ['mp3', 'wav'],
  },
  'brown-noise': {
    // A player first: a short seamless loop plays on repeat for as long as you like, so listening
    // for eight hours costs the same few megabytes as listening for one minute. Downloading a
    // file is the secondary action, capped at 30 minutes -- see makeNoiseLoop for the measured
    // reason the old "build the whole duration as one buffer" approach had to go.
    engine: 'noise',
    controls: 'noise',
    color: 'brown',
    downloadLengths: [60, 300, 600, 1800],
    downloadFormats: ['mp3', 'wav'],
  },
};
