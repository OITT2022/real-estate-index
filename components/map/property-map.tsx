"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/map/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="map-placeholder">
      <div className="map-pin" />
    </div>
  ),
});

type PropertyMapProps = {
  lat: number;
  lng: number;
  zoom?: number;
  tileUrl?: string;
  tileAttribution?: string;
  label?: string;
};

export function PropertyMap({ lat, lng, zoom, tileUrl, tileAttribution, label }: PropertyMapProps) {
  return (
    <div className="card map-card">
      <div className="map-header-row">
        <div>
          <h3>Location</h3>
        </div>
        <div className="map-coordinates">{lat.toFixed(4)}, {lng.toFixed(4)}</div>
      </div>
      <div style={{ height: 320, borderRadius: 18, overflow: "hidden" }}>
        <LeafletMap lat={lat} lng={lng} zoom={zoom} tileUrl={tileUrl} tileAttribution={tileAttribution} label={label} />
      </div>
    </div>
  );
}
