// ЭТО КОМПЬЮТЕР ИЛИ ТЕЛЕФОН.
//
// Нужно ровно одному: тяжёлой модели «Нейросеть Про». Она съедает под гигабайт памяти, и на
// телефоне это не «медленно», а вылет вкладки — владелец поймал это на своём iPhone 24.08.2026.
//
// Одного `navigator.gpu` мало, и это главная ошибка прежней проверки: Safari на iPhone
// видеокарту показывает. Значит спрашивать надо не «есть ли видеокарта», а «это компьютер».

/** Телефон или планшет. */
export function этоТелефон() {
  if (typeof navigator === 'undefined') return false;
  // Признаки складываются ЧЕРЕЗ ИЛИ, а не по очереди с доверием первому. Прежняя версия
  // спрашивала userAgentData и на ответ «нет» успокаивалась -- а Safari на iPhone этого
  // свойства не имеет вовсе, и проверка возвращала «компьютер».
  const дд = navigator.userAgentData;
  if (дд && дд.mobile === true) return true;
  const касания = (navigator.maxTouchPoints || 0) > 1;
  if (!касания) return false;
  // Касания есть. Отличаем телефон и планшет от ноутбука с сенсорным экраном: у ноутбука
  // есть мышь или трекпад, то есть точный указатель.
  try {
    if (typeof matchMedia === 'function' && !matchMedia('(pointer: fine)').matches) return true;
  } catch (e) {}
  const узкий = typeof screen !== 'undefined'
    && Math.min(screen.width || 0, screen.height || 0) > 0
    && Math.min(screen.width, screen.height) < 900;
  return узкий;
}

/** Можно ли пускать тяжёлую модель: компьютер И есть видеокарта. */
export function этоПК() {
  return typeof navigator !== 'undefined' && !!navigator.gpu && !этоТелефон();
}
