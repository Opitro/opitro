
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'd', 'g', 'c', 'f', 'bb', 'eb']);

export function keyUsesFlats(key) {
  if (!key) return false;
  const tag = key.mode === 'minor' ? key.name.toLowerCase() : key.name;
  return FLAT_KEYS.has(tag);
}

export function midiToName(midi, useFlats = false) {
  const names = useFlats ? FLAT_NAMES : SHARP_NAMES;
  return names[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1);
}

export const SENSITIVITY = [
  { onsetThresh: 0.90, frameThresh: 0.60, minLen: 17 },
  { onsetThresh: 0.80, frameThresh: 0.50, minLen: 11 },
  { onsetThresh: 0.70, frameThresh: 0.40, minLen: 11 },
  { onsetThresh: 0.60, frameThresh: 0.30, minLen: 11 },
  { onsetThresh: 0.50, frameThresh: 0.30, minLen: 5 },
];
export const SENSITIVITY_DEFAULT = 2;

export function cleanNotes(notes, opts = {}) {
  const gapMerge = opts.gapMerge ?? 0;
  const minDur = opts.minDur ?? 0.045;
  const minAmp = opts.minAmp ?? 0.15;

  const kept = notes
    .filter((n) => n.dur >= minDur && n.amp >= minAmp)
    .sort((a, b) => a.onset - b.onset || a.midi - b.midi);
  if (gapMerge <= 0) return kept.map((n) => ({ midi: n.midi, onset: n.onset, dur: n.dur, amp: n.amp }));

  const byPitch = new Map();
  for (const n of kept) {
    if (!byPitch.has(n.midi)) byPitch.set(n.midi, []);
    byPitch.get(n.midi).push(n);
  }
  const out = [];
  for (const list of byPitch.values()) {
    let cur = null;
    for (const n of list) {
      if (cur && n.onset - (cur.onset + cur.dur) <= gapMerge) {
        cur.dur = Math.max(cur.onset + cur.dur, n.onset + n.dur) - cur.onset;
        cur.amp = Math.max(cur.amp, n.amp);
      } else {
        cur = { midi: n.midi, onset: n.onset, dur: n.dur, amp: n.amp };
        out.push(cur);
      }
    }
  }
  return out.sort((a, b) => a.onset - b.onset || a.midi - b.midi);
}

export function transposeNotes(notes, semitones) {
  if (!semitones) return notes;
  return notes
    .map((n) => ({ ...n, midi: n.midi + semitones }))

    .filter((n) => n.midi >= 0 && n.midi <= 127);
}

export function quantizeNotes(notes, bpm, division = 4) {
  if (!bpm || bpm <= 0) return notes;
  const step = 60 / bpm / division;
  const minStep = step;
  return notes.map((n) => {
    const onset = Math.round(n.onset / step) * step;
    const dur = Math.max(minStep, Math.round(n.dur / step) * step);
    return { ...n, onset, dur };
  });
}

const KS_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KS_MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

function correlate(a, b) {
  const n = a.length;
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - ma, y = b[i] - mb;
    num += x * y; da += x * x; db += y * y;
  }
  return da && db ? num / Math.sqrt(da * db) : 0;
}

export function keyFromNotes(notes) {
  if (!notes.length) return null;
  const chroma = new Array(12).fill(0);

  for (const n of notes) chroma[((n.midi % 12) + 12) % 12] += n.dur * n.amp;
  const total = chroma.reduce((a, b) => a + b, 0);
  if (total <= 0) return null;
  let best = null;
  for (let root = 0; root < 12; root++) {
    for (const [mode, profile] of [['major', KS_MAJOR], ['minor', KS_MINOR]]) {
      const rotated = profile.map((_, i) => profile[(i - root + 12) % 12]);
      const score = correlate(chroma, rotated);
      if (!best || score > best.score) best = { root, mode, score };
    }
  }
  return { name: SHARP_NAMES[best.root], mode: best.mode, score: best.score, chroma };
}

