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
  const settings = await db.siteSetting.findMany({
    where: { key: { in: ["map_tile_layer", "map_default_zoom", "map_default_lat", "map_default_lng"] } },
  });

  const map = new Map(settings.map((s) => [s.key, s.value]));
  const layerKey = (map.get("map_tile_layer") ?? "osm") as TileLayerKey;
  const layer = MAP_TILE_LAYERS[layerKey] ?? MAP_TILE_LAYERS.osm;

  return {
    tileLayerKey: layerKey,
    tileUrl: layer.url,
    tileAttribution: layer.attribution,
    defaultZoom: Number(map.get("map_default_zoom") ?? 15),
    defaultLat: Number(map.get("map_default_lat") ?? 32.0853),
    defaultLng: Number(map.get("map_default_lng") ?? 34.7818),
  };
}
