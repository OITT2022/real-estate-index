import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { routing } from "@/i18n/routing";

/**
 * Emits one entry per (path × locale). `alternates.languages` makes the
 * sitemap also act as the hreflang map for crawlers, complementing the
 * `<link rel="alternate">` tags we render in app/[locale]/layout.tsx.
 */
export const dynamic = "force-dynamic";

const BASE = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

function localizedAlternates(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const locale of routing.locales) {
    out[locale] = `${BASE}/${locale}${path}`;
  }
  return out;
}

function entries(path: string, lastModified?: Date): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: `${BASE}/${locale}${path}`,
    lastModified,
    alternates: { languages: localizedAlternates(path) },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, projects] = await Promise.all([
    db.property.findMany({
      where: { published: true, status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
    db.project.findMany({
      where: { published: true, status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const out: MetadataRoute.Sitemap = [
    ...entries(""),
    ...entries("/projects"),
    ...entries("/about"),
    ...entries("/contact"),
    ...entries("/map"),
    ...properties.flatMap((p) => entries(`/properties/${p.slug}`, p.updatedAt)),
    ...projects.flatMap((p) => entries(`/projects/${p.slug}`, p.updatedAt)),
  ];
  return out;
}