export function tempoFromNotes(notes, opts = {}) {
  const minBpm = opts.minBpm ?? 50;
  const maxBpm = opts.maxBpm ?? 200;
  const BIN = 0.01;

  const onsets = [];
  for (const n of notes.slice().sort((a, b) => a.onset - b.onset)) {
    const last = onsets[onsets.length - 1];
    if (last && n.onset - last.t < 0.04) { last.w = Math.max(last.w, n.amp); continue; }
    onsets.push({ t: n.onset, w: n.amp });
  }
  if (onsets.length < 6) return 0;

  const span = onsets[onsets.length - 1].t - onsets[0].t;
  if (span < 2) return 0;
  const bins = Math.ceil(span / BIN) + 1;
  const train = new Float64Array(bins);
  for (const o of onsets) {
    const i = Math.round((o.t - onsets[0].t) / BIN);
    if (i >= 0 && i < bins) train[i] += o.w;
  }

  const smeared = new Float64Array(bins);
  const R = 3;
  for (let i = 0; i < bins; i++) {
    if (!train[i]) continue;
    for (let d = -R; d <= R; d++) {
      const j = i + d;
      if (j >= 0 && j < bins) smeared[j] += train[i] * (1 - Math.abs(d) / (R + 1));
    }
  }

  const minLag = Math.max(1, Math.floor(60 / maxBpm / BIN));
  const maxLag = Math.min(bins - 2, Math.ceil(60 / minBpm / BIN));
  if (maxLag <= minLag) return 0;
  const corr = new Float64Array(maxLag + 2);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let acc = 0;
    for (let i = 0; i + lag < bins; i++) acc += smeared[i] * smeared[i + lag];
    corr[lag] = acc / (bins - lag);
  }

  let bestLag = 0, bestScore = -1;
  for (let lag = minLag; lag <= maxLag; lag++) {
    const bpm = 60 / (lag * BIN);

    const s = corr[lag] * Math.exp(-0.5 * Math.pow(Math.log2(bpm / 120) / 0.9, 2));
    if (s > bestScore) { bestScore = s; bestLag = lag; }
  }
  if (!bestLag || bestScore <= 0) return 0;

  const halfLag = Math.round(bestLag / 2);
  if (halfLag >= minLag && corr[halfLag] > corr[bestLag] * 0.5) bestLag = halfLag;
  const y0 = corr[bestLag - 1] || 0, y1 = corr[bestLag], y2 = corr[bestLag + 1] || 0;
  const denom = y0 - 2 * y1 + y2;
  const shift = denom !== 0 ? 0.5 * (y0 - y2) / denom : 0;
  const lag = bestLag + Math.max(-1, Math.min(1, shift));
  return Math.round(60 / (lag * BIN) * 2) / 2;
}

const CHORD_TEMPLATES = [
  { suffix: '',     tone: 1.0,  weights: { 0: 1.0, 4: 1.0, 7: 0.8 } },
  { suffix: 'm',    tone: 1.0,  weights: { 0: 1.0, 3: 1.0, 7: 0.8 } },
  { suffix: '7',    tone: 0.94, weights: { 0: 1.0, 4: 0.9, 7: 0.6, 10: 0.9 } },
  { suffix: 'm7',   tone: 0.94, weights: { 0: 1.0, 3: 0.9, 7: 0.6, 10: 0.9 } },
  { suffix: 'maj7', tone: 0.90, weights: { 0: 1.0, 4: 0.9, 7: 0.6, 11: 0.9 } },
  { suffix: 'sus4', tone: 0.88, weights: { 0: 1.0, 5: 1.0, 7: 0.8 } },
  { suffix: 'sus2', tone: 0.88, weights: { 0: 1.0, 2: 1.0, 7: 0.8 } },
  { suffix: 'dim',  tone: 0.85, weights: { 0: 1.0, 3: 1.0, 6: 1.0 } },
  { suffix: 'aug',  tone: 0.80, weights: { 0: 1.0, 4: 1.0, 8: 1.0 } },
];

const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

function chromaOfWindow(notes, from, to) {
  const chroma = new Float64Array(12);
  let lowest = null;
  for (const n of notes) {
    const start = Math.max(n.onset, from);
    const end = Math.min(n.onset + n.dur, to);
    const overlap = end - start;
    if (overlap <= 0) continue;

    chroma[((n.midi % 12) + 12) % 12] += overlap * n.amp;
    if (lowest === null || n.midi < lowest) lowest = n.midi;
  }
  return { chroma, bass: lowest };
}

function scoreChord(chroma, root, template) {
  let dot = 0, tmplNorm = 0, chromaNorm = 0;
  for (let i = 0; i < 12; i++) {
    const w = template.weights[((i - root) % 12 + 12) % 12] || 0;
    dot += chroma[i] * w;
    tmplNorm += w * w;
    chromaNorm += chroma[i] * chroma[i];
  }
  if (!chromaNorm || !tmplNorm) return 0;
  return (dot / Math.sqrt(tmplNorm * chromaNorm)) * template.tone;
}

