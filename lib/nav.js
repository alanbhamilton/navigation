// Earth's radius in kilometers
const R = 6371;

// // // // // // // // // // // // // // // // // // // // // // // // // // // //

export function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // //

export function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // //

export function calculateBearing(lat1, lon1, lat2, lon2) {
  // Convert coordinates to radians
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);

  // Calculate bearing
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  // Calculate initial bearing
  let bearing = Math.atan2(y, x);

  // Convert from radians to degrees
  bearing = toDegrees(bearing);

  // Normalize to 0-360 degrees
  return (bearing + 360) % 360;
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // //

export function calculateDistance(lat1, lon1, lat2, lon2, unit = 'kilometers') {
  // Calculate differences
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  // Haversine Formula
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calculate distance
  let distance = R * c;

  // Convert to miles if requested
  if (unit.toLowerCase() === 'miles') {
    distance *= 0.621371; // Convert kilometers to miles
  }

  return distance;
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // // //

export function calculateCrossTrackError(startLat, startLon, endLat, endLon, pointLat, pointLon) {
  // Convert to radians
  const φ1 = toRadians(startLat);
  const λ1 = toRadians(startLon);
  const φ2 = toRadians(endLat);
  const λ2 = toRadians(endLon);
  const φp = toRadians(pointLat);
  const λp = toRadians(pointLon);

  // Calculate initial bearing of the great circle path (radians)
  const initialBearing = Math.atan2(
    Math.sin(λ2 - λ1) * Math.cos(φ2),
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1)
  );

  // Calculate distance between start point and given point (radians)
  const distanceToPoint = Math.acos(
    Math.sin(φ1) * Math.sin(φp) +
    Math.cos(φ1) * Math.cos(φp) * Math.cos(λp - λ1)
  );

  // Calculate cross-track error (radians)
  const crossTrackError = Math.asin(
    Math.sin(distanceToPoint) *
    Math.sin(initialBearing - Math.atan2(
      Math.sin(φp - φ1) * Math.cos(initialBearing),
      Math.cos(φp) * Math.sin(initialBearing)
    ))
  );

  // Convert cross-track error to distances
  const crossTrackErrorKM = Math.abs(crossTrackError * R);
  const crossTrackErrorMeters = crossTrackErrorKM * 1000;

  // Calculate along-track distance
  const alongTrackDistance = Math.acos(
    Math.cos(distanceToPoint) / Math.cos(Math.abs(crossTrackError))
  );

  return {
    crossTrackErrorDistanceKM: crossTrackErrorKM,
    crossTrackErrorDistance: crossTrackErrorMeters,
    alongTrackDistance: alongTrackDistance * R,
    crossTrackBearing: toDegrees(initialBearing),
    crossTrackDirection: crossTrackError > 0 ? 'Right' : 'Left'
  };
}
