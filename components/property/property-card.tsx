import Link from "next/link";
import type { Property, PropertyImage } from "@prisma/client";

type PropertyWithImages = Property & { images: PropertyImage[] };

export function PropertyCard({ property }: { property: PropertyWithImages }) {
  const primaryImage = property.images.find((img) => img.isPrimary) ?? property.images[0];

  return (
    <article className="property-card">
      <Link href={`/properties/${property.slug}`}>
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.altText ?? property.title}
            className="property-card-image"
          />
        ) : (
          <div className="property-image-placeholder" />
        )}
        <div className="property-card-body">
          <p className="eyebrow">{property.city}</p>
          <h3>{property.title}</h3>
          <p className="muted">{property.address}</p>
          <div className="property-meta-row">
            <span>{property.bedrooms ?? "-"} beds</span>
            <span>{property.bathrooms ?? "-"} baths</span>
            <span>{property.areaSqm ?? "-"} sqm</span>
          </div>
          <p className="price-line">€{Number(property.price).toLocaleString()}</p>
        </div>
      </Link>
    </article>
  );
}