export function estimateChords(notes, bpm, opts = {}) {
  if (!notes.length || !bpm || bpm <= 0) return [];
  const beatsPerWindow = opts.beatsPerWindow ?? 2;
  const switchPenalty = opts.switchPenalty ?? 0.22;
  const minScore = opts.minScore ?? 0.55;
  const key = opts.key || null;
  const useFlats = keyUsesFlats(key);
  const names = useFlats ? FLAT_NAMES : SHARP_NAMES;

  const beat = 60 / bpm;
  const windowDur = beat * beatsPerWindow;
  const first = Math.min(...notes.map((n) => n.onset));
  const last = Math.max(...notes.map((n) => n.onset + n.dur));
  const origin = Math.max(0, first - (first % windowDur));

  const candidates = [{ label: null, root: null, template: null }];
  for (let root = 0; root < 12; root++) {
    for (const template of CHORD_TEMPLATES) candidates.push({ root, template });
  }

  const windows = [];
  for (let t = origin; t < last - 1e-6; t += windowDur) {
    const { chroma, bass } = chromaOfWindow(notes, t, t + windowDur);
    const total = chroma.reduce((a, b) => a + b, 0);
    const scores = candidates.map((c) => {
      if (c.root === null) return total > 0 ? 0.42 : 1.0;
      let s = scoreChord(chroma, c.root, c.template);

      if (key && s > 0) {
        const scale = key.mode === 'minor' ? MINOR_SCALE : MAJOR_SCALE;
        const tonic = SHARP_NAMES.indexOf(key.name);
        if (tonic >= 0 && scale.includes(((c.root - tonic) % 12 + 12) % 12)) s *= 1.06;
      }
      return s < minScore ? 0 : s;
    });
    windows.push({ start: t, end: t + windowDur, scores, bass, total });
  }
  if (!windows.length) return [];

  const n = candidates.length;
  let prev = windows[0].scores.slice();
  const back = [];
  for (let w = 1; w < windows.length; w++) {
    const cur = new Float64Array(n);
    const ptr = new Int32Array(n);

    let bestPrev = -Infinity, bestIdx = 0;
    for (let i = 0; i < n; i++) if (prev[i] > bestPrev) { bestPrev = prev[i]; bestIdx = i; }
    for (let j = 0; j < n; j++) {
      const stay = prev[j];
      const move = bestPrev - switchPenalty;
      if (stay >= move) { cur[j] = stay + windows[w].scores[j]; ptr[j] = j; }
      else { cur[j] = move + windows[w].scores[j]; ptr[j] = bestIdx; }
    }
    back.push(ptr);
    prev = cur;
  }
  let bestEnd = 0;
  for (let i = 1; i < n; i++) if (prev[i] > prev[bestEnd]) bestEnd = i;
  const path = new Array(windows.length);
  path[windows.length - 1] = bestEnd;
  for (let w = windows.length - 2; w >= 0; w--) path[w] = back[w][path[w + 1]];

  const spans = [];
  for (let w = 0; w < windows.length; w++) {
    const c = candidates[path[w]];
    const label = c.root === null ? null : names[c.root] + c.template.suffix;
    const prevSpan = spans[spans.length - 1];
    if (prevSpan && prevSpan.label === label) {
      prevSpan.end = windows[w].end;
      if (windows[w].bass !== null) prevSpan.bassNotes.push(windows[w].bass);
    } else {
      spans.push({
        label, start: windows[w].start, end: windows[w].end,
        root: c.root, suffix: c.template ? c.template.suffix : null,
        bassNotes: windows[w].bass === null ? [] : [windows[w].bass],
      });
    }
  }

  return spans.map((s) => {

    let slash = null;
    if (s.root !== null && s.bassNotes.length) {
      const pcs = s.bassNotes.map((m) => ((m % 12) + 12) % 12);
      const allSame = pcs.every((p) => p === pcs[0]);
      if (allSame && pcs[0] !== s.root) slash = names[pcs[0]];
    }
    return {
      label: s.label === null ? null : s.label + (slash ? '/' + slash : ''),
      chord: s.label,
      bass: slash,
      start: +s.start.toFixed(3),
      end: +s.end.toFixed(3),
      degree: s.root === null ? null : degreeOf(s.root, s.suffix, key),
      nashville: s.root === null ? null : nashvilleOf(s.root, s.suffix, key),
    };
  });
}

