// Browser-only. Lazy-loads ffmpeg.wasm's core+wasm (~32 MB on disk, ~8.8 MB over the wire
// after brotli) only when an audio tool is actually opened -- never bundled into the static
// build. Served from our own domain, not a third-party CDN: see CORE_BASE below. The FFmpeg
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
//
// OUR OWN DOMAIN, not cdn.jsdelivr.net. The core used to come from a third party, which meant
// every audio tool depended on someone else's server staying up, and that third party saw
// everyone who opened one. Files live in public/ffmpeg/<version>/ -- refresh them with
// `node scripts/fetch-ffmpeg-core.mjs`.
const CORE_BASE = `/ffmpeg/${CORE_VERSION}`;
// Cloudflare refuses a static file over 25 MiB and the core is 30.6 MiB, so it is stored in
// two pieces and glued back together here. Blob takes the pieces as they are -- nothing is
// copied byte by byte.
const WASM_PARTS = 2;

async function coreWasmURL() {
  const pieces = await Promise.all(
    Array.from({ length: WASM_PARTS }, async (_, i) => {
      const res = await fetch(`${CORE_BASE}/ffmpeg-core.wasm.${i + 1}`);
      if (!res.ok) throw new Error(`ffmpeg-core.wasm.${i + 1}: ${res.status}`);
      return res.blob();
    }),
  );
  return URL.createObjectURL(new Blob(pieces, { type: 'application/wasm' }));
}

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
    // The core must be handed over as a blob, never as a plain URL: the library tries to
    // encode a plain URL with btoa and dies on the first non-Latin1 byte inside the core
    // ("InvalidCharacterError"). Cost me a broken test harness before I remembered why.
    await instance.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await coreWasmURL(),
    });
    ffmpeg = instance;
    return instance;
  })();

  return loadPromise;
}

// Where input files are mounted. Its own directory rather than the root: the core keeps its
// own files at the root, and a mount over them would hide the wrong things.
const MOUNT_POINT = '/ffin';

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
  let mounted = false;
  let crashed = false;
  const quietly = async (fn) => { try { await fn(); } catch (e) {} };
  try {
    // INPUTS ARE MOUNTED, NOT COPIED.
    //
    // `writeFile` used to pull the whole file into browser memory (`arrayBuffer`) and then
    // copy it again into ffmpeg's own heap -- two full copies before any work started.
    // WORKERFS hands ffmpeg the Blob and lets it read slices on demand, so neither copy
    // happens. Measured on this exact path (input only, no codec): the copy costs about
    // 1.7 ms per megabyte and disappears entirely -- 336 ms -> 1 ms at 200 MB, 3033 ms -> 1 ms
    // at 1800 MB. At 1800 MB the first read also dropped from 2419 ms to 29 ms, which is
    // memory pressure showing up. Read-only and worker-only, so it fits inputs and nothing
    // else: the result still comes back through `readFile` into ordinary memory.
    const inputPaths = [];
    if (inputs.length && inputs.every((i) => i.file instanceof Blob)) {
      try {
        // A previous run that crashed can leave the mount point occupied, and then the next
        // mount fails for a reason that has nothing to do with the current file.
        await quietly(() => instance.unmount(MOUNT_POINT));
        await quietly(() => instance.deleteDir(MOUNT_POINT));
        await instance.createDir(MOUNT_POINT);
        await instance.mount('WORKERFS', {
          blobs: inputs.map(({ name, file }) => ({ name, data: file })),
        }, MOUNT_POINT);
        mounted = true;
        for (const { name } of inputs) inputPaths.push(`${MOUNT_POINT}/${name}`);
      } catch (e) {
        // Older cores and anything without WORKERFS fall back to the copy rather than fail:
        // a slower tool beats a broken one.
        mounted = false;
        await quietly(() => instance.deleteDir(MOUNT_POINT));
      }
    }
    if (!mounted) {
      for (const input of inputs) {
        await instance.writeFile(input.name, new Uint8Array(await input.file.arrayBuffer()));
        writtenNames.push(input.name);
        inputPaths.push(input.name);
      }
    }
    // Test hook: which way the input actually went in. Without it a check cannot tell a real
    // mount from the silent fallback to copying, and would pass either way.
    if (typeof window !== 'undefined') window.__ffInput = mounted ? 'mount' : 'copy';
    await instance.exec(buildArgs(inputPaths, outputName));
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
      // Unmount and drop the directory every time: leave it behind and the NEXT file refuses
      // to mount, which looks like a broken tool and has nothing to do with that file.
      if (mounted) {
        await quietly(() => instance.unmount(MOUNT_POINT));
        await quietly(() => instance.deleteDir(MOUNT_POINT));
      }
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
