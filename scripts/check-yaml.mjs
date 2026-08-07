import fs from 'node:fs';

// Frontmatter values are hand-written prose, and two shapes reliably break the YAML parser:
//   1. an unquoted scalar containing ": "  (parsed as a nested key)
//   2. a scalar that opens with a quote but doesn't close with the same one
// Both have actually broken the build during development, and the second slipped past an
// earlier version of this check that treated any leading quote as "already quoted".
const KEYS = /^\s*(?:- )?(?:question|answer|title|description|h1|navName):\s+(.*)$/;
let problems = 0;

function checkFile(path) {
  const text = fs.readFileSync(path, 'utf8');
  // A backslash before an apostrophe is an escape in JavaScript and literal text in Markdown.
  // Writing Ukrainian prose (which is full of apostrophes) through a shell heredoc is an easy
  // way to leak one in, where it renders on the page as a stray backslash.
  if (text.includes("\\'")) {
    console.log(`${path}: literal backslash before an apostrophe -- it will render as text`);
    problems++;
  }
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