function scaleIndex(root, key) {
  if (!key) return null;
  const tonic = SHARP_NAMES.indexOf(key.name);
  if (tonic < 0) return null;
  const scale = key.mode === 'minor' ? MINOR_SCALE : MAJOR_SCALE;
  const interval = ((root - tonic) % 12 + 12) % 12;
  const idx = scale.indexOf(interval);
  return idx < 0 ? null : idx;
}

function degreeOf(root, suffix, key) {
  const idx = scaleIndex(root, key);
  if (idx === null) return null;
  const minorish = suffix === 'm' || suffix === 'm7' || suffix === 'dim';
  const numeral = minorish ? ROMAN[idx].toLowerCase() : ROMAN[idx];
  return numeral + (suffix === 'dim' ? '°' : suffix === '7' ? '7' : suffix === 'maj7' ? 'maj7' : suffix === 'm7' ? '7' : '');
}

function nashvilleOf(root, suffix, key) {
  const idx = scaleIndex(root, key);
  if (idx === null) return null;
  return String(idx + 1) + (suffix === '' ? '' : suffix);
}

const TICKS_PER_QUARTER = 480;

function variableLength(value) {
  const bytes = [value & 0x7f];
  let v = value >> 7;
  while (v > 0) { bytes.unshift((v & 0x7f) | 0x80); v >>= 7; }
  return bytes;
}

function chunk(id, data) {
  const out = [];
  for (const ch of id) out.push(ch.charCodeAt(0));
  out.push((data.length >> 24) & 0xff, (data.length >> 16) & 0xff, (data.length >> 8) & 0xff, data.length & 0xff);
  return out.concat(data);
}

export function notesToMidi(notes, bpm = 120, key = null, opts = {}) {
  const tempo = Math.round(60000000 / (bpm || 120));
  const meta = [];
  meta.push(0, 0xff, 0x51, 0x03, (tempo >> 16) & 0xff, (tempo >> 8) & 0xff, tempo & 0xff);
  meta.push(0, 0xff, 0x58, 0x04, 4, 2, 24, 8);
  if (key) {

    const CIRCLE_MAJOR = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6 };
    const CIRCLE_MINOR = { A: 0, E: 1, B: 2, 'F#': 3, 'C#': 4, 'G#': 5, 'D#': 6, D: -1, G: -2, C: -3, F: -4, Bb: -5, Eb: -6 };
    const sf = (key.mode === 'minor' ? CIRCLE_MINOR : CIRCLE_MAJOR)[key.name];
    if (sf !== undefined) meta.push(0, 0xff, 0x59, 0x02, sf & 0xff, key.mode === 'minor' ? 1 : 0);
  }
  if (opts.trackName) {
    const bytes = Array.from(new TextEncoder().encode(opts.trackName));
    meta.push(0, 0xff, 0x03, ...variableLength(bytes.length), ...bytes);
  }
  meta.push(0, 0xff, 0x2f, 0x00);

  const secToTicks = (s) => Math.max(0, Math.round((s * bpm / 60) * TICKS_PER_QUARTER));
  const events = [];
  for (const n of notes) {
    const on = secToTicks(n.onset);
    const off = Math.max(on + 1, secToTicks(n.onset + n.dur));

    const vel = Math.max(1, Math.min(127, Math.round(n.amp * 127)));
    events.push({ tick: on, data: [0x90, n.midi & 0x7f, vel] });
    events.push({ tick: off, data: [0x80, n.midi & 0x7f, 0] });
  }

  events.sort((a, b) => a.tick - b.tick || (a.data[0] & 0xf0) - (b.data[0] & 0xf0));

  const track = [];
  let last = 0;
  for (const e of events) {
    track.push(...variableLength(e.tick - last), ...e.data);
    last = e.tick;
  }
  track.push(0, 0xff, 0x2f, 0x00);

  const header = chunk('MThd', [0, 1, 0, 2, (TICKS_PER_QUARTER >> 8) & 0xff, TICKS_PER_QUARTER & 0xff]);
  return new Uint8Array([...header, ...chunk('MTrk', meta), ...chunk('MTrk', track)]);
}

export function notesToCsv(notes, useFlats = false) {
  const rows = [['note', 'midi', 'start_seconds', 'duration_seconds', 'velocity']];
  for (const n of notes) {
    rows.push([
      midiToName(n.midi, useFlats), String(n.midi),
      n.onset.toFixed(3), n.dur.toFixed(3),
      String(Math.max(1, Math.min(127, Math.round(n.amp * 127)))),
    ]);
  }
  return rows.map((r) => r.join(',')).join('\n') + '\n';
}

