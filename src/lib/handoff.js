
const БАЗА = 'opitro-handoff';
const СКЛАД = 'работа';
const ЖИЗНЬ = 10 * 60 * 1000;

function открыть() {
  return new Promise((готово, беда) => {
    const зпр = indexedDB.open(БАЗА, 1);
    зпр.onupgradeneeded = () => {
      const db = зпр.result;
      if (!db.objectStoreNames.contains(СКЛАД)) db.createObjectStore(СКЛАД);
    };
    зпр.onsuccess = () => готово(зпр.result);
    зпр.onerror = () => беда(зпр.error);
  });
}

function действие(режим, дело) {
  return открыть().then((db) => new Promise((готово, беда) => {
    const т = db.transaction(СКЛАД, режим);
    const зпр = дело(т.objectStore(СКЛАД));
    зпр.onsuccess = () => готово(зпр.result);
    зпр.onerror = () => беда(зпр.error);
  }));
}

export async function отложить(что) {
  try {
    await действие('readwrite', (склад) => склад.put({ ...что, когда: Date.now() }, 'текущая'));
    return true;
  } catch (e) { return false; }
}

export async function забрать() {
  try {
    const что = await действие('readonly', (склад) => склад.get('текущая'));
    await действие('readwrite', (склад) => склад.delete('текущая'));
    if (!что) return null;
    if (Date.now() - (что.когда || 0) > ЖИЗНЬ) return null;
    return что;
  } catch (e) { return null; }
}
