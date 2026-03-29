import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getAllProperties } from "@/lib/site-data";
import { AdminPropertyTable } from "@/components/admin/admin-property-table";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties();

  const rows = properties.map((p) => ({
    id: p.id,
    title: p.title,
    city: p.city,
    price: Number(p.price),
    published: p.published,
    projectTitle: p.project?.title ?? null,
    imageUrl: p.images.find((img) => img.isPrimary)?.url ?? p.images[0]?.url ?? null,
    apiEnabled: p.apiEnabled,
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
        <AdminPropertyTable rows={rows} />
      </section>
    </main>
  );
}
