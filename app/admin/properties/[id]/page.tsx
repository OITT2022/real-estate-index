import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/forms/property-form";
import { ImageManager } from "@/components/admin/image-manager";
import { ImageBankPicker } from "@/components/admin/image-bank-picker";
import { getPropertyById, getAllProjectsForSelect, getAllCustomersForSelect, getAllBankImages, getProjectUnitsForSelect } from "@/lib/site-data";
import { db } from "@/lib/db";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser, getUserScope } from "@/lib/scope";

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

  // Load project units if property belongs to a project
  const projectUnits = property.projectId
    ? await getProjectUnitsForSelect(property.projectId)
    : [];

  // Find which unit this property is linked to
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
    <main className="section">
      <div className="container" style={{ display: "grid", gap: 24 }}>
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Edit property</h1>
        </div>
        <ImageManager propertyId={property.id} images={property.images} />
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
    </main>
  );
}
