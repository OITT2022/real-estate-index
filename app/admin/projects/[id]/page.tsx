import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/forms/project-form";
import { ProjectImageManager } from "@/components/admin/project-image-manager";
import { ProjectPropertiesManager } from "@/components/admin/project-properties-manager";
import { ProjectDocumentManager } from "@/components/admin/project-document-manager";
import { ProjectStructureEditor } from "@/components/admin/project-structure-editor";
import { ProjectWizard } from "@/components/admin/project-wizard";
import { ImageBankPicker } from "@/components/admin/image-bank-picker";
import { AddPropertyModal } from "@/components/admin/add-property-modal";
import { getProjectById, getAllProperties, getAllBankImages, getAllCustomersForSelect } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser, getUserScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await checkPageAccess("projects");
  const { id } = await params;
  const sessionUser = await getSessionUser();
  const [project, allProperties, bankImages, customers, userScope] = await Promise.all([
    getProjectById(id),
    getAllProperties(sessionUser ?? undefined),
    getAllBankImages(),
    getAllCustomersForSelect(),
    sessionUser ? getUserScope(sessionUser) : Promise.resolve(null),
  ]);

  if (!project) return notFound();

  const linkedProperties = project.properties.map((p) => ({
    id: p.id, title: p.title, city: p.city,
    price: Number(p.price), published: p.published,
    currentProjectTitle: project.title,
  }));

  const allPropertiesSimple = allProperties.map((p) => ({
    id: p.id, title: p.title, city: p.city,
    price: Number(p.price), published: p.published,
    currentProjectTitle: p.project?.title ?? null,
  }));

  const bankImagesSimple = bankImages.map((img) => ({
    id: img.id, url: img.url, altText: img.altText,
  }));

  return (
    <main className="section">
      <div className="container">
        <div style={{ marginBottom: 20 }}>
          <p className="eyebrow">Admin</p>
          <h1>Edit Project — {project.title}</h1>
        </div>

        <ProjectWizard>
          {/* Step 1: General Information */}
          <div style={{ display: "grid", gap: 20 }}>
            <ProjectForm mode="edit" project={project} customers={customers} userScope={userScope} />
          </div>

          {/* Step 2: Media */}
          <div style={{ display: "grid", gap: 20 }}>
            <ProjectImageManager projectId={project.id} images={project.images} />
            <ImageBankPicker bankImages={bankImagesSimple} targetType="project" targetId={project.id} />
            <ProjectDocumentManager projectId={project.id} documents={project.documents} />
          </div>

          {/* Step 3: Structure & Properties */}
          <div style={{ display: "grid", gap: 20 }}>
            <ProjectStructureEditor
              projectId={project.id}
              projectTitle={project.title}
              units={project.units.map((u) => ({
                id: u.id, building: u.building, entrance: u.entrance,
                floor: u.floor, unitNumber: u.unitNumber,
                propertyId: u.propertyId, propertyTitle: u.property?.title ?? null,
              }))}
              availableProperties={project.properties.map((p) => ({ id: p.id, title: p.title }))}
            />
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
          </div>

          {/* Step 4: Finish */}
          <div style={{ display: "grid", gap: 20 }}>
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>&#10003;</div>
              <h2 style={{ margin: "0 0 8px" }}>Project Updated</h2>
              <p className="muted" style={{ margin: "0 0 20px" }}>
                All changes are saved automatically. Review the summary below.
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <div style={{ padding: "12px 20px", borderRadius: 10, background: "var(--bg-alt)" }}>
                  <strong>{project.images.length}</strong>
                  <p className="muted" style={{ margin: 0, fontSize: "0.8rem" }}>Images</p>
                </div>
                <div style={{ padding: "12px 20px", borderRadius: 10, background: "var(--bg-alt)" }}>
                  <strong>{project.documents.length}</strong>
                  <p className="muted" style={{ margin: 0, fontSize: "0.8rem" }}>Documents</p>
                </div>
                <div style={{ padding: "12px 20px", borderRadius: 10, background: "var(--bg-alt)" }}>
                  <strong>{project.units.length}</strong>
                  <p className="muted" style={{ margin: 0, fontSize: "0.8rem" }}>Units</p>
                </div>
                <div style={{ padding: "12px 20px", borderRadius: 10, background: "var(--bg-alt)" }}>
                  <strong>{linkedProperties.length}</strong>
                  <p className="muted" style={{ margin: 0, fontSize: "0.8rem" }}>Properties</p>
                </div>
              </div>
              <div style={{ marginTop: 24 }}>
                <a href="/admin/projects" className="button-primary">Back to Projects</a>
              </div>
            </div>
          </div>
        </ProjectWizard>
      </div>
    </main>
  );
}
