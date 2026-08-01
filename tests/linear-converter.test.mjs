import assert from 'node:assert/strict';
import { convertLinear, formatNumber } from '../src/lib/linear-converter.js';

const KM_TO_MILES = 0.621371;
const M_TO_FEET = 3.28084;
const CM_TO_INCHES = 0.393701;
const MILES_TO_KM = 1.609344;
const FEET_TO_M = 0.3048;
const INCHES_TO_CM = 2.54;

function approxEqual(a, b, epsilon = 1e-4) {
  assert.ok(Math.abs(a - b) < epsilon, `expected ${a} to be close to ${b}`);
}

// 10 km = 6.21371 miles (real-world reference value)
approxEqual(convertLinear(10, KM_TO_MILES), 6.21371);

// 1 m = 3.28084 feet
approxEqual(convertLinear(1, M_TO_FEET), 3.28084);

// 100 cm = 39.3701 inches
approxEqual(convertLinear(100, CM_TO_INCHES), 39.3701);

// reverse-direction tools: values quoted in each tool's FAQ, must match exactly
approxEqual(convertLinear(26.2, MILES_TO_KM), 42.164813, 1e-6);
approxEqual(convertLinear(10, FEET_TO_M), 3.048, 1e-6);
approxEqual(convertLinear(32, INCHES_TO_CM), 81.28, 1e-6);

// forward/reverse factors round-trip back to ~1 (sanity check the pairs are true inverses)
approxEqual(KM_TO_MILES * MILES_TO_KM, 1, 1e-3);
approxEqual(M_TO_FEET * FEET_TO_M, 1, 1e-3);
approxEqual(CM_TO_INCHES * INCHES_TO_CM, 1, 1e-3);

// 0 always converts to 0 regardless of factor
assert.equal(convertLinear(0, KM_TO_MILES), 0);

// formatNumber rounds long decimals to 6 places and strips trailing zeros
assert.equal(formatNumber(6.213710000001), '6.21371');
assert.equal(formatNumber(5), '5');
assert.equal(formatNumber(NaN), '0');

console.log('linear-converter: all assertions passed');
