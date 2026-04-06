import { PropertyCard } from "@/components/property/property-card";
import { ProjectCard } from "@/components/project/project-card";
import { FilterBar } from "@/components/property/filter-bar";
import { HeroSlideshow } from "@/components/property/hero-slideshow";
import {
  getFeaturedProperties,
  getPublishedProjects,
  getActiveHeroImages,
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

  const [properties, featured, projects, heroImages, cities, propertyTypes] = await Promise.all([
    searchProperties({ city, propertyType, bedrooms, minPrice, maxPrice }),
    hasFilters ? Promise.resolve([]) : getFeaturedProperties(),
    hasFilters ? Promise.resolve([]) : getPublishedProjects(),
    getActiveHeroImages(),
    getDistinctCities(),
    getDistinctPropertyTypes(),
  ]);

  const fallbackImages = [
    { id: "fallback-1", url: "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?w=1400&q=80", altText: "Beautiful coastline" },
  ];

  const slideshowImages = heroImages.length > 0 ? heroImages : fallbackImages;

  return (
    <main>
      {/* ── Full-Width Hero ──────────────────────────────────── */}
      <HeroSlideshow images={slideshowImages}>
        <div className="hero-search-card">
          <h1>Find Your Dream Property</h1>
          <p className="muted">
            Browse our curated collection of premium real estate listings across Cyprus.
          </p>
          <FilterBar cities={cities} propertyTypes={propertyTypes} />
          <div className="hero-search-stats">
            <div className="hero-search-stat">
              <strong>{properties.length}</strong>
              <span>{hasFilters ? "Matching" : "Properties"}</span>
            </div>
            <div className="hero-search-stat">
              <strong>{cities.length}</strong>
              <span>Cities</span>
            </div>
            {!hasFilters && featured.length > 0 && (
              <div className="hero-search-stat">
                <strong>{featured.length}</strong>
                <span>Featured</span>
              </div>
            )}
          </div>
        </div>
      </HeroSlideshow>

      {/* ── How It Works ─────────────────────────────────────── */}
      {!hasFilters && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <p className="eyebrow">How it works</p>
              <h2>Find Your Home in 3 Steps</h2>
              <p>We make the property search simple, transparent, and enjoyable from start to finish.</p>
            </div>
            <div className="how-it-works-grid">
              <div className="how-it-works-card">
                <div className="how-it-works-icon">&#127968;</div>
                <h3>Browse Properties</h3>
                <p>Explore our curated listings with detailed photos, specs, and location data for every property.</p>
              </div>
              <div className="how-it-works-card">
                <div className="how-it-works-icon">&#128269;</div>
                <h3>Compare &amp; Choose</h3>
                <p>Use our filters to narrow down your perfect match by location, size, price, and features.</p>
              </div>
              <div className="how-it-works-card">
                <div className="how-it-works-icon">&#128274;</div>
                <h3>Contact the Seller</h3>
                <p>Send inquiries directly to property sellers through our secure contact forms.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Listings ────────────────────────────────── */}
      {featured.length > 0 && !hasFilters && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-header">
              <p className="eyebrow">Featured listings</p>
              <h2>Handpicked Properties</h2>
              <p>Our top selections, curated for quality and value.</p>
            </div>
            <div className="grid grid-3">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Projects ─────────────────────────────────────────── */}
      {projects.length > 0 && !hasFilters && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-header">
              <p className="eyebrow">Development projects</p>
              <h2>New Developments</h2>
              <p>Explore exciting real estate developments in progress.</p>
            </div>
            <div className="grid grid-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── All Properties / Search Results ──────────────────── */}
      <section className="section" style={{ paddingTop: hasFilters ? undefined : 0 }}>
        <div className="container">
          <div className="section-header">
            <p className="eyebrow">{hasFilters ? "Search results" : "All properties"}</p>
            <h2>{hasFilters ? "Properties Matching Your Search" : "Explore All Listings"}</h2>
          </div>
          {properties.length > 0 ? (
            <div className="grid grid-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <p className="muted" style={{ textAlign: "center" }}>
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
