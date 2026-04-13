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
  city?: string;
  address?: string;
};

export function LocationPicker({ lat, lng, onLatChange, onLngChange, city, address }: Props) {
  const [localLat, setLocalLat] = useState(lat);
  const [localLng, setLocalLng] = useState(lng);
  const [geocoding, setGeocoding] = useState(false);

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

  async function handleGeocode() {
    if (!city && !address) return;
    setGeocoding(true);
    try {
      const q = [address, city].filter(Boolean).join(", ");
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        const newLat = Math.round(parseFloat(data[0].lat) * 10000) / 10000;
        const newLng = Math.round(parseFloat(data[0].lon) * 10000) / 10000;
        setLocalLat(newLat);
        setLocalLng(newLng);
        onLatChange(newLat);
        onLngChange(newLng);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    } finally {
      setGeocoding(false);
    }
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
      {(city || address) && (
        <div
          onClick={handleGeocode}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            background: "#f0f9ff",
            borderRadius: 8,
            cursor: geocoding ? "wait" : "pointer",
            fontSize: "0.85rem",
            color: "#0369a1",
            border: "1px solid #bae6fd",
          }}
          title="Click to look up coordinates for this address"
        >
          <span style={{ fontSize: "1rem" }}>&#x1F4CD;</span>
          <span style={{ textDecoration: "underline" }}>
            {[address, city].filter(Boolean).join(", ")}
          </span>
          {geocoding && <span style={{ marginLeft: "auto", fontSize: "0.8rem", opacity: 0.7 }}>Looking up...</span>}
        </div>
      )}
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
