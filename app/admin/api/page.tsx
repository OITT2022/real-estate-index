import Link from "next/link";
import { db } from "@/lib/db";
import { AdminApiClientTable } from "@/components/admin/admin-api-client-table";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function AdminApiPage() {
  await checkPageAccess("api");
  const clients = await db.apiClient.findMany({
    include: { customer: { select: { companyName: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = clients.map((c) => ({
    id: c.id,
    name: c.name,
    tokenPrefix: c.tokenPrefix,
    scopeLabel: c.scopeType === "customer" && c.customer
      ? c.customer.companyName
      : "All Customers",
    active: c.active,
    createdAt: c.createdAt.toLocaleDateString(),
    propertyFieldCount: (c.allowedPropertyFields as string[]).length,
    projectFieldCount: (c.allowedProjectFields as string[]).length,
  }));

  return (
    <section className="admin-content">
        <div className="at-page-header">
          <div>
            <h1 className="at-page-title">API Clients</h1>
            <p className="at-page-subtitle">{clients.length} registered clients</p>
          </div>
          <Link href="/admin/api/new" className="at-btn-primary">Add Client</Link>
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
  );
}
