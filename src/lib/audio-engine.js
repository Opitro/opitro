
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

const CORE_VERSION = '0.12.6';

const CORE_BASE = `/ffmpeg/${CORE_VERSION}`;

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

export function resetFFmpeg() {
  if (ffmpeg) { try { ffmpeg.terminate(); } catch (e) {} }
  ffmpeg = null;
  loadPromise = null;
}

let progressTarget = null;

export function loadFFmpeg(onProgress) {
  if (onProgress) progressTarget = onProgress;
  if (ffmpeg) return Promise.resolve(ffmpeg);
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const instance = new FFmpeg();

    instance.on('progress', ({ progress }) => {
      if (progressTarget) progressTarget(Math.max(0, Math.min(100, Math.round(progress * 100))));
    });

    await instance.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await coreWasmURL(),
    });
    ffmpeg = instance;
    return instance;
  })();

  return loadPromise;
}

const MOUNT_POINT = '/ffin';

export async function execFFmpeg({ inputs = [], buildArgs, outputName, mimeType, onProgress }) {
  const instance = await loadFFmpeg(onProgress);

  progressTarget = onProgress || null;
  const writtenNames = [];
  let mounted = false;
  let crashed = false;
  const quietly = async (fn) => { try { await fn(); } catch (e) {} };
  try {

    const inputPaths = [];
    if (inputs.length && inputs.every((i) => i.file instanceof Blob)) {
      try {

        await quietly(() => instance.unmount(MOUNT_POINT));
        await quietly(() => instance.deleteDir(MOUNT_POINT));
        await instance.createDir(MOUNT_POINT);
        await instance.mount('WORKERFS', {
          blobs: inputs.map(({ name, file }) => ({ name, data: file })),
        }, MOUNT_POINT);
        mounted = true;
        for (const { name } of inputs) inputPaths.push(`${MOUNT_POINT}/${name}`);
      } catch (e) {

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

    if (typeof window !== 'undefined') window.__ffInput = mounted ? 'mount' : 'copy';
    await instance.exec(buildArgs(inputPaths, outputName));
    const data = await instance.readFile(outputName);
    return new Blob([data.buffer], { type: mimeType });
  } catch (e) {

    crashed = true;
    try { instance.terminate(); } catch (e2) {}
    ffmpeg = null;
    loadPromise = null;
    throw e;
  } finally {
    progressTarget = null;
    if (!crashed) {

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
