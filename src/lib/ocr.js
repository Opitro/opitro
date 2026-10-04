
function поддержкаSIMD() {
  try {
    return WebAssembly.validate(new Uint8Array([
      0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0,
      10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
    ]));
  } catch (е) { return false; }
}

const работники = new Map();

export async function поднятьЧтеца(языки, ход) {
  if (работники.has(языки)) return работники.get(языки);
  const обещание = (async () => {
    const { createWorker } = await import('tesseract.js');
    const ядро = поддержкаSIMD()
      ? '/tess/tesseract-core-simd-lstm.js'
      : '/tess/tesseract-core-lstm.js';
    return createWorker(языки, 1, {
      workerPath: '/tess/worker.min.js',

      workerBlobURL: false,
      corePath: ядро,
      langPath: '/tess/',
      gzip: true,
      logger: (м) => {
        if (ход && м && typeof м.progress === 'number') ход(м.progress, м.status || '');
      },
    });
  })();
  работники.set(языки, обещание);
  try { return await обещание; } catch (е) { работники.delete(языки); throw е; }
}

export function подготовить(источник, { ш, в, часть = null,
  ширинаЦели = 0, безКонтраста = false, безВыравнивания = false, канал = 'серый' } = {}) {
  const кх = часть ? Math.round(часть.х * ш) : 0;
  const ку = часть ? Math.round(часть.у * в) : 0;
  const кш = часть ? Math.max(8, Math.round(часть.ш * ш)) : ш;
  const кв = часть ? Math.max(8, Math.round(часть.в * в)) : в;

  const цель = ширинаЦели || 1800;
  let к = Math.min(2, Math.max(1, цель / кш));

  const ПРЕДЕЛ_ТОЧЕК = 3.2e6;
  if (кш * кв * к * к > ПРЕДЕЛ_ТОЧЕК) к = Math.sqrt(ПРЕДЕЛ_ТОЧЕК / (кш * кв));
  const холст = document.createElement('canvas');
  холст.width = Math.max(1, Math.round(кш * к));
  холст.height = Math.max(1, Math.round(кв * к));
  const кон = холст.getContext('2d', { willReadFrequently: true });
  кон.imageSmoothingQuality = 'high';
  кон.drawImage(источник, кх, ку, кш, кв, 0, 0, холст.width, холст.height);

  const точки = кон.getImageData(0, 0, холст.width, холст.height);
  const д = точки.data;
  const всего = холст.width * холст.height;
  const серый = new Uint8ClampedArray(всего);

  for (let i = 0, п = 0; i < д.length; i += 4, п++) {
    let г = канал === 'R' ? д[i]
      : канал === 'G' ? д[i + 1]
      : канал === 'B' ? д[i + 2]
      : (д[i] * 299 + д[i + 1] * 587 + д[i + 2] * 114) / 1000 | 0;
    серый[п] = г;
  }

  const чёрнобелый = безКонтраста ? серый : местныйПорог(серый, холст.width, холст.height);
  for (let i = 0, п = 0; i < д.length; i += 4, п++) {
    д[i] = д[i + 1] = д[i + 2] = чёрнобелый[п];
    д[i + 3] = 255;
  }
  кон.putImageData(точки, 0, 0);

  if (!безВыравнивания) {
    const угол = уголНаклона(чёрнобелый, холст.width, холст.height);
    if (Math.abs(угол) >= 0.5) {
      const ровный = document.createElement('canvas');
      ровный.width = холст.width; ровный.height = холст.height;
      const к2 = ровный.getContext('2d', { willReadFrequently: true });
      к2.fillStyle = '#fff';
      к2.fillRect(0, 0, ровный.width, ровный.height);
      к2.translate(ровный.width / 2, ровный.height / 2);
      к2.rotate((-угол * Math.PI) / 180);
      к2.drawImage(холст, -холст.width / 2, -холст.height / 2);
      return ровный;
    }
  }
  return холст;
}

