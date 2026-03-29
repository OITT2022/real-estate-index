"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const MapPicker = dynamic(() => import("@/components/map/map-picker"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 300, borderRadius: 14, background: "linear-gradient(135deg, #dbeafe, #cffafe)", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
      Loading map...
    </div>
  ),
});

type Props = {
  lat: number;
  lng: number;
  onLatChange: (val: number) => void;
  onLngChange: (val: number) => void;
};

export function LocationPicker({ lat, lng, onLatChange, onLngChange }: Props) {
  const [localLat, setLocalLat] = useState(lat);
  const [localLng, setLocalLng] = useState(lng);

  function handleMapClick(newLat: number, newLng: number) {
    const roundedLat = Math.round(newLat * 10000) / 10000;
    const roundedLng = Math.round(newLng * 10000) / 10000;
    setLocalLat(roundedLat);
    setLocalLng(roundedLng);
    onLatChange(roundedLat);
    onLngChange(roundedLng);
  }

  function handleLatInput(val: number) {
    setLocalLat(val);
    onLatChange(val);
  }

  function handleLngInput(val: number) {
    setLocalLng(val);
    onLngChange(val);
  }

  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="eyebrow" style={{ margin: 0 }}>Location</p>
          <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>Click on the map to set coordinates</p>
        </div>
        <div className="map-coordinates">{localLat.toFixed(4)}, {localLng.toFixed(4)}</div>
      </div>
      <div style={{ height: 300, borderRadius: 14, overflow: "hidden" }}>
        <MapPicker lat={localLat} lng={localLng} onChange={handleMapClick} />
      </div>
      <div className="admin-form-grid">
        <label>
          <span>Latitude</span>
          <input
            type="number"
            step="any"
            value={localLat}
            onChange={(e) => handleLatInput(Number(e.target.value))}
            placeholder="34.9056"
          />
        </label>
        <label>
          <span>Longitude</span>
          <input
            type="number"
            step="any"
            value={localLng}
            onChange={(e) => handleLngInput(Number(e.target.value))}
            placeholder="33.6232"
          />
        </label>
      </div>
    </div>
  );
}
