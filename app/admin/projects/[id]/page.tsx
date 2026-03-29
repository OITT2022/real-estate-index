import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/forms/project-form";
import { ProjectImageManager } from "@/components/admin/project-image-manager";
import { ProjectPropertiesManager } from "@/components/admin/project-properties-manager";
import { ProjectDocumentManager } from "@/components/admin/project-document-manager";
import { getProjectById, getAllProperties } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await checkPageAccess("projects");
  const { id } = await params;
  const [project, allProperties] = await Promise.all([
    getProjectById(id),
    getAllProperties(),
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

  return (
    <main className="section">
      <div className="container" style={{ display: "grid", gap: 24 }}>
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Edit project</h1>
        </div>
        <ProjectImageManager projectId={project.id} images={project.images} />
        <ProjectDocumentManager projectId={project.id} documents={project.documents} />
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
