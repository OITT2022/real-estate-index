import type { Metadata } from "next";
import { MapExplorer } from "@/components/map/map-explorer";
import { getMapPageData } from "@/lib/site-data";
import { getMapSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Map — Real Estate Index",
  description: "Browse projects and properties on an interactive map.",
};

export default async function MapPage() {
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
