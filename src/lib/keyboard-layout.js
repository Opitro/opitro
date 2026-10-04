
const к = (код, лат, кир, ш) => ({ код, лат, кир, ш: ш || 1 });
const пусто = (ш) => ({ пусто: true, ш });

const ОСНОВНОЙ = [
  [к('Escape', 'Esc'), пусто(1),
   к('F1', 'F1'), к('F2', 'F2'), к('F3', 'F3'), к('F4', 'F4'), пусто(0.5),
   к('F5', 'F5'), к('F6', 'F6'), к('F7', 'F7'), к('F8', 'F8'), пусто(0.5),
   к('F9', 'F9'), к('F10', 'F10'), к('F11', 'F11'), к('F12', 'F12')],

  [к('Backquote', '`', 'ё'), к('Digit1', '1', '!'), к('Digit2', '2', '"'), к('Digit3', '3', '№'),
   к('Digit4', '4', ';'), к('Digit5', '5', '%'), к('Digit6', '6', ':'), к('Digit7', '7', '?'),
   к('Digit8', '8', '*'), к('Digit9', '9', '('), к('Digit0', '0', ')'),
   к('Minus', '−'), к('Equal', '='), к('Backspace', '⌫', null, 2)],

  [к('Tab', '⇥ Tab', null, 1.5),
   к('KeyQ', 'Q', 'Й'), к('KeyW', 'W', 'Ц'), к('KeyE', 'E', 'У'), к('KeyR', 'R', 'К'),
   к('KeyT', 'T', 'Е'), к('KeyY', 'Y', 'Н'), к('KeyU', 'U', 'Г'), к('KeyI', 'I', 'Ш'),
   к('KeyO', 'O', 'Щ'), к('KeyP', 'P', 'З'),
   к('BracketLeft', '[', 'Х'), к('BracketRight', ']', 'Ъ'), к('Backslash', '\\', '/', 1.5)],

  [к('CapsLock', '⇪ Caps', null, 1.75),
   к('KeyA', 'A', 'Ф'), к('KeyS', 'S', 'Ы'), к('KeyD', 'D', 'В'), к('KeyF', 'F', 'А'),
   к('KeyG', 'G', 'П'), к('KeyH', 'H', 'Р'), к('KeyJ', 'J', 'О'), к('KeyK', 'K', 'Л'),
   к('KeyL', 'L', 'Д'), к('Semicolon', ';', 'Ж'), к('Quote', "'", 'Э'),
   к('Enter', '⏎ Enter', null, 2.25)],

  [к('ShiftLeft', '⇧ Shift', null, 2.25),
   к('KeyZ', 'Z', 'Я'), к('KeyX', 'X', 'Ч'), к('KeyC', 'C', 'С'), к('KeyV', 'V', 'М'),
   к('KeyB', 'B', 'И'), к('KeyN', 'N', 'Т'), к('KeyM', 'M', 'Ь'),
   к('Comma', ',', 'Б'), к('Period', '.', 'Ю'), к('Slash', '/', '.'),
   к('ShiftRight', '⇧ Shift', null, 2.75)],

  [к('ControlLeft', 'Ctrl', null, 1.25), к('MetaLeft', '⌘ / ⊞', null, 1.25),
   к('AltLeft', 'Alt', null, 1.25), к('Space', '', null, 6.25),
   к('AltRight', 'Alt', null, 1.25), к('MetaRight', '⌘ / ⊞', null, 1.25),
   к('ContextMenu', '☰', null, 1.25), к('ControlRight', 'Ctrl', null, 1.25)],
];

const СРЕДНИЙ = [
  [к('PrintScreen', 'PrtSc'), к('ScrollLock', 'ScrLk'), к('Pause', 'Pause')],
  [к('Insert', 'Ins'), к('Home', 'Home'), к('PageUp', 'PgUp')],
  [к('Delete', 'Del'), к('End', 'End'), к('PageDown', 'PgDn')],
  [пусто(3)],
  [пусто(1), к('ArrowUp', '↑'), пусто(1)],
  [к('ArrowLeft', '←'), к('ArrowDown', '↓'), к('ArrowRight', '→')],
];

const ЦИФРОВОЙ = [
  [пусто(4)],
  [к('NumLock', 'Num'), к('NumpadDivide', '/'), к('NumpadMultiply', '*'), к('NumpadSubtract', '−')],
  [к('Numpad7', '7'), к('Numpad8', '8'), к('Numpad9', '9'), к('NumpadAdd', '+')],
  [к('Numpad4', '4'), к('Numpad5', '5'), к('Numpad6', '6'), пусто(1)],
  [к('Numpad1', '1'), к('Numpad2', '2'), к('Numpad3', '3'), к('NumpadEnter', '⏎')],
  [к('Numpad0', '0', null, 2), к('NumpadDecimal', '.'), пусто(1)],
];

export const БЛОКИ = [ОСНОВНОЙ, СРЕДНИЙ, ЦИФРОВОЙ];

export const ВСЕГО = БЛОКИ.reduce(
  (сумма, блок) => сумма + блок.reduce((с, ряд) => с + ряд.filter((э) => !э.пусто).length, 0),
  0
);
