import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { PropertyMap } from "@/components/map/property-map";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyGallery } from "@/components/property/property-gallery";
import { VideoEmbed } from "@/components/property/video-embed";
import { getPropertyBySlug, getRelatedProperties } from "@/lib/site-data";
import { getMapSettings } from "@/lib/settings";
import { BedDouble, Bath, Ruler, Building2, Layers, Car, Fence, Home, CheckCircle2, Waves, ArrowUpDown, Flame, Snowflake, Heater } from "lucide-react";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};
  return {
    title: property.metaTitle ?? `${property.title} — Real Estate Index`,
    description: property.metaDescription ?? property.shortDescription ?? property.description.slice(0, 160),
  };
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) return notFound();

  const [related, mapSettings] = await Promise.all([
    getRelatedProperties(property.slug, property.city),
    getMapSettings(),
  ]);

  return (
    <main>
      {/* ── Full-width Gallery Hero ───────────────────────────── */}
      <PropertyGallery title={property.title} images={property.images} />

      {/* ── Property Header: title + price + specs ────────────── */}
      <section className="sp-header-section">
        <div className="container">
          <div className="sp-header">
            <div className="sp-header-left">
              {property.propertyType && (
                <span className="sp-badge">{property.propertyType}</span>
              )}
              <h1 className="sp-title">{property.title}</h1>
              <p className="sp-address">{property.address}, {property.city}</p>
              {property.project && (
                <p className="sp-project-link">
                  Part of{" "}
                  <Link href={`/projects/${property.project.slug}`}>
                    {property.project.title}
                  </Link>
                </p>
              )}
            </div>
            <div className="sp-header-right">
              <div className="sp-price">&euro;{Number(property.price).toLocaleString()}</div>
              <div className="sp-specs-row">
                <div className="sp-spec">
                  <strong>{property.bedrooms ?? "-"}</strong>
                  <span>Beds</span>
                </div>
                <div className="sp-spec">
                  <strong>{property.bathrooms ?? "-"}</strong>
                  <span>Bath</span>
                </div>
                <div className="sp-spec">
                  <strong>{property.areaSqm ?? "-"}</strong>
                  <span>sqm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Website Banner ────────────────────────────────────── */}
      {property.websiteUrl && (
        <div className="container" style={{ marginTop: -16 }}>
          <a
            href={property.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="website-banner"
          >
            <span className="website-banner-text">Visit Property Website</span>
            <span className="website-banner-arrow">&#8599;</span>
          </a>
        </div>
      )}

      {/* ── Two-column content ────────────────────────────────── */}
      <section style={{ padding: "24px 0 72px" }}>
        <div className="container">
          <div className="sp-content-grid">
            {/* LEFT COLUMN */}
            <div className="sp-main">
              {/* Detail & Features */}
              <div className="sp-section-card">
                <h2 className="sp-section-title">Detail &amp; Features</h2>
                <div className="sp-features-grid">
                  <div className="sp-feature"><span><BedDouble size={18} className="sp-feat-icon" />Bedrooms</span><strong>{property.bedrooms ?? "-"} Beds</strong></div>
                  <div className="sp-feature"><span><Bath size={18} className="sp-feat-icon" />Bathrooms</span><strong>{property.bathrooms ?? "-"} Bath</strong></div>
                  <div className="sp-feature"><span><Ruler size={18} className="sp-feat-icon" />Area</span><strong>{property.areaSqm ?? "-"} sqm</strong></div>
                  {property.unitNumber && <div className="sp-feature"><span><Building2 size={18} className="sp-feat-icon" />Unit</span><strong>{property.unitNumber}</strong></div>}
                  {property.floor != null && <div className="sp-feature"><span><Layers size={18} className="sp-feat-icon" />Floor</span><strong>{property.floor}</strong></div>}
                  <div className="sp-feature"><span><Car size={18} className="sp-feat-icon" />Parking</span><strong>{property.parking ? "Yes" : "No"}</strong></div>
                  <div className="sp-feature"><span><Fence size={18} className="sp-feat-icon" />Balcony</span><strong>{property.balcony ? "Yes" : "No"}</strong></div>
                  <div className="sp-feature"><span><Waves size={18} className="sp-feat-icon" />Swimming Pool</span><strong>{property.swimmingPool ? "Yes" : "No"}</strong></div>
                  <div className="sp-feature"><span><ArrowUpDown size={18} className="sp-feat-icon" />Elevator</span><strong>{property.elevator ? "Yes" : "No"}</strong></div>
                  <div className="sp-feature"><span><Flame size={18} className="sp-feat-icon" />Fireplace</span><strong>{property.fireplace ? "Yes" : "No"}</strong></div>
                  {property.coolingType && <div className="sp-feature"><span><Snowflake size={18} className="sp-feat-icon" />Cooling</span><strong>{property.coolingType}</strong></div>}
                  {property.heatingType && <div className="sp-feature"><span><Heater size={18} className="sp-feat-icon" />Heating</span><strong>{property.heatingType}</strong></div>}
                  {property.propertyType && <div className="sp-feature"><span><Home size={18} className="sp-feat-icon" />Type</span><strong>{property.propertyType}</strong></div>}
                  <div className="sp-feature"><span><CheckCircle2 size={18} className="sp-feat-icon" />Status</span><strong>{property.sold ? "Sold" : property.status}</strong></div>
                </div>
              </div>

              {/* Description */}
              <div className="sp-section-card">
                <h2 className="sp-section-title">Description</h2>
                {property.shortDescription && (
                  <p style={{ fontWeight: 500, marginBottom: 12 }}>{property.shortDescription}</p>
                )}
                <p className="sp-description">{property.description}</p>
              </div>

              {/* Video */}
              {property.videoUrl && (
                <div className="sp-section-card">
                  <h2 className="sp-section-title">Property Video</h2>
                  <VideoEmbed url={property.videoUrl} />
                </div>
              )}

              {/* Map */}
              <div className="sp-section-card">
                <h2 className="sp-section-title">Property Location</h2>
                <PropertyMap
                  lat={property.latitude}
                  lng={property.longitude}
                  zoom={mapSettings.defaultZoom}
                  tileUrl={mapSettings.tileUrl}
                  tileAttribution={mapSettings.tileAttribution}
                  label={property.title}
                  address={`${property.address}, ${property.city}`}
                  bare
                />
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="sp-sidebar">
              <InquiryForm propertyId={property.id} propertyTitle={property.title} />
              <div className="sp-seller-card">
                <h3 className="sp-seller-card-title">Seller</h3>
                <div className="sp-seller-card-name">{property.sellerName}</div>
                <div className="sp-seller-card-row">{property.sellerPhone}</div>
                <div className="sp-seller-card-row">{property.sellerEmail}</div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Related Properties ────────────────────────────────── */}
      {related.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-header">
              <p className="eyebrow">Similar properties</p>
              <h2>You May Also Like</h2>
            </div>
            <div className="grid grid-3">
              {related.map((item) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
