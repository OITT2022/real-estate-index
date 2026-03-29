import { db } from "@/lib/db";

export const MAP_TILE_LAYERS = {
  osm: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  cartodb_light: {
    name: "CartoDB Light",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  cartodb_dark: {
    name: "CartoDB Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  esri_satellite: {
    name: "Satellite (Esri)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
  },
  esri_topo: {
    name: "Topographic (Esri)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri, HERE, Garmin',
  },
  google_streets: {
    name: "Google Streets",
    url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    attribution: '&copy; Google',
  },
  google_satellite: {
    name: "Google Satellite",
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    attribution: '&copy; Google',
  },
  google_hybrid: {
    name: "Google Hybrid",
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attribution: '&copy; Google',
  },
} as const;

export type TileLayerKey = keyof typeof MAP_TILE_LAYERS;

export async function getMapSettings() {
  const [tileLayer, defaultZoom, defaultLat, defaultLng] = await Promise.all([
    db.siteSetting.findUnique({ where: { key: "map_tile_layer" } }),
    db.siteSetting.findUnique({ where: { key: "map_default_zoom" } }),
    db.siteSetting.findUnique({ where: { key: "map_default_lat" } }),
    db.siteSetting.findUnique({ where: { key: "map_default_lng" } }),
  ]);

  const layerKey = (tileLayer?.value ?? "osm") as TileLayerKey;
  const layer = MAP_TILE_LAYERS[layerKey] ?? MAP_TILE_LAYERS.osm;

  return {
    tileLayerKey: layerKey,
    tileUrl: layer.url,
    tileAttribution: layer.attribution,
    defaultZoom: Number(defaultZoom?.value ?? 15),
    defaultLat: Number(defaultLat?.value ?? 32.0853),
    defaultLng: Number(defaultLng?.value ?? 34.7818),
  };
}
