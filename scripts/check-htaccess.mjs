// СУДЬЯ -- НАСТОЯЩИЙ APACHE.
//
// Читать сгенерированные строки глазами бессмысленно: они выглядят правильно ровно до того
// мига, когда кладут чужой сайт. Поэтому здесь поднимается настоящий httpd 2.4 с
// AllowOverride All, в корень кладётся сгенерированный .htaccess, и запросы идут по-настоящему.
// Проверяется не текст правил, а КОДЫ ОТВЕТОВ и заголовки, которые сервер на них отдаёт.

import { spawn, execFileSync } from 'node:child_process';
process.on('uncaughtException', (е) => { console.log('СОРВАЛОСЬ:', е && е.stack); process.exit(9); });
process.on('unhandledRejection', (е) => { console.log('СОРВАЛОСЬ:', е && (е.stack || е)); process.exit(9); });
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { собрать } from '../src/lib/htaccess.js';

// Своя песочница рядом с проектом: испытание поднимает настоящий сервер и должно
// прибирать за собой само.
const БАЗА = new URL('../.апач-проба', import.meta.url).pathname;
const ПОРТ = 8731;
const МОДУЛИ = '/usr/libexec/apache2';

let бед = 0;
const так = (что, ждём, имя) => {
  const а = JSON.stringify(что), б = JSON.stringify(ждём);
  if (а !== б) { console.log(`  ✗ ${имя}\n     ждали ${б}\n     вышло ${а}`); бед++; }
  else console.log(`  ✓ ${имя}: ${а}`);
};
const надо = (у, и) => { if (!у) { console.log('  ✗ ' + и); бед++; } else console.log('  ✓ ' + и); };

/** Разложить корень сайта заново и положить туда файл настроек. */
function постелить(код) {
  rmSync(БАЗА, { recursive: true, force: true });
  mkdirSync(`${БАЗА}/сайт/dir`, { recursive: true });
  mkdirSync(`${БАЗА}/журналы`, { recursive: true });
  writeFileSync(`${БАЗА}/сайт/.htaccess`, код);
  writeFileSync(`${БАЗА}/сайт/index.html`, '<!doctype html><title>дом</title><p>дом</p>\n'.repeat(40));
  writeFileSync(`${БАЗА}/сайт/style.css`, 'body{color:red}\n'.repeat(200));
  writeFileSync(`${БАЗА}/сайт/img.png`, Buffer.alloc(64, 7));
  writeFileSync(`${БАЗА}/сайт/dir/file.txt`, 'внутри папки');
  writeFileSync(`${БАЗА}/httpd.conf`, НАСТРОЙКИ);
}

const НАСТРОЙКИ = `
ServerRoot "/usr"
Listen 127.0.0.1:${ПОРТ}
ServerName localhost
PidFile "${БАЗА}/httpd.pid"
Mutex file:${БАЗА}
DefaultRuntimeDir "${БАЗА}"

LoadModule mpm_prefork_module ${МОДУЛИ}/mod_mpm_prefork.so
LoadModule authz_core_module ${МОДУЛИ}/mod_authz_core.so
LoadModule authz_host_module ${МОДУЛИ}/mod_authz_host.so
LoadModule access_compat_module ${МОДУЛИ}/mod_access_compat.so
LoadModule mime_module ${МОДУЛИ}/mod_mime.so
LoadModule log_config_module ${МОДУЛИ}/mod_log_config.so
LoadModule unixd_module ${МОДУЛИ}/mod_unixd.so
LoadModule dir_module ${МОДУЛИ}/mod_dir.so
LoadModule autoindex_module ${МОДУЛИ}/mod_autoindex.so
LoadModule alias_module ${МОДУЛИ}/mod_alias.so
LoadModule rewrite_module ${МОДУЛИ}/mod_rewrite.so
LoadModule deflate_module ${МОДУЛИ}/mod_deflate.so
LoadModule expires_module ${МОДУЛИ}/mod_expires.so
LoadModule headers_module ${МОДУЛИ}/mod_headers.so
LoadModule filter_module ${МОДУЛИ}/mod_filter.so
LoadModule setenvif_module ${МОДУЛИ}/mod_setenvif.so

TypesConfig /private/etc/apache2/mime.types
ErrorLog "${БАЗА}/журналы/ошибки.log"
LogLevel warn
DocumentRoot "${БАЗА}/сайт"
DirectoryIndex index.html

<Directory "${БАЗА}/сайт">
  AllowOverride All
  Require all granted
  Options Indexes FollowSymLinks
</Directory>
`;

