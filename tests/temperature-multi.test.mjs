import assert from 'node:assert/strict';
import { convertTemperature, formatNumber } from '../src/lib/temperature-multi.js';

// unit -> Celsius affine transforms (scale, offset)
const C = { scale: 1, offset: 0 };
const F = { scale: 5 / 9, offset: -160 / 9 };
const K = { scale: 1, offset: -273.15 };

function approxEqual(a, b, epsilon = 1e-4) {
  assert.ok(Math.abs(a - b) < epsilon, `expected ${a} to be close to ${b}`);
}

approxEqual(convertTemperature(0, C.scale, C.offset, F.scale, F.offset), 32);
approxEqual(convertTemperature(100, C.scale, C.offset, F.scale, F.offset), 212);
approxEqual(convertTemperature(32, F.scale, F.offset, C.scale, C.offset), 0);
approxEqual(convertTemperature(98.6, F.scale, F.offset, C.scale, C.offset), 37);
approxEqual(convertTemperature(0, C.scale, C.offset, K.scale, K.offset), 273.15);
approxEqual(convertTemperature(273.15, K.scale, K.offset, C.scale, C.offset), 0);
approxEqual(convertTemperature(300, K.scale, K.offset, F.scale, F.offset), 80.33, 1e-2);

// same unit on both sides is a no-op
approxEqual(convertTemperature(50, F.scale, F.offset, F.scale, F.offset), 50);

assert.equal(formatNumber(convertTemperature(32, F.scale, F.offset, C.scale, C.offset)), '0');
assert.equal(formatNumber(convertTemperature(98.6, F.scale, F.offset, C.scale, C.offset)), '37');
assert.equal(formatNumber(NaN), '0');

console.log('temperature-multi: all assertions passed');