function уголНаклона(серый, ш, в) {
  const шаг = Math.max(1, Math.round(Math.max(ш, в) / 500));
  const мш = Math.floor(ш / шаг), мв = Math.floor(в / шаг);
  const мелкий = new Float32Array(мш * мв);
  for (let у = 0; у < мв; у++) for (let х = 0; х < мш; х++) {
    мелкий[у * мш + х] = 255 - серый[(у * шаг) * ш + (х * шаг)];
  }
  const резкость = (угол) => {
    const син = Math.sin(угол), кос = Math.cos(угол);
    const ряды = new Float32Array(мв);
    for (let у = 0; у < мв; у++) {
      for (let х = 0; х < мш; х++) {
        const у2 = Math.round((х - мш / 2) * син + (у - мв / 2) * кос + мв / 2);
        if (у2 >= 0 && у2 < мв) ряды[у2] += мелкий[у * мш + х];
      }
    }
    let сумма = 0, сумма2 = 0;
    for (let у = 0; у < мв; у++) { сумма += ряды[у]; сумма2 += ряды[у] * ряды[у]; }
    const средн = сумма / мв;
    return сумма2 / мв - средн * средн;
  };
  let лучший = 0, лучшая = -1;
  for (let град = -6; град <= 6; град += 0.5) {
    const р = резкость(град * Math.PI / 180);
    if (р > лучшая) { лучшая = р; лучший = град; }
  }
  return лучший;
}

function местныйПорог(серый, ш, в, окно = 0, k = 0.34) {

  const р = Math.max(9, Math.min(28, Math.round((окно || в / 45) / 2)));

  const сум = new Uint32Array((ш + 1) * (в + 1));
  const сум2 = new Float64Array((ш + 1) * (в + 1));
  for (let у = 0; у < в; у++) {
    let строка = 0, строка2 = 0;
    for (let х = 0; х < ш; х++) {
      const з = серый[у * ш + х];
      строка += з; строка2 += з * з;
      сум[(у + 1) * (ш + 1) + х + 1] = сум[у * (ш + 1) + х + 1] + строка;
      сум2[(у + 1) * (ш + 1) + х + 1] = сум2[у * (ш + 1) + х + 1] + строка2;
    }
  }
  const вышло = new Uint8ClampedArray(ш * в);
  for (let у = 0; у < в; у++) {
    const у1 = Math.max(0, у - р), у2 = Math.min(в - 1, у + р);
    for (let х = 0; х < ш; х++) {
      const х1 = Math.max(0, х - р), х2 = Math.min(ш - 1, х + р);
      const н = (у2 - у1 + 1) * (х2 - х1 + 1);
      const с = сум[(у2 + 1) * (ш + 1) + х2 + 1] - сум[у1 * (ш + 1) + х2 + 1]
              - сум[(у2 + 1) * (ш + 1) + х1] + сум[у1 * (ш + 1) + х1];
      const с2 = сум2[(у2 + 1) * (ш + 1) + х2 + 1] - сум2[у1 * (ш + 1) + х2 + 1]
               - сум2[(у2 + 1) * (ш + 1) + х1] + сум2[у1 * (ш + 1) + х1];
      const средн = с / н;
      const разброс = Math.sqrt(Math.max(0, с2 / н - средн * средн));
      const порог = средн * (1 + k * (разброс / 128 - 1));
      вышло[у * ш + х] = серый[у * ш + х] > порог ? 255 : 0;
    }
  }
  return вышло;
}

export function разобратьЧтение(data, { ш, в, часть = null } = {}) {
  const абзацы = [];
  const вДоли = (р) => {
    const дх = часть ? часть.х : 0, ду = часть ? часть.у : 0;
    const дш = часть ? часть.ш : 1, дв = часть ? часть.в : 1;
    return {
      х: дх + (р.x0 / ш) * дш,
      у: ду + (р.y0 / в) * дв,
      ш: ((р.x1 - р.x0) / ш) * дш,
      в: ((р.y1 - р.y0) / в) * дв,
    };
  };
  for (const блок of data.blocks || []) {
    for (const абзац of блок.paragraphs || []) {
      const строки = [];
      for (const стр of абзац.lines || []) {
        const текст = (стр.text || '').replace(/\s+$/, '');
        if (!текст.trim()) continue;
        строки.push({
          текст,
          уверенность: Math.round(стр.confidence || 0),
          место: вДоли(стр.bbox),
          слова: (стр.words || []).map((с) => ({
            текст: с.text, уверенность: Math.round(с.confidence || 0), место: вДоли(с.bbox),
          })),
        });
      }
      if (строки.length) абзацы.push({ строки });
    }
  }

  const текст = абзацы.map((а) => а.строки.map((с) => с.текст).join('\n')).join('\n\n');

  let сумма = 0, весов = 0;
  for (const а of абзацы) for (const с of а.строки) {
    const вес = Math.max(1, с.текст.length);
    сумма += с.уверенность * вес; весов += вес;
  }
  const уверенность = весов ? Math.round(сумма / весов) : Math.round(data.confidence || 0);
  return { абзацы, текст, уверенность };
}

