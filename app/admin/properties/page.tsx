import Link from "next/link";
import { getAllProperties, getCustomerById } from "@/lib/site-data";
import { AdminPropertyTable } from "@/components/admin/admin-property-table";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser } from "@/lib/scope";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  await checkPageAccess("properties");
  const sessionUser = await getSessionUser();
  const { customerId } = await searchParams;
  const properties = await getAllProperties(sessionUser ?? undefined, customerId);

  const filterCustomer = customerId ? await getCustomerById(customerId) : null;

  const rows = properties.map((p) => ({
    id: p.id,
    title: p.title,
    city: p.city,
    price: Number(p.price),
    published: p.published,
    projectTitle: p.project?.title ?? null,
    customerName: p.project?.customer?.companyName ?? p.customer?.companyName ?? null,
    imageUrl: p.images.find((img) => img.isPrimary)?.url ?? p.images[0]?.url ?? null,
    apiEnabled: p.apiEnabled,
  }));

  return (
    <section className="admin-content">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1>{filterCustomer ? `Properties for ${filterCustomer.companyName}` : "Properties"}</h1>
            <p className="muted">{properties.length} total listings</p>
            {filterCustomer && (
              <Link href="/admin/properties" style={{ fontSize: "0.85rem", color: "var(--accent)" }}>Show all properties</Link>
            )}
          </div>
          <Link href={customerId ? `/admin/properties/new?customerId=${customerId}` : "/admin/properties/new"} className="button-primary">Add property</Link>
        </div>
        <AdminPropertyTable rows={rows} />
      </section>
  );
}
