// ДЕРЖАТЕЛЬ ЗВУКОВОЙ СЕССИИ ДЛЯ iOS.
//
// Беда: после блокировки экрана iOS разбирает звуковой конвейер вкладки. Возвращаешься --
// кнопка нажимается, бегунок идёт, звука нет; лечила только перезагрузка страницы. Из-за неё
// мы уводили воспроизведение на обычный <audio> и теряли мгновенную реакцию ручек.
//
// Лечение: держать скрытый <audio> с ЗАЦИКЛЕННОЙ ТИШИНОЙ, запущенный с первого касания.
// Пока в системе крутится хоть один играющий медиаэлемент, конвейер не разбирается, и живой
// AudioContext переживает сон. Проверено на живом iPhone (LeebTTS, 19-21.08.2026), см. память
// project-audio-rule-1-ios-session.
//
// Обязательные условия -- без любого приём не работает:
//   * запуск ТОЛЬКО из жеста, обработчики в фазе перехвата, чтобы поймать первое касание
//     раньше обработчиков страницы;
//   * loop -- одноразовая тишина отыграет, и болезнь вернётся;
//   * playsInline и оба атрибута, иначе iOS попробует открыть плеер во весь экран;
//   * элемент не удалять и не ставить на паузу, пока страница жива (кроме времени записи);
//   * ТОЛЬКО iOS: на Android лишний играющий элемент перехватывает медиа-кнопки.

let эл = null;
let занят = false;
let включён = false;
let наПаузеИзЗаЗаписи = false;

function этоIOS() {
  // Принудительное включение нужно проверкам: на компьютере приёма нет, и убедиться,
  // что элемент вообще заводится, иначе нечем.
  if (typeof window !== 'undefined' && window.__opitroДержательВсегда) return true;
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  // iPad с iPadOS представляется маком -- ловим его по наличию касаний.
  return /iP(hone|ad|od)/.test(ua) ||
    (ua.indexOf('Macintosh') > -1 && (navigator.maxTouchPoints || 0) > 1);
}

// Пять секунд тишины, 8 кГц моно: сорок килобайт, собираются на месте, ничего не грузится.
function тишинаWav() {
  const sr = 8000, n = sr * 5, байт = n * 2;
  const ab = new ArrayBuffer(44 + байт), v = new DataView(ab);
  const w = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + байт, true); w(8, 'WAVE'); w(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, 'data'); v.setUint32(40, байт, true);
  return URL.createObjectURL(new Blob([ab], { type: 'audio/wav' }));
}

function создать() {
  if (эл) return эл;
  эл = document.createElement('audio');
  эл.loop = true;
  эл.preload = 'auto';
  эл.playsInline = true;
  эл.setAttribute('playsinline', '');
  эл.setAttribute('webkit-playsinline', '');
  эл.setAttribute('aria-hidden', 'true');
  эл.src = тишинаWav();
  эл.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';
  (document.body || document.documentElement).appendChild(эл);
  return эл;
}

function толкнуть() {
  const a = создать();
  if (занят || !a.paused || наПаузеИзЗаЗаписи) return;
  занят = true;
  const p = a.play();
  if (p && p.then) p.then(() => { занят = false; }).catch(() => { занят = false; });
  else занят = false;
}

/** Завести держателя. Вызывать один раз при загрузке страницы со звуком. */
export function startKeeper() {
  if (включён || typeof document === 'undefined' || !этоIOS()) return;
  включён = true;
  ['touchend', 'keydown', 'click'].forEach((имя) => document.addEventListener(имя, толкнуть, true));
}

/** Замолчать на время записи: сессия на странице одна, и режимы столкнутся лбами. */
export function pauseKeeper() {
  наПаузеИзЗаЗаписи = true;
  if (эл && !эл.paused) { try { эл.pause(); } catch (e) {} }
}

/** Вернуть держателя после записи. */
export function resumeKeeper() {
  наПаузеИзЗаЗаписи = false;
  if (эл) толкнуть();
}

/** Для проверок: есть ли элемент и играет ли он. */
export function keeperState() {
  return { есть: !!эл, играет: !!(эл && !эл.paused), включён };
}
