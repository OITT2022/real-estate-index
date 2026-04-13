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

// ── Page Content Settings ────────────────────────────────────

const ABOUT_KEYS = [
  "about_title", "about_subtitle", "about_eyebrow", "about_heading",
  "about_text1", "about_text2", "about_image",
  "about_stat1_value", "about_stat1_label",
  "about_stat2_value", "about_stat2_label",
  "about_stat3_value", "about_stat3_label",
  "about_section2_eyebrow", "about_section2_heading", "about_section2_intro",
  "about_card1_title", "about_card1_text",
  "about_card2_title", "about_card2_text",
  "about_card3_title", "about_card3_text",
] as const;

const CONTACT_KEYS = [
  "contact_title", "contact_subtitle",
  "contact_form_heading", "contact_form_intro",
  "contact_info_heading", "contact_info_intro",
  "contact_office", "contact_email", "contact_phone",
  "contact_image",
] as const;

export type AboutContent = Record<(typeof ABOUT_KEYS)[number], string>;
export type ContactContent = Record<(typeof CONTACT_KEYS)[number], string>;

const ABOUT_DEFAULTS: AboutContent = {
  about_title: "About Us",
  about_subtitle: "Your trusted platform for premium real estate listings.",
  about_eyebrow: "Who we are",
  about_heading: "Making Real Estate Simple & Transparent",
  about_text1: "Real Estate Index is a premium platform built for property professionals and buyers who want a clean, modern experience. We make it easy to browse verified listings, explore developments, and connect directly with sellers.",
  about_text2: "Our mission is to bring transparency and simplicity to the real estate market. Every listing on our platform is curated for quality, with comprehensive details, professional imagery, and direct contact information.",
  about_image: "/about-illustration.png",
  about_stat1_value: "500+", about_stat1_label: "Properties Listed",
  about_stat2_value: "50+", about_stat2_label: "Cities Covered",
  about_stat3_value: "1000+", about_stat3_label: "Happy Clients",
  about_section2_eyebrow: "Why choose us",
  about_section2_heading: "What Sets Us Apart",
  about_section2_intro: "We focus on quality over quantity, ensuring every listing meets our standards.",
  about_card1_title: "Verified Listings", about_card1_text: "Every property is reviewed and verified before it goes live on our platform.",
  about_card2_title: "Rich Media", about_card2_text: "Professional photos, video tours, and interactive maps for every property.",
  about_card3_title: "Direct Contact", about_card3_text: "Connect directly with property sellers through our secure inquiry system.",
};

const CONTACT_DEFAULTS: ContactContent = {
  contact_title: "Contact Us",
  contact_subtitle: "We'd love to hear from you. Get in touch with our team.",
  contact_form_heading: "Send Us a Message",
  contact_form_intro: "Fill in the form below and we'll get back to you as soon as possible.",
  contact_info_heading: "Get In Touch",
  contact_info_intro: "Whether you have a question about listings, pricing, or anything else, our team is ready to answer all your questions.",
  contact_office: "Cyprus",
  contact_email: "info@aradre.com",
  contact_phone: "+357 99 123 456",
  contact_image: "/contact-illustration.png",
};

export async function getAboutContent(): Promise<AboutContent> {
  const settings = await db.siteSetting.findMany({ where: { key: { in: [...ABOUT_KEYS] } } });
  const map = new Map(settings.map((s) => [s.key, s.value]));
  const result = { ...ABOUT_DEFAULTS };
  for (const key of ABOUT_KEYS) {
    if (map.has(key)) (result as Record<string, string>)[key] = map.get(key)!;
  }
  return result;
}

export async function getContactContent(): Promise<ContactContent> {
  const settings = await db.siteSetting.findMany({ where: { key: { in: [...CONTACT_KEYS] } } });
  const map = new Map(settings.map((s) => [s.key, s.value]));
  const result = { ...CONTACT_DEFAULTS };
  for (const key of CONTACT_KEYS) {
    if (map.has(key)) (result as Record<string, string>)[key] = map.get(key)!;
  }
  return result;
}

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
