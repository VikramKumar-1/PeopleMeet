/**
 * Geodesic / Haversine formula to calculate exact distance in meters
 * between any two latitude/longitude coordinates on Earth.
 */
export function calculateDistanceMeter(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Generates a realistic nearby coordinate given a base GPS coordinate and distance in meters.
 * Used for simulating exact peer movement along roads (Boring Road, Lalpur, Mukherjee Nagar).
 */
export function generateOffsetCoordinate(
  baseLat: number,
  baseLng: number,
  distanceMeter: number,
  angleDegree: number
): { lat: number; lng: number } {
  const R = 6371e3;
  const angleRad = (angleDegree * Math.PI) / 180;
  const deltaLat = (distanceMeter * Math.cos(angleRad)) / R;
  const deltaLng =
    (distanceMeter * Math.sin(angleRad)) / (R * Math.cos((baseLat * Math.PI) / 180));

  return {
    lat: baseLat + (deltaLat * 180) / Math.PI,
    lng: baseLng + (deltaLng * 180) / Math.PI,
  };
}

/**
 * Checks if a user's coordinate is inside the Municipal City boundary radius.
 */
export function isWithinCityLimit(
  userLat: number,
  userLng: number,
  cityLat: number,
  cityLng: number,
  maxRadiusKm: number
): boolean {
  const distMeter = calculateDistanceMeter(userLat, userLng, cityLat, cityLng);
  return distMeter <= maxRadiusKm * 1000;
}
