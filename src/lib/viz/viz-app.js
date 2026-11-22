import { BufferAnalyser, LiveAnalyser, PALETTES, STYLES, demoFrame, drawFrame, emptyFrame, smoothFrame, heatColors } from './viz-draw.js';
import { openAudioSession, openRecordSession, startKeeper } from '../web-audio-engine.js';

const STORE = 'opitro:viz';
const MAX_FILE = 900;
const MAX_VIDEO = 600;
const FPS = 30;
const QUALITY = {
  720: { '16x9': [1280, 720], '9x16': [720, 1280], '1x1': [720, 720], bitrate: 3e6 },
  1080: { '16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080], bitrate: 6e6 },
};
const RATIO = { '16x9': '16 / 9', '9x16': '9 / 16', '1x1': '1 / 1' };
const svg = (d) => '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' + d + '</svg>';
const ICON = {
  play: svg('<path d="M8 5v14l11-7z" fill="currentColor"/>'),
  pause: svg('<path d="M7 5h3v14H7zM14 5h3v14h-3z" fill="currentColor"/>'),
};

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; }
}
function savePrefs(v) {
  try { localStorage.setItem(STORE, JSON.stringify(v)); } catch (e) {}
}
function clock(s) {
  const t = Math.max(0, Math.floor(s));
  return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
}
function safeName(s) {
  return (s || 'audio').replace(/\.[^.]+$/, '').replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'audio';
}
function save(blob, name) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
function touched() {
  window.dispatchEvent(new Event('opitro:tool-interaction'));
}

class Visualizer {
  constructor(root) {
    this.root = root;
    this.t = JSON.parse(root.dataset.words || '{}');
    const q = (s) => root.querySelector(s);
    this.el = {
      input: q('.zv-input'), drop: q('.zv-drop'), remove: q('.zv-remove'), undo: q('.zv-undo'), file: q('.zv-file'), name: q('.zv-name'), other: q('.zv-other'),
      mics: [...root.querySelectorAll('.zv-mic')], stage: q('.zv-stage'), canvas: q('.zv-stage canvas'),
      seekBox: q('.zv-seek'), seekCanvas: q('.zv-seek canvas'), seek: q('.zv-seek input'),
      time: q('.zv-time'), cur: q('.zv-cur'), dur: q('.zv-dur'),
      play: q('.zv-play'), playIco: q('.zv-play-ico'), playLabel: q('.zv-play-label'),
      palettes: [...root.querySelectorAll('[data-palette]')], styles: [...root.querySelectorAll('[data-style]')],
      formats: [...root.querySelectorAll('[data-format]')],
      video: q('.zv-video'), videoLabel: q('.zv-video-label'), image: q('.zv-image'), cancel: q('.zv-cancel'),
      sizes: [...root.querySelectorAll('.zv-size[data-q]')], status: q('.zv-status'),
    };
    const prefs = loadPrefs();
    this.style = STYLES.some((s) => s.id === prefs.style) ? prefs.style : 'bars';
    this.palette = PALETTES[prefs.palette] ? prefs.palette : 'night';
    this.format = RATIO[prefs.format] ? prefs.format : '16x9';
    this.ctx2d = this.el.canvas.getContext('2d', { alpha: false });
    this.display = emptyFrame();
    this.state = {};
    this.mode = null;
    this.playing = false;
    this.offset = 0;
    this.busy = false;
    startKeeper();
    this.bind();
    this.applyFormat();
    this.renderControls();
    this.previews();
    this.idle();
  }

