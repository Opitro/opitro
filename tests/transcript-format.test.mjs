// Subtitle timing is the kind of thing that looks right on screen and is wrong by a factor of a
// thousand in the file, so every timestamp here is written out by hand and compared exactly.
import { normalizeChunks, wrapCaption, toSrt, toVtt, toPlainText, toTimestamped, countWords }
  from '../src/lib/transcript-format.js';

let pass = 0, fail = 0;
function check(name, got, want, ok) {
  if (ok) { pass++; console.log(`  ok    ${name}`); }
  else { fail++; console.log(`  ПРОВАЛ ${name}\n        получено: ${JSON.stringify(got)}\n        ожидалось: ${JSON.stringify(want)}`); }
}
const eq = (name, got, want) => check(name, got, want, got === want);

/* --- cleaning up what the recogniser returns ----------------------------------------------- */
console.log('\nразбор ответа модели');
// Exactly the shapes Whisper produces: a null end on the last chunk, an empty chunk around
// silence, and chunks that arrive out of order after a long file is processed in windows.
const raw = [
  { timestamp: [3.0, 5.5], text: ' вторая фраза ' },
  { timestamp: [0.0, 2.4], text: 'Первая фраза.' },
  { timestamp: [6.0, null], text: 'последняя' },
  { timestamp: [5.5, 6.0], text: '   ' },
];
const norm = normalizeChunks(raw, 9.0);
eq('пустые куски выброшены', norm.length, 3);
eq('порядок восстановлен', norm.map((c) => c.text).join('|'), 'Первая фраза.|вторая фраза|последняя');
eq('пробелы обрезаны', norm[1].text, 'вторая фраза');
eq('пустой конец досчитан до длины записи', norm[2].end, 9.0);
check('строки не наезжают друг на друга', norm.map((c) => [c.start, c.end]),
  'каждая заканчивается не позже начала следующей',
  norm.every((c, i) => !norm[i + 1] || c.end <= norm[i + 1].start));
check('нулевых по длине нет', norm.map((c) => c.end - c.start), '> 0', norm.every((c) => c.end > c.start));
// Without a known duration the last line still has to get some length, or no player shows it.
const noDur = normalizeChunks([{ timestamp: [1, null], text: 'одна' }]);
check('без известной длительности конец всё равно есть', noDur[0].end, '> 1', noDur[0].end > 1);

// Whisper narrates silence: on six seconds of pure digital silence it returned "[музыка]".
// A chunk that is nothing but an annotation is noise; one attached to real words is not.
const annotated = normalizeChunks([
  { timestamp: [0, 2], text: '[музыка]' },
  { timestamp: [2, 4], text: '(аплодисменты)' },
  { timestamp: [4, 6], text: '[Music]' },
  { timestamp: [6, 8], text: 'а вот это уже речь' },
  { timestamp: [8, 10], text: '[смех] и снова речь' },
], 10);
eq('аннотации в одиночку выброшены', annotated.length, 2);
eq('настоящая речь осталась', annotated[0].text, 'а вот это уже речь');
eq('аннотация вместе со словами оставлена', annotated[1].text, '[смех] и снова речь');
eq('файл из одной тишины -> ничего', normalizeChunks([{ timestamp: [0, 6], text: '[музыка]' }], 6).length, 0);

// Idempotence, and it is not academic: the page normalises once when the result arrives and the
// exporters normalise again. When this function only understood the {timestamp:[a,b]} shape, the
// second pass threw every timestamp away and produced 25 captions all running 0.0 -> 0.4 seconds.
// It looked perfectly fine on screen; only the downloaded file was wrong.
const twice = normalizeChunks(normalizeChunks(raw, 9.0), 9.0);
check('второй прогон ничего не меняет', twice, norm,
  JSON.stringify(twice) === JSON.stringify(norm));
const srtTwice = toSrt(normalizeChunks([{ timestamp: [5, 7.5], text: 'позже' }], 10), { duration: 10 });
eq('субтитры из уже разобранных кусков сохраняют время', srtTwice.split('\n')[1], '00:00:05,000 --> 00:00:07,500');
eq('и метки времени тоже', toTimestamped(normalizeChunks([{ timestamp: [65, 67], text: 'позже' }], 70), { duration: 70 }), '[1:05] позже');

