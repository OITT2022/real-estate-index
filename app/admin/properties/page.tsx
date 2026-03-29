import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getAllProperties } from "@/lib/site-data";
import { PropertyActions } from "@/components/admin/property-actions";
import { SortableTable } from "@/components/admin/sortable-table";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  title: string;
  city: string;
  price: number;
  published: boolean;
  projectTitle: string | null;
};

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties();

  const rows: Row[] = properties.map((p) => ({
    id: p.id,
    title: p.title,
    city: p.city,
    price: Number(p.price),
    published: p.published,
    projectTitle: p.project?.title ?? null,
  }));

  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1>Properties</h1>
            <p className="muted">{properties.length} total listings</p>
          </div>
          <Link href="/admin/properties/new" className="button-primary">Add property</Link>
        </div>

        <SortableTable
          data={rows}
          getKey={(r) => r.id}
          gridTemplate="2fr 1fr 1fr 1fr 1fr"
          emptyMessage="No properties yet. Create your first listing."
          columns={[
            { key: "title", label: "Title", getValue: (r) => r.title },
            { key: "city", label: "City", getValue: (r) => r.city },
            { key: "price", label: "Price", getValue: (r) => r.price, render: (r) => <span>€{r.price.toLocaleString()}</span> },
            { key: "project", label: "Project", getValue: (r) => r.projectTitle, render: (r) => <span className={r.projectTitle ? "" : "muted"}>{r.projectTitle ?? "—"}</span> },
            { key: "status", label: "Status", getValue: (r) => r.published ? "Published" : "Draft" },
          ]}
          actions={(r) => (
            <>
              <Link href={`/admin/properties/${r.id}`} className="button-secondary">Edit</Link>
              <PropertyActions propertyId={r.id} published={r.published} />
            </>
          )}
        />
      </section>
    </main>
  );
}
