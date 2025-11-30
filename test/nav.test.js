import test, { describe, it } from 'node:test';
import * as chai from 'chai';
import chaiAlmost from 'chai-almost';

chai.use(chaiAlmost());

const { assert, expect } = chai;

import { calculateDistance, calculateBearing, normalizeBearing, R } from '../lib/nav.js';

const distanceTolerance = 0.003; // 3%
const earthCircumference = 2 * Math.PI * R

const tests = [
    // Start at equator, go North (due North)
    {
      name: "Equator North",
      start: { lat: 0, lon: 0 },
      end: { lat: 1, lon: 0 },
      expected: {
        bearing: 0.00,
        distance: {
          value: 111.2,
          tolerance: 111.2 * distanceTolerance
        },
      }
    },
    // Start at equator, go East (due East)
    {
      name: "Equator East",
      start: { lat: 0, lon: 0 },
      end: { lat: 0, lon: 1 },
      expected: {
        bearing: 90.00,
        distance: {
          value: 111.2,
          tolerance: 111.2 * distanceTolerance
        },
      }
    },
    // Go due South near the prime meridian
    {
      name: "Go South",
      start: { lat: 50.0, lon: 0.0 },
      end: { lat: 49.0, lon: 0.0 },
      expected: {
        bearing: 180.0,
        distance: {
          value: 111.2,
          tolerance: 111.2 * distanceTolerance
        },
      }
    },
    // Go due West near the prime meridian
    {
      name: "Go West",
      start: { lat: 50.0, lon: 0.0 },
      end: { lat: 50.0, lon: -1.0},
      expected: {
        bearing: 270.3830,
        distance: {
          value: 71.47,
          tolerance: 71.47 * distanceTolerance
        },
      }
    },
    // A specific case with known result from online calculator/formula sites
    {
      name: "Kansas City to St Louis (approx)",
      start: { lat: 39.0997, lon: -94.5786 },
      end: { lat: 38.6270, lon: -90.1994 },
      expected: {
        bearing: 96.51,
        distance: {
          value: 382.7,
          tolerance: 382.7 * distanceTolerance
        },
      }
    },
    // From https://www.movable-type.co.uk/scripts/latlong.html
    {
      name: "Movable Type Scripts",
      start: { lat: 50.066389, lon: -5.714722 },
      end: { lat: 58.643889, lon: -3.07 },
      expected: {
        bearing: 9.1198,
        distance: {
          value: 968.8,
          tolerance: 968.8 * distanceTolerance
        },
      }
    },
    // Self
    {
      name: "Self (0, 0, 0, 0)",
      start: { lat: 0, lon: 0 },
      end: { lat: 0, lon: 0 },
      expected: {
        bearing: 0,
        distance: {
          value: 0,
          tolerance: 0
        },
      }
    },
    {
      name: "Self (40, -70, 40, -70)",
      start: { lat: 40, lon: -70 },
      end: { lat: 40, lon: -70 },
      expected: {
        bearing: 0,
        distance: {
          value: 0,
          tolerance: 0
        },
      }
    },
    // Distance between (0, 0) and (0, 90) should be 1/4 of Earth's circumference
    {
      name: "1/4 of Earth's circumference",
      start: { lat: 0, lon: 0 },
      end: { lat: 0, lon: 90 },
      expected: {
        bearing: 90,
        distance: {
          value: earthCircumference / 4,
          tolerance: earthCircumference / 4 * distanceTolerance
        },
      }
    },
    // Antipodal Points
    {
      name: "Antipodal piont (0, 0, 0, 180)",
      start: { lat: 0, lon: 0 },
      end: { lat: 0, lon: 180 },
      expected: {
        bearing: 90,
        distance: {
          value: earthCircumference / 2,
          tolerance: earthCircumference / 2 * distanceTolerance
        },
      }
    },
    {
      name: "Antipodal piont (90, 0, -90, 0)",
      start: { lat: 90, lon: 0 },
      end: { lat: -90, lon: 0 },
      expected: {
        bearing: 180,
        distance: {
          value: earthCircumference / 2,
          tolerance: earthCircumference / 2 * distanceTolerance
        },
      }
    },
  ];

describe('calculateDistance function', () => {
  const tolerance = 0.1;

  tests.forEach(({ name, start, end, expected }) => {
    it(name, () => {
      const result = calculateDistance(start.lat, start.lon, end.lat, end.lon);
      expect(result).to.be.almost(expected.distance.value, expected.distance.tolerance);
    });
  });
})


describe('calculateBearing function', () => {
  const tolerance = 0.1;

  tests.forEach(({ name, start, end, expected }) => {
    it(name, () => {
      const result = calculateBearing(start.lat, start.lon, end.lat, end.lon);
      expect(result).to.be.almost(expected.bearing, tolerance);
    });
  });
})

test("normalizeBearing", (t) => {
  const tests = [
    { input: 0, expected: 0 },
    { input: 90, expected: 90 },
    { input: 180, expected: 180 },
    { input: 270, expected: 270 },
    { input: 360, expected: 0 },
    { input: 361, expected: 1 },
    { input: -10, expected: 350 }, // Negative input test
    { input: -90, expected: 270 },
    { input: -180, expected: 180 },
    { input: -360, expected: 0 },
    { input: 720, expected: 0 },
    { input: -730, expected: 350 }, // Large negative input test
  ];
  tests.forEach(({ input, expected }) => {
    assert.equal(normalizeBearing(input), expected);
  });
})
