
export function этоТелефон() {
  if (typeof navigator === 'undefined') return false;

  const дд = navigator.userAgentData;
  if (дд && дд.mobile === true) return true;
  const касания = (navigator.maxTouchPoints || 0) > 1;
  if (!касания) return false;

  try {
    if (typeof matchMedia === 'function' && !matchMedia('(pointer: fine)').matches) return true;
  } catch (e) {}
  const узкий = typeof screen !== 'undefined'
    && Math.min(screen.width || 0, screen.height || 0) > 0
    && Math.min(screen.width, screen.height) < 900;
  return узкий;
}

export function этоПК() {
  return typeof navigator !== 'undefined' && !!navigator.gpu && !этоТелефон();
}
