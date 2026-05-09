import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { MapExplorer } from "@/components/map/map-explorer";
import { getMapPageData } from "@/lib/site-data";
import { getMapSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "map" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function MapPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [{ projects, properties }, mapSettings] = await Promise.all([
    getMapPageData({}),
    getMapSettings(),
  ]);

  return (
    <main className="map-page-fullscreen">
      <MapExplorer
        projects={projects}
        properties={properties}
        tileUrl={mapSettings.tileUrl}
        tileAttribution={mapSettings.tileAttribution}
        defaultLat={mapSettings.defaultLat}
        defaultLng={mapSettings.defaultLng}
        defaultZoom={mapSettings.defaultZoom}
      />
    </main>
  );
}
