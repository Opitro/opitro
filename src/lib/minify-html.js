
import { сжатьCSS } from './minify-css.js';

const СТРОЧНЫЕ = new Set([
  'a', 'abbr', 'acronym', 'b', 'bdi', 'bdo', 'big', 'br', 'button', 'cite', 'code', 'data',
  'datalist', 'del', 'dfn', 'em', 'embed', 'font', 'i', 'iframe', 'img', 'input', 'ins',
  'kbd', 'label', 'map', 'mark', 'meter', 'nobr', 'object', 'output', 'picture', 'progress',
  'q', 'ruby', 's', 'samp', 'select', 'small', 'span', 'strike', 'strong', 'sub', 'sup',
  'svg', 'textarea', 'time', 'tt', 'u', 'var', 'video', 'audio', 'canvas', 'wbr',
]);

const СЫРЫЕ = new Set(['script', 'style', 'pre', 'textarea', 'title']);

const ДОСЛОВНЫЕ = new Set(['pre', 'textarea']);

const ЛОГИЧЕСКИЕ = new Set([
  'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls', 'default',
  'defer', 'disabled', 'formnovalidate', 'hidden', 'inert', 'ismap', 'itemscope', 'loop',
  'multiple', 'muted', 'nomodule', 'novalidate', 'open', 'playsinline', 'readonly',
  'required', 'reversed', 'selected', 'shadowrootclonable', 'truespeed',
]);

const ЭТО_JS = (тип) => !тип
  || /^(text\/javascript|application\/javascript|application\/ecmascript|text\/ecmascript|module)$/i.test(тип.trim());

function разобратьТег(с, начало) {
  let и = начало + 1;
  const закрывающий = с[и] === '/';
  if (закрывающий) и++;
  const имя = (с.slice(и).match(/^[a-zA-Z][\w:-]*/) || [''])[0];
  и += имя.length;
  const свойства = [];
  while (и < с.length) {
    while (и < с.length && /\s/.test(с[и])) и++;
    if (с[и] === '>') return { имя: имя.toLowerCase(), закрывающий, свойства, конец: и + 1, сам: false };
    if (с[и] === '/' && с[и + 1] === '>') {
      return { имя: имя.toLowerCase(), закрывающий, свойства, конец: и + 2, сам: true };
    }
    const имяСв = (с.slice(и).match(/^[^\s=/>]+/) || [''])[0];
    if (!имяСв) { и++; continue; }
    и += имяСв.length;
    let значение = null, кавычка = '';
    const сохранить = и;
    while (и < с.length && /\s/.test(с[и])) и++;
    if (с[и] === '=') {
      и++;
      while (и < с.length && /\s/.test(с[и])) и++;
      if (с[и] === '"' || с[и] === "'") {
        кавычка = с[и];
        const конец = с.indexOf(кавычка, и + 1);
        if (конец === -1) return null;
        значение = с.slice(и + 1, конец);
        и = конец + 1;
      } else {
        const кусок = (с.slice(и).match(/^[^\s>]*/) || [''])[0];
        значение = кусок;
        и += кусок.length;
      }
    } else {
      и = сохранить;
    }
    свойства.push({ имя: имяСв, значение, кавычка });
  }
  return null;
}

function собратьТег(тег, наладки) {
  if (тег.закрывающий) return `</${тег.имя}>`;
  let итог = '<' + тег.имя;
  for (const с of тег.свойства) {
    const низ = с.имя.toLowerCase();
    if (наладки.свойства) {

      if (ЛОГИЧЕСКИЕ.has(низ)
          && (с.значение === null || с.значение === '' || с.значение.toLowerCase() === низ)) {
        итог += ' ' + с.имя;
        continue;
      }

      if (низ === 'type' && тег.имя === 'script' && /^text\/javascript$/i.test(с.значение || '')) continue;
      if (низ === 'type' && тег.имя === 'style' && /^text\/css$/i.test(с.значение || '')) continue;
      if (низ === 'language' && тег.имя === 'script' && /^javascript$/i.test(с.значение || '')) continue;
    }
    if (с.значение === null) { итог += ' ' + с.имя; continue; }

    const к = с.кавычка || '"';
    итог += ` ${с.имя}=${к}${с.значение}${к}`;
  }
  return итог + (тег.сам ? '/>' : '>');
}