const WRITTEN = [
  [16, 'w', 0], [12, 'h', 1], [8, 'h', 0], [6, 'q', 1],
  [4, 'q', 0], [3, '8', 1], [2, '8', 0], [1, '16', 0],
];
const XML_TYPE = { w: 'whole', h: 'half', q: 'quarter', 8: 'eighth', 16: '16th' };

const MAJOR_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const MINOR_KEYS = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'Bbm', 'Bm'];
const FIFTHS_MAJOR = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, Gb: -6, Db: -5, Ab: -4, Eb: -3, Bb: -2, F: -1 };
const FIFTHS_MINOR = { Am: 0, Em: 1, Bm: 2, 'F#m': 3, 'C#m': 4, 'G#m': 5, Ebm: -6, Bbm: -5, Fm: -4, Cm: -3, Gm: -2, Dm: -1 };

export function keySpec(key) {
  if (!key) return { name: 'C', fifths: 0, flats: false };
  const pc = SHARP_NAMES.indexOf(key.name);
  if (pc < 0) return { name: 'C', fifths: 0, flats: false };
  const name = key.mode === 'minor' ? MINOR_KEYS[pc] : MAJOR_KEYS[pc];
  const fifths = (key.mode === 'minor' ? FIFTHS_MINOR : FIFTHS_MAJOR)[name] ?? 0;
  return { name, fifths, flats: fifths < 0 };
}

function splitDuration(units) {

  const out = [];
  let left = units;
  while (left > 0) {
    const found = WRITTEN.find(([n]) => n <= left);
    if (!found) break;
    out.push({ units: found[0], duration: found[1], dots: found[2] });
    left -= found[0];
  }
  return out;
}

