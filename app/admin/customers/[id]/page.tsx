import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/forms/customer-form";
import { getCustomerById } from "@/lib/site-data";
import { db } from "@/lib/db";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await checkPageAccess("customers");
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) return notFound();

  const [projects, properties] = await Promise.all([
    db.project.findMany({
      where: { customerId: id },
      select: { id: true, title: true, city: true, published: true },
      orderBy: { createdAt: "desc" },
    }),
    db.property.findMany({
      where: { OR: [{ customerId: id }, { project: { customerId: id } }] },
      select: { id: true, title: true, city: true, published: true, price: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <section className="admin-content">
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Edit Customer</h1>
          <p className="at-page-subtitle">{customer.companyName}</p>
        </div>
      </div>
      <div style={{ display: "grid", gap: 20 }}>

        <div className="card" style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>Projects ({projects.length})</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href={`/admin/projects?customerId=${id}`} className="button-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>View all</Link>
              <Link href={`/admin/projects/new?customerId=${id}`} className="button-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>Add project</Link>
            </div>
          </div>
          {projects.length === 0 ? (
            <p className="muted">No projects linked to this customer.</p>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {projects.map((p) => (
                <Link key={p.id} href={`/admin/projects/${p.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: "var(--bg-alt)", textDecoration: "none", color: "inherit" }}>
                  <span style={{ fontWeight: 500 }}>{p.title}</span>
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="muted" style={{ fontSize: "0.85rem" }}>{p.city}</span>
                    <span className={`publish-badge ${p.published ? "publish-badge-on" : "publish-badge-off"}`}>{p.published ? "Published" : "Draft"}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>Properties ({properties.length})</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href={`/admin/properties?customerId=${id}`} className="button-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>View all</Link>
              <Link href={`/admin/properties/new?customerId=${id}`} className="button-secondary" style={{ padding: "6px 12px", fontSize: "0.85rem" }}>Add property</Link>
            </div>
          </div>
          {properties.length === 0 ? (
            <p className="muted">No properties linked to this customer.</p>
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {properties.map((p) => (
                <Link key={p.id} href={`/admin/properties/${p.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: "var(--bg-alt)", textDecoration: "none", color: "inherit" }}>
                  <span style={{ fontWeight: 500 }}>{p.title}</span>
                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="muted" style={{ fontSize: "0.85rem" }}>{p.city}</span>
                    <span className="muted" style={{ fontSize: "0.85rem" }}>€{Number(p.price).toLocaleString()}</span>
                    <span className={`publish-badge ${p.published ? "publish-badge-on" : "publish-badge-off"}`}>{p.published ? "Published" : "Draft"}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <CustomerForm mode="edit" customer={customer} />
      </div>
    </section>
  );
}
