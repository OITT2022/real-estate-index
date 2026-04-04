import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getAllProjects, getCustomerById } from "@/lib/site-data";
import { AdminProjectTable } from "@/components/admin/admin-project-table";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser } from "@/lib/scope";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  await checkPageAccess("projects");
  const sessionUser = await getSessionUser();
  const { customerId } = await searchParams;
  const projects = await getAllProjects(sessionUser ?? undefined, customerId);

  const filterCustomer = customerId ? await getCustomerById(customerId) : null;

  const rows = projects.map((p) => ({
    id: p.id,
    title: p.title,
    city: p.city,
    developerName: p.developerName,
    customerName: p.customer?.companyName ?? null,
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
            <h1>{filterCustomer ? `Projects for ${filterCustomer.companyName}` : "Projects"}</h1>
            <p className="muted">{projects.length} total projects</p>
            {filterCustomer && (
              <Link href="/admin/projects" style={{ fontSize: "0.85rem", color: "var(--accent)" }}>Show all projects</Link>
            )}
          </div>
          <Link href={customerId ? `/admin/projects/new?customerId=${customerId}` : "/admin/projects/new"} className="button-primary">Add project</Link>
        </div>
        <AdminProjectTable rows={rows} />
      </section>
    </main>
  );
}
