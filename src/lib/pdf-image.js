
const A4 = { ш: 595.28, в: 841.89 };

const вБайты = (строка) => Uint8Array.from(строка, (з) => з.charCodeAt(0) & 0xFF);

async function вJpeg(картинка, качество) {
  const холст = document.createElement('canvas');
  холст.width = картинка.width;
  холст.height = картинка.height;
  холст.getContext('2d').drawImage(картинка, 0, 0);
  const капля = await new Promise((готово) => холст.toBlob(готово, 'image/jpeg', качество));
  return new Uint8Array(await капля.arrayBuffer());
}

function место(ш, в) {
  const альбом = ш > в;
  const лист = альбом ? { ш: A4.в, в: A4.ш } : A4;
  const к = Math.min(лист.ш / ш, лист.в / в);
  const ширина = ш * к, высота = в * к;
  return {
    лист,
    ш: ширина,
    в: высота,
    х: (лист.ш - ширина) / 2,
    у: (лист.в - высота) / 2,
  };
}

function датаPdf(д) {
  const дв = (ч) => String(ч).padStart(2, '0');
  return 'D:' + д.getFullYear() + дв(д.getMonth() + 1) + дв(д.getDate())
    + дв(д.getHours()) + дв(д.getMinutes()) + дв(д.getSeconds());
}

const экранировать = (строка) => String(строка).replace(/([\\()])/g, '\\$1');

export async function собратьPdfИзЛистов(листы, { качество = 0.82, заголовок = 'Scan' } = {}) {
  if (!листы.length) throw new Error('нет ни одного листа');

  const страницы = [];
  for (const лист of листы) {
    страницы.push({ jpeg: await вJpeg(лист, качество), ш: лист.width, в: лист.height });
  }

  const оСтр = (и) => 3 + и * 3;
  const оСодерж = (и) => 4 + и * 3;
  const оКартинка = (и) => 5 + и * 3;
  const оСведения = 3 + страницы.length * 3;

  const объекты = new Array(оСведения + 1).fill(null);
  объекты[1] = вБайты('<</Type /Catalog /Pages 2 0 R>>');
  объекты[2] = вБайты('<</Type /Pages /Kids ['
    + страницы.map((_, и) => оСтр(и) + ' 0 R').join(' ')
    + '] /Count ' + страницы.length + '>>');

  страницы.forEach((с, и) => {
    const м = место(с.ш, с.в);
    объекты[оСтр(и)] = вБайты('<</Type /Page /Parent 2 0 R'
      + ' /MediaBox [0 0 ' + м.лист.ш.toFixed(2) + ' ' + м.лист.в.toFixed(2) + ']'
      + ' /Resources <</XObject <</I' + и + ' ' + оКартинка(и) + ' 0 R>>>>'
      + ' /Contents ' + оСодерж(и) + ' 0 R>>');

    const поток = 'q ' + м.ш.toFixed(2) + ' 0 0 ' + м.в.toFixed(2) + ' '
      + м.х.toFixed(2) + ' ' + м.у.toFixed(2) + ' cm /I' + и + ' Do Q';
    объекты[оСодерж(и)] = вБайты('<</Length ' + поток.length + '>>\nstream\n' + поток + '\nendstream');

    const шапка = вБайты('<</Type /XObject /Subtype /Image'
      + ' /Width ' + с.ш + ' /Height ' + с.в
      + ' /ColorSpace /DeviceRGB /BitsPerComponent 8'
      + ' /Filter /DCTDecode /Length ' + с.jpeg.length + '>>\nstream\n');
    const хвост = вБайты('\nendstream');
    const всё = new Uint8Array(шапка.length + с.jpeg.length + хвост.length);
    всё.set(шапка, 0);
    всё.set(с.jpeg, шапка.length);
    всё.set(хвост, шапка.length + с.jpeg.length);
    объекты[оКартинка(и)] = всё;
  });

  объекты[оСведения] = вБайты('<</Title (' + экранировать(заголовок) + ')'
    + ' /Producer (Opitro) /CreationDate (' + датаPdf(new Date()) + ')>>');

  const части = [];
  let длина = 0;
  const добавить = (байты) => { части.push(байты); длина += байты.length; };
  добавить(вБайты('%PDF-1.7\n%\xE2\xE3\xCF\xD3\n'));

  const места = new Array(оСведения + 1).fill(0);
  for (let н = 1; н <= оСведения; н++) {
    места[н] = длина;
    добавить(вБайты(н + ' 0 obj\n'));
    добавить(объекты[н]);
    добавить(вБайты('\nendobj\n'));
  }

  const таблица = длина;
  let ссылки = 'xref\n0 ' + (оСведения + 1) + '\n0000000000 65535 f \n';
  for (let н = 1; н <= оСведения; н++) ссылки += String(места[н]).padStart(10, '0') + ' 00000 n \n';
  ссылки += 'trailer\n<</Size ' + (оСведения + 1) + ' /Root 1 0 R /Info ' + оСведения + ' 0 R>>\n'
    + 'startxref\n' + таблица + '\n%%EOF\n';
  добавить(вБайты(ссылки));

  const файл = new Uint8Array(длина);
  let куда = 0;
  for (const часть of части) { файл.set(часть, куда); куда += часть.length; }
  return файл;
}
