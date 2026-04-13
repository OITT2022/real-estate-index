"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

type Props = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
};

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const initial = useRef(true);
  useEffect(() => {
    if (initial.current) { initial.current = false; return; }
    map.flyTo([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapPicker({ lat, lng, onChange }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", borderRadius: 14 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={icon} />
      <RecenterMap lat={lat} lng={lng} />
      <ClickHandler onChange={onChange} />
    </MapContainer>
  );
}
