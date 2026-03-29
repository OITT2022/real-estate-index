import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { PropertyMap } from "@/components/map/property-map";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyGallery } from "@/components/property/property-gallery";
import { VideoEmbed } from "@/components/property/video-embed";
import { getPropertyBySlug, getRelatedProperties } from "@/lib/site-data";
import { getMapSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

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
    <main className="section">
      <div className="container property-hero">
        <div className="property-head">
          <div>
            <p className="eyebrow">{property.city}</p>
            <h1>{property.title}</h1>
            <p className="muted">{property.address}</p>
          </div>
          <div className="card">
            <p className="muted">Asking price</p>
            <div className="price-line">€{Number(property.price).toLocaleString()}</div>
          </div>
        </div>

        <PropertyGallery title={property.title} images={property.images} />

        {property.websiteUrl && (
          <a
            href={property.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="website-banner"
          >
            <span className="website-banner-text">Visit Property Website</span>
            <span className="website-banner-arrow">&#8599;</span>
          </a>
        )}

        <div className="details-grid">
          <section className="card">
            <p className="eyebrow">Overview</p>
            <h2>Property details</h2>
            {property.shortDescription && <p>{property.shortDescription}</p>}
            <p className="muted">{property.description}</p>

            <div className="specs-grid">
              <div className="spec-item"><strong>Bedrooms</strong><br />{property.bedrooms ?? "-"}</div>
              <div className="spec-item"><strong>Bathrooms</strong><br />{property.bathrooms ?? "-"}</div>
              <div className="spec-item"><strong>Area</strong><br />{property.areaSqm ?? "-"} sqm</div>
              {property.floor && <div className="spec-item"><strong>Floor</strong><br />{property.floor}</div>}
              <div className="spec-item"><strong>Parking</strong><br />{property.parking ? "Yes" : "No"}</div>
              <div className="spec-item"><strong>Balcony</strong><br />{property.balcony ? "Yes" : "No"}</div>
              <div className="spec-item"><strong>Seller</strong><br />{property.sellerName}</div>
              <div className="spec-item"><strong>Email</strong><br />{property.sellerEmail}</div>
              <div className="spec-item"><strong>Phone</strong><br />{property.sellerPhone}</div>
            </div>

            {property.videoUrl && (
              <div style={{ marginTop: 20 }}>
                <p className="eyebrow">Video tour</p>
                <VideoEmbed url={property.videoUrl} />
              </div>
            )}
          </section>

          <div className="grid">
            <PropertyMap
              lat={property.latitude}
              lng={property.longitude}
              zoom={mapSettings.defaultZoom}
              tileUrl={mapSettings.tileUrl}
              tileAttribution={mapSettings.tileAttribution}
              label={property.title}
            />
            <InquiryForm propertyId={property.id} propertyTitle={property.title} />
          </div>
        </div>

        {related.length > 0 && (
          <section>
            <p className="eyebrow">Related properties</p>
            <div className="grid grid-3">
              {related.map((item) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
