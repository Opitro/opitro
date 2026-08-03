// One entry per audio tool: what controls it needs (read by AudioTool.astro to pick which
// markup block to render) and how to turn those controls into an ffmpeg command (read by the
// tool's client script at run time). Keeping this in one place is the whole point of the
// generalized AudioTool component -- adding a tool is a config entry, not a new page's worth
// of duplicated HTML/CSS/JS (see project-architecture memory for why, vs. LeebTTS's approach).
//
// Every "effect" tool normalizes its output to MP3 192kbps -- keeps the args matrix small and
// matches what most people actually want (a working file back), not a format decision on every
// single tool. Convert/ringtone/video-to-audio are the deliberate exceptions since format IS
// the point of those specific tools.

const MP3_OUT = { outputName: 'out.mp3', mimeType: 'audio/mpeg', ext: 'mp3' };

export const AUDIO_TOOLS = {
  convert: {
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
    controls: 'trim',
    accept: 'audio/*',
    output: () => MP3_OUT,
    buildArgs: ([inp], out, { start, end }) => ['-i', inp, '-ss', start, '-to', end, '-b:a', '192k', out],
  },

  merge: {
    controls: 'multi-file',
    accept: 'audio/*',
    multiFile: true,
    output: () => MP3_OUT,
    buildArgs: (inputNames, out) => {
      const filterInputs = inputNames.map((n) => `[${inputNames.indexOf(n)}:a]`).join('');
      const args = [];
      inputNames.forEach((n) => args.push('-i', n));
      args.push('-filter_complex', `${filterInputs}concat=n=${inputNames.length}:v=0:a=1[a]`, '-map', '[a]', '-b:a', '192k', out);
      return args;
    },
  },

  volume: {
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'volumeLabel',
    sliderMin: 10,
    sliderMax: 300,
    sliderDefault: 100,
    sliderUnit: '%',
    output: () => MP3_OUT,
    buildArgs: ([inp], out, { value }) => ['-i', inp, '-filter:a', `volume=${value / 100}`, '-b:a', '192k', out],
  },

  normalize: {
    controls: 'none',
    accept: 'audio/*',
    output: () => MP3_OUT,
    buildArgs: ([inp], out) => ['-i', inp, '-filter:a', 'loudnorm', '-b:a', '192k', out],
  },

  speed: {
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'speedLabel',
    sliderMin: 50,
    sliderMax: 200,
    sliderDefault: 100,
    sliderUnit: 'x',
    sliderDivisor: 100,
    output: () => MP3_OUT,
    buildArgs: ([inp], out, { value }) => ['-i', inp, '-filter:a', `atempo=${value / 100}`, '-b:a', '192k', out],
  },

  pitch: {
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'pitchLabel',
    sliderMin: -12,
    sliderMax: 12,
    sliderDefault: 0,
    sliderUnit: ' semitones',
    output: () => MP3_OUT,
    buildArgs: ([inp], out, { value }) => {
      const ratio = Math.pow(2, value / 12);
      const rate = Math.round(44100 * ratio);
      return ['-i', inp, '-filter:a', `asetrate=${rate},aresample=44100,atempo=${1 / ratio}`, '-b:a', '192k', out];
    },
  },

  reverse: {
    controls: 'none',
    accept: 'audio/*',
    output: () => MP3_OUT,
    buildArgs: ([inp], out) => ['-i', inp, '-af', 'areverse', '-b:a', '192k', out],
  },

  loop: {
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'loopLabel',
    sliderMin: 1,
    sliderMax: 10,
    sliderDefault: 2,
    sliderUnit: 'x',
    sliderStep: 1,
    output: () => MP3_OUT,
    buildArgs: ([inp], out, { value }) => ['-stream_loop', String(value - 1), '-i', inp, '-b:a', '192k', out],
  },

  'remove-silence': {
    controls: 'none',
    accept: 'audio/*',
    output: () => MP3_OUT,
    buildArgs: ([inp], out) => [
      '-i', inp,
      '-af', 'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.15:stop_periods=-1:stop_threshold=-50dB:stop_silence=0.15',
      '-b:a', '192k', out,
    ],
  },

  fade: {
    controls: 'fade',
    accept: 'audio/*',
    output: () => MP3_OUT,
    buildArgs: ([inp], out, { fadeIn, fadeOut }) => [
      '-i', inp,
      '-af', `afade=t=in:d=${fadeIn},areverse,afade=t=in:d=${fadeOut},areverse`,
      '-b:a', '192k', out,
    ],
  },

  compress: {
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'compressLabel',
    sliderMin: 64,
    sliderMax: 192,
    sliderDefault: 96,
    sliderUnit: ' kbps',
    sliderStep: 16,
    output: () => MP3_OUT,
    buildArgs: ([inp], out, { value }) => ['-i', inp, '-b:a', `${value}k`, out],
  },

  'stereo-to-mono': {
    controls: 'none',
    accept: 'audio/*',
    output: () => MP3_OUT,
    buildArgs: ([inp], out) => ['-i', inp, '-ac', '1', '-b:a', '192k', out],
  },

  'mono-to-stereo': {
    controls: 'none',
    accept: 'audio/*',
    output: () => MP3_OUT,
    buildArgs: ([inp], out) => ['-i', inp, '-ac', '2', '-b:a', '192k', out],
  },

  equalizer: {
    controls: 'eq3',
    accept: 'audio/*',
    output: () => MP3_OUT,
    buildArgs: ([inp], out, { bass, mid, treble }) => [
      '-i', inp,
      '-af', `equalizer=f=100:width_type=o:width=2:g=${bass},equalizer=f=1000:width_type=o:width=2:g=${mid},equalizer=f=8000:width_type=o:width=2:g=${treble}`,
      '-b:a', '192k', out,
    ],
  },

  'reverb-echo': {
    controls: 'slider',
    accept: 'audio/*',
    sliderLabel: 'echoLabel',
    sliderMin: 0,
    sliderMax: 100,
    sliderDefault: 40,
    sliderUnit: '%',
    output: () => MP3_OUT,
    buildArgs: ([inp], out, { value }) => {
      const decay = Math.max(0.05, value / 120);
      return ['-i', inp, '-af', `aecho=0.8:0.9:600:${decay.toFixed(2)}`, '-b:a', '192k', out];
    },
  },

  ringtone: {
    controls: 'trim',
    accept: 'audio/*',
    output: () => ({ outputName: 'out.m4r', mimeType: 'audio/x-m4r', ext: 'm4r' }),
    buildArgs: ([inp], out, { start, end }) => ['-i', inp, '-ss', start, '-to', end, '-c:a', 'aac', '-b:a', '192k', '-f', 'ipod', out],
    maxDurationSec: 40,
  },

  'video-to-audio': {
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
    output: () => MP3_OUT,
    buildArgs: ([inp], out, { value }) => ['-i', inp, '-ar', value, '-b:a', '192k', out],
  },

  chiptune: {
    controls: 'none',
    accept: 'audio/*',
    output: () => MP3_OUT,
    buildArgs: ([inp], out) => ['-i', inp, '-af', 'aresample=11025', '-ar', '11025', '-b:a', '96k', out],
  },

  visualizer: {
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
    controls: 'none',
    accept: 'audio/*',
    output: () => MP3_OUT,
    buildArgs: ([inp], out) => ['-i', inp, '-af', 'afftdn', '-b:a', '192k', out],
  },

  enhance: {
    controls: 'none',
    accept: 'audio/*',
    output: () => MP3_OUT,
    buildArgs: ([inp], out) => ['-i', inp, '-af', 'afftdn,loudnorm', '-b:a', '192k', out],
  },

  'white-noise': {
    controls: 'generator',
    accept: null,
    output: () => MP3_OUT,
    durationDefault: 60,
    durationMax: 3600,
    buildArgs: (_inputs, out, { duration }) => ['-f', 'lavfi', '-i', `anoisesrc=color=white:duration=${duration}`, '-b:a', '192k', out],
  },

  'pink-noise': {
    controls: 'generator',
    accept: null,
    output: () => MP3_OUT,
    durationDefault: 60,
    durationMax: 3600,
    buildArgs: (_inputs, out, { duration }) => ['-f', 'lavfi', '-i', `anoisesrc=color=pink:duration=${duration}`, '-b:a', '192k', out],
  },
};
