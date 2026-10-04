
let движок = null;

async function взятьДвижок() {
  if (!движок) движок = await import('terser');
  return движок;
}

export async function сжатьJS(код, наладки = {}) {
  const { комментарии = true, имена = true } = наладки;
  const текст = String(код ?? '');
  if (!текст.trim()) return { код: '', беда: null, строка: null, столбец: null };

  const { minify } = await взятьДвижок();
  try {
    const р = await minify(текст, {

      compress: true,
      mangle: имена,
      format: { comments: комментарии ? false : 'all' },
    });
    return { код: р.code ?? '', беда: null, строка: null, столбец: null };
  } catch (е) {
    return {
      код: '',
      беда: е.message || String(е),
      строка: е.line ?? null,
      столбец: е.col ?? null,
    };
  }
}

export const сжатьJSпросто = (код) => сжатьJS(код, { имена: false }).then((р) => {
  if (р.беда) throw new Error(р.беда);
  return р.код;
});
