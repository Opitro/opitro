const FFT = 2048;
const BANDS = 72;

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      let t = re[i]; re[i] = re[j]; re[j] = t;
      t = im[i]; im[i] = im[j]; im[j] = t;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang), half = len >> 1;
    for (let s = 0; s < n; s += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < half; k++) {
        const a = s + k, b = a + half;
        const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti;
        re[a] += tr; im[a] += ti;
        const nr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr; cr = nr;
      }
    }
  }
}

function bandEdges(sampleRate, size = FFT, bands = BANDS) {
  const edges = new Uint16Array(bands + 1), nyq = sampleRate / 2, top = Math.min(16000, nyq * 0.95);
  for (let i = 0; i <= bands; i++) {
    const hz = 35 * Math.pow(top / 35, i / bands);
    edges[i] = Math.max(1, Math.min(size / 2 - 1, Math.round(hz / nyq * (size / 2))));
  }
  for (let i = 1; i <= bands; i++) if (edges[i] <= edges[i - 1]) edges[i] = edges[i - 1] + 1;
  return edges;
}

function dbToUnit(db) {
  const v = (db + 88) / 70;
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

export function emptyFrame() {
  return { bands: new Float32Array(BANDS), wave: new Float32Array(512), bass: 0, level: 0, t: 0 };
}

export function smoothFrame(src, dst, dt) {
  const fall = Math.pow(0.72, dt * 30);
  for (let i = 0; i < BANDS; i++) {
    const v = src.bands[i], held = dst.bands[i] * fall;
    dst.bands[i] = v > held ? held + (v - held) * 0.75 : held;
  }
  dst.wave.set(src.wave);
  dst.bass = Math.max(src.bass, dst.bass * Math.pow(0.8, dt * 30));
  dst.level = Math.max(src.level, dst.level * Math.pow(0.85, dt * 30));
  dst.t = src.t;
  return dst;
}

function finishFrame(f) {
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += f.bands[i];
  f.bass = sum / 10;
  let e = 0;
  for (let i = 0; i < f.wave.length; i++) e += f.wave[i] * f.wave[i];
  f.level = Math.min(1, Math.sqrt(e / f.wave.length) * 3);
  return f;
}

export class BufferAnalyser {
  constructor(buffer) {
    this.sr = buffer.sampleRate;
    const len = buffer.length, ch = buffer.numberOfChannels;
    this.mono = new Float32Array(len);
    for (let c = 0; c < ch; c++) {
      const d = buffer.getChannelData(c);
      for (let i = 0; i < len; i++) this.mono[i] += d[i] / ch;
    }
    this.edges = bandEdges(this.sr);
    this.win = new Float32Array(FFT);
    for (let i = 0; i < FFT; i++) this.win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (FFT - 1));
    this.re = new Float32Array(FFT);
    this.im = new Float32Array(FFT);
    this.mag = new Float32Array(FFT / 2);
    this.duration = len / this.sr;
  }

  spectrum(center) {
    const m = this.mono, start = center - FFT / 2;
    for (let i = 0; i < FFT; i++) {
      const p = start + i;
      this.re[i] = (p >= 0 && p < m.length ? m[p] : 0) * this.win[i];
      this.im[i] = 0;
    }
    fft(this.re, this.im);
    for (let i = 0; i < FFT / 2; i++) this.mag[i] = Math.hypot(this.re[i], this.im[i]) / (FFT / 4);
    return this.mag;
  }

  frame(time, out = emptyFrame()) {
    const center = Math.round(time * this.sr), mag = this.spectrum(center), edges = this.edges;
    for (let b = 0; b < BANDS; b++) {
      let peak = 0;
      for (let k = edges[b]; k < edges[b + 1]; k++) if (mag[k] > peak) peak = mag[k];
      const tilt = 1 + b / BANDS * 2.2;
      out.bands[b] = dbToUnit(20 * Math.log10(peak * tilt + 1e-9));
    }
    const wave = out.wave, step = 2, from = center - wave.length * step / 2, m = this.mono;
    for (let i = 0; i < wave.length; i++) {
      const p = from + i * step;
      wave[i] = p >= 0 && p < m.length ? m[p] : 0;
    }
    out.t = time;
    return finishFrame(out);
  }

  peaks(count) {
    const m = this.mono, per = m.length / count, out = new Float32Array(count);
    let max = 1e-6;
    for (let i = 0; i < count; i++) {
      let p = 0;
      const a = Math.floor(i * per), b = Math.min(m.length, Math.floor((i + 1) * per));
      for (let j = a; j < b; j++) {
        const v = Math.abs(m[j]);
        if (v > p) p = v;
      }
      out[i] = p;
      if (p > max) max = p;
    }
    for (let i = 0; i < count; i++) out[i] /= max;
    return out;
  }
}

