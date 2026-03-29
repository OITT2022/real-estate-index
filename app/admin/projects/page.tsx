import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getAllProjects } from "@/lib/site-data";
import { ProjectActions } from "@/components/admin/project-actions";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1>Projects</h1>
            <p className="muted">{projects.length} total projects</p>
          </div>
          <Link href="/admin/projects/new" className="button-primary">Add project</Link>
        </div>

        <div className="card">
          <div className="admin-header-row muted" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr auto" }}>
            <div>Title</div>
            <div>City</div>
            <div>Developer</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {projects.length === 0 && (
            <div className="table-row"><div className="muted">No projects yet. Create your first project.</div></div>
          )}
          {projects.map((project) => (
            <div key={project.id} className="table-row">
              <div>{project.title}</div>
              <div>{project.city}</div>
              <div>{project.developerName}</div>
              <div>{project.published ? "Published" : "Draft"}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href={`/admin/projects/${project.id}`} className="button-secondary">Edit</Link>
                <ProjectActions projectId={project.id} published={project.published} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
