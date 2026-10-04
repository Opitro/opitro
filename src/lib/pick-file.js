
export function выбратьФайл({ берём = 'image/*', многие = false, съёмка = '' } = {}) {
  return new Promise((готово) => {
    const поле = document.createElement('input');
    поле.type = 'file';
    if (берём) поле.accept = берём;
    if (многие) поле.multiple = true;

    if (съёмка) поле.setAttribute('capture', съёмка);

    поле.style.cssText = 'position:fixed;left:-10000px;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
    document.body.appendChild(поле);

    let отдано = false;
    const отдать = (что) => {
      if (отдано) return;
      отдано = true;

      setTimeout(() => { try { поле.remove(); } catch (е) {} }, 0);
      готово(что);
    };

    поле.addEventListener('change', () => {
      const файлы = поле.files ? Array.from(поле.files) : [];
      отдать(многие ? файлы : (файлы[0] || null));
    }, { once: true });

    поле.addEventListener('cancel', () => отдать(многие ? [] : null), { once: true });

    window.addEventListener('focus', () => {
      setTimeout(() => { if (!поле.files || !поле.files.length) отдать(многие ? [] : null); }, 1500);
    }, { once: true });

    поле.click();
  });
}
