"use client";

import { useEffect, useRef } from "react";
import type { GeoJSONSource, Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { createCircle } from "@/lib/geo";
import {
  DEFAULT_ZOOM,
  ISTANBUL_CENTER,
  MAP_STYLE_URL,
  WALK_RADIUS_COLOR,
  WALK_RADIUS_FILL_LAYER_ID,
  WALK_RADIUS_LINE_LAYER_ID,
  WALK_RADIUS_METERS,
  WALK_RADIUS_SOURCE_ID,
} from "@/lib/map-config";

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: MapLibreMap | undefined;
    let cancelled = false;

    // Load MapLibre only in the browser: it needs `window` and WebGL.
    import("maplibre-gl").then(
      ({ Map, Marker: MarkerClass, NavigationControl, setWorkerUrl }) => {
        if (cancelled || !containerRef.current) return;

        // MapLibre 6 computes its worker URL at runtime, so the bundler never
        // emits the file. Pointing at it explicitly makes Turbopack ship it.
        setWorkerUrl(
          new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href,
        );

        const instance = new Map({
          container: containerRef.current,
          style: MAP_STYLE_URL,
          center: ISTANBUL_CENTER,
          zoom: DEFAULT_ZOOM,
          // Keep the OSM / OpenFreeMap attribution expanded on every screen size.
          attributionControl: { compact: false },
        });
        map = instance;
        instance.addControl(new NavigationControl(), "top-right");

        // Sources and layers can only be added once the style has loaded, so
        // clicks are handled from then on as well.
        instance.on("load", () => {
          instance.addSource(WALK_RADIUS_SOURCE_ID, {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          instance.addLayer({
            id: WALK_RADIUS_FILL_LAYER_ID,
            type: "fill",
            source: WALK_RADIUS_SOURCE_ID,
            paint: { "fill-color": WALK_RADIUS_COLOR, "fill-opacity": 0.15 },
          });
          instance.addLayer({
            id: WALK_RADIUS_LINE_LAYER_ID,
            type: "line",
            source: WALK_RADIUS_SOURCE_ID,
            paint: { "line-color": WALK_RADIUS_COLOR, "line-width": 2 },
          });

          let marker: Marker | undefined;

          instance.on("click", ({ lngLat }) => {
            marker ??= new MarkerClass({ color: WALK_RADIUS_COLOR });
            marker.setLngLat(lngLat).addTo(instance);

            instance
              .getSource<GeoJSONSource>(WALK_RADIUS_SOURCE_ID)
              ?.setData(createCircle([lngLat.lng, lngLat.lat], WALK_RADIUS_METERS));
          });
        });
      },
    );

    return () => {
      cancelled = true;
      // Also removes the marker, which lives inside the map's container.
      map?.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      // maplibre-gl.css forces `position: relative` on the container (unlayered
      // CSS beats Tailwind's layered utilities), so size it via height instead.
      className="h-full w-full"
      role="region"
      aria-label="Map of Istanbul"
    />
  );
}
