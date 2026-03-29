import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getAllProperties } from "@/lib/site-data";
import { PropertyActions } from "@/components/admin/property-actions";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  const properties = await getAllProperties();

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

        <div className="card">
          <div className="admin-header-row muted">
            <div>Title</div>
            <div>City</div>
            <div>Price</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {properties.length === 0 && (
            <div className="table-row">
              <div className="muted">No properties yet. Create your first listing.</div>
            </div>
          )}
          {properties.map((property) => (
            <div key={property.id} className="table-row">
              <div>{property.title}</div>
              <div>{property.city}</div>
              <div>€{Number(property.price).toLocaleString()}</div>
              <div>{property.published ? "Published" : "Draft"}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link href={`/admin/properties/${property.id}`} className="button-secondary">Edit</Link>
                <PropertyActions propertyId={property.id} published={property.published} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
