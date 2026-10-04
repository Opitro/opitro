
export function контрольнаяЦифра(цифры) {
  const с = String(цифры).replace(/\D/g, '');
  let сумма = 0;
  for (let и = 0; и < с.length; и++) {

    const вес = и % 2 === 0 ? 3 : 1;
    сумма += вес * Number(с[с.length - 1 - и]);
  }
  return (10 - (сумма % 10)) % 10;
}

const ДЛИНА = { EAN13: 13, EAN8: 8, UPC: 12 };

const ЗНАКИ39 = new Set('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%'.split(''));

export function проверить(формат, ввод) {
  const текст = String(ввод ?? '');
  if (!текст.trim()) return { годно: false, пусто: true };

  if (формат === 'EAN13' || формат === 'EAN8' || формат === 'UPC') {
    const надо = ДЛИНА[формат];
    const цифры = текст.replace(/\s/g, '');
    if (!/^\d+$/.test(цифры)) {
      const чужой = [...цифры].find((з) => !/\d/.test(з));
      return { годно: false, беда: { вид: 'толькоЦифры', знак: чужой } };
    }

    if (цифры.length === надо - 1) {
      const ц = контрольнаяЦифра(цифры);
      return { годно: true, значение: цифры + ц, добавленаЦифра: ц };
    }
    if (цифры.length !== надо) {
      return { годно: false, беда: { вид: 'длина', надо, есть: цифры.length } };
    }
    const должна = контрольнаяЦифра(цифры.slice(0, надо - 1));
    const стоит = Number(цифры[надо - 1]);
    if (должна !== стоит) {
      return { годно: false, беда: { вид: 'контроль', должна, стоит } };
    }
    return { годно: true, значение: цифры };
  }

  if (формат === 'CODE39') {
    const верх = текст.toUpperCase();
    const чужой = [...верх].find((з) => !ЗНАКИ39.has(з));
    if (чужой) return { годно: false, беда: { вид: 'знак39', знак: чужой } };
    return {
      годно: true,
      значение: верх,

      подсказка: верх !== текст ? { вид: 'заглавные' } : null,
    };
  }

  const чужой = [...текст].find((з) => з.codePointAt(0) > 127);
  if (чужой) return { годно: false, беда: { вид: 'неASCII', знак: чужой } };
  return { годно: true, значение: текст };
}
