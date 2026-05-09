import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Property, PropertyImage } from "@prisma/client";

type PropertyWithImages = Property & { images: PropertyImage[] };

export function PropertyCard({ property }: { property: PropertyWithImages }) {
  const t = useTranslations("property");
  const primaryImage = property.images.find((img) => img.isPrimary) ?? property.images[0];

  return (
    <article className="property-card">
      <Link href={`/properties/${property.slug}`}>
        <div className="property-card-image-wrap">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText ?? property.title}
              className="property-card-image"
            />
          ) : (
            <div className="property-image-placeholder" />
          )}
          <span className="property-card-badge">{property.city}</span>
        </div>
        <div className="property-card-body">
          <h3>{property.title}</h3>
          <p className="muted">{property.address}</p>
          <div className="property-meta-row">
            <span>{property.bedrooms ?? "-"} {t("beds")}</span>
            <span>{property.bathrooms ?? "-"} {t("baths")}</span>
            <span>{property.areaSqm ?? "-"} {t("sqm")}</span>
          </div>
          <p className="price-line">&euro;{Number(property.price).toLocaleString()}</p>
        </div>
      </Link>
    </article>
  );
}
