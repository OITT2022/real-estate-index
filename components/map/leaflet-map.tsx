"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Props = {
  lat: number;
  lng: number;
  zoom?: number;
  tileUrl?: string;
  tileAttribution?: string;
  label?: string;
};

export default function LeafletMap({ lat, lng, zoom, tileUrl, tileAttribution, label }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom ?? 15}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%", borderRadius: 18 }}
    >
      <TileLayer
        attribution={tileAttribution ?? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}
        url={tileUrl ?? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
      />
      <Marker position={[lat, lng]} icon={icon}>
        {label && <Popup>{label}</Popup>}
      </Marker>
    </MapContainer>
  );
}
