import { setRequestLocale, getTranslations } from "next-intl/server";
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
import { getHomepageContent } from "@/lib/settings";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ params: paramsPromise, searchParams }: Props) {
  const { locale } = await paramsPromise;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const params = await searchParams;

  const city = typeof params.city === "string" ? params.city : undefined;
  const propertyType = typeof params.propertyType === "string" ? params.propertyType : undefined;
  const bedrooms = typeof params.bedrooms === "string" ? Number(params.bedrooms) : undefined;
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : undefined;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : undefined;

  const hasFilters = city || propertyType || bedrooms || minPrice || maxPrice;

  const [properties, featured, projects, heroImages, cities, propertyTypes, homepage] = await Promise.all([
    searchProperties({ city, propertyType, bedrooms, minPrice, maxPrice }, locale),
    hasFilters ? Promise.resolve([]) : getFeaturedProperties(locale),
    hasFilters ? Promise.resolve([]) : getPublishedProjects(locale),
    getActiveHeroImages(),
    getDistinctCities(),
    getDistinctPropertyTypes(),
    getHomepageContent(locale),
  ]);

  return (
    <main>
      {/* ── Full-Width Hero ──────────────────────────────────── */}
      <HeroSlideshow images={heroImages}>
        <div className="hero-search-card">
          <h1>{t("heroTitle")}</h1>
          <p className="muted">{t("heroSubtitle")}</p>
          <FilterBar cities={cities} propertyTypes={propertyTypes} />
          <div className="hero-search-stats">
            <div className="hero-search-stat">
              <strong>{properties.length}</strong>
              <span>{hasFilters ? t("statsMatching") : t("statsProperties")}</span>
            </div>
            <div className="hero-search-stat">
              <strong>{cities.length}</strong>
              <span>{t("statsCities")}</span>
            </div>
            {!hasFilters && featured.length > 0 && (
              <div className="hero-search-stat">
                <strong>{featured.length}</strong>
                <span>{t("statsFeatured")}</span>
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
              <p className="eyebrow">{homepage.homepage_how_eyebrow}</p>
              <h2>{homepage.homepage_how_heading}</h2>
              <p>{homepage.homepage_how_intro}</p>
            </div>
            <div className="how-it-works-grid">
              <div className="how-it-works-card">
                <div className="how-it-works-icon">&#127968;</div>
                <h3>{homepage.homepage_card1_title}</h3>
                <p>{homepage.homepage_card1_text}</p>
              </div>
              <div className="how-it-works-card">
                <div className="how-it-works-icon">&#128269;</div>
                <h3>{homepage.homepage_card2_title}</h3>
                <p>{homepage.homepage_card2_text}</p>
              </div>
              <div className="how-it-works-card">
                <div className="how-it-works-icon">&#128274;</div>
                <h3>{homepage.homepage_card3_title}</h3>
                <p>{homepage.homepage_card3_text}</p>
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
              <p className="eyebrow">{t("featuredEyebrow")}</p>
              <h2>{t("featuredHeading")}</h2>
              <p>{t("featuredIntro")}</p>
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
              <p className="eyebrow">{t("projectsEyebrow")}</p>
              <h2>{t("projectsHeading")}</h2>
              <p>{t("projectsIntro")}</p>
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
            <p className="eyebrow">{hasFilters ? t("searchEyebrow") : t("allEyebrow")}</p>
            <h2>{hasFilters ? t("searchHeading") : t("allHeading")}</h2>
          </div>
          {properties.length > 0 ? (
            <div className="grid grid-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <p className="muted" style={{ textAlign: "center" }}>
              {hasFilters ? t("noMatches") : t("noProperties")}
            </p>
          )}
        </div>
      </section>

    </main>
  );
}