export async function сжатьHTML(текст, наладки = {}) {
  const { комментарии = true, встроенные = true, свойства = true, сжатьJS = null } = наладки;
  const с = String(текст ?? '');
  const куски = [];
  let и = 0;

  while (и < с.length) {
    const открыть = с.indexOf('<', и);
    if (открыть === -1) { куски.push({ вид: 'текст', текст: с.slice(и) }); break; }
    if (открыть > и) куски.push({ вид: 'текст', текст: с.slice(и, открыть) });

    if (с.startsWith('<!--', открыть)) {
      const конец = с.indexOf('-->', открыть + 4);
      if (конец === -1) { куски.push({ вид: 'иное', текст: с.slice(открыть) }); break; }
      куски.push({ вид: 'примечание', текст: с.slice(открыть, конец + 3) });
      и = конец + 3;
      continue;
    }

    if (с[открыть + 1] === '!' || с[открыть + 1] === '?') {
      const конец = с.indexOf('>', открыть);
      if (конец === -1) { куски.push({ вид: 'иное', текст: с.slice(открыть) }); break; }
      куски.push({ вид: 'иное', текст: с.slice(открыть, конец + 1) });
      и = конец + 1;
      continue;
    }

    const тег = разобратьТег(с, открыть);
    if (!тег || !тег.имя) {

      куски.push({ вид: 'текст', текст: с.slice(открыть, открыть + 1) });
      и = открыть + 1;
      continue;
    }

    if (!тег.закрывающий && СЫРЫЕ.has(тег.имя) && !тег.сам) {
      const закрытие = new RegExp(`</${тег.имя}\\s*>`, 'i');
      const хвост = с.slice(тег.конец);
      const м = хвост.match(закрытие);
      const содержимое = м ? хвост.slice(0, м.index) : хвост;
      куски.push({ вид: 'сырой', тег, содержимое });
      и = тег.конец + содержимое.length + (м ? м[0].length : 0);
      continue;
    }

    куски.push({ вид: 'тег', тег });
    и = тег.конец;
  }

  const значимые = куски.filter((к) => !(к.вид === 'примечание' && комментарии && !к.текст.startsWith('<!--[')));

  const строчное = (кусок) => {
    if (!кусок) return false;
    if (кусок.вид === 'текст') return true;
    if (кусок.вид === 'иное') return false;
    if (кусок.вид === 'примечание') return false;
    const имя = кусок.вид === 'сырой' ? кусок.тег.имя : кусок.тег.имя;
    return СТРОЧНЫЕ.has(имя);
  };

  let итог = '';
  for (let н = 0; н < значимые.length; н++) {
    const к = значимые[н];

    if (к.вид === 'примечание') { итог += к.текст; continue; }
    if (к.вид === 'иное') { итог += к.текст; continue; }
    if (к.вид === 'тег') { итог += собратьТег(к.тег, { свойства }); continue; }

    if (к.вид === 'сырой') {
      const имя = к.тег.имя;
      let тело = к.содержимое;
      if (!ДОСЛОВНЫЕ.has(имя) && встроенные) {
        if (имя === 'style') {
          const р = сжатьCSS(тело, {});
          if (!р.беда) тело = р.код;
        } else if (имя === 'script') {
          const тип = (к.тег.свойства.find((п) => п.имя.toLowerCase() === 'type') || {}).значение;
          if (ЭТО_JS(тип) && сжатьJS) {
            try { тело = await сжатьJS(тело); } catch (е) {  }
          } else if (!ЭТО_JS(тип)) {
            тело = тело.trim();
          }
        }
      } else if (!ДОСЛОВНЫЕ.has(имя)) {
        тело = тело.trim();
      }
      итог += собратьТег(к.тег, { свойства }) + тело + `</${имя}>`;
      continue;
    }

    const слева = значимые[н - 1];
    const справа = значимые[н + 1];
    if (/^\s*$/.test(к.текст)) {

      if (строчное(слева) || строчное(справа)) итог += ' ';
      continue;
    }
    let т = к.текст.replace(/\s+/g, ' ');

    if (/^\s/.test(к.текст) && !строчное(слева)) т = т.replace(/^ /, '');
    if (/\s$/.test(к.текст) && !строчное(справа)) т = т.replace(/ $/, '');
    итог += т;
  }

  return { код: итог.trim(), беда: null };
}
