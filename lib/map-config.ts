import type { LngLatLike } from "maplibre-gl";

/**
 * OpenFreeMap "Liberty" style: free OpenStreetMap-based vector tiles,
 * no API key or registration required. Attribution is defined by the
 * style's sources and rendered by MapLibre's AttributionControl.
 */
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

/** Historic peninsula of Istanbul, in MapLibre's [lng, lat] order. */
export const ISTANBUL_CENTER: LngLatLike = [28.9784, 41.0082];

export const DEFAULT_ZOOM = 10;

/** v1 approximation of a 15-minute walk (~80 m/min). */
export const WALK_RADIUS_METERS = 1200;

/** Ids of the GeoJSON source and layers that draw the walk radius circle. */
export const WALK_RADIUS_SOURCE_ID = "walk-radius";
export const WALK_RADIUS_FILL_LAYER_ID = "walk-radius-fill";
export const WALK_RADIUS_LINE_LAYER_ID = "walk-radius-outline";

/** Shared accent color for the clicked-point marker and the radius circle. */
export const WALK_RADIUS_COLOR = "#2563eb";
