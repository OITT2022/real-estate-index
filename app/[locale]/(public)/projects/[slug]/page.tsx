import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertyMap } from "@/components/map/property-map";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { ProjectInquiryForm } from "@/components/forms/project-inquiry-form";
import { VideoEmbed } from "@/components/property/video-embed";
import { getProjectBySlug } from "@/lib/site-data";
import { getMapSettings } from "@/lib/settings";
import { ProjectStructureView } from "@/components/project/project-structure-view";
import { Building2, Calendar, MapPin, Users, FileText } from "lucide-react";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string; slug: string }> };

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
  const { locale, slug } = await params;
  const { setRequestLocale } = await import("next-intl/server");
  setRequestLocale(locale);
  const project = await getProjectBySlug(slug, locale);

  if (!project) return notFound();

  const mapSettings = await getMapSettings();
  const firstProperty = project.properties[0];

  return (
    <main style={{ paddingTop: 10 }}>
      <div className="container property-hero">
        {/* ── Header ──────────────────────────────────────── */}
        <div className="property-head">
          <div>
            <p className="eyebrow" style={{ marginBottom: 2 }}>{project.city}</p>
            <h1 style={{ margin: "0 0 2px", fontSize: "1.5rem" }}>{project.title}</h1>
            <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>{project.address}</p>
          </div>
          <div className="card" style={{ padding: "10px 18px" }}>
            <p className="muted" style={{ margin: 0, fontSize: "0.78rem" }}>Developer</p>
            <div className="price-line" style={{ fontSize: "0.92rem", margin: 0 }}>{project.developerName}</div>
          </div>
        </div>

        {/* ── Gallery ─────────────────────────────────────── */}
        <PropertyGallery title={project.title} images={project.images} />

        {/* ── Website Banner ──────────────────────────────── */}
        {project.websiteUrl && (
          <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="website-banner">
            <span className="website-banner-text">Visit Project Website</span>
            <span className="website-banner-arrow">&#8599;</span>
          </a>
        )}

        {/* ── Two-column layout ───────────────────────────── */}
        <div className="sp-content-grid">
          {/* LEFT COLUMN */}
          <div className="sp-main">
            {/* Detail & Features */}
            <div className="sp-section-card">
              <h2 className="sp-section-title">Project Details</h2>
              <div className="sp-features-grid">
                {project.totalUnits && (
                  <div className="sp-feature"><span><Users size={18} className="sp-feat-icon" />Total Units</span><strong>{project.totalUnits}</strong></div>
                )}
                {project.completionDate && (
                  <div className="sp-feature"><span><Calendar size={18} className="sp-feat-icon" />Completion</span><strong>{project.completionDate}</strong></div>
                )}
                <div className="sp-feature"><span><Building2 size={18} className="sp-feat-icon" />Developer</span><strong>{project.developerName}</strong></div>
                <div className="sp-feature"><span><MapPin size={18} className="sp-feat-icon" />City</span><strong>{project.city}</strong></div>
              </div>
            </div>

            {/* Description */}
            <div className="sp-section-card">
              <h2 className="sp-section-title">Description</h2>
              {project.shortDescription && (
                <p style={{ fontWeight: 500, marginBottom: 12 }}>{project.shortDescription}</p>
              )}
              <p className="sp-description">{project.description}</p>
            </div>

            {/* Documents */}
            <div className="sp-section-card">
              <h2 className="sp-section-title">
                <FileText size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />
                Documents &amp; Downloads
              </h2>
              {project.documents.length > 0 ? (
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
              ) : (
                <div className="doc-grid">
                  <div className="doc-card" style={{ opacity: 0.5, cursor: "default" }}>
                    <span className="doc-icon">📄</span>
                    <div>
                      <strong>Floor Plans</strong>
                      <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>Coming soon</p>
                    </div>
                  </div>
                  <div className="doc-card" style={{ opacity: 0.5, cursor: "default" }}>
                    <span className="doc-icon">📋</span>
                    <div>
                      <strong>Brochure</strong>
                      <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>Coming soon</p>
                    </div>
                  </div>
                  <div className="doc-card" style={{ opacity: 0.5, cursor: "default" }}>
                    <span className="doc-icon">📊</span>
                    <div>
                      <strong>Price List</strong>
                      <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>Coming soon</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Video */}
            {project.videoUrl && (
              <div className="sp-section-card">
                <h2 className="sp-section-title">Project Video</h2>
                <VideoEmbed url={project.videoUrl} />
              </div>
            )}

            {/* Map */}
            <div className="sp-section-card">
              <h2 className="sp-section-title">Project Location</h2>
              <PropertyMap
                lat={project.latitude}
                lng={project.longitude}
                zoom={mapSettings.defaultZoom}
                tileUrl={mapSettings.tileUrl}
                tileAttribution={mapSettings.tileAttribution}
                label={project.title}
                address={`${project.address}, ${project.city}`}
                bare
              />
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="sp-sidebar">
            {firstProperty ? (
              <InquiryForm propertyId={firstProperty.id} propertyTitle={project.title} />
            ) : (
              <ProjectInquiryForm projectId={project.id} projectTitle={project.title} />
            )}
            <div className="sp-seller-card">
              <h3 className="sp-seller-card-title">Developer</h3>
              <div className="sp-seller-card-name">{project.developerName}</div>
              <div className="sp-seller-card-row">{project.address}, {project.city}</div>
            </div>
          </aside>
        </div>

        {/* ── Properties Table ────────────────────────────── */}
        <section style={{ marginTop: 12 }}>
          <p className="eyebrow">Available apartments</p>
          <h2 style={{ marginBottom: 16 }}>
            {project.properties.length} {project.properties.length === 1 ? "Property" : "Properties"} in this project
          </h2>

          {project.units.length > 0 ? (
            <ProjectStructureView units={project.units} />
          ) : project.properties.length > 0 ? (
            <div className="card">
              <div className="st-row st-header muted" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 70px" }}>
                <div>Name</div>
                <div>Unit</div>
                <div>Beds</div>
                <div>Area</div>
                <div>Floor</div>
                <div>Price</div>
                <div></div>
              </div>
              {project.properties.map((property) => (
                <div key={property.id} className="st-row" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 70px" }}>
                  <div><strong>{property.title}</strong></div>
                  <div>{property.unitNumber ?? "-"}</div>
                  <div>{property.bedrooms ?? "-"}</div>
                  <div>{property.areaSqm ? `${property.areaSqm} sqm` : "-"}</div>
                  <div>{property.floor != null ? property.floor : "-"}</div>
                  <div className="price-line" style={{ fontSize: "1rem" }}>&euro;{Number(property.price).toLocaleString()}</div>
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
      <div style={{ height: 72 }} />
    </main>
  );
}
