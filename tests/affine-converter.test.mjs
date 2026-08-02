import assert from 'node:assert/strict';
import { convertAffine, formatNumber } from '../src/lib/affine-converter.js';

const C_TO_F = { scale: 1.8, offset: 32 };
const F_TO_C = { scale: 0.5555555556, offset: -17.7777777778 };
const C_TO_K = { scale: 1, offset: 273.15 };
const K_TO_C = { scale: 1, offset: -273.15 };

function approxEqual(a, b, epsilon = 1e-3) {
  assert.ok(Math.abs(a - b) < epsilon, `expected ${a} to be close to ${b}`);
}

// Well-known reference points -- these formulas are the classic place to get it wrong,
// verified against real physical reference values, not just internal round-trips.
approxEqual(convertAffine(0, C_TO_F.scale, C_TO_F.offset), 32); // freezing point of water
approxEqual(convertAffine(100, C_TO_F.scale, C_TO_F.offset), 212); // boiling point of water
approxEqual(convertAffine(37, C_TO_F.scale, C_TO_F.offset), 98.6); // normal body temperature
approxEqual(convertAffine(-40, C_TO_F.scale, C_TO_F.offset), -40); // the famous C/F crossover point

approxEqual(convertAffine(32, F_TO_C.scale, F_TO_C.offset), 0);
approxEqual(convertAffine(212, F_TO_C.scale, F_TO_C.offset), 100);
approxEqual(convertAffine(98.6, F_TO_C.scale, F_TO_C.offset), 37);
approxEqual(convertAffine(-40, F_TO_C.scale, F_TO_C.offset), -40);

approxEqual(convertAffine(0, C_TO_K.scale, C_TO_K.offset), 273.15); // absolute zero reference
approxEqual(convertAffine(100, C_TO_K.scale, C_TO_K.offset), 373.15);
approxEqual(convertAffine(-273.15, C_TO_K.scale, C_TO_K.offset), 0); // absolute zero itself

approxEqual(convertAffine(273.15, K_TO_C.scale, K_TO_C.offset), 0);
approxEqual(convertAffine(0, K_TO_C.scale, K_TO_C.offset), -273.15);

// forward/reverse round-trip to the identity
approxEqual(convertAffine(convertAffine(21, C_TO_F.scale, C_TO_F.offset), F_TO_C.scale, F_TO_C.offset), 21, 1e-3);

// The exact strings a visitor would see at common reference points must be clean ("0", "37",
// "100"), not "0.000001" or "37.000004" -- a real artifact caught while writing FAQ copy with
// a lower-precision F_TO_C constant than what's used here now. formatNumber's 6-decimal
// rounding only cleans up floating noise if the source constants have enough precision.
assert.equal(formatNumber(convertAffine(32, F_TO_C.scale, F_TO_C.offset)), '0');
assert.equal(formatNumber(convertAffine(98.6, F_TO_C.scale, F_TO_C.offset)), '37');
assert.equal(formatNumber(convertAffine(212, F_TO_C.scale, F_TO_C.offset)), '100');

assert.equal(formatNumber(6.213710000001), '6.21371');
assert.equal(formatNumber(NaN), '0');

console.log('affine-converter: all assertions passed');
