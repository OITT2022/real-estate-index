import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getAllProjects } from "@/lib/site-data";
import { ProjectActions } from "@/components/admin/project-actions";
import { SortableTable } from "@/components/admin/sortable-table";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  title: string;
  city: string;
  developerName: string;
  units: number;
  published: boolean;
};

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  const rows: Row[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    city: p.city,
    developerName: p.developerName,
    units: p._count.properties,
    published: p.published,
  }));

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

        <SortableTable
          data={rows}
          getKey={(r) => r.id}
          gridTemplate="2fr 1fr 1fr 1fr 1fr"
          emptyMessage="No projects yet. Create your first project."
          columns={[
            { key: "title", label: "Title", getValue: (r) => r.title },
            { key: "city", label: "City", getValue: (r) => r.city },
            { key: "developer", label: "Developer", getValue: (r) => r.developerName },
            { key: "units", label: "Properties", getValue: (r) => r.units },
            { key: "status", label: "Status", getValue: (r) => r.published ? "Published" : "Draft" },
          ]}
          actions={(r) => (
            <>
              <Link href={`/admin/projects/${r.id}`} className="button-secondary">Edit</Link>
              <ProjectActions projectId={r.id} published={r.published} />
            </>
          )}
        />
      </section>
    </main>
  );
}
