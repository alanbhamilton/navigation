// Earth's radius in kilometers
export const R = 6371;

// // // // // // // // // // // // // // // // // // // // // // // // // // // //

export function getBearing(φ1, λ1, φ2, λ2) {
  const x = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const y = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1)
  return Math.atan2(x, y);
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // //

// Normalize bearing to ensure the final output is always a positive value between 0° and 360°
export function normalizeBearing(degrees) {
  // The modulo operator (%) can return a negative number if the input is negative.
  // By adding 360 before the modulo operation, we ensure the result is always positive
  // and within the 0-360 range.
  return (degrees % 360 + 360) % 360;
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // //

export function calculateGreatCircleDistance(φ1, λ1, φ2, λ2) {
  // Get deltas
  const Δφ = φ2 - φ1;
  const Δλ = λ2 - λ1;

  // Haversine Formula Components
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  // Central angle between points (radians)
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // //

export function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // //

export function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // //

export function calculateBearing(startLat, startLon, endLat, endLon) {
  // Convert coordinates to radians
  const φ1 = toRadians(startLat);
  const λ1 = toRadians(startLon);
  const φ2 = toRadians(endLat);
  const λ2 = toRadians(endLon);

  // Calculate initial bearing
  const bearingRad = getBearing(φ1, λ1, φ2, λ2);

  // Convert from radians to degrees
  const bearingDeg = toDegrees(bearingRad);

  // Normalize to 0-360 degrees
  return normalizeBearing(bearingDeg);
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // //

export function calculateDistance(startLat, startLon, endLat, endLon) {
  // Calculate differences
  const φ1 = toRadians(startLat);
  const λ1 = toRadians(startLon);
  const φ2 = toRadians(endLat);
  const λ2 = toRadians(endLon);

  // Calculate distance (radians)
  const distance = calculateGreatCircleDistance(φ1, λ1, φ2, λ2)

  //
  return distance * R;
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
  const initialBearing = getBearing(φ1, λ1, φ2, λ2);

  // Calculate distance between start point and given point (radians)
  const distanceToPoint = calculateGreatCircleDistance(φ1, λ1, φp, λp)

  // Calculate cross-track error (radians)
  // perpendicular distance from a point to a great circle path
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