export const ЛАТИНСКИЕ = ['fra', 'deu', 'spa', 'ita', 'por', 'nld', 'pol', 'tur', 'ces'];

export const ПИСЬМЕННОСТИ = ['chi_sim', 'jpn', 'kor', 'ara', 'ell', 'heb', 'hin', 'tha'];
export const ЗАПАСНЫЕ = [...ЛАТИНСКИЕ, ...ПИСЬМЕННОСТИ];

function ряднаяДогадка(текст) {
  const латиницы = (текст.match(/[A-Za-zÀ-ÿ]/g) || []).length;
  const кириллицы = (текст.match(/[А-Яа-яЁёЇїІіЄєҐґ]/g) || []).length;
  const прочего = (текст.match(/[\u0370-\u1CFF\u3040-\u9FFF\uAC00-\uD7AF]/g) || []).length;
  if (прочего > латиницы && прочего > кириллицы) return 'иные';
  return латиницы >= кириллицы ? 'латиница' : 'кириллица';
}

const ПРИМЕТЫ = {
  fra: /\b(les|des|pour|avec|sans|conserver|température|préférence|matières|valeurs|consommer|ingrédients)\b|[èêçôûœ]/i,
  deu: /\b(der|die|das|und|mit|ohne|kühl|mindestens|haltbar|zutaten|nährwerte|gekühlt)\b|[äöüß]/i,
  spa: /\b(los|las|para|con|sin|conservar|valores|grasas|ingredientes|consumir)\b|[ñáíóú]/i,
  ita: /\b(per|con|senza|conservare|valori|ingredienti|grassi|consumare)\b|[àìòù]/i,
  por: /\b(para|com|sem|conservar|valores|ingredientes|gordura|consumir)\b|[ãõ]/i,
  nld: /\b(het|een|met|zonder|houdbaar|ingrediënten|voedingswaarde|bewaren)\b|[ëï]/i,
  pol: /\b(dla|bez|zawiera|wartość|składniki|przechowywać)\b|[ąćęłńśźż]/i,
  tur: /\b(icin|ile|gida|besin|degerleri|saklayiniz)\b|[çğış]/i,
  ces: /\b(pro|bez|obsahuje|hodnoty|složení|skladujte)\b|[čďěňřťůž]/i,
};
export function угадатьЛатинский(текст) {
  const очки = [];
  for (const [язык, примета] of Object.entries(ПРИМЕТЫ)) {
    const н = (текст.match(new RegExp(примета.source, 'gi')) || []).length;
    if (н) очки.push([язык, н]);
  }
  очки.sort((а, б) => б[1] - а[1]);
  return очки.map(([язык]) => язык);
}

export function ценаЧтения(разбор) {
  const текст = разбор.текст || '';
  const латиницы = (текст.match(/[A-Za-zÀ-ÿ]/g) || []).length;
  const кириллицы = (текст.match(/[А-Яа-яЁёЇїІіЄєҐґ]/g) || []).length;
  const иных = (текст.match(/[\u0370-\u1CFF\u3040-\u9FFF\uAC00-\uD7AF]/g) || []).length;
  const всего = латиницы + кириллицы + иных;
  if (!всего) return 0;
  const своих = Math.max(латиницы, кириллицы, иных);
  const чистота = своих / всего;

  const объём = Math.min(1, всего / 45);

  const слова = (текст.match(/\p{L}{3,}/gu) || []).length;
  const словность = Math.min(1, слова / 6);
  return разбор.уверенность * чистота * чистота * (0.35 + 0.65 * объём) * (0.25 + 0.75 * словность);
}

const ДИАКРИТИКА = /[àâäãåçéèêëíìîïñóòôöõúùûüýÿšžœæåø]/i;

export function прочиталосьПлохо(разбор) {
  const букв = (разбор.текст.match(/\p{L}/gu) || []).length;
  return букв < 12 || разбор.уверенность < 55;
}

export const КАНАЛЫ = ['серый', 'B', 'G', 'R'];

