"use client";

import Link from "next/link";
import type { MapPropertyPoint, MapProjectPoint } from "@/lib/site-data";
import { formatCompactPrice } from "@/lib/format";

type Props = {
  projects: MapProjectPoint[];
  properties: MapPropertyPoint[];
};

function ProjectRow({ project }: { project: MapProjectPoint }) {
  return (
    <Link href={`/projects/${project.slug}`} className="map-side-card">
      <div className="map-side-card-image">
        {project.image ? (
          <img src={project.image.url} alt={project.image.altText ?? project.title} />
        ) : (
          <div className="property-image-placeholder" />
        )}
        <span className="map-side-card-badge">Project</span>
      </div>
      <div className="map-side-card-body">
        <p className="eyebrow">{project.city}</p>
        <h4>{project.title}</h4>
        <p className="muted">{project.developerName}</p>
        <p className="map-side-card-meta">
          {project.propertyCount} unit{project.propertyCount === 1 ? "" : "s"}
          {project.totalUnits ? ` · ${project.totalUnits} total` : ""}
        </p>
      </div>
    </Link>
  );
}

function PropertyRow({ property }: { property: MapPropertyPoint }) {
  return (
    <Link href={`/properties/${property.slug}`} className="map-side-card">
      <div className="map-side-card-image">
        {property.image ? (
          <img src={property.image.url} alt={property.image.altText ?? property.title} />
        ) : (
          <div className="property-image-placeholder" />
        )}
        <span className="map-side-card-badge">{property.city}</span>
      </div>
      <div className="map-side-card-body">
        <p className="map-side-card-price">{formatCompactPrice(property.price, property.currency)}</p>
        <h4>{property.title}</h4>
        <p className="muted">{property.address}</p>
        <p className="map-side-card-meta">
          {property.bedrooms != null ? `${property.bedrooms} beds` : "—"}
          {property.floor != null ? ` · floor ${property.floor}` : ""}
          {property.areaSqm != null ? ` · ${property.areaSqm} sqm` : ""}
        </p>
      </div>
    </Link>
  );
}

export function MapSidePanel({ projects, properties }: Props) {
  const total = projects.length + properties.length;

  return (
    <aside className="map-side-panel">
      <header className="map-side-header">
        <h3>{total} on map</h3>
        <p className="muted">
          {projects.length} project{projects.length === 1 ? "" : "s"} · {properties.length} propert{properties.length === 1 ? "y" : "ies"}
        </p>
      </header>
      <div className="map-side-list">
        {total === 0 ? (
          <div className="map-side-empty">
            <p className="muted">Pan or zoom the map to find properties and projects.</p>
          </div>
        ) : (
          <>
            {projects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
            {properties.map((property) => (
              <PropertyRow key={property.id} property={property} />
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
