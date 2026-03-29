import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getAllApiClients } from "@/lib/site-data";
import { AdminApiClientTable } from "@/components/admin/admin-api-client-table";

export const dynamic = "force-dynamic";

export default async function AdminApiPage() {
  const clients = await getAllApiClients();

  const rows = clients.map((c) => ({
    id: c.id,
    name: c.name,
    tokenPrefix: c.tokenPrefix,
    active: c.active,
    createdAt: c.createdAt.toLocaleDateString(),
    propertyFieldCount: (c.allowedPropertyFields as string[]).length,
    projectFieldCount: (c.allowedProjectFields as string[]).length,
  }));

  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1>API Clients</h1>
            <p className="muted">{clients.length} registered clients</p>
          </div>
          <Link href="/admin/api/new" className="button-primary">Add client</Link>
        </div>

        <div className="card" style={{ marginBottom: 20, padding: 16 }}>
          <p className="eyebrow" style={{ margin: "0 0 4px" }}>API Endpoints</p>
          <p className="muted" style={{ margin: 0 }}>
            <code>GET /api/v1/properties</code> &nbsp;|&nbsp; <code>GET /api/v1/projects</code>
            &nbsp;— Auth: <code>Authorization: Bearer &lt;token&gt;</code>
          </p>
        </div>

        <AdminApiClientTable rows={rows} />
      </section>
    </main>
  );
}