/* --- caption wrapping ---------------------------------------------------------------------- */
console.log('\nразбивка на строки');
eq('короткая строка не трогается', wrapCaption('Привет мир'), 'Привет мир');
const long = wrapCaption('Сегодня мы разберём как работает звуковая волна и почему её форма важна', 42);
eq('длинная строка разбита надвое', long.split('\n').length, 2);
check('ни одна строка не длиннее лимита', long.split('\n').map((l) => l.length), '<= 42',
  long.split('\n').every((l) => l.length <= 42));
check('слова не разрезаны', long, 'все слова целые',
  long.replace(/\n/g, ' ') === 'Сегодня мы разберём как работает звуковая волна и почему её форма важна');
const veryLong = wrapCaption('раз два три четыре пять шесть семь восемь девять десять одиннадцать двенадцать тринадцать четырнадцать пятнадцать шестнадцать', 42);
eq('очень длинная всё равно укладывается в две строки', veryLong.split('\n').length, 2);

/* --- SRT ------------------------------------------------------------------------------------ */
console.log('\nсубтитры SRT');
const srt = toSrt([
  { timestamp: [0, 2.5], text: 'Первая строка' },
  { timestamp: [2.5, 5.25], text: 'Вторая строка' },
], { duration: 6 });
const lines = srt.split('\n');
eq('нумерация с единицы', lines[0], '1');
eq('формат времени с запятой', lines[1], '00:00:00,000 --> 00:00:02,500');
eq('текст на своём месте', lines[2], 'Первая строка');
eq('второй блок пронумерован', lines[4], '2');
eq('дробные секунды в миллисекундах', lines[5], '00:00:02,500 --> 00:00:05,250');
// An hour-long recording is the normal case for a lecture, and the hours field is where a
// naive mm:ss formatter silently loses everything past sixty minutes.
const hour = toSrt([{ timestamp: [3725.5, 3727.0], text: 'через час' }], { duration: 4000 });
eq('часы не теряются', hour.split('\n')[1], '01:02:05,500 --> 01:02:07,000');
check('блоки разделены пустой строкой', srt, 'да', /\n\n/.test(srt));

/* --- VTT ------------------------------------------------------------------------------------ */
console.log('\nсубтитры VTT');
const vtt = toVtt([{ timestamp: [1.2, 3.4], text: 'строка' }], { duration: 5 });
eq('заголовок WEBVTT', vtt.split('\n')[0], 'WEBVTT');
eq('формат времени с точкой', vtt.split('\n')[2], '00:00:01.200 --> 00:00:03.400');

/* --- reading text --------------------------------------------------------------------------- */
console.log('\nсплошной текст');
const speech = [
  { timestamp: [0, 2], text: 'Сегодня мы разберём звук.' },
  { timestamp: [2, 4], text: 'Обратите внимание на график.' },
  { timestamp: [6, 8], text: 'На следующей лекции поговорим о сжатии.' },
];
const plain = toPlainText(speech, { duration: 9 });
eq('абзац появляется после паузы', plain.split('\n\n').length, 2);
eq('внутри абзаца строки склеены', plain.split('\n\n')[0], 'Сегодня мы разберём звук. Обратите внимание на график.');
// A pause in the middle of a sentence is a breath, not a paragraph break.
const midSentence = toPlainText([
  { timestamp: [0, 2], text: 'Сегодня мы разберём' },
  { timestamp: [5, 7], text: 'звуковую волну.' },
], { duration: 8 });
eq('пауза посреди фразы не рвёт абзац', midSentence.split('\n\n').length, 1);
eq('пустой ввод -> пустая строка', toPlainText([]), '');

console.log('\nс метками времени');
const ts = toTimestamped(speech, { duration: 9 });
eq('метка в минутах и секундах', ts.split('\n')[0], '[0:00] Сегодня мы разберём звук.');
eq('секунды с ведущим нулём', toTimestamped([{ timestamp: [65, 67], text: 'позже' }], { duration: 70 }), '[1:05] позже');

console.log('\nсчётчик слов');
eq('обычная фраза', countWords('раз два три'), 3);
eq('лишние пробелы не считаются', countWords('  раз   два  '), 2);
eq('пусто -> ноль', countWords(''), 0);

console.log(`\nитого: ${pass} прошло, ${fail} не прошло`);
process.exit(fail ? 1 : 0);
