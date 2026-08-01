import assert from 'node:assert/strict';
import { convertLinear, formatNumber } from '../src/lib/linear-converter.js';

const KM_TO_MILES = 0.621371;
const M_TO_FEET = 3.28084;
const CM_TO_INCHES = 0.393701;

function approxEqual(a, b, epsilon = 1e-4) {
  assert.ok(Math.abs(a - b) < epsilon, `expected ${a} to be close to ${b}`);
}

// 10 km = 6.21371 miles (real-world reference value)
approxEqual(convertLinear(10, KM_TO_MILES), 6.21371);

// 1 m = 3.28084 feet
approxEqual(convertLinear(1, M_TO_FEET), 3.28084);

// 100 cm = 39.3701 inches
approxEqual(convertLinear(100, CM_TO_INCHES), 39.3701);

// 0 always converts to 0 regardless of factor
assert.equal(convertLinear(0, KM_TO_MILES), 0);

// formatNumber rounds long decimals to 6 places and strips trailing zeros
assert.equal(formatNumber(6.213710000001), '6.21371');
assert.equal(formatNumber(5), '5');
assert.equal(formatNumber(NaN), '0');

console.log('linear-converter: all assertions passed');
