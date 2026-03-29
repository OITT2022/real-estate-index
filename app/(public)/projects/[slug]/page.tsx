import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertyMap } from "@/components/map/property-map";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { VideoEmbed } from "@/components/property/video-embed";
import { getProjectBySlug } from "@/lib/site-data";
import { getMapSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.metaTitle ?? `${project.title} — Real Estate Index`,
    description: project.metaDescription ?? project.shortDescription ?? project.description.slice(0, 160),
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) return notFound();

  const mapSettings = await getMapSettings();

  return (
    <main className="section">
      <div className="container property-hero">
        <div className="property-head">
          <div>
            <p className="eyebrow">{project.city}</p>
            <h1>{project.title}</h1>
            <p className="muted">{project.address}</p>
          </div>
          <div className="card">
            <p className="muted">Developer</p>
            <div className="price-line" style={{ fontSize: "1rem" }}>{project.developerName}</div>
          </div>
        </div>

        <PropertyGallery title={project.title} images={project.images} />

        {project.websiteUrl && (
          <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="website-banner">
            <span className="website-banner-text">Visit Project Website</span>
            <span className="website-banner-arrow">&#8599;</span>
          </a>
        )}

        <div className="details-grid">
          <section className="card">
            <p className="eyebrow">About this project</p>
            <h2>Project Details</h2>
            {project.shortDescription && <p>{project.shortDescription}</p>}
            <p className="muted">{project.description}</p>

            <div className="specs-grid">
              {project.totalUnits && <div className="spec-item"><strong>Total Units</strong><br />{project.totalUnits}</div>}
              {project.completionDate && <div className="spec-item"><strong>Completion</strong><br />{project.completionDate}</div>}
              <div className="spec-item"><strong>Developer</strong><br />{project.developerName}</div>
              <div className="spec-item"><strong>City</strong><br />{project.city}</div>
              <div className="spec-item"><strong>Address</strong><br />{project.address}</div>
            </div>

            {project.videoUrl && (
              <div style={{ marginTop: 20 }}>
                <p className="eyebrow">Video tour</p>
                <VideoEmbed url={project.videoUrl} />
              </div>
            )}

            {project.documents.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <p className="eyebrow">Downloads</p>
                <div className="doc-grid">
                  {project.documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="doc-card"
                    >
                      <span className="doc-icon">{doc.fileName.endsWith(".pdf") ? "📄" : "🖼️"}</span>
                      <div>
                        <strong>{doc.fileType === "plan" ? "Floor Plan" : doc.fileType === "brochure" ? "Brochure" : "Document"}</strong>
                        <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>{doc.fileName}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          <div className="grid">
            <PropertyMap
              lat={project.latitude}
              lng={project.longitude}
              zoom={mapSettings.defaultZoom}
              tileUrl={mapSettings.tileUrl}
              tileAttribution={mapSettings.tileAttribution}
              label={project.title}
            />
            {project.properties.length > 0 && (
              <InquiryForm
                propertyId={project.properties[0].id}
                propertyTitle={project.title}
              />
            )}
          </div>
        </div>

        <section style={{ marginTop: 12 }}>
          <p className="eyebrow">Available apartments</p>
          <h2 style={{ marginBottom: 16 }}>
            {project.properties.length} {project.properties.length === 1 ? "Property" : "Properties"} in this project
          </h2>

          {project.properties.length > 0 ? (
            <div className="card">
              <div className="st-row st-header muted" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 70px" }}>
                <div>Name</div>
                <div>Beds</div>
                <div>Baths</div>
                <div>Area</div>
                <div>Price</div>
                <div></div>
              </div>
              {project.properties.map((property) => (
                <div key={property.id} className="st-row" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 70px" }}>
                  <div><strong>{property.title}</strong></div>
                  <div>{property.bedrooms ?? "-"}</div>
                  <div>{property.bathrooms ?? "-"}</div>
                  <div>{property.areaSqm ? `${property.areaSqm} sqm` : "-"}</div>
                  <div className="price-line" style={{ fontSize: "1rem" }}>€{Number(property.price).toLocaleString()}</div>
                  <div>
                    <Link href={`/properties/${property.slug}`} className="button-primary" style={{ padding: "8px 14px", fontSize: "0.9rem" }}>
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No properties listed for this project yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