export async function прочитатьСамо(холст, { база, ход, приРезультате, картинка = null, видКадра = null } = {}) {
  const читать = async (набор, где) => {
    const чтец = await поднятьЧтеца(набор, (доля, что) => ход && ход({ набор, доля, что }));

    const { data } = await чтец.recognize(где, {}, { text: true, blocks: true });
    return data;
  };
  const оценить = (data, где) => разобратьЧтение(data, { ш: где.width, в: где.height });

  let лучшее = await читать(база, холст);
  let лучшийНабор = база;
  let разбор = оценить(лучшее, холст);
  if (приРезультате) приРезультате(лучшее, база);

  const латиницей = ряднаяДогадка(разбор.текст) === 'латиница';
  const чужаяДиакритика = ДИАКРИТИКА.test(разбор.текст)
    && !ЛАТИНСКИЕ.some((я) => база.includes(я));
  if (!прочиталосьПлохо(разбор) && !чужаяДиакритика && !(латиницей && разбор.уверенность < 80)) {
    return { data: лучшее, набор: база, подбирали: false };
  }

  const почтиПусто = (разбор.текст.match(/\p{L}/gu) || []).length < 12;
  const проба = document.createElement('canvas');

  const доля = почтиПусто ? 1 : Math.min(1, 1600 / холст.width);
  проба.width = Math.max(1, Math.round(холст.width * доля));
  проба.height = Math.max(1, Math.round(холст.height * доля));
  проба.getContext('2d').drawImage(холст, 0, 0, проба.width, проба.height);

  const догадка = почтиПусто || разбор.уверенность < 45 ? 'иные' : ряднаяДогадка(разбор.текст);

  const угаданные = угадатьЛатинский(разбор.текст);
  const латинскиеПоПорядку = [...угаданные, ...ЛАТИНСКИЕ.filter((я) => !угаданные.includes(я))];

  const букв = (разбор.текст.match(/[A-Za-zÀ-ÿА-Яа-яЁёЇїІіЄєҐґ]/g) || []).length;
  const очередь = догадка === 'иные'
    ? [...ПИСЬМЕННОСТИ.slice(0, 4), ...латинскиеПоПорядку.slice(0, 3)]
    : (букв >= 40 ? латинскиеПоПорядку.slice(0, 6)
                  : [...латинскиеПоПорядку.slice(0, 5), ...ПИСЬМЕННОСТИ.slice(0, 2)]);

  let лучшийПробный = оценить(await читать(база, проба), проба);
  let выбор = база;
  for (const один of очередь) {

    const набор = ЛАТИНСКИЕ.includes(один) ? один + '+eng' : один;
    if (ход) ход({ подбор: true, набор });
    let data;
    try {
      data = await читать(набор, проба);
    } catch (е) {

      if (typeof window !== 'undefined') {
        window.__тсОсечки = (window.__тсОсечки || []).concat(набор + ': ' + (е && е.message || е));
      }
      continue;
    }
    const этот = оценить(data, проба);

    const чужая = ПИСЬМЕННОСТИ.includes(один);
    const своихЗнаков = чужая
      ? (этот.текст.match(/[\u0370-\u1CFF\u3040-\u9FFF\uAC00-\uD7AF]/g) || []).length : 0;

    const порог = чужая ? ценаЧтения(лучшийПробный) + 4 : ценаЧтения(лучшийПробный) + 1;
    if (ценаЧтения(этот) > порог && (!чужая || своихЗнаков >= 6)) {
      лучшийПробный = этот; выбор = набор;
    }
    if (!прочиталосьПлохо(этот) && ценаЧтения(этот) >= 85) break;
  }

  let каналВыбран = 'серый';
  if (картинка && видКадра && прочиталосьПлохо(лучшийПробный)) {
    for (const канал of КАНАЛЫ.slice(1)) {
      if (ход) ход({ подбор: true, канал });
      let этот;
      try {
        const другой = подготовить(картинка, { ...видКадра, канал, ширинаЦели: 1400 });
        этот = разобратьЧтение(await читать(выбор, другой), { ш: другой.width, в: другой.height });
      } catch (е) { continue; }
      if (ценаЧтения(этот) > ценаЧтения(лучшийПробный) + 1) {
        лучшийПробный = этот; каналВыбран = канал;
      }
    }
  }

  if (выбор === база && каналВыбран === 'серый') {
    return { data: лучшее, набор: база, подбирали: true, канал: каналВыбран };
  }

  if (ход) ход({ подбор: true, набор: выбор });
  const начистоХолст = (каналВыбран !== 'серый' && картинка && видКадра)
    ? подготовить(картинка, { ...видКадра, канал: каналВыбран })
    : холст;
  const начисто = await читать(выбор, начистоХолст);
  return { data: начисто, набор: выбор, подбирали: true, канал: каналВыбран, холст: начистоХолст };
}

export function сомнительных(абзацы, порог = 70) {
  let всего = 0, плохих = 0;
  for (const а of абзацы) for (const с of а.строки) for (const сл of с.слова) {
    if (!сл.текст.trim()) continue;
    всего++;
    if (сл.уверенность < порог) плохих++;
  }
  return { всего, плохих };
}
