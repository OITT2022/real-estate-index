"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import type { MapPropertyPoint, MapProjectPoint } from "@/lib/site-data";
import { formatCompactPrice } from "@/lib/format";

type LatLngBoundsLiteral = {
  north: number;
  south: number;
  east: number;
  west: number;
};

type Props = {
  projects: MapProjectPoint[];
  properties: MapPropertyPoint[];
  tileUrl: string;
  tileAttribution: string;
  defaultLat: number;
  defaultLng: number;
  defaultZoom: number;
  onBoundsChange?: (bounds: LatLngBoundsLiteral) => void;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function priceIcon(label: string): L.DivIcon {
  const html = `<div class="map-price-pill">${escapeHtml(label)}</div>`;
  return L.divIcon({
    html,
    className: "map-divicon",
    iconSize: [80, 30],
    iconAnchor: [40, 30],
    popupAnchor: [0, -30],
  });
}

function projectIcon(initial: string): L.DivIcon {
  const html = `<div class="map-project-marker"><span>${escapeHtml(initial)}</span></div>`;
  return L.divIcon({
    html,
    className: "map-divicon",
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44],
  });
}

function BoundsReporter({ onBoundsChange }: { onBoundsChange?: (b: LatLngBoundsLiteral) => void }) {
  const map = useMapEvents({
    moveend() {
      if (!onBoundsChange) return;
      const b = map.getBounds();
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    },
  });
  // Emit initial bounds once on mount.
  const reportedRef = useRef(false);
  useEffect(() => {
    if (reportedRef.current || !onBoundsChange) return;
    reportedRef.current = true;
    const b = map.getBounds();
    onBoundsChange({
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    });
  }, [map, onBoundsChange]);
  return null;
}

export default function MapCanvas({
  projects,
  properties,
  tileUrl,
  tileAttribution,
  defaultLat,
  defaultLng,
  defaultZoom,
  onBoundsChange,
}: Props) {
  // If we have any markers, fit the map view to them; else use defaults.
  const initialView = useMemo(() => {
    const points: [number, number][] = [
      ...projects.map((p) => [p.latitude, p.longitude] as [number, number]),
      ...properties.map((p) => [p.latitude, p.longitude] as [number, number]),
    ];
    if (points.length === 0) {
      return { center: [defaultLat, defaultLng] as [number, number], zoom: defaultZoom };
    }
    const lats = points.map((p) => p[0]);
    const lngs = points.map((p) => p[1]);
    const center: [number, number] = [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ];
    return { center, zoom: defaultZoom };
  }, [projects, properties, defaultLat, defaultLng, defaultZoom]);

  return (
    <MapContainer
      center={initialView.center}
      zoom={initialView.zoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer attribution={tileAttribution} url={tileUrl} />
      <BoundsReporter onBoundsChange={onBoundsChange} />

      {projects.map((project) => (
        <Marker
          key={project.id}
          position={[project.latitude, project.longitude]}
          icon={projectIcon(project.title.charAt(0).toUpperCase() || "P")}
        >
          <Popup>
            <div className="map-popup">
              {project.image && (
                <img
                  src={project.image.url}
                  alt={project.image.altText ?? project.title}
                  className="map-popup-image"
                />
              )}
              <div className="map-popup-body">
                <p className="map-popup-eyebrow">Project · {project.city}</p>
                <h4>{project.title}</h4>
                <p className="map-popup-meta">{project.developerName}</p>
                <p className="map-popup-meta">
                  {project.propertyCount} unit{project.propertyCount === 1 ? "" : "s"}
                  {project.totalUnits ? ` · ${project.totalUnits} total` : ""}
                </p>
                <a className="map-popup-link" href={`/projects/${project.slug}`}>
                  View project →
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude, property.longitude]}
          icon={priceIcon(formatCompactPrice(property.price, property.currency))}
        >
          <Popup>
            <div className="map-popup">
              {property.image && (
                <img
                  src={property.image.url}
                  alt={property.image.altText ?? property.title}
                  className="map-popup-image"
                />
              )}
              <div className="map-popup-body">
                <p className="map-popup-price">
                  {formatCompactPrice(property.price, property.currency)}
                </p>
                <h4>{property.title}</h4>
                <p className="map-popup-meta">{property.address}, {property.city}</p>
                <p className="map-popup-meta">
                  {property.bedrooms != null ? `${property.bedrooms} beds` : "—"}
                  {property.floor != null ? ` · floor ${property.floor}` : ""}
                  {property.areaSqm != null ? ` · ${property.areaSqm} sqm` : ""}
                </p>
                <a className="map-popup-link" href={`/properties/${property.slug}`}>
                  View property →
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