export class LiveAnalyser {
  constructor(node, sampleRate) {
    this.node = node;
    node.fftSize = FFT;
    node.smoothingTimeConstant = 0;
    this.db = new Float32Array(FFT / 2);
    this.time = new Float32Array(FFT);
    this.edges = bandEdges(sampleRate);
  }

  frame(time, out = emptyFrame()) {
    this.node.getFloatFrequencyData(this.db);
    this.node.getFloatTimeDomainData(this.time);
    const edges = this.edges;
    for (let b = 0; b < BANDS; b++) {
      let peak = -200;
      for (let k = edges[b]; k < edges[b + 1]; k++) if (this.db[k] > peak) peak = this.db[k];
      const tilt = 20 * Math.log10(1 + b / BANDS * 2.2);
      out.bands[b] = dbToUnit(peak + tilt - 6);
    }
    const wave = out.wave, from = (FFT - wave.length * 2) / 2;
    for (let i = 0; i < wave.length; i++) wave[i] = this.time[from + i * 2];
    out.t = time;
    return finishFrame(out);
  }
}

function sampleFrame(seed = 1) {
  const f = emptyFrame();
  let s = seed * 9301 + 49297;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < BANDS; i++) {
    const x = i / BANDS;
    f.bands[i] = Math.min(1, 0.92 * Math.exp(-x * 1.6) + 0.28 * Math.sin(x * 11 + 0.6) ** 2 + 0.12 * rnd());
  }
  for (let i = 0; i < f.wave.length; i++) {
    const x = i / f.wave.length;
    f.wave[i] = 0.55 * Math.sin(x * Math.PI * 6) * Math.sin(x * Math.PI) + 0.18 * Math.sin(x * Math.PI * 31) + 0.06 * (rnd() - 0.5);
  }
  return finishFrame(f);
}

export function demoFrame(n) {
  const f = sampleFrame(1 + n % 7), kick = Math.max(0, Math.sin(n / 4)) ** 3;
  for (let i = 0; i < 12; i++) f.bands[i] = Math.min(1, f.bands[i] * (0.75 + kick * 0.4));
  f.bass = Math.min(1, 0.35 + kick * 0.6);
  return f;
}

export const PALETTES = {
  night: { a: '#38bdf8', b: '#818cf8', bg: '#0b1220' },
  sunset: { a: '#f472b6', b: '#fbbf24', bg: '#170f1f' },
  mint: { a: '#34d399', b: '#22d3ee', bg: '#07161a' },
  fire: { a: '#fde047', b: '#ef4444', bg: '#160c0a' },
  mono: { a: '#ffffff', b: '#94a3b8', bg: '#0d0f12' },
};

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function grad(ctx, x0, y0, x1, y1, p) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, p.a);
  g.addColorStop(1, p.b);
  return g;
}

function background(ctx, w, h, f, p) {
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, w, h);
  const [r, g, b] = rgb(p.a);
  const glow = ctx.createRadialGradient(w / 2, h * 0.62, 0, w / 2, h * 0.62, Math.max(w, h) * 0.7);
  glow.addColorStop(0, `rgba(${r},${g},${b},${0.07 + f.bass * 0.13})`);
  glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

function resample(bands, n) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = i / (n - 1) * (BANDS - 1), k = Math.floor(x), fr = x - k;
    out[i] = bands[k] * (1 - fr) + bands[Math.min(BANDS - 1, k + 1)] * fr;
  }
  return out;
}

function smoothPath(ctx, pts, closed) {
  const n = pts.length;
  if (closed) {
    const last = pts[n - 1], first = pts[0];
    ctx.moveTo((last[0] + first[0]) / 2, (last[1] + first[1]) / 2);
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
    }
    ctx.closePath();
  } else {
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < n - 1; i++) {
      const p = pts[i], q = pts[i + 1];
      ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
    }
    ctx.lineTo(pts[n - 1][0], pts[n - 1][1]);
  }
}

