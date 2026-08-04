// One entry per audio tool. `engine: 'webaudio'` tools run entirely on the native Web Audio
// API (src/lib/web-audio-engine.js) -- no ffmpeg, no ~32 MB download, and the decoded buffer
// lets the UI draw a waveform and let the user listen to the result before downloading.
// `engine: 'ffmpeg'` is reserved for the few things Web Audio genuinely can't do: real
// format/codec transcoding (convert, ringtone's final export), reading a video container
// (video-to-audio), muxing a video output (visualizer), and spectral noise reduction
// (denoise/enhance -- no native noise-reduction node exists in Web Audio).
import { wsolaStretch, pitchShift } from './web-audio-engine.js';

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
  },

  volume: {
    engine: 'webaudio',
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'volumeLabel',
    sliderMin: 10,
    sliderMax: 300,
    sliderDefault: 100,
    sliderUnit: '%',
    // Peak/clip meter -- there was no feedback at all before about how close (or over) 300%
    // pushes the audio to clipping, a real gap vs. competitors' loudness metering.
    showMeter: true,
    render: (oc, src, { value }) => {
      const g = oc.createGain();
      g.gain.value = value / 100;
      src.connect(g);
      return g;
    },
  },

  normalize: {
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
    // Was playbackRate-only, so speed also changed pitch as a side effect (a "chipmunk" or
    // "monster" effect nobody asked for) -- competitors default to pitch-preserving. Now uses
    // WSOLA time-stretch, matching timbrica's default behavior.
    engine: 'webaudio',
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'speedLabel',
    sliderMin: 50,
    sliderMax: 200,
    sliderDefault: 100,
    sliderUnit: '%',
    directRender: (buffer, { value }) => wsolaStretch(buffer, 100 / (value || 100)),
  },

  pitch: {
    // Was literally the same playbackRate transform as speed (mislabeled -- it changed tempo
    // too, not just pitch). Now a real pitch-shift with tempo locked, via resample+WSOLA.
    engine: 'webaudio',
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'pitchLabel',
    sliderMin: -24,
    sliderMax: 24,
    sliderDefault: 0,
    sliderUnit: ' st',
    directRender: (buffer, { value }) => pitchShift(buffer, value || 0),
  },

  reverse: {
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
    engine: 'webaudio',
    controls: 'fade',
    accept: 'audio/*',
    render: (oc, src, { fadeIn, fadeOut }) => {
      const g = oc.createGain();
      const dur = src.buffer.duration;
      const fi = Math.min(Number(fadeIn) || 0, dur / 2);
      const fo = Math.min(Number(fadeOut) || 0, dur / 2);
      g.gain.setValueAtTime(0.0001, 0);
      if (fi > 0) g.gain.exponentialRampToValueAtTime(1, fi);
      else g.gain.setValueAtTime(1, 0);
      if (fo > 0) {
        g.gain.setValueAtTime(1, Math.max(fi, dur - fo));
        g.gain.exponentialRampToValueAtTime(0.0001, dur);
      }
      src.connect(g);
      return g;
    },
  },

  compress: {
    engine: 'webaudio',
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'compressLabel',
    sliderMin: 32,
    sliderMax: 320,
    sliderDefault: 128,
    sliderUnit: ' kbps',
    sliderStep: 8,
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
    engine: 'webaudio',
    controls: 'select',
    accept: 'audio/*',
    selectLabel: 'sampleRateLabel',
    selectOptions: [
      { value: '8000', label: '8,000 Hz' },
      { value: '16000', label: '16,000 Hz' },
      { value: '22050', label: '22,050 Hz' },
      { value: '44100', label: '44,100 Hz (CD)' },
      { value: '48000', label: '48,000 Hz' },
      { value: '96000', label: '96,000 Hz' },
    ],
    render: (oc, src) => src,
    outputSampleRate: ({ value }) => Number(value),
  },

  chiptune: {
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
    // Was one fixed render (green line waveform) -- now a style picker over standard ffmpeg
    // lavfi filters (all built into any ffmpeg-core build, no external-lib crash risk like
    // libopus had).
    engine: 'ffmpeg',
    controls: 'select',
    accept: 'audio/*',
    selectLabel: 'visualizerStyleLabel',
    selectOptions: [
      { value: 'wave-green', label: 'visualizerWaveGreenLabel' },
      { value: 'wave-blue', label: 'visualizerWaveBlueLabel' },
      { value: 'bars', label: 'visualizerBarsLabel' },
      { value: 'spectrum', label: 'visualizerSpectrumLabel' },
    ],
    output: () => ({ outputName: 'out.mp4', mimeType: 'video/mp4', ext: 'mp4' }),
    buildArgs: ([inp], out, params) => {
      const filters = {
        'wave-green': 'showwaves=s=1280x720:mode=cline:colors=0x4ade9e',
        'wave-blue': 'showwaves=s=1280x720:mode=cline:colors=0x4a9eff',
        bars: 'showfreqs=s=1280x720:mode=bar:ascale=log:colors=0x4ade9e',
        spectrum: 'showspectrum=s=1280x720:mode=combined:color=intensity',
      };
      const filter = filters[params.value] || filters['wave-green'];
      return [
        '-i', inp,
        '-filter_complex', `[0:a]${filter}[v]`,
        '-map', '[v]', '-map', '0:a',
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', out,
      ];
    },
  },

  denoise: {
    // Was a single fixed afftdn pass with no control at all -- now a strength picker mapped
    // onto afftdn's own noise-reduction-amount parameter (nr, in dB).
    engine: 'ffmpeg',
    controls: 'select',
    accept: 'audio/*',
    selectLabel: 'denoiseStrengthLabel',
    selectOptions: [
      { value: 'light', label: 'strengthLightLabel' },
      { value: 'medium', label: 'strengthMediumLabel' },
      { value: 'strong', label: 'strengthStrongLabel' },
    ],
    output: () => MP3_OUT,
    buildArgs: ([inp], out, params) => {
      const nr = { light: 6, medium: 12, strong: 22 }[params.value] || 12;
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

  'white-noise': {
    engine: 'webaudio-generator',
    controls: 'generator',
    color: 'white',
    durationDefault: 60,
    durationMax: 3600,
  },

  'pink-noise': {
    engine: 'webaudio-generator',
    controls: 'generator',
    color: 'pink',
    durationDefault: 60,
    durationMax: 3600,
  },
};
