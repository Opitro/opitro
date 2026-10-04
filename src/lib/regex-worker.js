
const ПОТОЛОК = 5000;

self.onmessage = (е) => {
  const { шаблон, флаги, текст } = е.data || {};

  let выражение;
  try {
    выражение = new RegExp(шаблон, флаги);
  } catch (о) {

    self.postMessage({ беда: String(о.message || о) });
    return;
  }

  const совпадения = [];
  let оборвано = false;

  try {
    if (!флаги.includes('g')) {
      const м = выражение.exec(текст);
      if (м) совпадения.push(разобрать(м));
    } else {
      выражение.lastIndex = 0;
      let м;
      while ((м = выражение.exec(текст)) !== null) {
        совпадения.push(разобрать(м));

        if (м[0] === '') выражение.lastIndex += 1;
        if (совпадения.length >= ПОТОЛОК) { оборвано = true; break; }
      }
    }
  } catch (о) {
    self.postMessage({ беда: String(о.message || о) });
    return;
  }

  self.postMessage({ совпадения, оборвано, потолок: ПОТОЛОК });

  function разобрать(м) {
    const группы = [];
    for (let и = 1; и < м.length; и++) {
      группы.push({ номер: и, имя: имяГруппы(м, и), текст: м[и] === undefined ? null : м[и] });
    }
    return { начало: м.index, конец: м.index + м[0].length, текст: м[0], группы };
  }

  function имяГруппы(м, номер) {
    if (!м.groups) return null;
    for (const [имя, значение] of Object.entries(м.groups)) {
      if (значение === м[номер]) return имя;
    }
    return null;
  }
};
