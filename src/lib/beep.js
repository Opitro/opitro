
let ак = null;

export function подготовитьЗвук() {
  try {
    if (!ак) ак = new (window.AudioContext || window.webkitAudioContext)();
    if (ак.state === 'suspended') ак.resume();
  } catch (е) {  }
  return ак;
}

export function пикнуть() {
  try {
    подготовитьЗвук();
    if (!ак) return;
    const ген = ак.createOscillator();
    const гром = ак.createGain();
    ген.type = 'sine';
    ген.frequency.value = 1320;

    гром.gain.setValueAtTime(0.0001, ак.currentTime);
    гром.gain.exponentialRampToValueAtTime(0.09, ак.currentTime + 0.01);
    гром.gain.exponentialRampToValueAtTime(0.0001, ак.currentTime + 0.14);
    ген.connect(гром); гром.connect(ак.destination);
    ген.start(); ген.stop(ак.currentTime + 0.15);
  } catch (е) {  }
}

export function состояниеЗвука() {
  return ак ? ак.state : 'нет';
}
