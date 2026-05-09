import { db } from "@/lib/db";
import { translateList } from "@/lib/translation/get";

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

const HOMEPAGE_KEYS = [
  "homepage_how_eyebrow", "homepage_how_heading", "homepage_how_intro",
  "homepage_card1_title", "homepage_card1_text",
  "homepage_card2_title", "homepage_card2_text",
  "homepage_card3_title", "homepage_card3_text",
] as const;

export type AboutContent = Record<(typeof ABOUT_KEYS)[number], string>;
export type ContactContent = Record<(typeof CONTACT_KEYS)[number], string>;
export type HomepageContent = Record<(typeof HOMEPAGE_KEYS)[number], string>;

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

const HOMEPAGE_DEFAULTS: HomepageContent = {
  homepage_how_eyebrow: "How it works",
  homepage_how_heading: "Find Your Home in 3 Steps",
  homepage_how_intro: "We make the property search simple, transparent, and enjoyable from start to finish.",
  homepage_card1_title: "Browse Properties",
  homepage_card1_text: "Explore our curated listings with detailed photos, specs, and location data for every property.",
  homepage_card2_title: "Compare & Choose",
  homepage_card2_text: "Use our filters to narrow down your perfect match by location, size, price, and features.",
  homepage_card3_title: "Contact the Seller",
  homepage_card3_text: "Send inquiries directly to property sellers through our secure contact forms.",
};

export const ALL_PAGE_DEFAULTS: Record<string, string> = {
  ...ABOUT_DEFAULTS,
  ...CONTACT_DEFAULTS,
  ...HOMEPAGE_DEFAULTS,
};

/**
 * Translates a flat string→string content map (e.g. AboutContent). Each
 * key becomes its own Translation row with entityType="site_setting" and
 * entityId=key, so admin overrides apply at the same key granularity.
 */
async function translateContentMap<T extends Record<string, string>>(
  content: T,
  locale: string,
  excludeKeys: ReadonlySet<string> = new Set(),
): Promise<T> {
  // translateList expects a list of objects keyed by `id`; reshape one
  // entity-per-key, then fold the result back into a flat object.
  const rows = Object.entries(content)
    .filter(([k]) => !excludeKeys.has(k))
    .map(([key, value]) => ({ id: key, value }));
  const translated = await translateList(rows, {
    entityType: "site_setting",
    fields: ["value"],
  }, locale);

  const out = { ...content };
  for (const r of translated) (out as Record<string, string>)[r.id] = r.value;
  return out;
}

// Stat values that are computed at runtime — never translated.
const ABOUT_NON_TRANSLATABLE = new Set<string>([
  "about_image",
  "about_stat1_value",
  "about_stat2_value",
  "about_stat3_value",
]);
const CONTACT_NON_TRANSLATABLE = new Set<string>([
  "contact_image",
  "contact_email",
  "contact_phone",
]);

export async function getAboutContent(locale?: string): Promise<AboutContent> {
  const [settings, propertyCount, distinctCities] = await Promise.all([
    db.siteSetting.findMany({ where: { key: { in: [...ABOUT_KEYS] } } }),
    db.property.count({ where: { published: true, status: "ACTIVE" } }),
    db.property.findMany({
      where: { published: true, status: "ACTIVE" },
      select: { city: true },
      distinct: ["city"],
    }),
  ]);
  const map = new Map(settings.map((s) => [s.key, s.value]));
  const result = { ...ABOUT_DEFAULTS };
  for (const key of ABOUT_KEYS) {
    if (map.has(key)) (result as Record<string, string>)[key] = map.get(key)!;
  }
  // Live-compute the first two stats from the database. The third
  // ("Happy Clients") has no DB source and stays admin-editable.
  result.about_stat1_value = String(propertyCount);
  result.about_stat2_value = String(distinctCities.length);
  if (!locale) return result;
  return translateContentMap(result, locale, ABOUT_NON_TRANSLATABLE);
}

export async function getContactContent(locale?: string): Promise<ContactContent> {
  const settings = await db.siteSetting.findMany({ where: { key: { in: [...CONTACT_KEYS] } } });
  const map = new Map(settings.map((s) => [s.key, s.value]));
  const result = { ...CONTACT_DEFAULTS };
  for (const key of CONTACT_KEYS) {
    if (map.has(key)) (result as Record<string, string>)[key] = map.get(key)!;
  }
  if (!locale) return result;
  return translateContentMap(result, locale, CONTACT_NON_TRANSLATABLE);
}

export async function getHomepageContent(locale?: string): Promise<HomepageContent> {
  const settings = await db.siteSetting.findMany({ where: { key: { in: [...HOMEPAGE_KEYS] } } });
  const map = new Map(settings.map((s) => [s.key, s.value]));
  const result = { ...HOMEPAGE_DEFAULTS };
  for (const key of HOMEPAGE_KEYS) {
    if (map.has(key)) (result as Record<string, string>)[key] = map.get(key)!;
  }
  if (!locale) return result;
  return translateContentMap(result, locale);
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