function drawBars(ctx, w, h, f, p, st, dt) {
  const n = w > h ? 64 : 40, v = resample(f.bands, n), pad = w * 0.06, base = h * 0.86, top = h * 0.12;
  const step = (w - pad * 2) / n, gap = step * 0.28;
  if (!st.peaks || st.peaks.length !== n) st.peaks = new Float32Array(n);
  ctx.fillStyle = grad(ctx, pad, 0, w - pad, 0, p);
  for (let i = 0; i < n; i++) {
    const bh = Math.max(step * 0.4, v[i] * (base - top)), x = pad + i * step + gap / 2;
    ctx.beginPath();
    ctx.roundRect(x, base - bh, step - gap, bh, Math.min(6, (step - gap) / 2));
    ctx.fill();
    st.peaks[i] = Math.max(v[i], st.peaks[i] - dt * 0.35);
  }
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#fff';
  for (let i = 0; i < n; i++) {
    const y = base - st.peaks[i] * (base - top) - step * 0.5;
    ctx.fillRect(pad + i * step + gap / 2, y, step - gap, Math.max(2, h * 0.006));
  }
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = grad(ctx, pad, 0, w - pad, 0, p);
  for (let i = 0; i < n; i++) {
    const bh = v[i] * (base - top) * 0.25;
    ctx.fillRect(pad + i * step + gap / 2, base + h * 0.012, step - gap, bh);
  }
  ctx.globalAlpha = 1;
}

function drawMirror(ctx, w, h, f, p) {
  const n = w > h ? 96 : 56, v = resample(f.bands, n / 2), pad = w * 0.04, mid = h / 2, amp = h * 0.4;
  const step = (w - pad * 2) / n;
  ctx.fillStyle = grad(ctx, 0, mid - amp, 0, mid + amp, p);
  for (let i = 0; i < n; i++) {
    const k = i < n / 2 ? n / 2 - 1 - i : i - n / 2, bh = Math.max(step * 0.3, v[k] * amp);
    ctx.beginPath();
    ctx.roundRect(pad + i * step + step * 0.2, mid - bh, step * 0.6, bh * 2, step * 0.3);
    ctx.fill();
  }
}

