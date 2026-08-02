// Each unit is represented as its affine transform TO Celsius (scale, offset): celsius = value*scale+offset.
// Converting between any two units goes value -> celsius -> target, using the target's inverse transform.
export function convertTemperature(value, fromScale, fromOffset, toScale, toOffset) {
  const celsius = value * fromScale + fromOffset;
  return (celsius - toOffset) / toScale;
}

export function formatNumber(n) {
  if (!Number.isFinite(n)) return '0';
  const rounded = Math.round(n * 1e6) / 1e6;
  return rounded.toString();
}
