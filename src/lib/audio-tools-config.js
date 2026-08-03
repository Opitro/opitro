// One entry per audio tool. `engine: 'webaudio'` tools run entirely on the native Web Audio
// API (src/lib/web-audio-engine.js) -- no ffmpeg, no ~32 MB download, and the decoded buffer
// lets the UI draw a waveform and let the user listen to the result before downloading.
// `engine: 'ffmpeg'` is reserved for the few things Web Audio genuinely can't do: real
// format/codec transcoding (convert, ringtone's final export), reading a video container
// (video-to-audio), muxing a video output (visualizer), and spectral noise reduction
// (denoise/enhance -- no native noise-reduction node exists in Web Audio).

const MP3_OUT = { outputName: 'out.mp3', mimeType: 'audio/mpeg', ext: 'mp3' };

export const AUDIO_TOOLS = {
  convert: {
    engine: 'ffmpeg',
    controls: 'convert',
    accept: 'audio/*',
    output: (params) => {
      const map = { mp3: 'audio/mpeg', m4a: 'audio/mp4', m4r: 'audio/x-m4r', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac' };
      return { outputName: `out.${params.format}`, mimeType: map[params.format] || 'audio/mpeg', ext: params.format };
    },
    buildArgs: ([inp], out, params) => {
      const { format, bitrate } = params;
      if (format === 'mp3') return ['-i', inp, '-b:a', `${bitrate}k`, out];
      if (format === 'm4a') return ['-i', inp, '-c:a', 'aac', '-b:a', `${bitrate}k`, out];
      if (format === 'm4r') return ['-i', inp, '-c:a', 'aac', '-b:a', `${bitrate}k`, '-f', 'ipod', out];
      if (format === 'wav') return ['-i', inp, out];
      if (format === 'ogg') return ['-i', inp, '-c:a', 'libvorbis', '-b:a', `${bitrate}k`, out];
      if (format === 'flac') return ['-i', inp, out];
      return ['-i', inp, out];
    },
  },

  trim: {
    engine: 'webaudio',
    controls: 'trim',
    accept: 'audio/*',
    render: (oc, src) => src,
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
    engine: 'webaudio',
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'speedLabel',
    sliderMin: 50,
    sliderMax: 200,
    sliderDefault: 100,
    sliderUnit: '%',
    render: Object.assign(
      (oc, src, { value }) => { src.playbackRate.value = value / 100; return src; },
      { rate: ({ value }) => value / 100 }
    ),
  },

  pitch: {
    engine: 'webaudio',
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'pitchLabel',
    sliderMin: -12,
    sliderMax: 12,
    sliderDefault: 0,
    sliderUnit: ' st',
    render: Object.assign(
      (oc, src, { value }) => { src.playbackRate.value = Math.pow(2, value / 12); return src; },
      { rate: ({ value }) => Math.pow(2, value / 12) }
    ),
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
    sliderMax: 10,
    sliderDefault: 2,
    sliderUnit: 'x',
    sliderStep: 1,
    directRender: (buffer, { value }) => {
      const times = Math.max(1, Math.round(value));
      const out = new AudioBuffer({ numberOfChannels: buffer.numberOfChannels, length: buffer.length * times, sampleRate: buffer.sampleRate });
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        const src = buffer.getChannelData(c);
        const dst = out.getChannelData(c);
        for (let t = 0; t < times; t++) dst.set(src, t * src.length);
      }
      return out;
    },
  },

  'remove-silence': {
    engine: 'webaudio',
    controls: 'none',
    accept: 'audio/*',
    directRender: (buffer) => {
      const threshold = 0.02;
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
    sliderMin: 64,
    sliderMax: 192,
    sliderDefault: 96,
    sliderUnit: ' kbps',
    sliderStep: 16,
    render: (oc, src) => src,
    mp3Bitrate: ({ value }) => value,
  },

  'stereo-to-mono': {
    engine: 'webaudio',
    controls: 'none',
    accept: 'audio/*',
    outputChannels: 1,
    render: (oc, src) => src,
  },

  'mono-to-stereo': {
    engine: 'webaudio',
    controls: 'none',
    accept: 'audio/*',
    outputChannels: 2,
    render: (oc, src) => src,
  },

  equalizer: {
    engine: 'webaudio',
    controls: 'eq3',
    accept: 'audio/*',
    render: (oc, src, { bass, mid, treble }) => {
      const b = oc.createBiquadFilter(); b.type = 'peaking'; b.frequency.value = 100; b.Q.value = 1; b.gain.value = bass;
      const m = oc.createBiquadFilter(); m.type = 'peaking'; m.frequency.value = 1000; m.Q.value = 1; m.gain.value = mid;
      const t = oc.createBiquadFilter(); t.type = 'peaking'; t.frequency.value = 8000; t.Q.value = 1; t.gain.value = treble;
      src.connect(b); b.connect(m); m.connect(t);
      return t;
    },
  },

  'reverb-echo': {
    engine: 'webaudio',
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'echoLabel',
    sliderMin: 0,
    sliderMax: 100,
    sliderDefault: 40,
    sliderUnit: '%',
    render: (oc, src, { value }) => {
      const delay = oc.createDelay(2);
      delay.delayTime.value = 0.28;
      const feedback = oc.createGain();
      feedback.gain.value = Math.min(0.85, value / 120);
      const wet = oc.createGain();
      wet.gain.value = 0.6;
      const mix = oc.createGain();
      src.connect(mix);
      src.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(mix);
      return mix;
    },
  },

  ringtone: {
    engine: 'ffmpeg',
    controls: 'ringtone-targets',
    accept: 'audio/*',
    // One tile per destination -- format, an optional max duration (trims the selection down
    // further if it's longer), and the ffmpeg audio filters that recipe wants (fade-out is the
    // default for a call ringtone; the alarm target wants louder + fade-in instead).
    // Fade in/out is now a manual checkbox in the UI (fadeIn/fadeOut in params), not an
    // automatic per-target default -- only `louder` stays target-specific (an alarm should
    // be attention-grabbing regardless of what the user picked for fades).
    targets: [
      // iOS 26+ can set a ringtone straight from an MP3/M4A under 30s via Files -> Share ->
      // Use as Ringtone -- no GarageBand/M4R conversion needed anymore (verified 2026-08-03).
      { key: 'iphone', emoji: '📱', name: 'iPhone', fmt: 'mp3', max: 30 },
      { key: 'android', emoji: '🤖', name: 'Android', fmt: 'mp3', max: 0 },
      { key: 'telegram', emoji: '✈️', name: 'Telegram', fmt: 'ogg', max: 0 },
      { key: 'whatsapp', emoji: '💬', name: 'WhatsApp', fmt: 'ogg', max: 0 },
      { key: 'alarm', emoji: '⏰', name: 'Alarm', fmt: 'mp3', max: 0, louder: true },
      { key: 'notify', emoji: '🔔', name: 'Notification', fmt: 'mp3', max: 8 },
      { key: 'tiktok', emoji: '🎬', name: 'TikTok / Reels', fmt: 'mp3', max: 60 },
      { key: 'pc', emoji: '🖥️', name: 'PC', fmt: 'wav', max: 0 },
    ],
    output: (target) => {
      const map = { m4r: 'audio/x-m4r', mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav' };
      return { outputName: `out.${target.fmt}`, mimeType: map[target.fmt] || 'audio/mpeg', ext: target.fmt };
    },
    buildArgs: ([inp], out, { start, duration, target, fadeIn, fadeOut, volume }) => {
      const af = [];
      const vol = (volume ?? 100) / 100 * (target.louder ? 1.4 : 1);
      if (vol !== 1) af.push(`volume=${vol.toFixed(2)}`);
      if (fadeIn) af.push('afade=t=in:st=0:d=1');
      if (fadeOut && duration > 2) af.push(`afade=t=out:st=${Math.max(0, duration - 2).toFixed(2)}:d=2`);
      const args = ['-ss', String(start), '-t', String(duration), '-i', inp, '-vn'];
      if (af.length) args.push('-af', af.join(','));
      if (target.fmt === 'm4r') args.push('-c:a', 'aac', '-b:a', '192k', '-f', 'ipod', out);
      else if (target.fmt === 'mp3') args.push('-b:a', '192k', '-f', 'mp3', out);
      else if (target.fmt === 'ogg') args.push('-c:a', 'libopus', '-b:a', '96k', out);
      else args.push(out);
      return args;
    },
  },

  'video-to-audio': {
    engine: 'ffmpeg',
    controls: 'convert',
    accept: 'video/*',
    formats: ['mp3', 'm4a', 'wav'],
    output: (params) => {
      const map = { mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav' };
      return { outputName: `out.${params.format}`, mimeType: map[params.format] || 'audio/mpeg', ext: params.format };
    },
    buildArgs: ([inp], out, { format, bitrate }) => {
      if (format === 'wav') return ['-i', inp, '-vn', out];
      if (format === 'm4a') return ['-i', inp, '-vn', '-c:a', 'aac', '-b:a', `${bitrate}k`, out];
      return ['-i', inp, '-vn', '-b:a', `${bitrate}k`, out];
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
    engine: 'webaudio',
    controls: 'none',
    accept: 'audio/*',
    render: (oc, src) => src,
    outputSampleRate: () => 11025,
  },

  visualizer: {
    engine: 'ffmpeg',
    controls: 'none',
    accept: 'audio/*',
    output: () => ({ outputName: 'out.mp4', mimeType: 'video/mp4', ext: 'mp4' }),
    buildArgs: ([inp], out) => [
      '-i', inp,
      '-filter_complex', '[0:a]showwaves=s=1280x720:mode=cline:colors=0x4ade9e[v]',
      '-map', '[v]', '-map', '0:a',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', out,
    ],
  },

  denoise: {
    engine: 'ffmpeg',
    controls: 'none',
    accept: 'audio/*',
    output: () => MP3_OUT,
    buildArgs: ([inp], out) => ['-i', inp, '-af', 'afftdn', '-b:a', '192k', out],
  },

  enhance: {
    engine: 'ffmpeg',
    controls: 'none',
    accept: 'audio/*',
    output: () => MP3_OUT,
    buildArgs: ([inp], out) => ['-i', inp, '-af', 'afftdn,loudnorm', '-b:a', '192k', out],
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