  bind() {
    const el = this.el;
    el.drop.addEventListener('click', (e) => { if (!e.target.closest('.zv-mic, .zv-undo')) el.input.click(); });
    el.remove.addEventListener('click', () => this.removeFile());
    el.undo.addEventListener('click', (e) => { e.stopPropagation(); this.undoRemove(); });
    el.drop.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === el.drop) { e.preventDefault(); el.input.click(); }
    });
    el.other.addEventListener('click', () => { if (!this.recorderMic) el.input.click(); });
    el.input.addEventListener('change', () => {
      if (el.input.files[0]) this.load(el.input.files[0]);
      el.input.value = '';
    });
    el.mics.forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.mode === 'mic') this.stopMic(); else this.startMic();
    }));
    ['dragenter', 'dragover'].forEach((n) => this.root.addEventListener(n, (e) => {
      e.preventDefault();
      this.root.classList.add('is-drag');
    }));
    ['dragleave', 'drop'].forEach((n) => this.root.addEventListener(n, (e) => {
      e.preventDefault();
      if (n === 'drop' || e.target === this.root) this.root.classList.remove('is-drag');
    }));
    this.root.addEventListener('drop', (e) => {
      const f = e.dataTransfer && e.dataTransfer.files[0];
      if (f) this.load(f);
    });
    el.play.addEventListener('click', () => (this.playing ? this.pause() : this.play()));
    el.seek.addEventListener('input', () => this.seekTo(Number(el.seek.value) / 1000 * this.duration));
    el.palettes.forEach((b) => b.addEventListener('click', () => {
      this.palette = b.dataset.palette;
      this.changed(true);
    }));
    el.styles.forEach((b) => b.addEventListener('click', () => {
      this.style = b.dataset.style;
      this.state = {};
      this.changed(false);
    }));
    el.formats.forEach((b) => b.addEventListener('click', () => {
      this.format = b.dataset.format;
      this.state = {};
      this.applyFormat();
      this.changed(false);
    }));
    [el.video, el.image].forEach((b) => {
      const menu = b.nextElementSibling;
      b.addEventListener('click', () => {
        const open = menu.hidden;
        this.closeMenus();
        if (open && !this.busy) {
          menu.hidden = false;
          b.setAttribute('aria-expanded', 'true');
        }
      });
    });
    this.root.querySelectorAll('[data-quality]').forEach((b) => b.addEventListener('click', () => {
      this.closeMenus();
      this.makeVideo(Number(b.dataset.quality));
    }));
    this.root.querySelectorAll('[data-image]').forEach((b) => b.addEventListener('click', () => {
      this.closeMenus();
      this.makeImage(b.dataset.image);
    }));
    el.cancel.addEventListener('click', () => this.cancelVideo());
    document.addEventListener('click', (e) => { if (!e.target.closest('.zv-dl')) this.closeMenus(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeMenus(); });
    let pending = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => { this.fitCanvas(); if (!this.looping) this.drawStill(); });
    });
    window.addEventListener('pagehide', () => this.dispose());
  }

  closeMenus() {
    this.root.querySelectorAll('.zv-menu').forEach((m) => {
      m.hidden = true;
      m.previousElementSibling.setAttribute('aria-expanded', 'false');
    });
  }

  status(text) {
    this.el.status.textContent = text || '';
  }

  changed(repaintPreviews) {
    savePrefs({ style: this.style, palette: this.palette, format: this.format });
    this.renderControls();
    if (repaintPreviews) this.previews();
    if (!this.looping) this.drawStill();
  }

  renderControls() {
    const el = this.el, mic = this.mode === 'mic', file = this.mode === 'file';
    el.palettes.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.palette === this.palette)));
    el.styles.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.style === this.style)));
    el.formats.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.format === this.format)));
    el.playIco.innerHTML = this.playing ? ICON.pause : ICON.play;
    el.playLabel.textContent = this.playing ? this.t.pause : this.t.play;
    el.play.disabled = !file || this.busy;
    el.video.disabled = !file || this.busy;
    el.image.disabled = !file || this.busy;
    el.drop.hidden = !!this.mode;
    el.undo.hidden = !this.removed;
    el.remove.hidden = !file;
    el.file.hidden = !this.mode;
    el.seekBox.classList.toggle('is-off', !file);
    el.time.classList.toggle('is-off', !file);
    el.other.textContent = this.buffer ? this.t.other : this.t.pick;
    el.mics.forEach((b) => {
      b.classList.toggle('is-on', mic);
      const s = b.querySelector('span');
      if (s) s.textContent = mic ? this.t.micOff + ' ' + clock(this.recSeconds || 0) : this.t.mic;
    });
    if (file && this.duration) {
      el.sizes.forEach((s) => {
        const mb = (QUALITY[Number(s.dataset.q)].bitrate + 160000) * this.duration / 8 / 1048576;
        s.textContent = 'MP4 · ~' + Math.max(1, Math.round(mb)) + ' ' + this.t.mb;
      });
    }
  }

  applyFormat() {
    this.el.stage.style.aspectRatio = RATIO[this.format];
    this.el.stage.dataset.format = this.format;
    this.fitCanvas();
  }

  fitCanvas() {
    const c = this.el.canvas, box = c.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(2, Math.round(box.width * dpr)), h = Math.max(2, Math.round(box.height * dpr));
    if (c.width !== w || c.height !== h) {
      c.width = w;
      c.height = h;
      this.state = {};
    }
    const s = this.el.seekCanvas;
    if (s) {
      const r = s.getBoundingClientRect(), sw = Math.round(r.width * dpr), sh = Math.round(r.height * dpr);
      if (sw && (s.width !== sw || s.height !== sh)) {
        s.width = sw;
        s.height = sh;
        this.wavePeaks = null;
      }
      this.drawSeek();
    }
  }

  previews() {
    this.el.styles.forEach((b) => {
      const c = b.querySelector('canvas'), ctx = c.getContext('2d', { alpha: false }), st = {};
      const n = b.dataset.style === 'spectro' ? 140 : 46;
      for (let i = 0; i < n; i++) drawFrame(ctx, c.width, c.height, demoFrame(i), b.dataset.style, this.palette, st, 1 / 15);
    });
  }

  idle() {
    const st = {}, n = this.style === 'spectro' ? 140 : 46;
    for (let i = 0; i < n; i++) drawFrame(this.ctx2d, this.el.canvas.width, this.el.canvas.height, demoFrame(i), this.style, this.palette, st, 1 / 15);
  }

  drawStill() {
    if (!this.mode) {
      this.idle();
      return;
    }
    if (this.mode === 'file') {
      const at = this.position(), st = {}, f = emptyFrame(), back = this.style === 'spectro' ? 200 : 30;
      for (let i = back; i >= 0; i--) {
        smoothFrame(this.analyser.frame(Math.max(0, at - i / FPS)), f, 1 / FPS);
        drawFrame(this.ctx2d, this.el.canvas.width, this.el.canvas.height, f, this.style, this.palette, st, 1 / FPS);
      }
      this.state = st;
      this.display = f;
    } else {
      drawFrame(this.ctx2d, this.el.canvas.width, this.el.canvas.height, this.display, this.style, this.palette, this.state, 0);
    }
  }

  audio() {
    if (!this.ac || this.ac.state === 'closed') {
      openAudioSession();
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ac = new AC();
    }
    if (this.ac.state !== 'running') {
      try { this.ac.resume(); } catch (e) {}
    }
    return this.ac;
  }

  async load(file) {
    if (this.busy) return;
    touched();
    this.stopMic(true);
    this.pause();
    this.status(this.t.decoding);
    try {
      await this.open(await file.arrayBuffer(), file.name);
    } catch (e) {
      this.status(this.t.badFile);
    }
  }

  async open(data, name) {
    const ac = this.audio();
    const buffer = await new Promise((ok, fail) => {
      const r = ac.decodeAudioData(data, ok, fail);
      if (r && r.then) r.then(ok, fail);
    });
    if (buffer.duration > MAX_FILE) {
      this.status(this.t.tooLong);
      return;
    }
    this.removed = null;
    this.buffer = buffer;
    this.duration = buffer.duration;
    this.analyser = new BufferAnalyser(buffer);
    this.fileName = name;
    this.mode = 'file';
    this.offset = 0;
    this.wavePeaks = null;
    this.showName();
    this.el.dur.textContent = clock(this.duration);
    this.status('');
    this.renderControls();
    this.fitCanvas();
    this.updateTime();
    this.drawStill();
  }

  removeFile() {
    if (this.mode !== 'file' || this.busy) return;
    this.pause();
    this.removed = { buffer: this.buffer, analyser: this.analyser, fileName: this.fileName };
    this.buffer = this.analyser = this.fileName = null;
    this.duration = 0;
    this.offset = 0;
    this.wavePeaks = null;
    this.mode = null;
    this.state = {};
    this.status('');
    this.el.cur.textContent = '0:00';
    this.el.seek.value = '0';
    this.renderControls();
    this.drawSeek();
    this.drawStill();
  }

  undoRemove() {
    const r = this.removed;
    if (!r) return;
    this.removed = null;
    this.buffer = r.buffer;
    this.analyser = r.analyser;
    this.fileName = r.fileName;
    this.duration = r.buffer.duration;
    this.offset = 0;
    this.mode = 'file';
    this.showName();
    this.el.dur.textContent = clock(this.duration);
    this.renderControls();
    this.fitCanvas();
    this.updateTime();
    this.drawStill();
  }

  showName() {
    this.el.name.replaceChildren(this.fileName, Object.assign(document.createElement('small'), { textContent: clock(this.duration) }));
  }

  startRec() {
    if (!this.micStream || typeof MediaRecorder === 'undefined') {
      this.status(this.t.noRec);
      this.stopMic(true);
      return;
    }
    const type = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/webm'].find((m) => MediaRecorder.isTypeSupported(m));
    const rec = new MediaRecorder(this.micStream, type ? { mimeType: type, audioBitsPerSecond: 160000 } : undefined);
    const parts = [];
    rec.ondataavailable = (e) => { if (e.data.size) parts.push(e.data); };
    rec.onstop = async () => {
      clearInterval(this.recTimer);
      this.recorderMic = null;
      const blob = new Blob(parts, { type: rec.mimeType || type || 'audio/webm' });
      const d = new Date();
      const name = this.t.recName + ' ' + String(d.getHours()).padStart(2, '0') + '-' + String(d.getMinutes()).padStart(2, '0');
      this.stopMic(true);
      if (!blob.size) {
        this.status(this.t.noRec);
        return;
      }
      this.status(this.t.decoding);
      try {
        await this.open(await blob.arrayBuffer(), name);
      } catch (e) {
        this.status(this.t.noRec);
        this.renderControls();
      }
    };
    this.recorderMic = rec;
    this.recStart = performance.now();
    this.recSeconds = 0;
    rec.start(1000);
    this.recTimer = setInterval(() => {
      this.recSeconds = (performance.now() - this.recStart) / 1000;
      if (this.recSeconds >= MAX_VIDEO) this.stopRec(); else this.renderControls();
    }, 250);
    this.status(this.t.recHint);
    this.renderControls();
  }

  stopRec() {
    const r = this.recorderMic;
    if (r && r.state !== 'inactive') r.stop();
  }

  position() {
    return this.playing ? Math.min(this.duration, this.offset + this.ac.currentTime - this.startedAt) : this.offset;
  }

  play() {
    if (this.mode !== 'file' || this.playing) return;
    touched();
    const ac = this.audio();
    if (this.offset >= this.duration - 0.05) this.offset = 0;
    const src = ac.createBufferSource();
    src.buffer = this.buffer;
    src.connect(ac.destination);
    if (this.tap) src.connect(this.tap);
    src.onended = () => {
      if (this.source !== src || !this.playing) return;
      this.playing = false;
      this.offset = 0;
      this.source = null;
      this.renderControls();
      this.updateTime();
      this.drawStill();
      this.stopLoop();
      if (this.onEnded) this.onEnded();
    };
    src.start(0, this.offset);
    this.source = src;
    this.startedAt = ac.currentTime;
    this.playing = true;
    this.renderControls();
    this.startLoop();
  }

  pause() {
    if (!this.playing) return;
    this.offset = this.position();
    this.playing = false;
    const src = this.source;
    this.source = null;
    if (src) {
      src.onended = null;
      try { src.stop(); } catch (e) {}
    }
    this.renderControls();
    this.stopLoop();
    this.drawStill();
  }

  seekTo(time) {
    const was = this.playing;
    if (was) this.pause();
    this.offset = Math.max(0, Math.min(this.duration, time));
    this.updateTime();
    if (was) this.play(); else this.drawStill();
  }

  updateTime() {
    if (this.mode !== 'file') return;
    const at = this.position();
    this.el.cur.textContent = clock(at);
    this.el.seek.value = String(Math.round(at / this.duration * 1000));
    this.drawSeek(at);
  }

  drawSeek(at = this.position()) {
    const c = this.el.seekCanvas;
    if (!c.width) return;
    const ctx = c.getContext('2d'), w = c.width, h = c.height;
    ctx.clearRect(0, 0, w, h);
    if (!this.analyser) return;
    const step = Math.max(3, Math.round(w / 220)), count = Math.floor(w / step);
    if (!this.wavePeaks || this.wavePeaks.length !== count) this.wavePeaks = this.analyser.peaks(count);
    const x = at / this.duration * w, peaks = this.wavePeaks, pal = PALETTES[this.palette];
    for (let i = 0; i < peaks.length; i++) {
      const bh = Math.max(2, peaks[i] * h * 0.86), px = i * step;
      ctx.fillStyle = px < x ? pal.a : 'rgba(214,219,230,0.32)';
      ctx.fillRect(px, (h - bh) / 2, Math.max(1, step - 1), bh);
    }
    ctx.fillStyle = '#f0f0f2';
    ctx.fillRect(Math.min(w - 2, x), 0, 2, h);
  }

  startLoop() {
    if (this.looping) return;
    this.looping = true;
    let last = performance.now();
    const step = (now) => {
      if (!this.looping) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const src = this.mode === 'mic' ? this.micAnalyser : this.analyser;
      if (src) {
        const at = this.mode === 'file' ? this.position() : 0;
        smoothFrame(src.frame(at), this.display, dt);
        drawFrame(this.ctx2d, this.el.canvas.width, this.el.canvas.height, this.display, this.style, this.palette, this.state, dt);
        if (this.recorder && this.recordFrame) this.recordFrame();
      }
      if (this.mode === 'file') this.updateTime();
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  stopLoop() {
    this.looping = false;
    cancelAnimationFrame(this.raf);
  }

  async startMic() {
    if (this.busy) return;
    touched();
    this.pause();
    try {
      openRecordSession();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true } });
      const ac = this.audio();
      this.removed = null;
      this.micStream = stream;
      this.micNode = ac.createMediaStreamSource(stream);
      const node = ac.createAnalyser();
      this.micNode.connect(node);
      this.micAnalyser = new LiveAnalyser(node, ac.sampleRate);
      this.mode = 'mic';
      this.el.name.textContent = this.t.micMode;
      this.startRec();
      this.state = {};
      this.renderControls();
      this.startLoop();
    } catch (e) {
      openAudioSession();
      this.status(this.t.noMic);
    }
  }

  stopMic(force) {
    if (this.mode !== 'mic') return;
    if (this.recorderMic && !force) {
      this.stopRec();
      return;
    }
    this.stopLoop();
    if (this.micStream) this.micStream.getTracks().forEach((t) => t.stop());
    if (this.micNode) this.micNode.disconnect();
    this.micStream = this.micNode = this.micAnalyser = null;
    openAudioSession();
    this.mode = this.buffer ? 'file' : null;
    if (this.buffer) this.showName();
    this.status('');
    this.state = {};
    this.renderControls();
    this.fitCanvas();
    this.drawStill();
  }

  setBusy(on, label) {
    this.busy = on;
    this.el.cancel.hidden = !on;
    this.el.videoLabel.textContent = label || this.t.video;
    this.renderControls();
  }

  async makeVideo(q) {
    if (this.mode !== 'file' || this.busy) return;
    if (this.duration > MAX_VIDEO) {
      this.status(this.t.tooLongVid);
      return;
    }
    this.pause();
    const [w, h] = QUALITY[q][this.format], name = safeName(this.fileName) + '-' + this.style + '-' + q + 'p';
    this.abort = new AbortController();
    this.setBusy(true, this.t.making + ' 0%');
    this.status('');
    let mod = null;
    try { mod = await import('./viz-export.js'); } catch (e) {}
    if (mod && mod.canEncode()) {
      const an = this.analyser, style = this.style, pal = this.palette, f = emptyFrame(), st = {};
      try {
        const blob = await mod.encodeVideo({
          buffer: this.buffer, width: w, height: h, fps: FPS, bitrate: QUALITY[q].bitrate, signal: this.abort.signal,
          draw: (ctx, cw, ch, at, dt) => {
            smoothFrame(an.frame(at), f, dt);
            drawFrame(ctx, cw, ch, f, style, pal, st, dt);
          },
          onProgress: (p) => {
            if (this.busy) this.el.videoLabel.textContent = this.t.making + ' ' + Math.floor(p * 100) + '%';
          },
        });
        save(blob, name + '.mp4');
        this.setBusy(false);
        this.status(this.t.done);
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') {
          this.setBusy(false);
          return;
        }
        if (!e || e.message !== 'unsupported') {
          console.error('[viz]', e);
          this.setBusy(false);
          this.status(this.t.error);
          return;
        }
      }
    }
    this.recordRealtime(w, h, name);
  }

  recordRealtime(w, h, name) {
    if (typeof MediaRecorder === 'undefined' || !HTMLCanvasElement.prototype.captureStream) {
      this.setBusy(false);
      this.status(this.t.error);
      return;
    }
    this.status(this.t.realtime);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d', { alpha: false }), st = {}, ac = this.audio();
    this.tap = ac.createMediaStreamDestination();
    const stream = new MediaStream([...c.captureStream(FPS).getVideoTracks(), ...this.tap.stream.getAudioTracks()]);
    const type = ['video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'].find((m) => MediaRecorder.isTypeSupported(m)) || '';
    const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 5e6 });
    const parts = [];
    rec.ondataavailable = (e) => { if (e.data.size) parts.push(e.data); };
    rec.onstop = () => {
      this.tap = null;
      this.recorder = null;
      this.recordFrame = null;
      this.onEnded = null;
      if (!this.recCancelled && parts.length) {
        save(new Blob(parts, { type: rec.mimeType || 'video/webm' }), name + (/mp4/.test(rec.mimeType) ? '.mp4' : '.webm'));
      }
      this.setBusy(false);
      this.status(this.recCancelled ? '' : this.t.done);
    };
    this.recCancelled = false;
    this.recorder = rec;
    this.recordFrame = () => {
      drawFrame(ctx, w, h, this.display, this.style, this.palette, st, 1 / 60);
      this.el.videoLabel.textContent = this.t.recording + ' ' + Math.floor(this.position() / this.duration * 100) + '%';
    };
    this.onEnded = () => { if (rec.state !== 'inactive') rec.stop(); };
    this.offset = 0;
    rec.start(1000);
    this.play();
  }

  cancelVideo() {
    if (this.abort) this.abort.abort();
    if (this.recorder) {
      this.recCancelled = true;
      this.pause();
      if (this.recorder.state !== 'inactive') this.recorder.stop();
    }
  }

  makeImage(kind) {
    if (this.mode !== 'file') return;
    const base = safeName(this.fileName), pal = PALETTES[this.palette];
    if (kind === 'wave-svg') {
      const peaks = this.analyser.peaks(240), W = 2400, H = 600, step = W / 240;
      let rects = '';
      for (let i = 0; i < 240; i++) {
        const bh = Math.max(6, peaks[i] * H * 0.92);
        rects += '<rect x="' + (i * step + step * 0.15).toFixed(1) + '" y="' + ((H - bh) / 2).toFixed(1) + '" width="' + (step * 0.7).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="' + (step * 0.35).toFixed(1) + '"/>';
      }
      const doc = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="' + pal.a + '"/><stop offset="1" stop-color="' + pal.b + '"/></linearGradient></defs><g fill="url(#g)">' + rects + '</g></svg>';
      save(new Blob([doc], { type: 'image/svg+xml' }), base + '-wave.svg');
      return;
    }
    const c = document.createElement('canvas');
    if (kind === 'frame-png') {
      const [w, h] = QUALITY[1080][this.format];
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d', { alpha: false }), at = this.position(), st = {}, f = emptyFrame(), back = this.style === 'spectro' ? 200 : 30;
      for (let i = back; i >= 0; i--) {
        smoothFrame(this.analyser.frame(Math.max(0, at - i / FPS)), f, 1 / FPS);
        drawFrame(ctx, w, h, f, this.style, this.palette, st, 1 / FPS);
      }
      c.toBlob((b) => save(b, base + '-' + this.style + '-' + clock(at).replace(':', '-') + '.png'), 'image/png');
      return;
    }
    if (kind === 'wave-png') {
      const peaks = this.analyser.peaks(240), step = 2400 / 240;
      c.width = 2400;
      c.height = 600;
      const ctx = c.getContext('2d'), g = ctx.createLinearGradient(0, 0, 2400, 0);
      g.addColorStop(0, pal.a);
      g.addColorStop(1, pal.b);
      ctx.fillStyle = g;
      for (let i = 0; i < 240; i++) {
        const bh = Math.max(6, peaks[i] * 600 * 0.92);
        ctx.beginPath();
        ctx.roundRect(i * step + step * 0.15, (600 - bh) / 2, step * 0.7, bh, step * 0.35);
        ctx.fill();
      }
      c.toBlob((b) => save(b, base + '-wave.png'), 'image/png');
      return;
    }
    this.status(this.t.decoding);
    setTimeout(() => {
      const W = 2000, H = 400;
      c.width = W;
      c.height = 800;
      const ctx = c.getContext('2d'), img = ctx.createImageData(W, H), an = this.analyser, sr = an.sr;
      const top = Math.min(16000, sr / 2 * 0.95), half = 1024, bins = new Uint16Array(H);
      for (let y = 0; y < H; y++) bins[y] = Math.min(half - 1, Math.max(1, Math.round(35 * Math.pow(top / 35, y / (H - 1)) / (sr / 2) * half)));
      const lut = heatColors(pal, 256);
      for (let x = 0; x < W; x++) {
        const mag = an.spectrum(Math.round((x + 0.5) / W * an.mono.length));
        for (let y = 0; y < H; y++) {
          const db = 20 * Math.log10(mag[bins[y]] * (1 + y / H * 2.2) + 1e-9);
          const v = Math.min(1, Math.max(0, (db + 90) / 72));
          const col = lut[Math.round(Math.pow(v, 1.3) * 255)], o = ((H - 1 - y) * W + x) * 4;
          img.data[o] = col[0]; img.data[o + 1] = col[1]; img.data[o + 2] = col[2]; img.data[o + 3] = 255;
        }
      }
      const tmp = document.createElement('canvas');
      tmp.width = W;
      tmp.height = H;
      tmp.getContext('2d').putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(tmp, 0, 0, W, 800);
      this.status('');
      c.toBlob((b) => save(b, base + '-spectrogram.png'), 'image/png');
    }, 30);
  }

  dispose() {
    this.cancelVideo();
    this.pause();
    this.stopMic(true);
    if (this.ac) this.ac.close();
  }
}

export function mountVisualizers() {
  document.querySelectorAll('.viz[data-words]:not([data-ready])').forEach((root) => {
    root.dataset.ready = '1';
    new Visualizer(root);
  });
}
