import { PropertyCard } from "@/components/property/property-card";
import { FilterBar } from "@/components/property/filter-bar";
import {
  getFeaturedProperties,
  searchProperties,
  getDistinctCities,
  getDistinctPropertyTypes,
} from "@/lib/site-data";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: Props) {
  const params = await searchParams;

  const city = typeof params.city === "string" ? params.city : undefined;
  const propertyType = typeof params.propertyType === "string" ? params.propertyType : undefined;
  const bedrooms = typeof params.bedrooms === "string" ? Number(params.bedrooms) : undefined;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;

  const hasFilters = city || propertyType || bedrooms || minPrice || maxPrice;

  const [properties, featured, cities, propertyTypes] = await Promise.all([
    searchProperties({ city, propertyType, bedrooms, minPrice, maxPrice }),
    hasFilters ? Promise.resolve([]) : getFeaturedProperties(),
    getDistinctCities(),
    getDistinctPropertyTypes(),
  ]);

  return (
    <main>
      <section className="section">
        <div className="container hero-panel">
          <div className="hero-copy">
            <p className="eyebrow">Real estate index</p>
            <h1>Market all your properties in one premium website.</h1>
            <p className="muted">
              Browse our curated collection of premium real estate listings.
              Every property is verified and ready for viewing.
            </p>

            <FilterBar cities={cities} propertyTypes={propertyTypes} />

            <div className="hero-stats">
              <div className="stat-box">
                <strong>{properties.length}</strong>
                <p className="muted">{hasFilters ? "Matching properties" : "Published properties"}</p>
              </div>
              {!hasFilters && (
                <div className="stat-box">
                  <strong>{featured.length}</strong>
                  <p className="muted">Featured listings</p>
                </div>
              )}
            </div>
          </div>

          <aside className="hero-side hero-image-side">
            <img
              src="https://images.unsplash.com/photo-1580137189272-c9379f8864fd?w=800&q=80"
              alt="Cyprus coastline with crystal clear sea"
              className="hero-cover"
            />
          </aside>
        </div>
      </section>

      {featured.length > 0 && !hasFilters && (
        <section className="section">
          <div className="container">
            <p className="eyebrow">Featured listings</p>
            <div className="grid grid-3">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <p className="eyebrow">{hasFilters ? "Search results" : "All properties"}</p>
          {properties.length > 0 ? (
            <div className="grid grid-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <p className="muted">
              {hasFilters
                ? "No properties match your filters. Try adjusting your search."
                : "No properties available yet."}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
