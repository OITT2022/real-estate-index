import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/forms/property-form";
import { ImageManagerGeneric } from "@/components/admin/image-manager-generic";
import { ImageBankPicker } from "@/components/admin/image-bank-picker";
import { TranslationsCard } from "@/components/admin/translations-card";
import { getPropertyById, getAllProjectsForSelect, getAllCustomersForSelect, getAllBankImages, getProjectUnitsForSelect } from "@/lib/site-data";
import { db } from "@/lib/db";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser, getUserScope } from "@/lib/scope";
import { getEntityTranslations } from "@/lib/translation/admin";

export const dynamic = "force-dynamic";

const PROPERTY_TRANSLATABLE_FIELDS = [
  { key: "title", label: "Title" },
  { key: "shortDescription", label: "Short description", multiline: true },
  { key: "description", label: "Description", multiline: true },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "neighborhood", label: "Neighborhood" },
  { key: "metaTitle", label: "Meta title (SEO)" },
  { key: "metaDescription", label: "Meta description (SEO)", multiline: true },
];

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  await checkPageAccess("properties");
  const { id } = await params;
  const sessionUser = await getSessionUser();
  const [property, projects, customers, bankImages, userScope, translations] = await Promise.all([
    getPropertyById(id),
    getAllProjectsForSelect(sessionUser ?? undefined),
    getAllCustomersForSelect(),
    getAllBankImages(),
    sessionUser ? getUserScope(sessionUser) : Promise.resolve(null),
    getEntityTranslations("property", id),
  ]);

  if (!property) return notFound();

  const projectUnits = property.projectId
    ? await getProjectUnitsForSelect(property.projectId)
    : [];

  const linkedUnit = await db.projectUnit.findFirst({
    where: { propertyId: property.id },
    select: { id: true },
  });

  const bankImagesSimple = bankImages.map((img) => ({
    id: img.id,
    url: img.url,
    altText: img.altText,
  }));

  const sourceForTranslations: Record<string, string> = {
    title: property.title ?? "",
    shortDescription: property.shortDescription ?? "",
    description: property.description ?? "",
    address: property.address ?? "",
    city: property.city ?? "",
    neighborhood: property.neighborhood ?? "",
    metaTitle: property.metaTitle ?? "",
    metaDescription: property.metaDescription ?? "",
  };

  return (
    <section className="admin-content">
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Edit Property</h1>
          <p className="at-page-subtitle">{property.title}</p>
        </div>
      </div>
      <div style={{ display: "grid", gap: 20 }}>
        <ImageManagerGeneric entityType="property" entityId={property.id} images={property.images} />
        <ImageBankPicker bankImages={bankImagesSimple} targetType="property" targetId={property.id} />
        <PropertyForm
          mode="edit"
          property={{ ...property, price: Number(property.price) }}
          projects={projects}
          customers={customers}
          userScope={userScope}
          projectUnits={projectUnits}
          linkedUnitId={linkedUnit?.id ?? null}
        />
        <TranslationsCard
          entityType="property"
          entityId={property.id}
          fields={PROPERTY_TRANSLATABLE_FIELDS}
          source={sourceForTranslations}
          existing={translations}
        />
      </div>
    </section>
  );
}
