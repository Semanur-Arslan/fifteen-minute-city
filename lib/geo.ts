import type { Feature, Polygon, Position } from "geojson";

/** A geographic point in GeoJSON / MapLibre order: [longitude, latitude] in degrees. */
export type LngLat = [lng: number, lat: number];

/** Mean Earth radius in meters (spherical model). */
export const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const toDegrees = (radians: number) => (radians * 180) / Math.PI;

/** Wraps a longitude into the range [-180, 180). */
const normalizeLng = (lng: number) => ((((lng + 180) % 360) + 360) % 360) - 180;

/**
 * Great-circle distance in meters between two points, using the haversine
 * formula on a sphere of radius {@link EARTH_RADIUS_METERS}.
 */
export function haversineDistance([lng1, lat1]: LngLat, [lng2, lat2]: LngLat): number {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = φ2 - φ1;
  const Δλ = toRadians(lng2 - lng1);

  const h =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  // Clamp: floating-point error can push h slightly outside [0, 1].
  const c = 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Approximates a circle of `radiusMeters` around `center` as a GeoJSON polygon
 * with `steps` vertices. The ring is closed (first position repeated at the end),
 * so it holds `steps + 1` positions.
 *
 * @throws {RangeError} if `radiusMeters` is not a positive finite number, or
 *   `steps` is not an integer ≥ 3.
 */
export function createCircle(
  center: LngLat,
  radiusMeters: number,
  steps = 64,
): Feature<Polygon> {
  if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) {
    throw new RangeError(`radiusMeters must be a positive number, got ${radiusMeters}`);
  }
  if (!Number.isInteger(steps) || steps < 3) {
    throw new RangeError(`steps must be an integer ≥ 3, got ${steps}`);
  }

  const [lng, lat] = center;
  const φ1 = toRadians(lat);
  const λ1 = toRadians(lng);
  const δ = radiusMeters / EARTH_RADIUS_METERS; // angular distance

  const ring: Position[] = [];
  for (let i = 0; i < steps; i++) {
    const θ = (2 * Math.PI * i) / steps; // bearing, clockwise from north
    // Destination point given start, bearing and angular distance.
    const φ2 = Math.asin(
      Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ),
    );
    const λ2 =
      λ1 +
      Math.atan2(
        Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
        Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2),
      );
    ring.push([normalizeLng(toDegrees(λ2)), toDegrees(φ2)]);
  }
  ring.push([...ring[0]]);

  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [ring] },
  };
}
