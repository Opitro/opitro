// Browser-only. Lazy-loads ffmpeg.wasm's core+wasm (~30 MB) from a CDN via toBlobURL only
// when an audio tool is actually opened -- never bundled into the static build. The FFmpeg
// instance and its load promise are module-level singletons, so multiple conversions (or
// multiple tool components on one page) share a single loaded encoder instead of each
// re-downloading/re-initializing it.
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const CORE_VERSION = '0.12.6';
// @ffmpeg/ffmpeg's worker (as of 0.12.x) is itself an ES module, so `importScripts()` inside
// it always fails and it falls back to a dynamic `import()` of the core script -- that only
// works against the ESM build (`export default createFFmpegCore`), not the UMD one. Pointing
// this at /dist/umd (like older ffmpeg.wasm setups did, back when the worker was classic-type)
// throws "failed to import ffmpeg-core.js" because the UMD build has no default export.
const CORE_BASE = `https://cdn.jsdelivr.net/npm/@ffmpeg/core@${CORE_VERSION}/dist/esm`;

let ffmpeg = null;
let loadPromise = null;

export function loadFFmpeg(onProgress) {
  if (ffmpeg) return Promise.resolve(ffmpeg);
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const instance = new FFmpeg();
    if (onProgress) {
      instance.on('progress', ({ progress }) => {
        onProgress(Math.max(0, Math.min(100, Math.round(progress * 100))));
      });
    }
    await instance.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    ffmpeg = instance;
    return instance;
  })();

  return loadPromise;
}

// `buildArgs(inputName, outputName) => string[]` lets one runner serve every ffmpeg-based
// tool (convert, trim, volume, speed, reverse, ...) -- each tool just supplies its own args.
export async function runFFmpeg({ file, buildArgs, outputName, mimeType, onProgress }) {
  const instance = await loadFFmpeg(onProgress);
  const inputName = 'input_' + Date.now();
  await instance.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
  try {
    await instance.exec(buildArgs(inputName, outputName));
    const data = await instance.readFile(outputName);
    return new Blob([data.buffer], { type: mimeType });
  } finally {
    await instance.deleteFile(inputName).catch(() => {});
    await instance.deleteFile(outputName).catch(() => {});
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
