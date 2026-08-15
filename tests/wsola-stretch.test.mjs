// Растяжение по времени не было покрыто ни одной проверкой -- и это дорого обошлось:
// переписав функцию на генератор ради порционного расчёта, поломку поймать было нечем.
// Здесь оба входа проверяются на одном и том же звуке.
class FakeAudioBuffer {
  constructor({ numberOfChannels, length, sampleRate }) {
    this.numberOfChannels = numberOfChannels; this.length = length; this.sampleRate = sampleRate;
    this.duration = length / sampleRate;
    this._d = Array.from({ length: numberOfChannels }, () => new Float32Array(length));
  }
  getChannelData(c) { return this._d[c]; }
}
globalThis.AudioBuffer = FakeAudioBuffer;
globalThis.window = { AudioContext: function () {}, devicePixelRatio: 1 };
globalThis.requestAnimationFrame = (fn) => setTimeout(fn, 0);

const eng = await import('../src/lib/web-audio-engine.js');
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log('НЕ ПРОШЛО:', name); } };

const sr = 44100;
const tone = (len, hz = 440) => {
  const b = new FakeAudioBuffer({ numberOfChannels: 1, length: len, sampleRate: sr });
  const d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.sin(2 * Math.PI * hz * i / sr) * 0.5;
  return b;
};
const peak = (b) => { let p = 0; const d = b.getChannelData(0); for (let i = 100; i < d.length - 100; i++) { const v = Math.abs(d[i]); if (v > p) p = v; } return p; };

const src = tone(sr);
for (const [name, factor, expect] of [['вдвое короче', 0.5, sr / 2], ['вдвое длиннее', 2, sr * 2], ['без изменений', 1, sr]]) {
  const a = eng.wsolaStretch(src, factor);
  ok('синхронный, ' + name + ': длина', Math.abs(a.length - expect) <= 2);
  ok('синхронный, ' + name + ': звук не пропал', peak(a) > 0.2);
  const b = await eng.wsolaStretchChunked(src, factor);
  ok('порционный, ' + name + ': длина', Math.abs(b.length - expect) <= 2);
  ok('порционный, ' + name + ': звук не пропал', peak(b) > 0.2);
  ok('оба входа дают одну длину, ' + name, a.length === b.length);
}
// Слишком короткий кусок не растягиваем -- возвращаем как есть, а не ломаемся.
const tiny = tone(100);
ok('короткий кусок возвращается как есть', eng.wsolaStretch(tiny, 0.5).length === 100);
ok('короткий кусок, порционный', (await eng.wsolaStretchChunked(tiny, 0.5)).length === 100);

// Сдвиг высоты длительность НЕ меняет -- это его главное отличие от скорости.
const p = await eng.pitchShiftChunked(src, 5);
ok('высота тона: длительность сохранилась', Math.abs(p.length - sr) < sr * 0.05);
ok('высота тона: звук не пропал', peak(p) > 0.2);

console.log(`итого: ${pass} прошло, ${fail} не прошло`);
if (fail) process.exit(1);
