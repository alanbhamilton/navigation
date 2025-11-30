import { calculateBearing, calculateDistance, calculateCrossTrackError } from "./lib/nav.js";

// Example Locations
const locations = [
  {
    name: 'New York City to Los Angeles',
    start: { lat: 40.7128, lon: -74.0060 },
    end: { lat: 34.0522, lon: -118.2437 }
  },
  {
    name: 'London to Paris',
    start: { lat: 51.5074, lon: -0.1278 },
    end: { lat: 48.8566, lon: 2.3522 }
  }
];

// Calculate and display bearings
locations.forEach((location, index) => {
  const bearing = calculateBearing(
    location.start.lat,
    location.start.lon,
    location.end.lat,
    location.end.lon
  );
  const distance = calculateDistance(
    location.start.lat,
    location.start.lon,
    location.end.lat,
    location.end.lon
  );

  console.log('---');
  console.log(`${location.name}:`);
  console.log(`  Bearing: ${bearing.toFixed(2)} degrees`);
  console.log(`  Distance: ${distance.toFixed(2)} km`);
});


const scenarios = [
  {
    name: "New York to Los Angeles via Philadelphia",
    start: { lat: 40.7128, lon: -74.0060 },   // New York City
    end: { lat: 34.0522, lon: -118.2437 },    // Los Angeles
    point: { lat: 39.9526, lon: -75.1652 }    // Philadelphia
  },
  {
    name: "London to Paris via Brussels",
    start: { lat: 51.5074, lon: -0.1278 },    // London
    end: { lat: 48.8566, lon: 2.3522 },       // Paris
    point: { lat: 50.8503, lon: 4.3517 }      // Brussels
  }
];

scenarios.forEach((scenario) => {
  const result = calculateCrossTrackError(
    scenario.start.lat, scenario.start.lon,
    scenario.end.lat, scenario.end.lon,
    scenario.point.lat, scenario.point.lon
  );

  console.log('---');
  console.log(`Scenario: ${scenario.name}`);
  console.log(`Cross-Track Distance: ${result.crossTrackErrorDistanceKM.toFixed(2)} km`);
  console.log(`Cross-Track Direction: ${result.crossTrackDirection}`);
  console.log(`Along-Track Distance: ${result.alongTrackDistance.toFixed(2)} km`);
  console.log(`Path Bearing: ${result.crossTrackBearing.toFixed(2)} degrees`);
});
