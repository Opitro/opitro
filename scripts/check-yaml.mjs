import fs from 'node:fs';

const KEYS = /^\s*(?:- )?(?:question|answer|title|description|h1|navName):\s+(.*)$/;
let problems = 0;

function checkLinkDump(path, text) {
  const body = text.split(/^---$/m).slice(2).join('---');
  for (const para of body.split(/\n\n+/)) {
    const p = para.trim();
    if (!p || p.startsWith('#') || p.startsWith('-') || p.startsWith('<')) continue;
    const links = [...p.matchAll(/\[([^\]]+)\]\([^)]+\)/g)];
    if (links.length < 2) continue;
    const linkChars = links.reduce((n, m) => n + m[1].length, 0);
    const plain = p.replace(/\[[^\]]+\]\([^)]+\)/g, '').replace(/\s+/g, ' ').trim();
    if (linkChars > plain.length * 1.4) {
      console.log(`${path}: абзац почти целиком из ссылок -- перенесите их в related и уберите строку`);
      console.log(`   ${p.slice(0, 90)}…`);
      problems++;
    }
  }
}

function checkFile(path) {
  const text = fs.readFileSync(path, 'utf8');

  if (text.includes("\\'")) {
    console.log(`${path}: literal backslash before an apostrophe -- it will render as text`);
    problems++;
  }
  checkLinkDump(path, text);
  const fm = text.split('---')[1] || '';
  for (const line of fm.split('\n')) {
    const m = line.match(KEYS);
    if (!m) continue;
    const v = m[1].trim();
    if (!v) continue;
    const q = v[0];
    if (q === '"' || q === "'") {
      if (!(v.length > 1 && v.endsWith(q))) {
        console.log(`${path}: opens with ${q} but does not close with it -> ${v.slice(0, 70)}`);
        problems++;
      }
      continue;
    }
    if (q === '|' || q === '>') continue;
    if (v.includes(': ')) {
      console.log(`${path}: unquoted scalar contains ": " -> ${v.slice(0, 70)}`);
      problems++;
    }
  }
}

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.md')) checkFile(p);
  }
}

walk('src/content');
console.log(problems ? `${problems} frontmatter problem(s)` : 'frontmatter: clean');
process.exit(problems ? 1 : 0);
