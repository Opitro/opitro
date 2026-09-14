// ПРОИГРЫВАТЕЛЬ: ОДИН ЗВУК ЗА РАЗ.
//
// Узел буфера в браузере не перематывается: чтобы играть с другого места, заводится новый.
// Если прежний при этом не остановить, звучат двое разом, а ссылки на первого уже нет -- и
// остановить его нечем. Владелец поймал это живьём на «Аудио в MIDI»: перетащил бегунок,
// нажал паузу, а звук идёт.
//
// Проверяем НАСТОЯЩИЙ src/lib/web-audio-engine.js на поддельном движке: он считает
// запущенные и остановленные узлы, поэтому «звучит ли что-то лишнее» становится числом.
const беды = [];
const проба = (имя, ладно, что) => {
  console.log(`  ${ладно ? '✓' : '✗'} ${имя}${что !== undefined ? ' — ' + String(что) : ''}`);
  if (!ладно) беды.push(имя);
};

/** Поддельный движок: те же имена, что у браузера, и счётчик живых источников. */
function поддельныйДвижок() {
  const живые = new Set();
  let времени = 0;
  class Узел {
    constructor() { this.buffer = null; this.onended = null; this.loop = false; this.пущен = false; }
    connect() { return this; }
    disconnect() {}
    start() { this.пущен = true; живые.add(this); }
    stop() {
      живые.delete(this);
      if (this.onended) this.onended();
    }
  }
  const движок = {
    state: 'running',
    get currentTime() { return времени; },
    createBufferSource: () => new Узел(),
    createGain: () => ({ gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {} }, connect: () => движок.destination, disconnect() {} }),
    destination: { },
    resume: () => Promise.resolve(),
    close: () => Promise.resolve(),
  };
  return { движок, живые, идти: (сек) => { времени += сек; } };
}

const { движок, живые, идти } = поддельныйДвижок();
globalThis.window = { AudioContext: function () { return движок; }, addEventListener() {} };
globalThis.document = { addEventListener() {}, hidden: false, createElement: () => ({ style: {}, setAttribute() {}, addEventListener() {}, play: () => Promise.resolve(), appendChild() {} }), body: { appendChild() {} } };
globalThis.requestAnimationFrame = () => 0;
globalThis.cancelAnimationFrame = () => {};

const { createPlayer } = await import('../src/lib/web-audio-engine.js');

const запись = { duration: 30, length: 30 * 48000, sampleRate: 48000, numberOfChannels: 1,
  getChannelData: () => new Float32Array(10) };

console.log('════ перемотка во время звучания');
{
  const п = createPlayer();
  п.play(запись, null, null);
  проба('после пуска звучит ровно один источник', живые.size === 1, живые.size);

  идти(5);
  п.play(запись, null, null, 12);          // перетащили бегунок на 0:12
  проба('после перемотки по-прежнему ОДИН источник, а не два', живые.size === 1, живые.size);
  проба('положение взято из перемотки', Math.round(п.getPosition()) === 12, п.getPosition());

  п.pause();
  проба('пауза заглушила всё', живые.size === 0, живые.size);
  проба('плеер считает себя остановленным', !п.isPlaying());

  п.play(запись, null, null);
  проба('после паузы продолжаем с того же места', Math.round(п.getPosition()) === 12, п.getPosition());
  проба('и снова звучит один источник', живые.size === 1, живые.size);
  п.reset();
  проба('стоп глушит и отматывает в начало', живые.size === 0 && п.getPosition() === 0, `${живые.size} / ${п.getPosition()}`);
}

console.log('\n════ несколько перемоток подряд');
{
  const п = createPlayer();
  п.play(запись, null, null);
  for (const место of [3, 7, 11, 19, 24]) { идти(1); п.play(запись, null, null, место); }
  проба('пять перемоток -- всё равно один источник', живые.size === 1, живые.size);
  п.pause();
  проба('и тишина после паузы', живые.size === 0, живые.size);
}

console.log('\n════ конец записи');
{
  const п = createPlayer();
  let конец = 0;
  п.play(запись, null, () => { конец++; });
  [...живые][0].stop();                    // браузер сам шлёт onended, когда файл кончился
  проба('о завершении сказано один раз', конец === 1, конец);
  проба('плеер не считает себя играющим', !п.isPlaying());
  проба('следующий пуск -- с начала', п.getPosition() === 0, п.getPosition());
}

console.log(беды.length ? `\nбед: ${беды.length} — ${беды.join(', ')}` : '\nпроигрыватель: всё на месте');
process.exit(беды.length ? 1 : 0);
