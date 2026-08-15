/*
  Растяжение по времени и сдвиг высоты ПРЯМО В ЗВУКОВОМ ПОТОКЕ.

  Зачем отдельный файл и почему он в public, а не в src: обработчик звукового потока
  загружается браузером по адресу (`audioWorklet.addModule`), а не собирается вместе со
  страницей. Ему нельзя ничего импортировать из нашего кода -- он живёт в собственном мире,
  без DOM, без window, вообще без всего.

  Что он решает. Раньше скорость пересчитывала ВЕСЬ файл заранее: на минуте записи это
  770 мс мёртвой страницы, и звук приходилось останавливать. Здесь пересчитывается только
  та крошка, что звучит сию секунду -- 128 отсчётов за раз, около трёх миллисекунд звука.
  Поэтому смена скорости или высоты слышна мгновенно и не прерывает воспроизведение: меняется
  всего лишь число в уже работающем обработчике.

  Как устроено -- зернистый синтез с перекрытием (overlap-add).

  Выход собирается из «зёрен»: кусочков входа длиной около 50 мс, умноженных на плавное окно
  и наложенных друг на друга со сдвигом в половину зерна. Два независимых шага:

    - позиция чтения во входе двигается со скоростью `speed` -- это меняет ДЛИТЕЛЬНОСТЬ;
    - само зерно читается с шагом `pitchRatio` -- это меняет ВЫСОТУ.

  Именно потому, что шаги независимы, можно ускорить, не задрав голос, и поднять голос, не
  ускорив. Родные средства браузера (playbackRate, detune) так не умеют -- у них это одно
  и то же движение.

  Честно о качестве: это простой overlap-add без поиска наилучшего совпадения фаз (WSOLA).
  На речи и музыке средней сложности звучит хорошо; на чистом протяжном тоне может слышаться
  лёгкое биение. Поиск совпадения добавляется сюда же, отдельным шагом, не меняя устройства.
*/

class StretchProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      // Во сколько раз быстрее. 1 -- как есть. Меняется на ходу.
      { name: 'speed', defaultValue: 1, minValue: 0.25, maxValue: 4, automationRate: 'k-rate' },
      // Во сколько раз выше. 1 -- как есть. Одна ступень = 2^(1/12).
      { name: 'pitchRatio', defaultValue: 1, minValue: 0.25, maxValue: 4, automationRate: 'k-rate' },
    ];
  }

  constructor(options) {
    super();
    this.channels = null;      // Float32Array[] -- весь звук, передаётся один раз
    this.length = 0;
    this.readPos = 0;          // позиция во входе, в отсчётах, дробная
    this.playing = false;
    this.finished = false;

    const sr = (options && options.processorOptions && options.processorOptions.sampleRate) || sampleRate;
    // Зерно ~50 мс: короче -- слышно дробление, длиннее -- размазывается атака.
    this.grain = Math.max(256, Math.round(sr * 0.05));
    this.hop = this.grain >> 1;            // перекрытие ровно наполовину
    this.win = new Float32Array(this.grain);
    for (let i = 0; i < this.grain; i++) {
      this.win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (this.grain - 1));
    }
    // Копилка: сюда зёрна складываются внахлёст, отсюда выдаётся выход.
    this.acc = null;
    this.accFill = 0;          // сколько отсчётов в копилке уже готово к выдаче
    this.accOut = 0;           // сколько из готовых уже отдано

    this.port.onmessage = (e) => {
      const m = e.data;
      if (m.type === 'load') {
        this.channels = m.channels.map((b) => new Float32Array(b));
        this.length = this.channels[0] ? this.channels[0].length : 0;
        this.acc = this.channels.map(() => new Float32Array(this.grain * 8));
        this.readPos = m.offset ? Math.round(m.offset * sr) : 0;
        this.accFill = 0;
        this.accOut = 0;
        this.finished = false;
      } else if (m.type === 'play') {
        this.playing = true;
      } else if (m.type === 'stop') {
        this.playing = false;
      } else if (m.type === 'seek') {
        this.readPos = Math.max(0, Math.min(this.length - 1, Math.round(m.seconds * sr)));
        this.accFill = 0;
        this.accOut = 0;
        this.finished = false;
      }
    };
  }

  /** Подмешивает в копилку одно зерно, прочитанное с шагом `pitchRatio`. */
  addGrain(pitchRatio) {
    const g = this.grain;
    for (let c = 0; c < this.channels.length; c++) {
      const src = this.channels[c];
      const acc = this.acc[c];
      let p = this.readPos;
      for (let i = 0; i < g; i++) {
        const i0 = p | 0;
        const frac = p - i0;
        // Линейная выборка между соседними отсчётами -- иначе на дробном шаге появляется
        // шершавость, которую слышно как песок в верхах.
        const a = i0 < this.length ? src[i0] : 0;
        const b = i0 + 1 < this.length ? src[i0 + 1] : 0;
        acc[this.accFill + i] += (a + (b - a) * frac) * this.win[i];
        p += pitchRatio;
      }
    }
  }

  process(_inputs, outputs, params) {
    const out = outputs[0];
    const n = out[0] ? out[0].length : 128;
    if (!this.channels || !this.playing) {
      for (let c = 0; c < out.length; c++) out[c].fill(0);
      return true;
    }

    const speed = params.speed.length > 1 ? params.speed[0] : params.speed[0];
    const pitchRatio = params.pitchRatio.length > 1 ? params.pitchRatio[0] : params.pitchRatio[0];

    // Пока готового звука в копилке меньше, чем просят, домешиваем зёрна.
    while (this.accFill - this.accOut < n && !this.finished) {
      // Сдвигаем копилку влево, если она подошла к концу -- вместо бесконечного роста.
      // Освобождаем место, сдвигая уже отданное в начало. Две тонкости, каждая стоила
      // проверки:
      //   * обнулять надо ТОЛЬКО хвост, оставшийся копией самого себя. Прежнее
      //     `fill(0, accFill - accOut)` затирало перекрытие уже подмешанного, но ещё не
      //     доигранного зерна -- отсюда треск даже на нетронутом файле;
      //   * сдвигать имеет смысл только когда есть что сдвигать. При accOut == 0 сдвиг
      //     ничего не освобождает, и зерно уходит за край массива -- звук пропадает совсем.
      if (this.accOut > 0 && this.accFill + this.grain > this.acc[0].length) {
        const kept = this.acc[0].length - this.accOut;
        for (let c = 0; c < this.acc.length; c++) {
          this.acc[c].copyWithin(0, this.accOut);
          this.acc[c].fill(0, kept);
        }
        this.accFill -= this.accOut;
        this.accOut = 0;
      }
      // Если места всё равно нет -- копилка мала для такого зерна; растим её, а не теряем звук.
      if (this.accFill + this.grain > this.acc[0].length) {
        for (let c = 0; c < this.acc.length; c++) {
          const bigger = new Float32Array(this.acc[c].length * 2);
          bigger.set(this.acc[c]);
          this.acc[c] = bigger;
        }
      }
      this.addGrain(pitchRatio);
      // Готовым считается только то, что уже перекрыто полностью, -- то есть половина зерна.
      this.accFill += this.hop;
      // Позиция во входе двигается со СВОЕЙ скоростью: отсюда независимость времени и высоты.
      this.readPos += this.hop * speed;
      if (this.readPos >= this.length) this.finished = true;
    }

    const avail = Math.min(n, this.accFill - this.accOut);
    for (let c = 0; c < out.length; c++) {
      const acc = this.acc[Math.min(c, this.acc.length - 1)];
      for (let i = 0; i < avail; i++) out[c][i] = acc[this.accOut + i];
      for (let i = avail; i < n; i++) out[c][i] = 0;
    }
    // Отданное обнуляем: перекрытие следующего зерна должно ложиться на чистое место.
    for (let c = 0; c < this.acc.length; c++) this.acc[c].fill(0, this.accOut, this.accOut + avail);
    this.accOut += avail;

    // Сообщаем странице, где мы сейчас, -- по этому двигается бегунок.
    if ((this.tick = (this.tick || 0) + 1) % 8 === 0) {
      this.port.postMessage({ type: 'pos', seconds: this.readPos / sampleRate });
    }
    if (this.finished && avail === 0) {
      this.playing = false;
      this.port.postMessage({ type: 'ended' });
    }
    return true;
  }
}

registerProcessor('audio-stretch', StretchProcessor);
