/*
  Постоянная проверка страницы темпа (/ru/change-tempo).

  Заведена потому, что владелец справедливо заметил: правки в темп проверялись
  прогоном ЧУЖОЙ страницы (обрезки) -- она подтверждала лишь то, что не сломан общий
  плеер, а сам темп оставался ничем не прикрыт.

  Проверяется результат, а не вид: определился ли темп файла, идёт ли звук, не рвётся
  ли он при смене ударов в минуту, и главное -- идут ли бегунок и музыка В ТАКТ.
  Последнее ломалось дважды подряд и оба раза находил владелец.

  Запуск:  node scripts/check-tempo.mjs   (нужен npm run build)
*/
import { spawn, execSync } from 'node:child_process'; import fs from 'node:fs';
const DIR='/private/tmp/claude-501/-Users-privetulybnis-calc-catalog/5e295ec4-7887-4446-8778-83bab1fbd49c/scratchpad';
const PORT=9262; const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// файл с ЧЁТКИМ ритмом 100 ударов в минуту -- чтобы проверить не «что-то подставилось»,
// а что подставилось ВЕРНОЕ
const sr=44100, sec=20, bpm=100, n=sr*sec, ch=2;
const b=Buffer.alloc(44+n*ch*2);
b.write('RIFF',0);b.writeUInt32LE(36+n*ch*2,4);b.write('WAVE',8);b.write('fmt ',12);
b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(ch,22);b.writeUInt32LE(sr,24);
b.writeUInt32LE(sr*ch*2,28);b.writeUInt16LE(ch*2,32);b.writeUInt16LE(16,34);
b.write('data',36);b.writeUInt32LE(n*ch*2,40);
const beat=sr*60/bpm;
for(let i=0;i<n;i++){const t=i%beat;
  const env=Math.exp(-t/(sr*0.05));
  const v=(Math.sin(2*Math.PI*60*i/sr)*0.9+Math.sin(2*Math.PI*2500*i/sr)*0.25)*env;
  const s=Math.max(-1,Math.min(1,v))*30000; b.writeInt16LE(s,44+i*4); b.writeInt16LE(s,44+i*4+2)}
fs.writeFileSync(DIR+'/ritm100.wav',b);
// Освободить порт ПЕРЕД запуском. Раздатчики от прошлых прогонов не умирали и висели
// десятками; порт держал самый первый, и он отдавал СТАРУЮ сборку -- проверка месяцами
// смотрела бы на вчерашние файлы и падала на давно исправленном. Так и вышло: владелец
// сказал «темп работает», и был прав, а падала проверка на устаревшем снимке сайта.
try { execSync("lsof -ti tcp:4398 | xargs kill -9", { stdio: 'ignore' }); } catch (e) {}
const раздатчик = spawn('npx',['--yes','serve@14','dist','-l','4398'],{stdio:'ignore'});
process.on('exit', () => { try { раздатчик.kill(); } catch (e) {} });
// Ждать ГОТОВНОСТИ, а не отмеренные секунды. С фиксированным ожиданием проверка падала,
// когда раздатчик поднимался медленнее обычного, -- и это выглядело как поломка сайта.
// Дважды из-за такого падения я зря искал беду в рабочем коде.
for (let i = 0; i < 100; i++) {
  try { await fetch('http://127.0.0.1:4398/'); break; } catch { await sleep(300); }
}
await sleep(3000);
spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',[`--remote-debugging-port=${PORT}`,
 `--user-data-dir=${DIR}/tp-prof`,'--no-first-run','--no-default-browser-check',
 '--disable-backgrounding-occluded-windows','--autoplay-policy=no-user-gesture-required','--window-size=1300,900','about:blank'],{stdio:'ignore'});
let ws,id=0;const pend=new Map();const errs=[];
const send=(m,p={},s)=>new Promise((res,rej)=>{const i=++id;pend.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p,sessionId:s}))});
let v;for(let i=0;i<60;i++){try{v=await(await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();break}catch{await sleep(400)}}
ws=new WebSocket(v.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));
ws.addEventListener('message',m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){const{res,rej}=pend.get(d.id);pend.delete(d.id);d.error?rej(new Error(d.error.message)):res(d.result);return}
 if(d.method==='Runtime.exceptionThrown')errs.push((d.params.exceptionDetails.exception?.description||'').slice(0,140))});
