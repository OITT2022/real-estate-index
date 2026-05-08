"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import type { MapPageData } from "@/lib/site-data";
import { MapSidePanel } from "./map-side-panel";

const MapCanvas = dynamic(() => import("./map-canvas"), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <div className="map-pin" />
      <p className="muted">Loading map…</p>
    </div>
  ),
});

type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

type Props = MapPageData & {
  tileUrl: string;
  tileAttribution: string;
  defaultLat: number;
  defaultLng: number;
  defaultZoom: number;
};

function inBounds(lat: number, lng: number, b: Bounds): boolean {
  return lat <= b.north && lat >= b.south && lng <= b.east && lng >= b.west;
}

export function MapExplorer({
  projects,
  properties,
  tileUrl,
  tileAttribution,
  defaultLat,
  defaultLng,
  defaultZoom,
}: Props) {
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");

  const handleBoundsChange = useCallback((b: Bounds) => setBounds(b), []);

  const visible = useMemo(() => {
    if (!bounds) return { projects, properties };
    return {
      projects: projects.filter((p) => inBounds(p.latitude, p.longitude, bounds)),
      properties: properties.filter((p) => inBounds(p.latitude, p.longitude, bounds)),
    };
  }, [bounds, projects, properties]);

  return (
    <div className="map-explorer">
      <div className="map-explorer-mobile-toggle">
        <button
          type="button"
          className={mobileView === "map" ? "active" : ""}
          onClick={() => setMobileView("map")}
        >
          Map
        </button>
        <button
          type="button"
          className={mobileView === "list" ? "active" : ""}
          onClick={() => setMobileView("list")}
        >
          List ({visible.projects.length + visible.properties.length})
        </button>
      </div>
      <div
        className="map-explorer-side"
        data-mobile-hidden={mobileView === "map" ? "true" : "false"}
      >
        <MapSidePanel projects={visible.projects} properties={visible.properties} />
      </div>
      <div
        className="map-explorer-canvas"
        data-mobile-hidden={mobileView === "list" ? "true" : "false"}
      >
        <MapCanvas
          projects={projects}
          properties={properties}
          tileUrl={tileUrl}
          tileAttribution={tileAttribution}
          defaultLat={defaultLat}
          defaultLng={defaultLng}
          defaultZoom={defaultZoom}
          onBoundsChange={handleBoundsChange}
        />
      </div>
    </div>
  );
}
