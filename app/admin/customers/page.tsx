import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getAllCustomers } from "@/lib/site-data";
import { CustomerTable } from "@/components/admin/customer-table";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await checkPageAccess("customers");
  const { q } = await searchParams;
  const customers = await getAllCustomers(q);

  const rows = customers.map((c) => ({
    id: c.id,
    companyName: c.companyName,
    logoUrl: c.logoUrl,
    contactName: c.contactName,
    contactEmail: c.contactEmail,
    contactPhone: c.contactPhone,
    createdAt: c.createdAt.toLocaleDateString(),
  }));

  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1>Customers</h1>
            <p className="muted">{customers.length} customer{customers.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/admin/customers/new" className="button-primary">Add customer</Link>
        </div>

        <form method="get" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by company name..."
              style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)", background: "white" }}
            />
            <button type="submit" className="button-secondary">Search</button>
            {q && <Link href="/admin/customers" className="button-secondary">Clear</Link>}
          </div>
        </form>

        <CustomerTable rows={rows} />
      </section>
    </main>
  );
}
