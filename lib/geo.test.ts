import { describe, expect, it } from "vitest";

import { createCircle, haversineDistance, type LngLat } from "@/lib/geo";

describe("haversineDistance", () => {
  it("returns 0 for identical points", () => {
    expect(haversineDistance([28.9784, 41.0082], [28.9784, 41.0082])).toBe(0);
  });

  it("is symmetric", () => {
    const istanbul: LngLat = [28.9784, 41.0082];
    const izmir: LngLat = [27.1428, 38.4237];
    expect(haversineDistance(istanbul, izmir)).toBeCloseTo(
      haversineDistance(izmir, istanbul),
      6,
    );
  });

  it("matches the Rosetta Code reference (BNA → LAX, R = 6371 km)", () => {
    // Source: https://rosettacode.org/wiki/Haversine_formula
    // "6371.0 km -> 2886.44444283798329974715782394574671655 km"
    const bna: LngLat = [-86.67, 36.12];
    const lax: LngLat = [-118.4, 33.94];
    expect(haversineDistance(bna, lax)).toBeCloseTo(2_886_444.44, 1);
  });

  it("treats 1° of longitude on the equator as R·π/180 meters", () => {
    expect(haversineDistance([0, 0], [1, 0])).toBeCloseTo(
      (6_371_000 * Math.PI) / 180,
      3,
    );
  });

  it("handles the antimeridian (179° → -179° is 2°, not 358°)", () => {
    expect(haversineDistance([179, 0], [-179, 0])).toBeCloseTo(
      haversineDistance([0, 0], [2, 0]),
      3,
    );
  });
});

describe("createCircle", () => {
  const center: LngLat = [28.9784, 41.0082];

  it("returns a GeoJSON Polygon feature", () => {
    const circle = createCircle(center, 1200);
    expect(circle.type).toBe("Feature");
    expect(circle.geometry.type).toBe("Polygon");
    expect(circle.geometry.coordinates).toHaveLength(1);
  });

  it("produces a closed ring with steps + 1 positions (default 64 steps)", () => {
    const ring = createCircle(center, 1200).geometry.coordinates[0];
    expect(ring).toHaveLength(65);
    expect(ring[ring.length - 1]).toEqual(ring[0]);
  });

  it("respects a custom step count", () => {
    expect(createCircle(center, 1200, 8).geometry.coordinates[0]).toHaveLength(9);
  });

  it("places every vertex at the given radius from the center", () => {
    const ring = createCircle(center, 1200).geometry.coordinates[0];
    for (const vertex of ring) {
      expect(haversineDistance(center, vertex as LngLat)).toBeCloseTo(1200, 3);
    }
  });

  it.each([0, -5, Number.NaN])("throws RangeError for radius %s", (radius) => {
    expect(() => createCircle(center, radius)).toThrow(RangeError);
  });

  it("throws RangeError for fewer than 3 steps", () => {
    expect(() => createCircle(center, 1200, 2)).toThrow(RangeError);
  });
});
