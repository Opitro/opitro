import assert from 'node:assert/strict';
import { convertLinear, formatNumber } from '../src/lib/linear-converter.js';

const KM_TO_MILES = 0.621371;
const M_TO_FEET = 3.28084;
const CM_TO_INCHES = 0.393701;
const MILES_TO_KM = 1.609344;
const FEET_TO_M = 0.3048;
const INCHES_TO_CM = 2.54;
const STEPS_TO_KM = 0.000762;
const KM_TO_STEPS = 1312.335958;
const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 0.453592;
const G_TO_OZ = 0.035274;
const OZ_TO_G = 28.349523;
const KG_TO_STONE = 0.157473;
const STONE_TO_KG = 6.350293;
const LITERS_TO_GAL = 0.26417205;
const GAL_TO_LITERS = 3.785411784;
const ML_TO_CUPS = 0.00422675;
const CUPS_TO_ML = 236.588236;
const FLOZ_TO_ML = 29.5735296;
const ML_TO_FLOZ = 0.03381402;

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
approxEqual(STEPS_TO_KM * KM_TO_STEPS, 1, 1e-3);

// steps<->km: values quoted in each tool's FAQ (76 cm average stride)
approxEqual(convertLinear(10000, STEPS_TO_KM), 7.62, 1e-6);
approxEqual(convertLinear(5, KM_TO_STEPS), 6561.68, 1e-2);

// weight pairs: round-trip sanity + FAQ values, exactly as quoted on each page
approxEqual(KG_TO_LBS * LBS_TO_KG, 1, 1e-3);
approxEqual(G_TO_OZ * OZ_TO_G, 1, 1e-3);
approxEqual(KG_TO_STONE * STONE_TO_KG, 1, 1e-3);
approxEqual(convertLinear(70, KG_TO_LBS), 154.3234, 1e-4);
approxEqual(convertLinear(50, LBS_TO_KG), 22.6796, 1e-4);
approxEqual(convertLinear(200, G_TO_OZ), 7.0548, 1e-4);
approxEqual(convertLinear(8, OZ_TO_G), 226.796184, 1e-6);
approxEqual(convertLinear(80, KG_TO_STONE), 12.59784, 1e-5);
approxEqual(convertLinear(12, STONE_TO_KG), 76.203516, 1e-6);

// volume pairs: round-trip sanity + FAQ values, exactly as quoted on each page
approxEqual(LITERS_TO_GAL * GAL_TO_LITERS, 1, 1e-3);
approxEqual(ML_TO_CUPS * CUPS_TO_ML, 1, 1e-3);
approxEqual(FLOZ_TO_ML * ML_TO_FLOZ, 1, 1e-3);
approxEqual(convertLinear(60, LITERS_TO_GAL), 15.850323, 1e-6);
approxEqual(convertLinear(5, GAL_TO_LITERS), 18.927059, 1e-6);
approxEqual(convertLinear(500, ML_TO_CUPS), 2.113375, 1e-6);
approxEqual(convertLinear(2.5, CUPS_TO_ML), 591.47059, 1e-5);
approxEqual(convertLinear(12, FLOZ_TO_ML), 354.882355, 1e-6);
approxEqual(convertLinear(750, ML_TO_FLOZ), 25.360515, 1e-6);

// 0 always converts to 0 regardless of factor
assert.equal(convertLinear(0, KM_TO_MILES), 0);

// formatNumber rounds long decimals to 6 places and strips trailing zeros
assert.equal(formatNumber(6.213710000001), '6.21371');
assert.equal(formatNumber(5), '5');
assert.equal(formatNumber(NaN), '0');

console.log('linear-converter: all assertions passed');
