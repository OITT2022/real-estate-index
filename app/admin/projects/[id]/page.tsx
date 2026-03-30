import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/forms/project-form";
import { ProjectImageManager } from "@/components/admin/project-image-manager";
import { ProjectPropertiesManager } from "@/components/admin/project-properties-manager";
import { ProjectDocumentManager } from "@/components/admin/project-document-manager";
import { ImageBankPicker } from "@/components/admin/image-bank-picker";
import { AddPropertyModal } from "@/components/admin/add-property-modal";
import { getProjectById, getAllProperties, getAllBankImages } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await checkPageAccess("projects");
  const { id } = await params;
  const [project, allProperties, bankImages] = await Promise.all([
    getProjectById(id),
    getAllProperties(),
    getAllBankImages(),
  ]);

  if (!project) return notFound();

  const linkedProperties = project.properties.map((p) => ({
    id: p.id,
    title: p.title,
    city: p.city,
    price: Number(p.price),
    published: p.published,
    currentProjectTitle: project.title,
  }));

  const allPropertiesSimple = allProperties.map((p) => ({
    id: p.id,
    title: p.title,
    city: p.city,
    price: Number(p.price),
    published: p.published,
    currentProjectTitle: p.project?.title ?? null,
  }));

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
          <h1>Edit project</h1>
        </div>
        <ProjectImageManager projectId={project.id} images={project.images} />
        <ImageBankPicker bankImages={bankImagesSimple} targetType="project" targetId={project.id} />
        <ProjectDocumentManager projectId={project.id} documents={project.documents} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="eyebrow">Connected Properties</p>
            <p className="muted">{linkedProperties.length} properties linked</p>
          </div>
          <AddPropertyModal projectId={project.id} projectTitle={project.title} />
        </div>
        <ProjectPropertiesManager
          projectId={project.id}
          linkedProperties={linkedProperties}
          allProperties={allPropertiesSimple}
        />
        <ProjectForm mode="edit" project={project} />
      </div>
    </main>
  );
}
