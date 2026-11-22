function syncsafe(b, p) {
  return ((b[p] & 127) << 21) | ((b[p + 1] & 127) << 14) | ((b[p + 2] & 127) << 7) | (b[p + 3] & 127);
}

function uint32(b, p) {
  return ((b[p] << 24) | (b[p + 1] << 16) | (b[p + 2] << 8) | b[p + 3]) >>> 0;
}

function single(bytes) {
  let high = 0, letters = 0;
  for (const v of bytes) {
    if (v > 0x20) letters++;
    if (v >= 0xc0) high++;
  }
  try {
    return new TextDecoder(letters && high / letters > 0.5 ? 'windows-1251' : 'latin1').decode(bytes);
  } catch (e) {
    return String.fromCharCode(...bytes);
  }
}

function frameText(body) {
  const enc = body[0], data = body.subarray(1);
  let s = '';
  try {
    if (enc === 1) s = new TextDecoder('utf-16').decode(data);
    else if (enc === 2) s = new TextDecoder('utf-16be').decode(data);
    else if (enc === 3) s = new TextDecoder('utf-8').decode(data);
    else s = single(data);
  } catch (e) {
    s = '';
  }
  return s.split('\u0000')[0].replace(/^﻿/, '').trim();
}

export function readTags(buffer) {
  const b = new Uint8Array(buffer), out = {};
  if (b.length > 10 && b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33 && (b[3] === 3 || b[3] === 4)) {
    const ver = b[3], end = Math.min(b.length, 10 + syncsafe(b, 6));
    let p = 10;
    if (b[5] & 0x40) p += ver === 4 ? syncsafe(b, p) : 4 + uint32(b, p);
    while (p + 10 <= end) {
      const id = String.fromCharCode(b[p], b[p + 1], b[p + 2], b[p + 3]);
      if (!/^[A-Z0-9]{4}$/.test(id)) break;
      const size = ver === 4 ? syncsafe(b, p + 4) : uint32(b, p + 4);
      if (!size || p + 10 + size > end) break;
      const body = b.subarray(p + 10, p + 10 + size);
      if (id === 'TIT2' && !out.title) out.title = frameText(body);
      if (id === 'TPE1' && !out.artist) out.artist = frameText(body);
      p += 10 + size;
    }
  }
  if ((!out.title || !out.artist) && b.length > 128) {
    const t = b.length - 128;
    if (b[t] === 0x54 && b[t + 1] === 0x41 && b[t + 2] === 0x47) {
      const field = (a, z) => single(b.subarray(t + a, t + z)).split('\u0000')[0].trim();
      if (!out.title) out.title = field(3, 33);
      if (!out.artist) out.artist = field(33, 63);
    }
  }
  return out;
}
