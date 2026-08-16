// Drives real Chrome over every page shape the site has and reports what the browser itself
// complains about: deprecated APIs, console errors, mixed content, broken requests.
//
// The point is that nobody has to paste 288 URLs into PageSpeed one at a time. Every page is
// built from one of a handful of templates, so one page per template covers the site -- and this
// runs them all in one pass, against the real browser rather than against a guess.
const BASE = process.argv[2] || 'http://localhost:4321';
const PAGES = process.argv.slice(3).length ? process.argv.slice(3) : [
  '/ru',                     // homepage
  '/ru/tools/audio',         // category
  '/ru/cm-to-inches',        // calculator (linear converter)
  '/ru/celsius-to-fahrenheit', // calculator (temperature)
  '/ru/audio-converter',     // audio tool, ffmpeg engine
  '/ru/audio-equalizer',     // audio tool with the vertical sliders
  '/ru/dictaphone',          // recorder
  '/ru/trim-audio',          // trim handles
  '/ru/white-noise-generator', // generator
  '/ru/audio-to-midi',       // own component
  '/ru/audio-to-text',       // own component
  '/ru/speech-to-text',      // own component, microphone
];

// СВОЁ окно браузера, своя папка, свой порт. Раньше сценарий подключался к порту 9222 и
// хозяйничал во вкладках того окна, что уже открыто, -- то есть в рабочем браузере владельца.
// Он дважды терял из-за этого свою работу. Ничего чужого не трогаем.
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
const ПОРТ = 9351;
const ПАПКА = path.join(os.tmpdir(), 'opitro-check-pages-prof');
const сон = (ms) => new Promise((r) => setTimeout(r, ms));
let своё = null;
try {
  await fetch(`http://127.0.0.1:${ПОРТ}/json/version`);
} catch {
  своё = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    `--remote-debugging-port=${ПОРТ}`, `--user-data-dir=${ПАПКА}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--disable-backgrounding-occluded-windows', '--window-size=1300,900', 'about:blank',
  ], { stdio: 'ignore', detached: true });
  for (let i = 0; i < 60; i++) {
    try { await fetch(`http://127.0.0.1:${ПОРТ}/json/version`); break; } catch { await сон(400); }
  }
}
process.on('exit', () => { if (своё) { try { процессУбить(); } catch (e) {} } });
function процессУбить() { своё.kill('SIGTERM'); }

const targets = await (await fetch(BASE.includes('localhost') ? 'http://127.0.0.1:9351/json/list' : 'http://127.0.0.1:9351/json/list')).json();
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
let id = 0; const pending = new Map();
let issues = [];
const urls = new Map();
await new Promise((r) => { ws.onopen = r; });
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Audits.issueAdded') {
    const d = m.params.issue;
    const extra = d.details?.deprecationIssueDetails?.type
      || (d.details?.genericIssueDetails ? d.details.genericIssueDetails.errorType : '')
      || '';
    issues.push(d.code + (extra ? ': ' + extra : ''));
  }
  if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) {
    issues.push(m.params.type + ': ' + m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 90));
  }
  if (m.method === 'Runtime.exceptionThrown') {
    issues.push('EXCEPTION: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text || '').slice(0, 120));
  }
  if (m.method === 'Network.requestWillBeSent') urls.set(m.params.requestId, m.params.request.url);
  if (m.method === 'Network.loadingFailed') {
    const u = urls.get(m.params.requestId) || '';
    issues.push('запрос не удался (' + (m.params.errorText || '') + '): ' + u.replace(/^https?:\/\/[^/]+/, '').slice(0, 70));
  }
};
const send = (m, p = {}) => { const i = ++id; ws.send(JSON.stringify({ id: i, method: m, params: p })); return new Promise((r) => pending.set(i, r)); };
const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true, timeout: 30000 })).result?.result?.value;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable'); await send('Audits.enable');
let bad = 0;
for (const path of PAGES) {
  issues = [];
  await send('Page.navigate', { url: BASE + path });
  for (let i = 0; i < 40; i++) { if (await ev('document.readyState === "complete"').catch(() => false)) break; await wait(200); }
  await wait(900);
  const layout = await ev(`JSON.stringify({
    вылезает: document.documentElement.scrollWidth > innerWidth + 1,
    заголовков: document.querySelectorAll('h1').length,
    пустыхСсылок: [...document.querySelectorAll('a')].filter(a => !a.textContent.trim() && !a.querySelector('svg,img')).length,
  })`);
  const l = JSON.parse(layout || '{}');
  const problems = [...new Set(issues)];
  if (l.вылезает) problems.push('страница шире окна');
  if (l.заголовков !== 1) problems.push('заголовков h1: ' + l.заголовков);
  if (l.пустыхСсылок) problems.push('пустых ссылок: ' + l.пустыхСсылок);
  if (problems.length) { bad++; console.log('  ' + path.padEnd(28) + problems.join(' | ')); }
  else console.log('  ' + path.padEnd(28) + 'чисто');
}
console.log(bad ? `\nстраниц с замечаниями: ${bad} из ${PAGES.length}` : `\nвсе ${PAGES.length} шаблонов чисты`);
ws.close();
process.exit(bad ? 1 : 0);