let сервер = null;
function поднять() {
  // detached: своя группа процессов. Без этого сигнал, которым мы гасим httpd, доставался
  // и самому испытателю -- он умирал молча, не дописав ни одной строки.
  сервер = spawn('/usr/sbin/httpd', ['-f', `${БАЗА}/httpd.conf`, '-D', 'FOREGROUND'],
    { stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  сервер.stderr.on('data', () => {});
  сервер.on('error', (е) => console.log('httpd не запустился:', е.message));
}
async function опустить() {
  if (!сервер) return;
  const с = сервер; сервер = null;
  const ушёл = new Promise((г) => с.on('exit', г));
  try { process.kill(-с.pid, 'SIGTERM'); } catch (е) { try { с.kill('SIGTERM'); } catch (е2) {} }
  await Promise.race([ушёл, ждать(3000)]);
}

const ждать = (мс) => new Promise((r) => setTimeout(r, мс));

/** Запрос без слежения за перенаправлением: нам нужен именно первый ответ. */
function запрос(путь, { хост = 'localhost', заголовки = [], сжатие = false } = {}) {
  const аргументы = ['-s', '-i', '-o', '-', '-w', '\\n@@%{http_code}',
    '-H', `Host: ${хост}`, ...заголовки.flatMap((з) => ['-H', з])];
  if (сжатие) аргументы.push('--compressed', '-H', 'Accept-Encoding: gzip');
  аргументы.push(`http://127.0.0.1:${ПОРТ}${путь}`);
  let вывод;
  try { вывод = execFileSync('curl', аргументы, { encoding: 'latin1', maxBuffer: 1 << 24 }); }
  catch (е) { return { код: 0, место: '', сжат: '', срок: '', шапка: 'СЕРВЕР НЕ ОТВЕТИЛ' }; }
  const код = Number(вывод.slice(вывод.lastIndexOf('@@') + 2).trim());
  const шапка = вывод.slice(0, вывод.indexOf('\r\n\r\n'));
  const место = (шапка.match(/^location:\s*(.*)$/im) || [])[1] || '';
  const тип = (шапка.match(/^content-encoding:\s*(.*)$/im) || [])[1] || '';
  const срок = (шапка.match(/^cache-control:\s*(.*)$/im) || [])[1] || '';
  return { код, место: место.trim(), сжат: тип.trim(), срок: срок.trim(), шапка };
}

/** Сколько прыжков до цели -- считаем сами, поочерёдно. */
function прыжки(путь, начальныйХост, заголовки = []) {
  let цепочка = [];
  let текущийПуть = путь, хост = начальныйХост;
  for (let ш = 0; ш < 6; ш++) {
    const о = запрос(текущийПуть, { хост, заголовки });
    цепочка.push(`${о.код}${о.место ? ' -> ' + о.место : ''}`);
    if (о.код < 300 || о.код >= 400 || !о.место) break;
    const у = new URL(о.место);
    хост = у.host;
    текущийПуть = у.pathname + у.search;
    // Схему сервер всё равно не различает: он слушает обычный порт. Но если цель уже
    // канонична, следующий запрос вернёт 200 -- этого и добиваемся.
    if (у.protocol === 'https:') заголовки = [...заголовки, 'X-Forwarded-Proto: https'];
  }
  return цепочка;
}

async function прогнать(имя, наладки, дело) {
  const р = собрать(наладки);
  if (р.беды.length) { console.log(`  ✗ ${имя}: движок отказал -- ${р.беды.join(', ')}`); бед++; return; }
  постелить(р.код);
  поднять();
  await ждать(900);
  const жив = запрос('/', { хост: 'localhost' });
  if (жив.код === 500) {
    console.log(`  ✗ ${имя}: сервер отвечает 500 -- файл настроек негоден`);
    try { console.log('      ' + execFileSync('tail', ['-3', `${БАЗА}/журналы/ошибки.log`], { encoding: 'utf8' }).trim().split('\n').join('\n      ')); } catch (е) {}
    бед++; await опустить(); return;
  }
  console.log(`\n── ${имя} ──`);
  await дело();
  await опустить();
}

// ═══════════════════════════════════════════════════════════════════════════════════════
console.log('════ СУДЬЯ: настоящий Apache ' +
  execFileSync('/usr/sbin/httpd', ['-v'], { encoding: 'utf8' }).match(/Apache\/[\d.]+/)[0] + ' ════');

// ---- 1. Схема и хост одним правилом ----------------------------------------------------
await прогнать('HTTPS + склейка на без-www', {
  домен: 'example.com', https: true, зеркала: 'без-www', заПосредником: true,
}, async () => {
  {
    const о = запрос('/page', { хост: 'www.example.com' });
    так(о.код, 301, 'www + обычный: перенаправление');
    так(о.место, 'https://example.com/page', '   и сразу на конечный адрес');
  }
  {
    const ц = прыжки('/page', 'www.example.com');
    так(ц.length, 2, `прыжок ОДИН, дальше 200 (${ц.join('  ')})`);
  }
  {
    const о = запрос('/', { хост: 'example.com' });
    так(о.код, 301, 'верный хост, но обычная схема: тоже перенаправление');
    так(о.место, 'https://example.com/', '   на ту же страницу по https');
  }
  {
    // ГЛАВНАЯ ПРОВЕРКА. За посредником шифрование обрывается, и наивное правило
    // закольцевало бы сайт.
    const о = запрос('/', { хост: 'example.com', заголовки: ['X-Forwarded-Proto: https'] });
    так(о.код, 200, 'за посредником: ответ 200, вечного круга НЕТ');
  }
  {
    const о = запрос('/', { хост: 'www.example.com', заголовки: ['X-Forwarded-Proto: https'] });
    так(о.место, 'https://example.com/', 'за посредником хост всё равно правится');
  }
});

// ---- 2. Без посредника -----------------------------------------------------------------
await прогнать('HTTPS без посредника', {
  домен: 'example.com', https: true, зеркала: 'нет', заПосредником: false,
}, async () => {
  const о = запрос('/', { хост: 'example.com' });
  так(о.место, 'https://example.com/', 'обычная схема уводит на https');
  // ЗАЧЕМ НУЖНА ОТМЕТКА ПРО ПОСРЕДНИКА. Тот же файл, но запрос пришёл через Cloudflare:
  // человек уже на https, а Apache этого не видит и гонит его на https снова -- и снова,
  // и снова. Это и есть вечный круг, из-за которого сайты ложатся после «оптимизации».
  const круг = запрос('/', { хост: 'example.com', заголовки: ['X-Forwarded-Proto: https'] });
  так(круг.код, 301,
    'без отметки про посредника тот же запрос за Cloudflare уходит в вечный круг -- вот зачем она');
});

// ---- 3. Склейка на www -----------------------------------------------------------------
await прогнать('склейка на www, без https', {
  домен: 'example.com', https: false, зеркала: 'с-www',
}, async () => {
  const о = запрос('/path', { хост: 'example.com' });
  так(о.код, 301, 'без www: перенаправление');
  так(о.место, 'http://www.example.com/path', '   схема сохранена, не навязан https');
  так(запрос('/', { хост: 'www.example.com' }).код, 200, 'с www: ответ 200, круга нет');
});

// ---- 4. Свои перенаправления -----------------------------------------------------------
await прогнать('свои перенаправления', {
  домен: 'example.com', https: true, зеркала: 'без-www', заПосредником: true,
  переносы: [
    { откуда: '/old-page', куда: 'https://example.com/new' },
    { откуда: '/sale/2024', куда: 'https://example.com/sale' },
    { откуда: '/price.html', куда: 'https://example.com/pricing' },
  ],
}, async () => {
  так(запрос('/old-page', { хост: 'www.example.com' }).место,
    'https://example.com/new', 'старый путь уводит на новый ЗА ОДИН прыжок даже с www');
  так(запрос('/old-page/', { хост: 'example.com' }).место,
    'https://example.com/new', 'хвостовая косая не мешает');
  так(запрос('/sale/2024', { хост: 'example.com' }).место,
    'https://example.com/sale', 'путь с косой внутри');
  // Точка в пути -- знак образца. Без защиты «/ценаXhtml» тоже подошло бы.
  так(запрос('/price.html', { хост: 'example.com' }).место,
    'https://example.com/pricing', 'точка в пути работает');
  // Точка -- знак образца. Без защиты «priceXhtml» подошло бы под то же правило.
  так(запрос('/priceXhtml', { хост: 'example.com' }).место, 'https://example.com/priceXhtml',
    'а «priceXhtml» НЕ поймано правилом -- точка защищена, а не принята за любой знак');
  так(запрос('/old-page-and-more', { хост: 'example.com' }).место, 'https://example.com/old-page-and-more',
    'и путь-продолжение не захвачен: правило привязано к концу');
});

// ---- 5. Список файлов в папке ------------------------------------------------------------
await прогнать('запрет показа содержимого папки', { листинг: true }, async () => {
  const о = запрос('/dir/');
  так(о.код, 403, 'содержимое папки закрыто');
  так(запрос('/dir/file.txt').код, 200, 'а сам файл по-прежнему отдаётся');
});
await прогнать('без запрета -- для сравнения', { сжатие: true }, async () => {
  так(запрос('/dir/').код, 200, 'без правила содержимое папки показывается (судья не спит)');
});

// ---- 6. Запрет по адресу ------------------------------------------------------------------
await прогнать('запрет по адресу', { адреса: '127.0.0.1\n2001:db8::1\n10.0.0.0/8' }, async () => {
  так(запрос('/').код, 403, 'запрос со своего адреса закрыт -- запрет работает');
});
await прогнать('запрет по чужому адресу', { адреса: '203.0.113.5' }, async () => {
  так(запрос('/').код, 200, 'чужой адрес в списке нас не трогает');
});

// ---- 7. Хотлинк ----------------------------------------------------------------------------
await прогнать('защита от хотлинка', { домен: 'example.com', хотлинк: true }, async () => {
  так(запрос('/img.png', { заголовки: ['Referer: http://воришка.example.net/страница'] }).код,
    403, 'чужой сайт картинку не получит');
  так(запрос('/img.png').код, 200, 'ПУСТОЙ источник разрешён -- прямое открытие работает');
  так(запрос('/img.png', { заголовки: ['Referer: https://example.com/'] }).код,
    200, 'свой сайт картинку получает');
  так(запрос('/img.png', { заголовки: ['Referer: https://www.example.com/'] }).код,
    200, 'и свой сайт с www тоже');
  так(запрос('/img.png', { заголовки: ['Referer: https://images.google.com/'] }).код,
    200, 'поиск по картинкам не закрыт');
  так(запрос('/index.html', { заголовки: ['Referer: http://воришка.example.net/'] }).код,
    200, 'на страницы запрет не распространяется');
});

// ---- 8. Сжатие -------------------------------------------------------------------------------
await прогнать('сжатие ответа', { сжатие: true }, async () => {
  так(запрос('/style.css', { сжатие: true }).сжат, 'gzip', 'стили отдаются сжатыми');
  так(запрос('/index.html', { сжатие: true }).сжат, 'gzip', 'страницы отдаются сжатыми');
  так(запрос('/img.png', { сжатие: true }).сжат, '', 'картинка НЕ сжимается повторно');
});

// ---- 9. Сроки хранения -------------------------------------------------------------------------
await прогнать('сроки хранения в браузере', { кэш: true }, async () => {
  const с = запрос('/style.css').срок;
  надо(/max-age=2592000/.test(с), `стили хранятся месяц: ${с}`);
  const и = запрос('/img.png').срок;
  надо(/max-age=31536000/.test(и), `картинки хранятся год: ${и}`);
  const х = запрос('/index.html').срок;
  надо(/max-age=0/.test(х), `а страница НЕ хранится: ${х}`);
});

// ---- 10. Всё вместе -----------------------------------------------------------------------------
await прогнать('все наладки разом', {
  домен: 'example.com', https: true, зеркала: 'без-www', заПосредником: true,
  листинг: true, адреса: '203.0.113.5', хотлинк: true, сжатие: true, кэш: true,
  переносы: [{ откуда: '/old', куда: 'https://example.com/new' }],
}, async () => {
  так(запрос('/', { хост: 'example.com', заголовки: ['X-Forwarded-Proto: https'] }).код, 200,
    'сайт жив со всеми правилами разом');
  так(запрос('/old', { хост: 'www.example.com' }).место, 'https://example.com/new',
    'перенаправление работает');
  так(запрос('/dir/', { хост: 'example.com', заголовки: ['X-Forwarded-Proto: https'] }).код, 403,
    'папка закрыта');
  так(запрос('/style.css', { хост: 'example.com', заголовки: ['X-Forwarded-Proto: https'], сжатие: true }).сжат,
    'gzip', 'сжатие работает');
});


await опустить();
rmSync(БАЗА, { recursive: true, force: true });
console.log(бед ? `\nБЕД: ${бед}` : '\nвсё сошлось');
process.exit(бед ? 1 : 0);
