
const SPACES = /[   \s]/g;

function parseFraction(token) {
  const m = /^(\d+)\s*\/\s*(\d+)$/.exec(token);
  if (!m) return null;
  const den = Number(m[2]);
  if (!den) return null;
  return Number(m[1]) / den;
}

function parsePlain(text) {
  const cleaned = String(text)
    .replace(SPACES, '')
    .replace(',', '.');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  if (!/^-?\d*\.?\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function parseQuantity(text, compound) {
  if (text == null) return null;
  let s = String(text).trim().toLowerCase();
  if (!s) return null;

  const feetInch = /^(-?[\d.,]+)\s*['′]\s*([\d.,\s/]+)?\s*(?:["”″]|in|inch|inches)?$/.exec(s);
  if (feetInch && compound && compound.per) {
    const whole = parsePlain(feetInch[1]);
    if (whole == null) return null;
    const sub = feetInch[2] ? parseMixed(feetInch[2]) : 0;
    if (sub == null) return null;
    return whole + sub / compound.per;
  }

  if (compound && compound.per && compound.sub) {

    const words = compound.sub.concat(compound.main || []).map((w) => w.toLowerCase());
    let t = s;
    for (const w of words.sort((a, b) => b.length - a.length)) {
      t = t.split(w).join(' ');
    }
    const nums = t.split(/\s+/).map((x) => x.trim()).filter(Boolean);
    if (nums.length === 2) {
      const whole = parsePlain(nums[0]);
      const sub = parseMixed(nums[1]);
      if (whole != null && sub != null) return whole + sub / compound.per;
    }

    if (nums.length === 1 && t !== s) {
      const whole = parseMixed(nums[0]);
      if (whole != null) return whole;
    }
  }

  return parseMixed(s);
}

export function parseMixed(text) {
  const s = String(text).trim();
  if (!s) return null;
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 2) {
    const whole = parsePlain(parts[0]);
    const frac = parseFraction(parts[1]);
    if (whole != null && frac != null) return whole + (whole < 0 ? -frac : frac);

    return parsePlain(s);
  }
  const frac = parseFraction(s);
  if (frac != null) return frac;
  return parsePlain(s);
}

export const COMPOUND = {
  'feet-to-m': {
    per: 12,
    main: ['ft', 'feet', 'foot', 'фут', 'фута', 'футов', 'фт', 'pie', 'pies', 'фути', 'футів'],
    sub: ['in', 'inch', 'inches', '"', 'дюйм', 'дюйма', 'дюймов', 'дюйми', 'дюймів', 'pulgada', 'pulgadas'],
  },
  'stone-to-kg': {
    per: 14,
    main: ['st', 'stone', 'stones', 'стоун', 'стоуна', 'стоунов', 'стоунів', 'стоуни'],
    sub: ['lb', 'lbs', 'pound', 'pounds', 'фунт', 'фунта', 'фунтов', 'фунтів', 'фунти', 'libra', 'libras'],
  },
};
