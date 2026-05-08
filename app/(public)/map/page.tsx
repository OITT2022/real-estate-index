import type { Metadata } from "next";
import Link from "next/link";
import { FilterBar } from "@/components/property/filter-bar";
import { MapExplorer } from "@/components/map/map-explorer";
import {
  getMapPageData,
  getDistinctCities,
  getDistinctPropertyTypes,
} from "@/lib/site-data";
import { getMapSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Map — Real Estate Index",
  description: "Browse projects and properties on an interactive map.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MapPage({ searchParams }: Props) {
  const params = await searchParams;

  const city = typeof params.city === "string" ? params.city : undefined;
  const propertyType = typeof params.propertyType === "string" ? params.propertyType : undefined;
  const bedrooms = typeof params.bedrooms === "string" ? Number(params.bedrooms) : undefined;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;

  const [{ projects, properties }, cities, propertyTypes, mapSettings] = await Promise.all([
    getMapPageData({ city, propertyType, bedrooms, minPrice, maxPrice }),
    getDistinctCities(),
    getDistinctPropertyTypes(),
    getMapSettings(),
  ]);

  return (
    <main className="map-page">
      <div className="page-hero map-page-hero">
        <div className="container">
          <div className="page-hero-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Map</span>
          </div>
          <h1>Browse on the Map</h1>
          <p>{projects.length} projects and {properties.length} standalone properties.</p>
        </div>
      </div>

      <section className="map-page-filter">
        <div className="container">
          <FilterBar cities={cities} propertyTypes={propertyTypes} target="/map" />
        </div>
      </section>

      <section className="map-page-explorer">
        <MapExplorer
          projects={projects}
          properties={properties}
          tileUrl={mapSettings.tileUrl}
          tileAttribution={mapSettings.tileAttribution}
          defaultLat={mapSettings.defaultLat}
          defaultLng={mapSettings.defaultLng}
          defaultZoom={mapSettings.defaultZoom}
        />
      </section>
    </main>
  );
}
