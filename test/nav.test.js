import test from 'node:test';
import * as chai from 'chai';
import chaiAlmost from 'chai-almost';

chai.use(chaiAlmost());

const { assert, expect } = chai;

import { calculateDistance, R } from '../lib/nav.js';

// https://en.wikipedia.org/wiki/Haversine_formula

test("calculateDistance: white house to eiffel tower", (t) => {
  // White House in Washington DC (latitude 38.898° N, longitude -77.037° W)
  // Eiffel Tower in Paris (latitude 48.858° N, longitude 2.294° E)
  const distanceKM = calculateDistance(38.898, -77.037, 48.858, 2.294);
  assert.approximately(distanceKM, 6180, 50);
})

test("calculateDistance: london to paris", (t) => {
  // London (51.5074° N, 0.1278° W) and Paris (48.8566° N, 2.3522° E)
  // Expected distance ~ 343 km (using 6371 km radius) (1.0 km delta for approximation)
  const distanceKM = calculateDistance(51.5074, 0.1278, 48.8566, 2.3522);
  assert.approximately(distanceKM, 343, 50, 1.0);
})

test("calculateDistance: self", (t) => {
  assert.equal(calculateDistance(0, 0, 0, 0), 0);
  assert.equal(calculateDistance(40, -70, 40, -70), 0);
})

test("calculateDistance: equator points", (t) => {
  // Distance between (0, 0) and (0, 90) should be 1/4 of Earth's circumference
  const expected = (2 * Math.PI * R) / 4
  expect(calculateDistance(0, 0, 0, 90)).to.almost.equal(expected, 0.1);
})

test("calculateDistance: antipodal points", (t) => {
  // Distance between (0, 0) and (0, 180) should be 1/2 of Earth's circumference
  const expected = (2 * Math.PI * R) / 2
  expect(calculateDistance(0, 0, 0, 180)).to.almost.equal(expected, 0.1);
  expect(calculateDistance(90, 0, -90, 0)).to.almost.equal(expected, 0.1);
})
