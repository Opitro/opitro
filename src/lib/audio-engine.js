// Browser-only. Lazy-loads ffmpeg.wasm's core+wasm (~32 MB) from a CDN via toBlobURL only
// when an audio tool is actually opened -- never bundled into the static build. The FFmpeg
// instance and its load promise are module-level singletons, so every tool on a page (or a
// sequence of tools used in one session) shares a single loaded encoder instead of each
// re-downloading/re-initializing it. Single-threaded core deliberately (see project memory) --
// no COOP/COEP headers required, so it won't fight with third-party ad iframes later.
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const CORE_VERSION = '0.12.6';
// @ffmpeg/ffmpeg's worker (0.12.x) is itself an ES module, so `importScripts()` inside it
// always fails and it falls back to a dynamic `import()` of the core script -- that only works
// against the ESM build (`export default createFFmpegCore`), not the UMD one.
const CORE_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

let ffmpeg = null;
let loadPromise = null;

// WASM linear memory only grows, never shrinks -- once an exec call processes a large file,
// the instance's memory footprint stays inflated for the rest of the page's life, even after
// deleteFile(). Confirmed live on mobile Safari: decoding a large video for a waveform preview,
// then later running a second (tiny) export on the same singleton, crashed with "Out of bounds
// memory access". Call this right after any large-file exec so the next call gets a fresh,
// right-sized instance instead of inheriting the inflated one.
export function resetFFmpeg() {
  if (ffmpeg) { try { ffmpeg.terminate(); } catch (e) {} }
  ffmpeg = null;
  loadPromise = null;
}

// Where progress events are forwarded. It has to be a mutable module-level slot rather than a
// captured argument, because ffmpeg's 'progress' listener can only be attached to an instance
// once, at creation -- and the instance is created by whichever call happens first. That was a
// real bug: pickFile warms the engine up with a bare loadFFmpeg() (no callback), so the listener
// was never attached at all, and every later execFFmpeg passed an onProgress that silently went
// nowhere. Percentages were dead on every ffmpeg tool; the bar just jumped 0 -> 100.
let progressTarget = null;

export function loadFFmpeg(onProgress) {
  if (onProgress) progressTarget = onProgress;
  if (ffmpeg) return Promise.resolve(ffmpeg);
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const instance = new FFmpeg();
    // Attached unconditionally, and forwards to whatever the current target is.
    instance.on('progress', ({ progress }) => {
      if (progressTarget) progressTarget(Math.max(0, Math.min(100, Math.round(progress * 100))));
    });
    await instance.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpeg = instance;
    return instance;
  })();

  return loadPromise;
}

// Generalized runner behind every audio tool: `inputs` is a list of {name, file} pairs (zero
// for a generator like white noise, one for almost everything, more than one for merge/join).
// `buildArgs(inputNames, outputName) => string[]` builds the actual ffmpeg command -- this one
// function replaces a bespoke exec call per tool.
export async function execFFmpeg({ inputs = [], buildArgs, outputName, mimeType, onProgress }) {
  const instance = await loadFFmpeg(onProgress);
  // Authoritative per run: set it even when undefined, so a call without a progress callback
  // can't leave the previous run's callback attached and report an unrelated file's progress.
  progressTarget = onProgress || null;
  const writtenNames = [];
  let crashed = false;
  try {
    for (const input of inputs) {
      await instance.writeFile(input.name, new Uint8Array(await input.file.arrayBuffer()));
      writtenNames.push(input.name);
    }
    await instance.exec(buildArgs(writtenNames, outputName));
    const data = await instance.readFile(outputName);
    return new Blob([data.buffer], { type: mimeType });
  } catch (e) {
    // A large/exotic file can genuinely exhaust ffmpeg-core's WASM heap (confirmed live on
    // mobile Safari: "Out of bounds memory access"). Once that happens the WASM instance is
    // left corrupted -- reusing the singleton after a crash made even unrelated later files
    // fail too. Terminate and drop it so the next call gets a fully fresh instance instead of
    // inheriting a broken one.
    crashed = true;
    try { instance.terminate(); } catch (e2) {}
    ffmpeg = null;
    loadPromise = null;
    throw e;
  } finally {
    progressTarget = null;
    if (!crashed) {
      for (const name of writtenNames) await instance.deleteFile(name).catch(() => {});
      await instance.deleteFile(outputName).catch(() => {});
    }
  }
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
