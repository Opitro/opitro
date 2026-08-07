// Checks the note-handling layer against material whose correct answer is written down here,
// not eyeballed off a piano roll. The chord tests matter most: a chord estimator that reacts to
// every frame produces something that looks detailed and is unplayable, and only a test that
// counts the chord changes catches it.
import {
  cleanNotes, transposeNotes, quantizeNotes, estimateChords,
  notesToMidi, notesToCsv, notesToMusicXml, noteStats, midiToName, keyUsesFlats,
  keyFromNotes, tempoFromNotes, notesToScore, keySpec,
} from '../src/lib/midi-transcribe.js';

let pass = 0, fail = 0;
function check(name, got, want, ok) {
  if (ok) { pass++; console.log(`  ok    ${name}`); }
  else { fail++; console.log(`  ПРОВАЛ ${name}\n        получено: ${got}\n        ожидалось: ${want}`); }
}

const N = (n) => {
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const m = n.match(/^([A-G]#?)(-?\d)$/);
  return names.indexOf(m[1]) + (Number(m[2]) + 1) * 12;
};

/* --- names ------------------------------------------------------------------------------- */
console.log('\nимена нот');
check('60 -> C4', midiToName(60), 'C4', midiToName(60) === 'C4');
check('61 диезом -> C#4', midiToName(61), 'C#4', midiToName(61) === 'C#4');
check('61 бемолем -> Db4', midiToName(61, true), 'Db4', midiToName(61, true) === 'Db4');
check('фа мажор пишется бемолями', String(keyUsesFlats({ name: 'F', mode: 'major' })), 'true', keyUsesFlats({ name: 'F', mode: 'major' }) === true);
check('соль мажор пишется диезами', String(keyUsesFlats({ name: 'G', mode: 'major' })), 'false', keyUsesFlats({ name: 'G', mode: 'major' }) === false);

/* --- cleanup ----------------------------------------------------------------------------- */
console.log('\nчистка нот');
// One held C4 that the model reported as three fragments with tiny gaps.
const fragments = [
  { midi: 60, onset: 0.00, dur: 0.60, amp: 0.7 },
  { midi: 60, onset: 0.63, dur: 0.50, amp: 0.6 },
  { midi: 60, onset: 1.16, dur: 0.40, amp: 0.65 },
];
// Merging is off by default -- see the note in cleanNotes for the repeated-note case that
// made it unsafe. Switched on explicitly here so the behaviour itself stays covered.
const glued = cleanNotes(fragments, { gapMerge: 0.09 });
check('по умолчанию обрывки НЕ склеиваются', String(cleanNotes(fragments).length), '3', cleanNotes(fragments).length === 3);
// A chord holding A2 to 6.0s then another chord playing A2 at 6.0s: gap zero, and merging
// silently turns two notes into one. This is the case that took merging out of the default.
const repeated = cleanNotes([
  { midi: 45, onset: 4, dur: 2.0, amp: 0.8 },
  { midi: 45, onset: 6, dur: 2.0, amp: 0.8 },
]);
check('повтор ноты вплотную сохраняется', String(repeated.length), '2', repeated.length === 2);
check('три обрывка одной ноты -> одна', String(glued.length), '1', glued.length === 1);
check('склеенная длится всё время', glued[0]?.dur.toFixed(2), '1.56', Math.abs(glued[0].dur - 1.56) < 0.01);
check('громкость берётся максимальная', String(glued[0]?.amp), '0.7', glued[0].amp === 0.7);

const withJunk = cleanNotes([
  { midi: 60, onset: 0, dur: 0.5, amp: 0.8 },
  { midi: 72, onset: 0, dur: 0.02, amp: 0.8 },   // too short
  { midi: 55, onset: 0, dur: 0.5, amp: 0.05 },   // too quiet
]);
check('короткая и тихая отбрасываются', String(withJunk.length), '1', withJunk.length === 1);

// A real melody note an octave above a chord tone must survive: this is the case that made the
// obvious "drop anything an octave up" rule unusable, and it is worth a standing test.
const octavePair = cleanNotes([
  { midi: 52, onset: 0, dur: 2.0, amp: 0.9 },
  { midi: 64, onset: 0, dur: 0.5, amp: 0.5 },
]);
check('мелодия октавой выше аккорда не теряется', String(octavePair.length), '2', octavePair.length === 2);

/* --- transpose / quantize ---------------------------------------------------------------- */
console.log('\nтранспонирование и выравнивание');
const up = transposeNotes([{ midi: 60, onset: 0, dur: 1, amp: 1 }], 12);
check('на октаву вверх', String(up[0].midi), '72', up[0].midi === 72);
const offRange = transposeNotes([{ midi: 120, onset: 0, dur: 1, amp: 1 }], 12);
check('вылет за пределы MIDI отбрасывается', String(offRange.length), '0', offRange.length === 0);
const q = quantizeNotes([{ midi: 60, onset: 0.13, dur: 0.24, amp: 1 }], 120, 4);
check('онсет 0.13 -> 0.125 при 120 BPM', q[0].onset.toFixed(3), '0.125', Math.abs(q[0].onset - 0.125) < 0.001);

/* --- tempo and key from the notes ---------------------------------------------------------- */
console.log('\nтемп и тональность по нотам');
// The audio-domain detectors answered G major and 156 BPM on exactly this material once it had
// reverb on it -- a note carries its own fifth as an overtone, and reverb smears the rest.
// Reading the notes instead removes both errors, and these tests pin that down.
const pieceNotes = [];
[['C3','E3','G3'], ['G2','B2','D3'], ['A2','C3','E3'], ['F2','A2','C3']]
  .forEach((ch, i) => ch.forEach((n) => pieceNotes.push({ midi: N(n), onset: i * 2, dur: 2, amp: 0.75 })));
['E4','G4','A4','G4','D4','G4','B4','G4','C5','B4','A4','E4','F4','A4','C5','A4']
  .forEach((n, i) => pieceNotes.push({ midi: N(n), onset: i * 0.5, dur: 0.5, amp: 0.6 }));
const kn = keyFromNotes(pieceNotes);
check('до мажорная пьеса -> C major', kn.name + ' ' + kn.mode, 'C major', kn.name === 'C' && kn.mode === 'major');
const amNotes = [];
[['A2','C3','E3'], ['D3','F3','A3'], ['E3','G3','B3'], ['A2','C3','E3']]
  .forEach((ch, i) => ch.forEach((n) => amNotes.push({ midi: N(n), onset: i * 2, dur: 2, amp: 0.8 })));
['A4','C5','B4','A4','G4','A4','E4','A4'].forEach((n, i) => amNotes.push({ midi: N(n), onset: i, dur: 1, amp: 0.6 }));
const kn2 = keyFromNotes(amNotes);
check('ля минорная пьеса -> A minor', kn2.name + ' ' + kn2.mode, 'A minor', kn2.name === 'A' && kn2.mode === 'minor');
check('темп пьесы -> 120', String(tempoFromNotes(pieceNotes)), '120', tempoFromNotes(pieceNotes) === 120);
const even = (bpm, count = 32) => Array.from({ length: count }, (_, i) => ({ midi: 60 + (i % 5), onset: i * 60 / bpm, dur: 0.2, amp: 0.8 }));
for (const bpm of [75, 100, 120, 140, 160]) {
  const got = tempoFromNotes(even(bpm));
  check('ровные четверти при ' + bpm, String(got), String(bpm), Math.abs(got - bpm) <= 1);
}
// Eighth notes at 120 fill a 240 grid just as well. The answer people expect is the one they
// would tap, so the estimator has to walk back to the slower multiple.
check('восьмые при 120 не читаются как 240', String(tempoFromNotes(even(240, 48))), '<= 130', tempoFromNotes(even(240, 48)) <= 130);
check('слишком мало нот -> темпа нет', String(tempoFromNotes(pieceNotes.slice(0, 3))), '0', tempoFromNotes(pieceNotes.slice(0, 3)) === 0);

/* --- chords ------------------------------------------------------------------------------ */
console.log('\nаккорды');
// The progression is C - G - Am - F, two seconds each at 120 BPM, with a melody on top
// whose notes are not always chord tones -- exactly the situation that makes a naive estimator
// invent a new chord every window.
const chordNotes = [];
const prog = [['C3','E3','G3'], ['G2','B2','D3'], ['A2','C3','E3'], ['F2','A2','C3']];
prog.forEach((ch, i) => ch.forEach((n) => chordNotes.push({ midi: N(n), onset: i * 2, dur: 2, amp: 0.75 })));
['E4','G4','A4','G4','D4','G4','B4','G4','C5','B4','A4','E4','F4','A4','C5','A4']
  .forEach((n, i) => chordNotes.push({ midi: N(n), onset: i * 0.5, dur: 0.5, amp: 0.6 }));

const key = { name: 'C', mode: 'major' };
const chords = estimateChords(chordNotes, 120, { key });
const labels = chords.map((c) => c.label).join(' ');
check('распознано C G Am F', labels, 'C G Am F', labels === 'C G Am F');
check('ровно четыре смены аккорда, а не сотня', String(chords.length), '4', chords.length === 4);
check('первый держится два такта', `${chords[0]?.start}-${chords[0]?.end}`, '0-2', chords[0]?.start === 0 && chords[0]?.end === 2);
check('ступени в до мажоре', chords.map((c) => c.degree).join(' '), 'I V vi IV', chords.map((c) => c.degree).join(' ') === 'I V vi IV');
check('нашвилл', chords.map((c) => c.nashville).join(' '), '1 5 6m 4', chords.map((c) => c.nashville).join(' ') === '1 5 6m 4');
// No chord may be shorter than the window: a chart that changes three times a second is the
// exact failure this whole estimator exists to avoid.
const shortest = Math.min(...chords.map((c) => c.end - c.start));
check('ни один аккорд не короче доли сетки', shortest.toFixed(2), '>= 1.00', shortest >= 0.999);
// Inversions only when the bass really stays put. The melody moves over a static bass here, so
// no span should pick up a slash.
check('ложных обращений нет', String(chords.filter((c) => c.bass).length), '0', chords.filter((c) => c.bass).length === 0);

// Silence must read as "no chord", not as whatever scores least badly.
const gapped = estimateChords([
  { midi: N('C3'), onset: 0, dur: 2, amp: 0.8 },
  { midi: N('E3'), onset: 0, dur: 2, amp: 0.8 },
  { midi: N('G3'), onset: 0, dur: 2, amp: 0.8 },
  { midi: N('F3'), onset: 6, dur: 2, amp: 0.8 },
  { midi: N('A3'), onset: 6, dur: 2, amp: 0.8 },
  { midi: N('C4'), onset: 6, dur: 2, amp: 0.8 },
], 120, { key });
check('пауза помечается как «без аккорда»', gapped.map((c) => c.label ?? '—').join(' '), 'C — F', gapped.map((c) => c.label ?? '—').join(' ') === 'C — F');

const minorKey = estimateChords([
  { midi: N('A2'), onset: 0, dur: 2, amp: 0.8 },
  { midi: N('C3'), onset: 0, dur: 2, amp: 0.8 },
  { midi: N('E3'), onset: 0, dur: 2, amp: 0.8 },
], 120, { key: { name: 'A', mode: 'minor' } });
check('минорное трезвучие -> Am', minorKey[0]?.label, 'Am', minorKey[0]?.label === 'Am');
check('ступень в ля миноре -> i', minorKey[0]?.degree, 'i', minorKey[0]?.degree === 'i');

/* --- MIDI file --------------------------------------------------------------------------- */
console.log('\nфайл MIDI');
const midi = notesToMidi([
  { midi: 60, onset: 0, dur: 1, amp: 0.8 },
  { midi: 64, onset: 0, dur: 1, amp: 0.8 },
  { midi: 67, onset: 1, dur: 0.5, amp: 0.4 },
], 120, key, { trackName: 'Test' });

const str = (a, i, n) => String.fromCharCode(...a.slice(i, i + n));
check('заголовок MThd', str(midi, 0, 4), 'MThd', str(midi, 0, 4) === 'MThd');
check('формат 1', String((midi[8] << 8) | midi[9]), '1', ((midi[8] << 8) | midi[9]) === 1);
check('две дорожки', String((midi[10] << 8) | midi[11]), '2', ((midi[10] << 8) | midi[11]) === 2);
check('480 тиков на четверть', String((midi[12] << 8) | midi[13]), '480', ((midi[12] << 8) | midi[13]) === 480);

// Walk the file the way a sequencer would, so the delta times are actually exercised.
function parseTracks(bytes) {
  const tracks = [];
  let p = 14;
  while (p < bytes.length) {
    const len = (bytes[p + 4] << 24) | (bytes[p + 5] << 16) | (bytes[p + 6] << 8) | bytes[p + 7];
    const body = bytes.slice(p + 8, p + 8 + len);
    const events = [];
    let i = 0, tick = 0;
    while (i < body.length) {
      let delta = 0, b;
      do { b = body[i++]; delta = (delta << 7) | (b & 0x7f); } while (b & 0x80);
      tick += delta;
      const status = body[i++];
      if (status === 0xff) { const type = body[i++]; let l = 0; do { b = body[i++]; l = (l << 7) | (b & 0x7f); } while (b & 0x80); i += l; events.push({ tick, meta: type }); }
      else if ((status & 0xf0) === 0x90 || (status & 0xf0) === 0x80) { events.push({ tick, kind: status & 0xf0, note: body[i], vel: body[i + 1] }); i += 2; }
      else i += 2;
    }
    tracks.push(events);
    p += 8 + len;
  }
  return tracks;
}
const tracks = parseTracks(midi);
check('файл разбирается целиком', String(tracks.length), '2', tracks.length === 2);
const ons = tracks[1].filter((e) => e.kind === 0x90);
const offs = tracks[1].filter((e) => e.kind === 0x80);
check('три ноты включились', String(ons.length), '3', ons.length === 3);
check('каждая выключилась', String(offs.length), '3', offs.length === 3);
check('нет ноты с нулевой громкостью', String(ons.every((e) => e.vel > 0)), 'true', ons.every((e) => e.vel > 0));
// 1 second at 120 BPM is exactly two quarters = 960 ticks.
const g = ons.find((e) => e.note === 67);
check('нота на 1.0 сек стоит на 960 тиках', String(g?.tick), '960', g?.tick === 960);
check('темп записан в файл', String(tracks[0].some((e) => e.meta === 0x51)), 'true', tracks[0].some((e) => e.meta === 0x51));
check('тональность записана в файл', String(tracks[0].some((e) => e.meta === 0x59)), 'true', tracks[0].some((e) => e.meta === 0x59));

/* --- written score ------------------------------------------------------------------------ */
console.log('\nпартитура');
const score = notesToScore(chordNotes, 120, key);
check('восемь секунд при 120 -> 4 такта', String(score.measures.length), '4', score.measures.length === 4);
check('темп в партитуре', String(score.bpm), '120', score.bpm === 120);
check('до мажор -> без знаков', String(score.key.fifths), '0', score.key.fifths === 0);
// Every bar of every staff must add up to a full bar. A staff that comes up short is how a score
// ends up with bars that look right and are silently wrong.
let allFull = true, badBar = null;
for (const m of score.measures) {
  for (const st of ['treble', 'bass']) {
    const total = m.staves[st].reduce((s, e) => s + e.units, 0);
    if (total !== 16) { allFull = false; badBar = `такт ${m.index} ${st} = ${total}`; }
  }
}
check('каждый такт заполнен ровно', badBar || '16', '16', allFull);
// The flaw worth not repeating: five opening bars of nothing on one staff while the other plays.
const emptyStaves = score.measures.filter((m) => ['treble', 'bass'].some((st) => !m.staves[st].length));
check('нет пустых нотоносцев', String(emptyStaves.length), '0', emptyStaves.length === 0);
check('бас первого такта — целый аккорд', score.measures[0].staves.bass.map((e) => e.duration).join(','), 'w',
  score.measures[0].staves.bass.map((e) => e.duration).join(',') === 'w');
check('в аккорде три ноты', String(score.measures[0].staves.bass[0].keys.length), '3', score.measures[0].staves.bass[0].keys.length === 3);
check('мелодия первого такта — четверти', score.measures[0].staves.treble.map((e) => e.duration).join(','), 'q,q,q,q',
  score.measures[0].staves.treble.map((e) => e.duration).join(',') === 'q,q,q,q');
check('разделение по до первой октавы', String(score.measures[0].staves.treble.every((e) => e.rest || e.keys.every((k) => k.midi >= 60))), 'true',
  score.measures[0].staves.treble.every((e) => e.rest || e.keys.every((k) => k.midi >= 60)));

// A piano note decays, so the model reports a written quarter note as roughly an eighth. Taken
// literally that fills the page with eighths each trailed by a little rest. Notes are closed up
// to the next onset when the gap is no longer than the note itself -- and only then.
const decayed = [[64, 0, 0.302], [67, 0.50, 0.302], [69, 1.00, 0.48], [67, 1.49, 0.49]]
  .map(([midi, onset, dur]) => ({ midi, onset, dur, amp: 0.7 }));
const legatoBar = notesToScore(decayed, 121, key).measures[0].staves.treble;
check('затухшие ноты читаются четвертями', legatoBar.map((e) => e.duration).join(','), 'q,q,q,q',
  legatoBar.map((e) => e.duration).join(',') === 'q,q,q,q');
check('без дотягивания — восьмые с паузами', String(notesToScore(decayed, 121, key, { legato: false }).measures[0].staves.treble.some((e) => e.rest)), 'true',
  notesToScore(decayed, 121, key, { legato: false }).measures[0].staves.treble.some((e) => e.rest));
// Genuine staccato has to keep its rests -- otherwise the rule is just "always join everything".
const staccato = [0, 1, 2, 3].map((i) => ({ midi: 60, onset: i * 0.5, dur: 0.06, amp: 0.8 }));
check('стаккато сохраняет паузы', String(notesToScore(staccato, 120, key).measures[0].staves.treble.filter((e) => e.rest).length), '4',
  notesToScore(staccato, 120, key).measures[0].staves.treble.filter((e) => e.rest).length === 4);

// Key spellings: a notation library only accepts real key names, and A# major is not one.
check('ля-диез мажор пишется как си-бемоль', keySpec({ name: 'A#', mode: 'major' }).name, 'Bb', keySpec({ name: 'A#', mode: 'major' }).name === 'Bb');
check('фа-диез минор -> F#m, три диеза', keySpec({ name: 'F#', mode: 'minor' }).name + '/' + keySpec({ name: 'F#', mode: 'minor' }).fifths, 'F#m/3',
  keySpec({ name: 'F#', mode: 'minor' }).name === 'F#m' && keySpec({ name: 'F#', mode: 'minor' }).fifths === 3);
check('фа мажор -> один бемоль', String(keySpec({ name: 'F', mode: 'major' }).fifths), '-1', keySpec({ name: 'F', mode: 'major' }).fifths === -1);
// A note too long for one written value has to be tied, not quietly shortened.
const held = notesToScore([{ midi: 60, onset: 0, dur: 2.5, amp: 0.8 }], 120, key);
const tied = held.measures[0].staves.treble.filter((e) => e.tieStart || e.tieEnd);
check('длинная нота разбита и связана лигой', String(tied.length > 0), 'true', tied.length > 0);
// A rest-only staff still has to fill its bar.
const restOnly = notesToScore([{ midi: 72, onset: 0, dur: 1, amp: 0.8 }], 120, key);
check('пустой нотоносец заполнен паузами', String(restOnly.measures[0].staves.bass.reduce((s, e) => s + e.units, 0)), '16',
  restOnly.measures[0].staves.bass.reduce((s, e) => s + e.units, 0) === 16);
check('пауза помечена как пауза', String(restOnly.measures[0].staves.bass.every((e) => e.rest)), 'true',
  restOnly.measures[0].staves.bass.every((e) => e.rest));

/* --- CSV / MusicXML ---------------------------------------------------------------------- */
console.log('\nтекстовые форматы');
const csv = notesToCsv([{ midi: 60, onset: 0.5, dur: 0.25, amp: 0.5 }]);
check('CSV: шапка и одна строка', String(csv.trim().split('\n').length), '2', csv.trim().split('\n').length === 2);
check('CSV: имя ноты', csv.split('\n')[1].split(',')[0], 'C4', csv.split('\n')[1].split(',')[0] === 'C4');

const xml = notesToMusicXml(chordNotes, 120, key, { title: 'Тест' });
check('MusicXML: корневой тег', String(xml.includes('<score-partwise')), 'true', xml.includes('<score-partwise'));
check('MusicXML: два нотоносца', String(xml.includes('<staves>2</staves>')), 'true', xml.includes('<staves>2</staves>'));
check('MusicXML: темп 120', String(xml.includes('<per-minute>120</per-minute>')), 'true', xml.includes('<per-minute>120</per-minute>'));
// Eight seconds at 120 BPM in 4/4 is four bars. A file that opens with empty bars on one staff
// is the flaw this split was written to avoid, so the count is asserted rather than assumed.
const measures = (xml.match(/<measure /g) || []).length;
check('восемь секунд при 120 BPM -> 4 такта', String(measures), '4', measures === 4);
const tagStack = [];
let wellFormed = true;
for (const m of xml.matchAll(/<(\/?)([a-z-]+)([^>]*?)(\/?)>/g)) {
  if (m[3].endsWith('/') || m[4] === '/') continue;
  if (m[1]) { if (tagStack.pop() !== m[2]) { wellFormed = false; break; } } else tagStack.push(m[2]);
}
check('MusicXML: теги закрыты правильно', String(wellFormed && tagStack.length === 0), 'true', wellFormed && tagStack.length === 0);
// Every bar of the treble staff carries something -- a note or a rest. Five empty opening bars
// on one staff while the other plays is precisely what this checks against.
const bodies = xml.split('<measure ').slice(1);
check('в каждом такте есть содержимое', String(bodies.every((b) => b.includes('<note>'))), 'true', bodies.every((b) => b.includes('<note>')));

/* --- stats ------------------------------------------------------------------------------- */
console.log('\nсводка');
const st = noteStats(chordNotes);
check('всего нот', String(st.count), '28', st.count === 28);
check('самая низкая F2', st.lowest, 'F2', st.lowest === 'F2');
check('самая высокая C5', st.highest, 'C5', st.highest === 'C5');
check('максимум одновременных нот', String(st.polyphony), '4', st.polyphony === 4);

console.log(`\nитого: ${pass} прошло, ${fail} не прошло`);
process.exit(fail ? 1 : 0);
