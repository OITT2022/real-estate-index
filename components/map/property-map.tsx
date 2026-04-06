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
  address?: string;
  /** When true, the component renders without its own card wrapper */
  bare?: boolean;
};

export function PropertyMap({ lat, lng, zoom, tileUrl, tileAttribution, label, address, bare }: PropertyMapProps) {
  const mapContent = (
    <>
      <div className="map-header-row">
        <div>
          <h3>{bare ? undefined : "Location"}</h3>
        </div>
        {address ? (
          <div className="map-coordinates">{address}</div>
        ) : (
          <div className="map-coordinates">{lat.toFixed(4)}, {lng.toFixed(4)}</div>
        )}
      </div>
      <div style={{ height: 320, borderRadius: 18, overflow: "hidden" }}>
        <LeafletMap lat={lat} lng={lng} zoom={zoom} tileUrl={tileUrl} tileAttribution={tileAttribution} label={label} />
      </div>
    </>
  );

  if (bare) return mapContent;

  return (
    <div className="card map-card">
      {mapContent}
    </div>
  );
}