function drawScope(ctx, w, h, f, p) {
  const wave = f.wave, mid = h / 2, amp = h * 0.36;
  let max = 0;
  for (let i = 0; i < wave.length; i++) max = Math.max(max, Math.abs(wave[i]));
  const gain = 1 / Math.max(0.12, max), pts = [];
  for (let i = 0; i < wave.length; i += 2) {
    const s = (wave[i] + (wave[i + 1] || 0)) / 2;
    pts.push([i / (wave.length - 1) * w, mid - Math.max(-1, Math.min(1, s * gain)) * amp]);
  }
  const g = grad(ctx, 0, 0, w, 0, p);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const [lw, a] of [[h * 0.05, 0.08], [h * 0.022, 0.2], [h * 0.007, 1]]) {
    ctx.globalAlpha = a;
    ctx.strokeStyle = g;
    ctx.lineWidth = lw;
    ctx.beginPath();
    smoothPath(ctx, pts, false);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawCircle(ctx, w, h, f, p) {
  const cx = w / 2, cy = h / 2, m = Math.min(w, h), r = m * (0.2 + f.bass * 0.04), n = 120;
  const v = resample(f.bands, n / 2), g = grad(ctx, cx - m / 2, cy - m / 2, cx + m / 2, cy + m / 2, p);
  ctx.strokeStyle = g;
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(2, 2 * Math.PI * r / n * 0.55);
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const k = i < n / 2 ? i : n - 1 - i, a = i / n * Math.PI * 2 - Math.PI / 2, len = m * 0.02 + v[k] * m * 0.24;
    ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a) * (r + len), cy + Math.sin(a) * (r + len));
  }
  ctx.stroke();
  ctx.fillStyle = p.bg;
  ctx.beginPath();
  ctx.arc(cx, cy, r - ctx.lineWidth, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.35 + f.level * 0.5;
  ctx.lineWidth = Math.max(2, m * 0.006);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawBlob(ctx, w, h, f, p, st, dt) {
  const cx = w / 2, cy = h / 2, m = Math.min(w, h);
  st.rot = (st.rot || 0) + dt * 0.25;
  const n = 64, v = resample(f.bands, n / 2);
  for (const [scale, alpha, shift] of [[1.18, 0.25, 0.5], [1, 0.9, 0]]) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const k = i < n / 2 ? i : n - 1 - i, a = i / n * Math.PI * 2 + st.rot + shift;
      const r = m * (0.17 + f.bass * 0.05 + v[k] * 0.17) * scale;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    ctx.globalAlpha = alpha;
    ctx.fillStyle = grad(ctx, cx - m * 0.4, cy - m * 0.4, cx + m * 0.4, cy + m * 0.4, p);
    ctx.beginPath();
    smoothPath(ctx, pts, true);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = p.bg;
  ctx.beginPath();
  ctx.arc(cx, cy, m * 0.09, 0, Math.PI * 2);
  ctx.fill();
}

function drawHills(ctx, w, h, f, p) {
  const n = 48, v = resample(f.bands, n), floor = h * 0.92;
  const [r1, g1, b1] = rgb(p.a), [r2, g2, b2] = rgb(p.b);
  for (const [scale, alpha, mix] of [[0.62, 0.35, 0.9], [0.8, 0.55, 0.45], [1, 1, 0]]) {
    const pts = [[0, floor]];
    for (let i = 0; i < n; i++) pts.push([i / (n - 1) * w, floor - v[i] * h * 0.72 * scale - h * 0.02]);
    pts.push([w, floor]);
    const r = r1 + (r2 - r1) * mix, g = g1 + (g2 - g1) * mix, b = b1 + (b2 - b1) * mix;
    const fill = ctx.createLinearGradient(0, h * 0.15, 0, floor);
    fill.addColorStop(0, `rgba(${r | 0},${g | 0},${b | 0},${alpha})`);
    fill.addColorStop(1, `rgba(${r | 0},${g | 0},${b | 0},${alpha * 0.15})`);
    ctx.fillStyle = fill;
    ctx.beginPath();
    smoothPath(ctx, pts, false);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, floor, w, h - floor);
}

function drawLine(ctx, w, h, f, p) {
  const v = resample(f.bands, 40), mid = h * 0.55, amp = h * 0.38, g = grad(ctx, 0, 0, w, 0, p);
  for (const dir of [1, -1]) {
    const pts = [];
    for (let i = -39; i < 40; i++) {
      const k = Math.abs(i);
      pts.push([w / 2 + i / 39 * w * 0.46, mid - dir * v[k] * amp * (dir > 0 ? 1 : 0.35)]);
    }
    ctx.globalAlpha = dir > 0 ? 1 : 0.35;
    ctx.strokeStyle = g;
    ctx.lineWidth = Math.max(2, h * 0.008);
    ctx.lineJoin = 'round';
    ctx.beginPath();
    smoothPath(ctx, pts, false);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = g;
  ctx.fillRect(w * 0.04, mid - 1, w * 0.92, 2);
  ctx.globalAlpha = 1;
}

function drawLed(ctx, w, h, f, p) {
  const cols = w > h ? 32 : 18, rows = 22, v = resample(f.bands, cols), padX = w * 0.06, top = h * 0.1, bottom = h * 0.9;
  const cw = (w - padX * 2) / cols, rh = (bottom - top) / rows;
  const [r1, g1, b1] = rgb(p.a), [r2, g2, b2] = rgb(p.b);
  for (let row = 0; row < rows; row++) {
    const t = row / (rows - 1);
    const on = `rgb(${r1 + (r2 - r1) * t | 0},${g1 + (g2 - g1) * t | 0},${b1 + (b2 - b1) * t | 0})`;
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = v[c] * rows > row + 0.3 ? on : 'rgba(255,255,255,0.05)';
      ctx.fillRect(padX + c * cw + cw * 0.12, bottom - (row + 1) * rh + rh * 0.18, cw * 0.76, rh * 0.64);
    }
  }
}

function drawPulse(ctx, w, h, f, p, st, dt) {
  const cx = w / 2, cy = h / 2, m = Math.min(w, h);
  st.rings = st.rings || [];
  st.cool = Math.max(0, (st.cool || 0) - dt);
  const prev = st.bass || 0;
  if (f.bass > 0.45 && f.bass - prev > 0.04 && st.cool === 0) {
    st.rings.push({ r: m * 0.16, a: 0.9 });
    st.cool = 0.18;
  }
  st.bass = f.bass;
  const g = grad(ctx, cx - m / 2, cy - m / 2, cx + m / 2, cy + m / 2, p);
  ctx.strokeStyle = g;
  for (const ring of st.rings) {
    ring.r += dt * m * 0.45;
    ring.a -= dt * 0.7;
    if (ring.a <= 0) continue;
    ctx.globalAlpha = ring.a;
    ctx.lineWidth = m * 0.008;
    ctx.beginPath();
    ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
    ctx.stroke();
  }
  st.rings = st.rings.filter((ring) => ring.a > 0);
  const r = m * (0.12 + f.bass * 0.09), [cr, cg, cb] = rgb(p.a);
  const glow = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 2.4);
  glow.addColorStop(0, `rgba(${cr},${cg},${cb},${0.35 + f.level * 0.4})`);
  glow.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
  ctx.globalAlpha = 1;
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

export function heatColors(p, steps = 64) {
  const bg = rgb(p.bg), b = rgb(p.b), a = rgb(p.a), out = [];
  const mix = (x, y, t) => x.map((v, i) => v + (y[i] - v) * t);
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const c = t < 0.5 ? mix(bg, b, t * 2) : t < 0.85 ? mix(b, a, (t - 0.5) / 0.35) : mix(a, [255, 255, 255], (t - 0.85) / 0.15);
    out.push([c[0] | 0, c[1] | 0, c[2] | 0]);
  }
  return out;
}