export function notesToScore(notes, bpm = 120, key = null, opts = {}) {
  const beatsPerMeasure = opts.beatsPerMeasure ?? 4;
  const legato = opts.legato ?? true;
  const spec = keySpec(key);
  const beat = 60 / (bpm || 120);
  const unit = beat / 4;
  const perMeasure = beatsPerMeasure * 4;
  const names = spec.flats ? FLAT_NAMES : SHARP_NAMES;

  const sorted = notes.slice().sort((a, b) => a.onset - b.onset || a.midi - b.midi);
  const quantized = sorted.map((n) => ({
    midi: n.midi,
    start: Math.round(n.onset / unit),
    len: Math.max(1, Math.round(n.dur / unit)),
  }));

  const staffOf = (midi) => (midi >= 60 ? 'treble' : 'bass');
  const lastUnit = quantized.length ? Math.max(...quantized.map((n) => n.start + n.len)) : perMeasure;
  const measureCount = Math.max(1, Math.ceil(lastUnit / perMeasure));

  const totalUnits = measureCount * perMeasure;
  const measures = Array.from({ length: measureCount }, (_, m) => ({ index: m + 1, staves: { treble: [], bass: [] } }));

  for (const staff of ['treble', 'bass']) {

    const groups = [];
    for (const n of quantized) {
      if (staffOf(n.midi) !== staff) continue;
      const g = groups.find((g) => g.start === n.start);
      if (g) { g.midis.push(n.midi); g.len = Math.max(g.len, n.len); }
      else groups.push({ start: n.start, midis: [n.midi], len: n.len });
    }
    groups.sort((a, b) => a.start - b.start);

    const spans = [];
    let cursor = 0;
    groups.forEach((g, i) => {
      if (g.start > cursor) spans.push({ start: cursor, units: g.start - cursor, rest: true });
      const nextStart = i + 1 < groups.length ? groups[i + 1].start : totalUnits;
      const room = nextStart - g.start;
      let len = Math.max(1, Math.min(g.len, room, totalUnits - g.start));

      if (legato && room - len <= len) len = Math.min(room, totalUnits - g.start);
      spans.push({ start: g.start, units: len, midis: g.midis.slice().sort((a, b) => a - b) });
      cursor = g.start + len;
    });
    if (cursor < totalUnits) spans.push({ start: cursor, units: totalUnits - cursor, rest: true });

    for (const span of spans) {
      const pieces = [];
      let at = span.start, left = span.units;
      while (left > 0) {
        const barEnd = (Math.floor(at / perMeasure) + 1) * perMeasure;
        const chunk = Math.min(left, barEnd - at);
        for (const w of splitDuration(chunk)) { pieces.push({ ...w, at, measure: Math.floor(at / perMeasure) }); at += w.units; }
        left -= chunk;
      }
      pieces.forEach((p, k) => {
        const ev = { units: p.units, duration: p.duration, dots: p.dots };
        if (span.rest) ev.rest = true;
        else {
          ev.keys = span.midis.map((midi) => ({
            midi,
            name: names[((midi % 12) + 12) % 12],
            octave: Math.floor(midi / 12) - 1,
          }));
          ev.tieStart = k < pieces.length - 1;
          ev.tieEnd = k > 0;
        }
        measures[p.measure].staves[staff].push(ev);
      });
    }
  }
  return { bpm: Math.round(bpm), key: spec, beatsPerMeasure, measures };
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

export function notesToMusicXml(notes, bpm = 120, key = null, opts = {}) {
  const score = notesToScore(notes, bpm, key, opts);
  const DIVISIONS = 4;
  const measureUnits = score.beatsPerMeasure * 4;

  const stepOf = (name) => ({ step: name[0], alter: name.length > 1 ? (name[1] === '#' ? 1 : -1) : 0 });

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n';
  xml += '<score-partwise version="4.0">\n';
  xml += `  <work><work-title>${escapeXml(opts.title || 'Transcription')}</work-title></work>\n`;
  xml += '  <part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>\n';
  xml += '  <part id="P1">\n';

  for (const measure of score.measures) {
    xml += `    <measure number="${measure.index}">\n`;
    if (measure.index === 1) {
      xml += '      <attributes>\n';
      xml += `        <divisions>${DIVISIONS}</divisions>\n`;
      xml += `        <key><fifths>${score.key.fifths}</fifths><mode>${key && key.mode === 'minor' ? 'minor' : 'major'}</mode></key>\n`;
      xml += `        <time><beats>${score.beatsPerMeasure}</beats><beat-type>4</beat-type></time>\n`;
      xml += '        <staves>2</staves>\n';
      xml += '        <clef number="1"><sign>G</sign><line>2</line></clef>\n';
      xml += '        <clef number="2"><sign>F</sign><line>4</line></clef>\n';
      xml += '      </attributes>\n';
      xml += `      <direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit><per-minute>${score.bpm}</per-minute></metronome></direction-type><sound tempo="${score.bpm}"/></direction>\n`;
    }
    ['treble', 'bass'].forEach((staff, si) => {
      if (si === 1) xml += `      <backup><duration>${measureUnits}</duration></backup>\n`;
      for (const ev of measure.staves[staff]) {
        const type = XML_TYPE[ev.duration];
        const dots = '<dot/>'.repeat(ev.dots || 0);
        if (ev.rest) {
          xml += `      <note><rest/><duration>${ev.units}</duration><voice>${si + 1}</voice><type>${type}</type>${dots}<staff>${si + 1}</staff></note>\n`;
          continue;
        }
        ev.keys.forEach((k, i) => {
          const { step, alter } = stepOf(k.name);
          const tie = (ev.tieEnd ? '<tie type="stop"/>' : '') + (ev.tieStart ? '<tie type="start"/>' : '');
          const tied = (ev.tieEnd ? '<tied type="stop"/>' : '') + (ev.tieStart ? '<tied type="start"/>' : '');
          xml += '      <note>\n';
          if (i > 0) xml += '        <chord/>\n';
          xml += `        <pitch><step>${step}</step>${alter ? `<alter>${alter}</alter>` : ''}<octave>${k.octave}</octave></pitch>\n`;
          xml += `        <duration>${ev.units}</duration>${tie}<voice>${si + 1}</voice><type>${type}</type>${dots}<staff>${si + 1}</staff>\n`;
          if (tied) xml += `        <notations>${tied}</notations>\n`;
          xml += '      </note>\n';
        });
      }
    });
    xml += '    </measure>\n';
  }
  xml += '  </part>\n</score-partwise>\n';
  return xml;
}

export function noteStats(notes, useFlats = false) {
  if (!notes.length) return { count: 0, lowest: null, highest: null, polyphony: 0 };
  let lo = Infinity, hi = -Infinity;
  for (const n of notes) { if (n.midi < lo) lo = n.midi; if (n.midi > hi) hi = n.midi; }

  const edges = [];
  for (const n of notes) { edges.push([n.onset, 1]); edges.push([n.onset + n.dur, -1]); }
  edges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let cur = 0, max = 0;
  for (const [, d] of edges) { cur += d; if (cur > max) max = cur; }
  return { count: notes.length, lowest: midiToName(lo, useFlats), highest: midiToName(hi, useFlats), polyphony: max };
}
