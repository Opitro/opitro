
const ANNOTATION_ONLY = /^[\s]*[[(<][^\])>]*[\])>][\s.,!?…-]*$/;

export function normalizeChunks(chunks, duration = 0) {
  const out = [];
  for (const c of chunks || []) {
    const text = String(c.text ?? '').replace(/\s+/g, ' ').trim();
    if (!text || ANNOTATION_ONLY.test(text)) continue;
    const ts = c.timestamp || [];
    const rawStart = Number.isFinite(ts[0]) ? ts[0] : c.start;
    const rawEnd = Number.isFinite(ts[1]) ? ts[1] : c.end;
    const start = Number.isFinite(rawStart) ? Math.max(0, rawStart) : (out.length ? out[out.length - 1].end : 0);
    const end = Number.isFinite(rawEnd) ? rawEnd : null;
    out.push({ start, end, text });
  }
  out.sort((a, b) => a.start - b.start);
  for (let i = 0; i < out.length; i++) {
    const next = out[i + 1];

    if (out[i].end == null) out[i].end = next ? next.start : (duration || out[i].start + 2);
    if (duration) out[i].end = Math.min(out[i].end, duration);

    if (next && out[i].end > next.start) out[i].end = next.start;
    if (out[i].end <= out[i].start) out[i].end = out[i].start + 0.4;
  }
  return out;
}

function stamp(seconds, sep) {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const ms = Math.round((s - Math.floor(s)) * 1000);
  const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(h)}:${p(m)}:${p(sec)}${sep}${p(ms, 3)}`;
}

export function wrapCaption(text, maxChars = 42, maxLines = 2) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if (!line) { line = w; continue; }
    if ((line + ' ' + w).length <= maxChars) line += ' ' + w;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines.join('\n');

  const perLine = Math.ceil(text.length / maxLines);
  const rebuilt = [];
  let cur = '';
  for (const w of words) {
    if (cur && (cur + ' ' + w).length > perLine && rebuilt.length < maxLines - 1) { rebuilt.push(cur); cur = w; }
    else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) rebuilt.push(cur);
  return rebuilt.join('\n');
}

export function toSrt(chunks, opts = {}) {
  const list = normalizeChunks(chunks, opts.duration);
  return list
    .map((c, i) => `${i + 1}\n${stamp(c.start, ',')} --> ${stamp(c.end, ',')}\n${wrapCaption(c.text, opts.maxChars)}\n`)
    .join('\n');
}

export function toVtt(chunks, opts = {}) {
  const list = normalizeChunks(chunks, opts.duration);
  return 'WEBVTT\n\n' + list
    .map((c) => `${stamp(c.start, '.')} --> ${stamp(c.end, '.')}\n${wrapCaption(c.text, opts.maxChars)}\n`)
    .join('\n');
}

export function toPlainText(chunks, opts = {}) {
  const list = normalizeChunks(chunks, opts.duration);
  if (!list.length) return '';
  const gap = opts.paragraphGap ?? 1.2;
  const paragraphs = [];
  let cur = [];
  list.forEach((c, i) => {
    cur.push(c.text);
    const next = list[i + 1];

    const ended = /[.!?…]["»)]?$/.test(c.text);
    if (!next || (ended && next.start - c.end >= gap)) { paragraphs.push(cur.join(' ')); cur = []; }
  });
  if (cur.length) paragraphs.push(cur.join(' '));
  return paragraphs.join('\n\n').replace(/ +/g, ' ').trim();
}

export function toTimestamped(chunks, opts = {}) {
  return normalizeChunks(chunks, opts.duration)
    .map((c) => {
      const m = Math.floor(c.start / 60);
      const s = Math.floor(c.start % 60);
      return `[${m}:${String(s).padStart(2, '0')}] ${c.text}`;
    })
    .join('\n');
}

export function countWords(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

export function attachSpeakers(chunks, segments, opts = {}) {
  const minShare = opts.minShare ?? 0.2;
  const speech = (segments || []).filter((s) => s.id !== 0 && s.end > s.start);
  const list = normalizeChunks(chunks, opts.duration);
  if (!speech.length) return list.map((c) => ({ ...c, speaker: null }));

  const order = [];
  for (const s of speech.slice().sort((a, b) => a.start - b.start)) if (!order.includes(s.id)) order.push(s.id);
  const numberOf = new Map(order.map((id, i) => [id, i + 1]));

  return list.map((c) => {
    const totals = new Map();
    for (const s of speech) {
      const overlap = Math.min(c.end, s.end) - Math.max(c.start, s.start);
      if (overlap > 0) totals.set(s.id, (totals.get(s.id) || 0) + overlap);
    }
    let bestId = null, best = 0;
    for (const [id, v] of totals) if (v > best) { best = v; bestId = id; }

    if (bestId == null || best < (c.end - c.start) * minShare) return { ...c, speaker: null };
    return { ...c, speaker: numberOf.get(bestId) };
  });
}

export function speakerCount(chunks) {
  const seen = new Set();
  for (const c of chunks || []) if (c.speaker) seen.add(c.speaker);
  return seen.size;
}

export function groupBySpeaker(chunks) {
  const turns = [];
  for (const c of chunks || []) {
    const last = turns[turns.length - 1];
    if (last && last.speaker === (c.speaker ?? null)) {
      last.text += ' ' + c.text;
      last.end = c.end;
    } else {
      turns.push({ speaker: c.speaker ?? null, start: c.start, end: c.end, text: c.text });
    }
  }
  return turns;
}

export function toSpeakerText(chunks, label, opts = {}) {
  return groupBySpeaker(chunks)
    .map((t) => (t.speaker ? label(t.speaker) + ': ' : '') + t.text)
    .join('\n\n')
    .trim();
}

export function toSpeakerTimestamped(chunks, label) {
  return groupBySpeaker(chunks)
    .map((t) => {
      const m = Math.floor(t.start / 60);
      const s = Math.floor(t.start % 60);
      return `[${m}:${String(s).padStart(2, '0')}] ` + (t.speaker ? label(t.speaker) + ': ' : '') + t.text;
    })
    .join('\n');
}
