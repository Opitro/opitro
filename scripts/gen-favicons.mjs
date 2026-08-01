import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const svgPath = path.resolve('scripts/prism-source.svg');
const publicDir = path.resolve('public');

const svg = await (await import('node:fs/promises')).readFile(svgPath);

async function renderPng(size) {
  return sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();
}

// Build a valid ICO (PNG-in-ICO format, supported by every modern browser/OS) from a list of PNG buffers.
function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  const dirEntries = [];
  const imageChunks = [];
  let offset = headerSize;

  for (const { size, buffer } of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // size of image data
    entry.writeUInt32LE(offset, 12); // offset of image data
    dirEntries.push(entry);
    imageChunks.push(buffer);
    offset += buffer.length;
  }

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(count, 4); // image count

  return Buffer.concat([header, ...dirEntries, ...imageChunks]);
}

const sizes = [16, 32, 48, 192];
const rendered = {};
for (const s of sizes) {
  rendered[s] = await renderPng(s);
}

await writeFile(path.join(publicDir, 'favicon-32.png'), rendered[32]);
await writeFile(path.join(publicDir, 'favicon-192.png'), rendered[192]);
await writeFile(path.join(publicDir, 'apple-touch-icon.png'), await renderPng(180));

const ico = buildIco([
  { size: 16, buffer: rendered[16] },
  { size: 32, buffer: rendered[32] },
  { size: 48, buffer: rendered[48] },
]);
await writeFile(path.join(publicDir, 'favicon.ico'), ico);

console.log('Favicons written to public/: favicon.ico, favicon-32.png, favicon-192.png, apple-touch-icon.png');