function drawSpectro(ctx, w, h, f, p, st, dt) {
  const bw = Math.max(1, Math.round(w / 1.5)), bh = Math.max(1, Math.round(h / 1.5));
  if (!st.buf || st.buf.width !== bw || st.buf.height !== bh) {
    st.buf = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(bw, bh) : Object.assign(document.createElement('canvas'), { width: bw, height: bh });
    st.bx = st.buf.getContext('2d');
    st.bx.fillStyle = p.bg;
    st.bx.fillRect(0, 0, bw, bh);
    st.acc = 0;
    st.lut = null;
  }
  if (!st.lut || st.lutKey !== p.a + p.b) {
    st.lutKey = p.a + p.b;
    st.lut = heatColors(p);
  }
  st.acc += dt * bw / 6;
  const cols = Math.floor(st.acc);
  st.acc -= cols;
  if (cols > 0) {
    const bx = st.bx;
    bx.drawImage(st.buf, -cols, 0);
    if (!st.col || st.col.height !== bh || st.col.width !== cols) st.col = bx.createImageData(cols, bh);
    const d = st.col.data;
    for (let y = 0; y < bh; y++) {
      const x = (bh - 1 - y) / (bh - 1) * (BANDS - 1), k = Math.floor(x), fr = x - k;
      const v = f.bands[k] * (1 - fr) + f.bands[Math.min(BANDS - 1, k + 1)] * fr;
      const c = st.lut[Math.min(63, Math.round(Math.pow(v, 1.3) * 63))];
      for (let i = 0; i < cols; i++) {
        const o = (y * cols + i) * 4;
        d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
      }
    }
    bx.putImageData(st.col, bw - cols, 0);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(st.buf, 0, 0, w, h);
}

function mix(p, t, alpha = 1) {
  const [r1, g1, b1] = rgb(p.a), [r2, g2, b2] = rgb(p.b);
  return `rgba(${r1 + (r2 - r1) * t | 0},${g1 + (g2 - g1) * t | 0},${b1 + (b2 - b1) * t | 0},${alpha})`;
}

function drawRing(ctx, w, h, f, p) {
  const cx = w / 2, cy = h / 2, m = Math.min(w, h), r = m * (0.24 + f.bass * 0.03), wave = f.wave, n = 160;
  let max = 0;
  for (let i = 0; i < wave.length; i++) max = Math.max(max, Math.abs(wave[i]));
  const gain = 1 / Math.max(0.15, max), pts = [];
  for (let i = 0; i < n; i++) {
    const k = i < n / 2 ? i : n - 1 - i, s = wave[Math.floor(k / (n / 2) * (wave.length - 1))] * gain;
    const a = i / n * Math.PI * 2 - Math.PI / 2, rr = r + s * m * 0.09;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  const g = grad(ctx, cx - m / 2, cy - m / 2, cx + m / 2, cy + m / 2, p);
  ctx.lineJoin = 'round';
  for (const [lw, a] of [[m * 0.06, 0.08], [m * 0.025, 0.22], [m * 0.008, 1]]) {
    ctx.globalAlpha = a;
    ctx.strokeStyle = g;
    ctx.lineWidth = lw;
    ctx.beginPath();
    smoothPath(ctx, pts, true);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.25 + f.level * 0.4;
  ctx.lineWidth = Math.max(1, m * 0.004);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawSparks(ctx, w, h, f, p, st, dt) {
  const cx = w / 2, cy = h / 2, m = Math.min(w, h);
  st.parts = st.parts || [];
  st.carry = (st.carry || 0) + dt * (20 + f.level * 120 + f.bass * 260);
  while (st.carry >= 1 && st.parts.length < 700) {
    st.carry -= 1;
    const a = Math.random() * Math.PI * 2;
    st.parts.push({ a, d: m * 0.1, v: m * (0.12 + f.bass * 0.7 + Math.random() * 0.25), life: 1, size: 0.6 + Math.random() * 1.6, t: Math.random() });
  }
  st.carry = Math.min(st.carry, 1);
  ctx.globalCompositeOperation = 'lighter';
  for (const q of st.parts) {
    q.d += q.v * dt;
    q.life -= dt * 0.6;
    if (q.life <= 0) continue;
    ctx.fillStyle = mix(p, q.t, q.life * 0.9);
    ctx.beginPath();
    ctx.arc(cx + Math.cos(q.a) * q.d, cy + Math.sin(q.a) * q.d, Math.max(1, m * 0.004 * q.size), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  st.parts = st.parts.filter((q) => q.life > 0);
  const r = m * (0.07 + f.bass * 0.05), [cr, cg, cb] = rgb(p.a);
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 3);
  glow.addColorStop(0, `rgba(${cr},${cg},${cb},${0.5 + f.level * 0.4})`);
  glow.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6);
  ctx.fillStyle = grad(ctx, cx - r, cy - r, cx + r, cy + r, p);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawRetro(ctx, w, h, f, p, st, dt) {
  const hz = h * 0.6, m = Math.min(w, h), sunR = m * 0.24, sunY = hz - sunR * 0.35;
  st.z = ((st.z || 0) + dt * (0.5 + f.bass * 1.6)) % 1;
  const sun = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
  sun.addColorStop(0, p.b);
  sun.addColorStop(1, p.a);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, hz);
  ctx.clip();
  ctx.globalAlpha = 0.85 + f.level * 0.15;
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(w / 2, sunY, sunR * (1 + f.bass * 0.06), 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = p.bg;
  for (let i = 0; i < 6; i++) {
    const y = sunY + sunR * (0.05 + i * 0.16), th = sunR * (0.025 + i * 0.022);
    ctx.fillRect(0, y, w, th);
  }
  const n = 48, v = resample(f.bands, n / 2), pts = [[0, hz]];
  for (let i = 0; i <= n; i++) {
    const k = Math.min(n / 2 - 1, Math.abs(i - n / 2));
    pts.push([i / n * w, hz - (0.04 + v[n / 2 - 1 - k] * 0.3) * h * (0.35 + Math.abs(i - n / 2) / n)]);
  }
  pts.push([w, hz]);
  ctx.fillStyle = p.bg;
  ctx.beginPath();
  smoothPath(ctx, pts, false);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = mix(p, 0.3, 0.9);
  ctx.lineWidth = Math.max(1.5, h * 0.004);
  ctx.beginPath();
  smoothPath(ctx, pts.slice(1, -1), false);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, hz, w, h - hz);
  ctx.strokeStyle = mix(p, 1, 0.7);
  ctx.lineWidth = Math.max(1, h * 0.003);
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const t = (i + st.z) / 12, y = hz + (h - hz) * t * t;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  for (let i = -12; i <= 12; i++) {
    ctx.moveTo(w / 2 + i * w * 0.02, hz);
    ctx.lineTo(w / 2 + i * w * 0.16, h);
  }
  ctx.stroke();
  const fade = ctx.createLinearGradient(0, hz, 0, hz + (h - hz) * 0.35);
  fade.addColorStop(0, p.bg);
  fade.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = fade;
  ctx.fillRect(0, hz, w, (h - hz) * 0.35);
}

function drawTunnel(ctx, w, h, f, p, st, dt) {
  const cx = w / 2, cy = h / 2, big = Math.hypot(w, h) * 0.6, n = 16, v = resample(f.bands, n);
  st.z = ((st.z || 0) + dt * (0.35 + f.level * 1.4)) % 1;
  st.rot = (st.rot || 0) + dt * (0.15 + f.bass * 0.5);
  ctx.lineJoin = 'round';
  for (let i = n - 1; i >= 0; i--) {
    const d = (i + st.z) / n, s = d * d, r = big * s + 4;
    ctx.strokeStyle = mix(p, d, Math.min(1, d * 1.6));
    ctx.lineWidth = Math.max(1, (1 + v[i] * 10) * (0.3 + s) * (Math.min(w, h) / 360));
    ctx.beginPath();
    for (let k = 0; k <= 6; k++) {
      const a = k / 6 * Math.PI * 2 + st.rot * (1 - d * 0.6);
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawDots(ctx, w, h, f, p) {
  const cols = w > h ? 36 : 20, rows = w > h ? 15 : 27, v = resample(f.bands, cols);
  const cw = w * 0.9 / cols, rh = h * 0.84 / rows, x0 = w * 0.05 + cw / 2, y0 = h * 0.08 + rh / 2, mid = (rows - 1) / 2;
  const maxR = Math.min(cw, rh) * 0.42;
  for (let c = 0; c < cols; c++) {
    const reach = v[c] * mid * 1.1;
    for (let r = 0; r < rows; r++) {
      const dist = Math.abs(r - mid), on = Math.max(0, Math.min(1, reach - dist + 1));
      ctx.fillStyle = on > 0 ? mix(p, c / (cols - 1), 0.25 + on * 0.75) : 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.arc(x0 + c * cw, y0 + r * rh, maxR * (0.3 + on * 0.7), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawWaves(ctx, w, h, f, p, st, dt) {
  const mid = h / 2, groups = [[0, 8], [8, 20], [20, 34], [34, 50], [50, 72]];
  st.ph = (st.ph || 0) + dt * (1.6 + f.level * 3);
  ctx.globalCompositeOperation = 'lighter';
  groups.forEach(([a, b], g) => {
    let e = 0;
    for (let i = a; i < b; i++) e += f.bands[i];
    e /= b - a;
    const amp = h * 0.36 * (0.08 + e * e * 1.1), freq = 1.2 + g * 0.55, ph = st.ph * (1 + g * 0.35) + g * 1.7;
    const steps = 90;
    ctx.fillStyle = mix(p, g / 4, 0.38);
    ctx.beginPath();
    ctx.moveTo(0, mid);
    for (let i = 0; i <= steps; i++) {
      const x = i / steps, env = Math.sin(Math.PI * x) ** 2;
      ctx.lineTo(x * w, mid - Math.sin(x * Math.PI * 2 * freq + ph) * amp * env);
    }
    for (let i = steps; i >= 0; i--) {
      const x = i / steps, env = Math.sin(Math.PI * x) ** 2;
      ctx.lineTo(x * w, mid + Math.sin(x * Math.PI * 2 * freq + ph) * amp * env * 0.6);
    }
    ctx.closePath();
    ctx.fill();
  });
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(w * 0.03, mid - 0.5, w * 0.94, 1);
}

function drawVinyl(ctx, w, h, f, p, st, dt) {
  const cx = w / 2, cy = h / 2, m = Math.min(w, h), R = m * 0.3, n = 140, v = resample(f.bands, n / 2);
  st.rot = (st.rot || 0) + dt * Math.PI * 2 * 33.3 / 60;
  ctx.strokeStyle = grad(ctx, cx - m / 2, cy - m / 2, cx + m / 2, cy + m / 2, p);
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(2, 2 * Math.PI * R / n * 0.5);
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const k = i < n / 2 ? i : n - 1 - i, a = i / n * Math.PI * 2 - Math.PI / 2, r0 = R * 1.06, len = m * 0.01 + v[k] * m * 0.15;
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
    ctx.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len));
  }
  ctx.stroke();
  ctx.fillStyle = '#0a0a0c';
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.055)';
  ctx.lineWidth = 1;
  for (let r = R * 0.4; r < R * 0.97; r += Math.max(2, R * 0.03)) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(st.rot);
  for (const [a0, alpha] of [[0, 0.14], [Math.PI, 0.08]]) {
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, R * 0.97, a0 - 0.22, a0 + 0.22);
    ctx.closePath();
    ctx.fill();
  }
  const lr = R * 0.34;
  ctx.fillStyle = grad(ctx, -lr, -lr, lr, lr, p);
  ctx.beginPath();
  ctx.arc(0, 0, lr * (1 + f.bass * 0.05), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(-lr * 0.6, -lr * 0.5, lr * 1.2, lr * 0.12);
  ctx.fillRect(-lr * 0.4, lr * 0.35, lr * 0.8, lr * 0.08);
  ctx.restore();
  ctx.fillStyle = p.bg;
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(2, R * 0.03), 0, Math.PI * 2);
  ctx.fill();
}

function drawRidges(ctx, w, h, f, p, st, dt) {
  const rows = w > h ? 26 : 34, n = 48;
  st.hist = st.hist || [];
  st.acc = (st.acc || 0) + dt;
  if (st.acc >= 1 / 15 || !st.hist.length) {
    st.acc = 0;
    st.hist.push(resample(f.bands, n / 2));
    if (st.hist.length > rows) st.hist.shift();
  }
  const top = h * 0.12, gap = h * 0.76 / rows, span = w * (w > h ? 0.56 : 0.8), x0 = (w - span) / 2;
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(1.2, h * 0.0028);
  const list = st.hist;
  for (let r = 0; r < list.length; r++) {
    const v = list[r], y = top + (rows - list.length + r + 1) * gap, t = r / Math.max(1, list.length - 1), pts = [];
    for (let i = 0; i <= n; i++) {
      const x = i / n, k = Math.min(n / 2 - 1, Math.abs(i - n / 2)), env = Math.exp(-Math.pow((x - 0.5) / 0.22, 2));
      pts.push([x0 + x * span, y - v[k] * gap * 7 * env - gap * 0.15 * env]);
    }
    ctx.fillStyle = p.bg;
    ctx.beginPath();
    smoothPath(ctx, pts, false);
    ctx.lineTo(x0 + span, y + gap);
    ctx.lineTo(x0, y + gap);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = mix(p, 1 - t, 0.25 + t * 0.75);
    ctx.beginPath();
    smoothPath(ctx, pts, false);
    ctx.stroke();
  }
}

export const STYLES = [
  { id: 'bars', draw: drawBars },
  { id: 'mirror', draw: drawMirror },
  { id: 'circle', draw: drawCircle },
  { id: 'blob', draw: drawBlob },
  { id: 'hills', draw: drawHills },
  { id: 'scope', draw: drawScope },
  { id: 'line', draw: drawLine },
  { id: 'led', draw: drawLed },
  { id: 'pulse', draw: drawPulse },
  { id: 'spectro', draw: drawSpectro },
  { id: 'ring', draw: drawRing },
  { id: 'sparks', draw: drawSparks },
  { id: 'retro', draw: drawRetro },
  { id: 'tunnel', draw: drawTunnel },
  { id: 'dots', draw: drawDots },
  { id: 'waves', draw: drawWaves },
  { id: 'vinyl', draw: drawVinyl },
  { id: 'ridges', draw: drawRidges },
];

export function drawFrame(ctx, w, h, f, styleId, paletteId, st, dt) {
  const p = PALETTES[paletteId] || PALETTES.night;
  const style = STYLES.find((s) => s.id === styleId) || STYLES[0];
  if (style.id === 'ridges') {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, w, h);
  } else if (style.id !== 'spectro') background(ctx, w, h, f, p);
  style.draw(ctx, w, h, f, p, st, dt);
}
