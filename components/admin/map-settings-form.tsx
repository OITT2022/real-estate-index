"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveMapSettings } from "@/lib/actions";

type Props = {
  currentLayer: string;
  defaultZoom: number;
  defaultLat: number;
  defaultLng: number;
  layers: { key: string; name: string }[];
};

export function MapSettingsForm({ currentLayer, defaultZoom, defaultLat, defaultLng, layers }: Props) {
  const router = useRouter();
  const [layer, setLayer] = useState(currentLayer);
  const [zoom, setZoom] = useState(defaultZoom);
  const [lat, setLat] = useState(defaultLat);
  const [lng, setLng] = useState(defaultLng);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await saveMapSettings({ tileLayer: layer, defaultZoom: zoom, defaultLat: lat, defaultLng: lng });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: 640 }}>
      <div className="card" style={{ display: "grid", gap: 20 }}>
        <div>
          <p className="eyebrow">Tile Layer</p>
          <p className="muted">Choose the map style used on all property pages.</p>
        </div>

        <div className="tile-layer-grid">
          {layers.map((l) => (
            <label
              key={l.key}
              className={`tile-layer-option${layer === l.key ? " tile-layer-active" : ""}`}
            >
              <input
                type="radio"
                name="tileLayer"
                value={l.key}
                checked={layer === l.key}
                onChange={() => setLayer(l.key)}
                style={{ display: "none" }}
              />
              <span className="tile-layer-name">{l.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card" style={{ display: "grid", gap: 16 }}>
        <div>
          <p className="eyebrow">Default Map View</p>
          <p className="muted">Set the default center and zoom level for maps.</p>
        </div>
        <div className="admin-form-grid">
          <label>
            <span>Default Latitude</span>
            <input type="number" step="any" value={lat} onChange={(e) => setLat(Number(e.target.value))} />
          </label>
          <label>
            <span>Default Longitude</span>
            <input type="number" step="any" value={lng} onChange={(e) => setLng(Number(e.target.value))} />
          </label>
          <label>
            <span>Default Zoom (1-18)</span>
            <input type="number" min={1} max={18} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
          </label>
        </div>
      </div>

      <div className="admin-actions">
        <button type="submit" className="button-primary" disabled={saving}>
          {saving ? "Saving..." : "Save map settings"}
        </button>
        {saved && <span style={{ color: "var(--accent)", alignSelf: "center" }}>Settings saved!</span>}
      </div>
    </form>
  );
}
