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
