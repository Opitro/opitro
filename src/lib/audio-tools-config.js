// One entry per audio tool. `engine: 'webaudio'` tools run entirely on the native Web Audio
// API (src/lib/web-audio-engine.js) -- no ffmpeg, no ~32 MB download, and the decoded buffer
// lets the UI draw a waveform and let the user listen to the result before downloading.
// `engine: 'ffmpeg'` is reserved for the few things Web Audio genuinely can't do: real
// format/codec transcoding (convert, ringtone's final export), reading a video container
// (video-to-audio), muxing a video output (visualizer), and spectral noise reduction
// (denoise/enhance -- no native noise-reduction node exists in Web Audio).
import { wsolaStretch, pitchShift } from './web-audio-engine.js';

const MP3_OUT = { outputName: 'out.mp3', mimeType: 'audio/mpeg', ext: 'mp3' };

export const AUDIO_TOOLS = {
  convert: {
    engine: 'ffmpeg',
    controls: 'convert',
    accept: 'audio/*',
    // Sample-rate/channel dropdowns -- gated to just this tool (not video-to-audio, which
    // reuses the same 'convert' controls block) so that one stays simple.
    advancedConvert: true,
    output: (params) => {
      const map = { mp3: 'audio/mpeg', m4a: 'audio/mp4', m4r: 'audio/x-m4r', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac' };
      return { outputName: `out.${params.format}`, mimeType: map[params.format] || 'audio/mpeg', ext: params.format };
    },
    buildArgs: ([inp], out, params) => {
      const { format, bitrate, sampleRate, channels } = params;
      const extra = [];
      if (sampleRate && sampleRate !== 'auto') extra.push('-ar', sampleRate);
      if (channels && channels !== 'auto') extra.push('-ac', channels);
      if (format === 'mp3') return ['-i', inp, ...extra, '-b:a', `${bitrate}k`, out];
      if (format === 'm4a') return ['-i', inp, ...extra, '-c:a', 'aac', '-b:a', `${bitrate}k`, out];
      if (format === 'm4r') return ['-i', inp, ...extra, '-c:a', 'aac', '-b:a', `${bitrate}k`, '-f', 'ipod', out];
      if (format === 'wav') return ['-i', inp, ...extra, out];
      if (format === 'ogg') return ['-i', inp, ...extra, '-c:a', 'libvorbis', '-b:a', `${bitrate}k`, out];
      if (format === 'flac') return ['-i', inp, ...extra, out];
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
    engine: 'webaudio',
    controls: 'eq3',
    accept: 'audio/*',
    presets: [
      { key: 'flat', label: 'presetFlatLabel', set: { bass: 0, mid: 0, treble: 0 } },
      { key: 'bassboost', label: 'presetBassBoostLabel', set: { bass: 7, mid: 0, treble: 1 } },
      { key: 'vocal', label: 'presetVocalLabel', set: { bass: -3, mid: 5, treble: 2 } },
      { key: 'podcast', label: 'presetPodcastLabel', set: { bass: -2, mid: 3, treble: 3 } },
    ],
    // A WaveShaper soft-clip limiter at the end of the chain -- boosting all three bands at
    // once can genuinely clip otherwise, and there was no protection against that at all before.
    render: (oc, src, { bass, mid, treble }) => {
      const b = oc.createBiquadFilter(); b.type = 'peaking'; b.frequency.value = 100; b.Q.value = 1; b.gain.value = bass;
      const m = oc.createBiquadFilter(); m.type = 'peaking'; m.frequency.value = 1000; m.Q.value = 1; m.gain.value = mid;
      const t = oc.createBiquadFilter(); t.type = 'peaking'; t.frequency.value = 8000; t.Q.value = 1; t.gain.value = treble;
      const limiter = oc.createWaveShaper();
      const curve = new Float32Array(1024);
      for (let i = 0; i < 1024; i++) { const x = (i / 1023) * 2 - 1; curve[i] = Math.tanh(x * 1.2); }
      limiter.curve = curve;
      limiter.oversample = '2x';
      src.connect(b); b.connect(m); m.connect(t); t.connect(limiter);
      return limiter;
    },
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
    // Was one fixed filter chain with zero settings -- now content-type presets tuned with
    // different noise-reduction and loudness-normalization targets (LUFS) per type, matching
    // how competitors frame this (Speech/Podcast/Music presets rather than raw dB knobs).
    engine: 'ffmpeg',
    controls: 'select',
    accept: 'audio/*',
    selectLabel: 'enhancePresetLabel',
    selectOptions: [
      { value: 'speech', label: 'enhanceSpeechLabel' },
      { value: 'podcast', label: 'enhancePodcastLabel' },
      { value: 'music', label: 'enhanceMusicLabel' },
    ],
    output: () => MP3_OUT,
    buildArgs: ([inp], out, params) => {
      const presets = { speech: { nr: 12, i: -16 }, podcast: { nr: 8, i: -16 }, music: { nr: 4, i: -14 } };
      const p = presets[params.value] || presets.speech;
      return ['-i', inp, '-af', `afftdn=nr=${p.nr},loudnorm=I=${p.i}:TP=-1.5:LRA=11`, '-b:a', '192k', out];
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
