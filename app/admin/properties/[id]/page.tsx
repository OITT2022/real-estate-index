import { notFound } from "next/navigation";
import { PropertyForm } from "@/components/forms/property-form";
import { ImageManager } from "@/components/admin/image-manager";
import { getPropertyById, getAllProjectsForSelect } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  await checkPageAccess("properties");
  const { id } = await params;
  const [property, projects] = await Promise.all([
    getPropertyById(id),
    getAllProjectsForSelect(),
  ]);

  if (!property) return notFound();

  return (
    <main className="section">
      <div className="container" style={{ display: "grid", gap: 24 }}>
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Edit property</h1>
        </div>
        <ImageManager propertyId={property.id} images={property.images} />
        <PropertyForm mode="edit" property={{ ...property, price: Number(property.price) }} projects={projects} />
      </div>
    </main>
  );
}
