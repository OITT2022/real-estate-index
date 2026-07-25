import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/forms/property-form";
import { ImageManagerGeneric } from "@/components/admin/image-manager-generic";
import { ImageBankPicker } from "@/components/admin/image-bank-picker";
import { PropertyActions } from "@/components/admin/property-actions";
import { getPropertyById, getAllProjectsForSelect, getAllCustomersForSelect, getAllBankImages, getProjectUnitsForSelect } from "@/lib/site-data";
import { db } from "@/lib/db";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser, getUserScope, canAccessCustomer } from "@/lib/scope";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  await checkPageAccess("properties");
  const { id } = await params;
  const sessionUser = await getSessionUser();
  const [property, projects, customers, bankImages, userScope] = await Promise.all([
    getPropertyById(id),
    getAllProjectsForSelect(sessionUser ?? undefined),
    getAllCustomersForSelect(),
    getAllBankImages(),
    sessionUser ? getUserScope(sessionUser) : Promise.resolve(null),
  ]);

  if (!property) return notFound();

  let effectiveCustomerId = property.customerId;
  if (!effectiveCustomerId && property.projectId) {
    const owningProject = await db.project.findUnique({
      where: { id: property.projectId },
      select: { customerId: true },
    });
    effectiveCustomerId = owningProject?.customerId ?? null;
  }
  if (sessionUser && !canAccessCustomer(sessionUser, effectiveCustomerId)) return notFound();

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

  return (
    <section className="admin-content">
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Edit Property</h1>
          <p className="at-page-subtitle">{property.title}</p>
        </div>
        <PropertyActions propertyId={property.id} published={property.published} redirectTo="/admin/properties" />
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
      </div>
    </section>
  );
}
