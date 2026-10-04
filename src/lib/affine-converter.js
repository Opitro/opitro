
export function convertAffine(value, scale, offset) {
  return value * scale + offset;
}

export function formatNumber(n) {
  if (!Number.isFinite(n)) return '0';
  const rounded = Math.round(n * 1e6) / 1e6;
  return rounded.toString();
}
