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

/**
 * Calculates the destination point given a start point, bearing, and distance.
 * @param {number} lat1 Latitude of start point.
 * @param {number} lon1 Longitude of start point.
 * @param {number} brearing Initial bearing.
 * @param {number} distance Distance along the bearing.
 * @returns {object} {lat, lon} of the destination point in degrees.
 */
export function calculateDestination(lat1, lon1, bearing, distance) {
  const phi1 = toRadians(lat1);
  const lambda1 = toRadians(lon1);
  const theta = toRadians(bearing);
  const angularDistance = distance / R; // Angular distance in radians

  const phi2 = Math.asin(
    Math.sin(phi1) * Math.cos(angularDistance) +
    Math.cos(phi1) * Math.sin(angularDistance) * Math.cos(theta)
  );

  let lambda2 = lambda1 + Math.atan2(
    Math.sin(theta) * Math.sin(angularDistance) * Math.cos(phi1),
    Math.cos(angularDistance) - Math.sin(phi1) * Math.sin(phi2)
  );

  // Normalize longitude
  lambda2 = (lambda2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI;

  return {
    lat: toDegrees(phi2),
    lon: toDegrees(lambda2)
  };
}

// // // // // // // // // // // // // // // // // // // // // // // // // // // // //

// export function calculateCrossTrackError(startLat, startLon, endLat, endLon, pointLat, pointLon) {
//   // Convert to radians
//   const φ1 = toRadians(startLat);
//   const λ1 = toRadians(startLon);
//   const φ2 = toRadians(endLat);
//   const λ2 = toRadians(endLon);
//   const φp = toRadians(pointLat);
//   const λp = toRadians(pointLon);

//   // Calculate initial bearing of the great circle path (radians)
//   const initialBearing = getBearing(φ1, λ1, φ2, λ2);

//   // Calculate distance between start point and given point (radians)
//   const distanceToPoint = calculateGreatCircleDistance(φ1, λ1, φp, λp)

//   // Calculate cross-track error (radians)
//   // perpendicular distance from a point to a great circle path
//   const crossTrackError = Math.asin(
//     Math.sin(distanceToPoint) *
//     Math.sin(initialBearing - Math.atan2(
//       Math.sin(φp - φ1) * Math.cos(initialBearing),
//       Math.cos(φp) * Math.sin(initialBearing)
//     ))
//   );

//   // Convert cross-track error to distances
//   const crossTrackErrorKM = Math.abs(crossTrackError * R);
//   const crossTrackErrorMeters = crossTrackErrorKM * 1000;

//   // Calculate along-track distance
//   const alongTrackDistance = Math.acos(
//     Math.cos(distanceToPoint) / Math.cos(Math.abs(crossTrackError))
//   );

//   return {
//     crossTrackErrorDistanceKM: crossTrackErrorKM,
//     crossTrackErrorDistance: crossTrackErrorMeters,
//     alongTrackDistance: alongTrackDistance * R,
//     crossTrackBearing: toDegrees(initialBearing),
//     crossTrackDirection: crossTrackError > 0 ? 'Right' : 'Left'
//   };
// }


/**
 * Calculates the cross-track distance (XTD) and the coordinates of the
 * closest point on the great circle track from point 1 to point 2,
 * with respect to point 3 (the current position).
 *
 * @param {number} lat1 Latitude of start point (P1).
 * @param {number} lon1 Longitude of start point (P1).
 * @param {number} lat2 Latitude of end point (P2).
 * @param {number} lon2 Longitude of end point (P2).
 * @param {number} lat3 Latitude of current point (P3).
 * @param {number} lon3 Longitude of current point (P3).
 * @returns {object} {xtd: number (meters, signed), closestPoint: {lat: number, lon: number}}.
 */
export function calculateCrossTrack(lat1, lon1, lat2, lon2, lat3, lon3) {
    // 1. Angular distance from P1 to P3
    const dist13 = calculateDistance(lat1, lon1, lat3, lon3);
    const delta13 = dist13 / R;

    // 2. Initial bearing from P1 to P2 (track bearing)
    const bearing12 = calculateBearing(lat1, lon1, lat2, lon2);

    // 3. Initial bearing from P1 to P3
    const bearing13 = calculateBearing(lat1, lon1, lat3, lon3);

    // Convert bearings to radians
    const theta12 = toRadians(bearing12);
    const theta13 = toRadians(bearing13);

    // 4. Calculate cross-track distance (XTD)
    // The sign indicates which side of the track P3 is on (positive = right, negative = left).
    const xtd = Math.asin(
      Math.sin(delta13) * Math.sin(theta13 - theta12)
    ) * R;

    // 5. Calculate along-track distance (ATD)
    // The distance from P1 to the point on the track closest to P3.
    const atd = Math.acos(
      Math.cos(delta13) / Math.cos(xtd / R)
    ) * R;

    // 6. Calculate the coordinates of the closest point on the track using P1, track bearing, and ATD.
    const closestPoint = calculateDestination(lat1, lon1, bearing12, atd);

    return {
        xtd: xtd, // Cross track distance in meters (signed)
        atd: atd, // Along track distance in meters
        closestPoint: closestPoint
    };
}