const {targetId}=await send('Target.createTarget',{url:'http://127.0.0.1:4398/ru/change-tempo'});
const {sessionId:S}=await send('Target.attachToTarget',{targetId,flatten:true});
await send('Runtime.enable',{},S);await send('DOM.enable',{},S);await sleep(3000);
const q=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true},S)).result.value;
let pass=0; const fails=[];
const ok=(n,c,d)=>{ if(c) pass++; else fails.push(d? n+' -- '+d : n); };
const doc=await send('DOM.getDocument',{},S);
const nn=await send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'input[type=file]'},S);
await send('DOM.setFileInputFiles',{files:[DIR+'/ritm100.wav'],nodeId:nn.nodeId},S);
await sleep(4000);
const detected = Number(await q(`document.getElementById('ctrl-bpm-from').value`));
ok('темп файла определился верно', Math.abs(detected-100)<=3, 'получено '+detected+' вместо 100');
ok('исходный темп только для показа', await q(`document.getElementById('ctrl-bpm-from').readOnly`));
ok('у поля показа нет стрелочек', await q(`!document.getElementById('ctrl-bpm-from').closest('.stepper')`));
ok('кнопки «определить» нет', await q(`!document.getElementById('bpm-detect-btn')`));
ok('целевой темп подставлен', Number(await q(`document.getElementById('ctrl-bpm-to').value`))===detected);
const w1 = await q("Math.round(document.getElementById('ctrl-bpm-from').getBoundingClientRect().width)");
const w2 = await q("Math.round(document.getElementById('ctrl-bpm-to').getBoundingClientRect().width)");
ok('поля темпа по размеру трёх цифр', w1 < 110 && w2 < 110, w1+' и '+w2+' точек');

// Кнопка воспроизведения включается скриптом после раскодирования файла -- ждём её,
// а не гадаем по времени. Раньше проверка кликала по отключённой кнопке и молча ничего
// не измеряла, отчего казалось, что звук не идёт.
let waited = 0;
while (await q("document.getElementById('wave-play-btn').disabled") && waited < 15000) {
  await sleep(500); waited += 500;
}
ok('кнопка воспроизведения включилась', waited < 15000);
await q("document.getElementById('wave-play-btn').click()");
await sleep(1500);
const pos = () => q("parseInt(document.getElementById('playhead').style.left)||0");
const p1 = await pos(); await sleep(1200); const p2 = await pos();
ok('звук идёт, бегунок движется', p2 > p1, p1+' -> '+p2);
const t0 = Date.now();
await q(`(()=>{const i=document.getElementById('ctrl-bpm-to');i.value=140;i.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
const ms = Date.now() - t0;
await sleep(1500);
const p3 = await pos();
ok('смена темпа мгновенная', ms < 60, ms+' мс');
ok('смена темпа не прерывает звук', p3 > p2, p2+' -> '+p3);
// при ускорении бегунок должен идти БЫСТРЕЕ, иначе музыка кончится раньше него
await sleep(2000);
const p4 = await pos();
const wSpeed = await q("document.getElementById('playhead').parentElement.clientWidth");
const v1=(p2-p1)/1.2, v2=(p4-p3)/2.0;
ok('бегунок ускоряется вместе с музыкой', v2 > v1*1.15 && v2 < v1*1.75,
   Math.round(v1)+' -> '+Math.round(v2)+' точек в секунду при ускорении 1.4');
// главное: бегунок не должен добежать до конца, пока звук ещё идёт
await sleep(9000);
const wW = await q("document.getElementById('playhead').parentElement.clientWidth");
const pEnd = await pos();
const hidden = await q("document.getElementById('playhead').style.display === 'none'");
ok('бегунок и музыка кончаются вместе', pEnd >= wW*0.92, 'бегунок на '+pEnd+' из '+wW);
ok('в консоли нет исключений', errs.filter(Boolean).length===0, errs.join(' | '));

console.log('проверок пройдено: '+pass);
if (fails.length) { console.log('НЕ ПРОШЛО: '+fails.length); fails.forEach(f=>console.log('  - '+f)); process.exit(1); }
console.log('темп: всё на месте');
process.exit(0);
