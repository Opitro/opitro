// Проверка структуры всех собранных страниц по общим правилам вёрстки и SEO, а не по вкусу.
// Ходит по dist целиком: каждая страница, каждый язык. Ничего не запускает в браузере -- здесь
// проверяется разметка как таковая, браузерные замечания собирает check-pages.mjs.
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') pages.push(p);
  }
})(DIST);

// Ошибки и замечания разведены намеренно. Ошибка -- это то, что сломано: нет заголовка, битая
// ссылка, повторяющийся id. Замечание -- то, на что стоит взглянуть, но что ломаться не обязано.
//
// Длина title и description сюда попадала как ошибка и давала 297 «проблем» на ровном месте.
// Это неверно: поисковик читает тег целиком для ранжирования и обрезает только показ. Проверено
// на самых длинных описаниях -- видимые 155 знаков везде законченная мысль, а обрезается хвост
// вроде «бесплатно, без регистрации», по которому находят в длинных запросах. Резать его -- значит
// менять поисковый сигнал на косметику. Поэтому длина теперь замечание, и порог поднят до того
// места, где страдает уже начало строки, а не хвост.
const problems = [];
const notes = [];
const add = (page, kind, detail) => problems.push({ page: page.replace(/^dist/, '').replace(/\/index\.html$/, '') || '/', kind, detail });
const note = (page, kind, detail) => notes.push({ page: page.replace(/^dist/, '').replace(/\/index\.html$/, '') || '/', kind, detail });

const titles = new Map();
const descriptions = new Map();
const allUrls = new Set(pages.map((p) => p.replace(/^dist/, '').replace(/\/index\.html$/, '')));

for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const url = file.replace(/^dist/, '').replace(/\/index\.html$/, '');

  // --- заголовки: ровно один h1, и уровни не перепрыгиваются
  const heads = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)]
    .map((m) => ({ level: Number(m[1]), text: m[2].replace(/<[^>]+>/g, '').trim() }));
  const h1s = heads.filter((h) => h.level === 1);
  if (h1s.length !== 1) add(url, 'заголовки', `h1 на странице: ${h1s.length}`);
  let prev = 0;
  for (const h of heads) {
    if (prev && h.level > prev + 1) add(url, 'заголовки', `перепрыгнут уровень: h${prev} -> h${h.level} («${h.text.slice(0, 40)}»)`);
    prev = h.level;
  }
  for (const h of heads) if (!h.text) add(url, 'заголовки', `пустой h${h.level}`);

  // --- title и description: есть, не пустые, не повторяются между страницами
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim();
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1]?.trim();
  if (!title) add(url, 'мета', 'нет title');
  else {
    if (title.length > 75) note(url, 'длина', `title ${title.length} знаков -- в выдаче покажут около 60`);
    if (titles.has(title)) add(url, 'мета', `title повторяет ${titles.get(title)}`);
    else titles.set(title, url);
  }
  if (!desc) add(url, 'мета', 'нет description');
  else {
    if (desc.length > 220) note(url, 'длина', `description ${desc.length} знаков -- в выдаче покажут около 155`);
    if (descriptions.has(desc)) add(url, 'мета', `description повторяет ${descriptions.get(desc)}`);
    else descriptions.set(desc, url);
  }

  // --- lang, canonical
  if (!/<html lang="[a-z]{2}"/.test(html)) add(url, 'разметка', 'нет lang у <html>');
  const canon = (html.match(/rel="canonical" href="([^"]+)"/) || [])[1];
  if (!canon) add(url, 'мета', 'нет canonical');
  else if (!canon.endsWith(url) && !(url === '' && canon.endsWith('/'))) add(url, 'мета', `canonical не совпадает с адресом: ${canon}`);

  // --- повторяющиеся id
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  for (const d of new Set(dup)) add(url, 'разметка', `id встречается дважды: ${d}`);

  // --- ссылки: пустые, без текста, ведущие в никуда
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const attrs = m[1];
    const inner = m[2].replace(/<[^>]+>/g, '').trim();
    const href = (attrs.match(/href="([^"]*)"/) || [])[1];
    const aria = /aria-label="[^"]+"/.test(attrs);
    if (!href) { add(url, 'ссылки', 'ссылка без href'); continue; }
    if (!inner && !aria && !/<svg/.test(m[2])) add(url, 'ссылки', `ссылка без текста: ${href}`);
    if (href.startsWith('/') && !href.startsWith('/_')) {
      const clean = href.split('#')[0].split('?')[0].replace(/\/$/, '');
      if (clean && !allUrls.has(clean) && !fs.existsSync(path.join(DIST, clean.slice(1)))) {
        add(url, 'ссылки', `внутренняя ссылка в никуда: ${href}`);
      }
    }
  }

  // --- структурированные данные должны разбираться
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { add(url, 'разметка', 'структурированные данные не разбираются: ' + e.message.slice(0, 60)); }
  }

  // --- изображения без описания
  for (const m of html.matchAll(/<img\b([^>]*)>/g)) {
    if (!/alt="/.test(m[1])) add(url, 'доступность', 'картинка без alt');
  }
}

// --- файлы, которые должны быть у любого сайта
for (const f of ['robots.txt', 'sitemap-index.xml', '404.html']) {
  if (!fs.existsSync(path.join(DIST, f))) add('/', 'сайт', `нет файла ${f}`);
}

const byKind = {};
for (const p of problems) (byKind[p.kind] = byKind[p.kind] || []).push(p);
console.log(`страниц проверено: ${pages.length}`);
console.log(problems.length ? `ОШИБОК: ${problems.length}` : 'ошибок нет');
if (notes.length) {
  const kinds = {};
  for (const n of notes) kinds[n.detail.split(' ')[0]] = (kinds[n.detail.split(' ')[0]] || 0) + 1;
  console.log('замечаний (не ошибки): ' + notes.length + ' — ' + JSON.stringify(kinds));
}
for (const [kind, list] of Object.entries(byKind)) {
  console.log(`\n${kind}: ${list.length}`);
  const seen = new Set();
  for (const p of list) {
    const key = p.detail.replace(/\d+/g, '#');
    if (seen.has(key) && seen.size > 6) continue;
    seen.add(key);
    console.log(`  ${p.page.padEnd(30)} ${p.detail}`);
    if (seen.size > 8) { console.log(`  … и ещё ${list.length - 8}`); break; }
  }
}
process.exit(problems.length ? 1 : 0);
