import assert from 'node:assert/strict';
import { convertMultiUnit, formatNumber } from '../src/lib/multi-unit-converter.js';

// factors: meters per unit
const M = 1;
const KM = 1000;
const CM = 0.01;
const MM = 0.001;
const DM = 0.1;
const INCH = 0.0254;
const FOOT = 0.3048;
const YARD = 0.9144;
const MILE = 1609.344;
const NAUTICAL_MILE = 1852;

function approxEqual(a, b, epsilon = 1e-4) {
  assert.ok(Math.abs(a - b) < epsilon, `expected ${a} to be close to ${b}`);
}

// 1 km = 1000 m
approxEqual(convertMultiUnit(1, KM, M), 1000);

// 100 cm = 1 m
approxEqual(convertMultiUnit(100, CM, M), 1);

// 5 m = 500 cm
approxEqual(convertMultiUnit(5, M, CM), 500);

// 1 mile = 1609.344 m (matches the dedicated miles-to-km page's exact factor)
approxEqual(convertMultiUnit(1, MILE, M), 1609.344);

// 1 foot = 12 inches, cross-checked via meters as the common base
approxEqual(convertMultiUnit(1, FOOT, INCH), 12, 1e-3);

// 1 yard = 3 feet
approxEqual(convertMultiUnit(1, YARD, FOOT), 3, 1e-3);

// 1 nautical mile = 1852 m exactly
approxEqual(convertMultiUnit(1, NAUTICAL_MILE, M), 1852);

// 1 dm = 10 cm = 0.1 m
approxEqual(convertMultiUnit(1, DM, CM), 10, 1e-3);
approxEqual(convertMultiUnit(1, DM, M), 0.1, 1e-6);

// same unit on both sides is a no-op
assert.equal(convertMultiUnit(42, KM, KM), 42);

// converting through mm and back to m round-trips correctly
approxEqual(convertMultiUnit(convertMultiUnit(7, M, MM), MM, M), 7);

assert.equal(formatNumber(999.9999995), '1000');
assert.equal(formatNumber(NaN), '0');

console.log('multi-unit-converter: all assertions passed');
