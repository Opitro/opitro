import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Astro emits a page's inline <script> as one module chunk, and lets Rollup split anything shared
// between components (web-audio-engine.js) into a chunk of its own. It does not, however, emit a
// <link rel="modulepreload"> for that second chunk -- so the browser only discovers it after it has
// downloaded AND parsed the first one. That is a whole extra round trip before the tool can work.
// Measured against opitro.com with the network throttled: the engine started downloading 128 ms
// late on fast 4G and 433 ms late on slow 4G.
//
// This walks the built HTML, follows each module script's *static* imports through the emitted
// chunks, and adds a preload link for each one so they all start downloading at once.
//
// Only static imports are followed. Dynamic import() is the mechanism the heavy optional pieces use
// (VexFlow for the sheet music, Basic Pitch for note recognition, transformers.js for Whisper) and
// preloading those would download tens of megabytes nobody asked for -- the exact opposite of the
// point. In the built output a static import always carries a quoted specifier (`from"./x.js"` or a
// bare `import"./x.js"`), whereas the lazy ones appear as `import(variable)`, so the quote is what
// separates them.

const SCRIPT_TAG = /<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g;
const STATIC_IMPORT = /(?:\bfrom|\bimport)\s*["']([^"']+)["']/g;

/** Static import specifiers of one built chunk. */
async function staticImportsOf(filePath) {
  let code;
  try {
    code = await readFile(filePath, 'utf8');
  } catch {
    return [];
  }
  const out = [];
  for (const m of code.matchAll(STATIC_IMPORT)) out.push(m[1]);
  return out;
}

/** Every chunk reachable from `entryUrl` through static imports, entry itself excluded. */
async function chainFrom(entryUrl, distDir, seen = new Set()) {
  const found = [];
  const queue = [entryUrl];
  seen.add(entryUrl);
  while (queue.length) {
    const url = queue.shift();
    const filePath = join(distDir, url.replace(/^\//, ''));
    for (const spec of await staticImportsOf(filePath)) {
      if (!spec.startsWith('.')) continue; // bare specifiers are not ours to preload
      const abs = '/' + resolve(dirname(url), spec).replace(/^[/\\]/, '');
      if (seen.has(abs)) continue;
      seen.add(abs);
      found.push(abs);
      queue.push(abs);
    }
  }
  return found;
}

async function* htmlFiles(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

export default function modulePreload() {
  return {
    name: 'opitro-modulepreload',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const distDir = fileURLToPath(dir);
        let pagesTouched = 0;
        let linksAdded = 0;
        for await (const file of htmlFiles(distDir)) {
          const html = await readFile(file, 'utf8');
          const entries = [...html.matchAll(SCRIPT_TAG)].map((m) => m[1]).filter((s) => s.startsWith('/'));
          if (!entries.length) continue;

          const preloads = [];
          const seen = new Set();
          for (const entry of entries) {
            for (const dep of await chainFrom(entry, distDir, seen)) {
              if (!html.includes(`rel="modulepreload" href="${dep}"`)) preloads.push(dep);
            }
          }
          if (!preloads.length) continue;

          const links = preloads.map((h) => `<link rel="modulepreload" href="${h}">`).join('');
          if (!html.includes('</head>')) {
            logger.warn(`no </head> in ${file}, skipped`);
            continue;
          }
          await writeFile(file, html.replace('</head>', `${links}</head>`), 'utf8');
          pagesTouched++;
          linksAdded += preloads.length;
        }
        logger.info(`modulepreload: ${linksAdded} ссылок на ${pagesTouched} страницах`);
      },
    },
  };
}
