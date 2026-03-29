import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getAllProjects } from "@/lib/site-data";
import { AdminProjectTable } from "@/components/admin/admin-project-table";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  await checkPageAccess("projects");
  const projects = await getAllProjects();

  const rows = projects.map((p) => ({
    id: p.id,
    title: p.title,
    city: p.city,
    developerName: p.developerName,
    units: p._count.properties,
    published: p.published,
    imageUrl: p.images.find((img) => img.isPrimary)?.url ?? p.images[0]?.url ?? null,
    apiEnabled: p.apiEnabled,
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
        <AdminProjectTable rows={rows} />
      </section>
    </main>
  );
}
