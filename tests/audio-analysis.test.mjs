// Runs the shipped analysis functions against signals whose answer is known in advance.
// AudioBuffer doesn't exist in Node, so a tiny shim provides what these functions actually use.
import { analyzeVocalRange, detectKey, analyzeAudiobook, hzToNote } from '../src/lib/web-audio-engine.js';

const SR = 44100;
const buf = (a) => ({ sampleRate: SR, length: a.length, duration: a.length / SR, numberOfChannels: 1, getChannelData: () => a });
const noteHz = (name) => {
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const m = name.match(/^([A-G]#?)(-?\d)$/);
  const midi = names.indexOf(m[1]) + (Number(m[2]) + 1) * 12;
  return 440 * Math.pow(2, (midi - 69) / 12);
};
function sing(notes, secsEach = 0.6) {
  const n = Math.round(SR * secsEach);
  const out = new Float32Array(n * notes.length);
  notes.forEach((name, k) => {
    const f = noteHz(name);
    for (let i = 0; i < n; i++) {
      const env = Math.min(1, i / (SR * 0.05)) * Math.min(1, (n - i) / (SR * 0.05));
      // A couple of harmonics, so it isn't a bare sine -- closer to a voice, and a harder test.
      out[k * n + i] = env * 0.5 * (Math.sin(2*Math.PI*f*i/SR) + 0.4*Math.sin(4*Math.PI*f*i/SR) + 0.2*Math.sin(6*Math.PI*f*i/SR)) / 1.6;
    }
  });
  return out;
}
function chordProgression(notes, secs = 8) {
  const n = Math.round(SR * secs);
  const out = new Float32Array(n);
  const freqs = notes.map(noteHz);
  for (let i = 0; i < n; i++) {
    let v = 0;
    for (const f of freqs) v += Math.sin(2 * Math.PI * f * i / SR);
    out[i] = 0.4 * v / freqs.length;
  }
  return out;
}
let pass = 0, fail = 0;
const check = (label, got, want, ok) => { (ok ? pass++ : fail++); console.log((ok ? '  ok   ' : '  FAIL ') + label.padEnd(46) + 'получено ' + got + ' | ожидалось ' + want); };

console.log('ДИАПАЗОН ГОЛОСА');
for (const [low, mid, high] of [['C3',['E3','G3','C4','E4'],'C5'], ['E2',['G2','C3','E3','C4'],'G4'], ['A3',['C4','E4','A4','C5'],'E5']]) {
  const notes = [low, ...mid, high];
  const r = analyzeVocalRange(buf(sing(notes)));
  check(`пел от ${low} до ${high}`, r ? r.low.name + '–' + r.high.name : 'null',
    low + '–' + high, !!r && r.low.name === low && r.high.name === high);
}

console.log('ТОНАЛЬНОСТЬ');
for (const [name, notes, want] of [
  ['до мажор (C-E-G + гамма)', ['C3','E3','G3','C4','D4','E4','F4','G4','A4','B4'], 'C major'],
  ['ля минор (A-C-E + гамма)', ['A2','C3','E3','A3','B3','C4','D4','E4','F4','G4'], 'A minor'],
  ['соль мажор', ['G2','B2','D3','G3','A3','B3','C4','D4','E4','F#4'], 'G major'],
]) {
  const k = detectKey(buf(chordProgression(notes)));
  const got = k ? k.name + ' ' + k.mode : 'null';
  check(name, got, want, got === want);
}

console.log('ПРОВЕРКА АУДИОКНИГИ');
function speech(rmsTarget, peakTarget, floorTarget, secs = 6) {
  const n = Math.round(SR * secs);
  const out = new Float32Array(n);
  let seed = 3; const rnd = () => { seed = (seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff*2-1; };
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const talking = (t % 2) < 1.4;                       // gaps between "sentences"
    out[i] = (talking ? Math.sin(2*Math.PI*180*t) * rmsTarget * 1.6 : 0) + rnd() * floorTarget;
  }
  // Plant an exact peak so the peak reading can be checked against a known number.
  out[Math.round(n/2)] = peakTarget;
  return out;
}
const a = analyzeAudiobook(buf(speech(0.07, 0.5, 0.0005)));
check('пик 0.5 -> -6.0 дБ', a.peakDb.toFixed(1), '-6.0', Math.abs(a.peakDb + 6.02) < 0.1);
check('шумовой порог около -66 дБ', a.floorDb.toFixed(1), '≈ -66', a.floorDb < -60 && a.floorDb > -75);
check('вердикт по порогу (тихо -> ok)', String(a.floorOk), 'true', a.floorOk === true);
const loud = analyzeAudiobook(buf(speech(0.07, 0.99, 0.02)));
check('шумный файл -> порог не проходит', String(loud.floorOk), 'false', loud.floorOk === false);
check('пик 0.99 -> не проходит (нужно <= -3 дБ)', String(loud.peakOk), 'false', loud.peakOk === false);

console.log(`\nитого: ${pass} прошло, ${fail} не прошло`);
process.exit(fail ? 1 : 0);
