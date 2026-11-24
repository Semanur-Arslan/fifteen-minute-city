"use client";

import { useEffect, useRef } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { DEFAULT_ZOOM, ISTANBUL_CENTER, MAP_STYLE_URL } from "@/lib/map-config";

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: MapLibreMap | undefined;
    let cancelled = false;

    // Load MapLibre only in the browser: it needs `window` and WebGL.
    import("maplibre-gl").then(({ Map, NavigationControl, setWorkerUrl }) => {
      if (cancelled || !containerRef.current) return;

      // MapLibre 6 computes its worker URL at runtime, so the bundler never
      // emits the file. Pointing at it explicitly makes Turbopack ship it.
      setWorkerUrl(
        new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href,
      );

      map = new Map({
        container: containerRef.current,
        style: MAP_STYLE_URL,
        center: ISTANBUL_CENTER,
        zoom: DEFAULT_ZOOM,
        // Keep the OSM / OpenFreeMap attribution expanded on every screen size.
        attributionControl: { compact: false },
      });
      map.addControl(new NavigationControl(), "top-right");
    });

    return () => {
      cancelled = true;
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
