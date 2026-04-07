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
    slug: p.slug,
    city: p.city,
    price: Number(p.price),
    published: p.published,
    sold: (p as any).sold ?? false,
    status: (p as any).status as string,
    propertyType: (p as any).propertyType as string | null,
    bedrooms: (p as any).bedrooms as number | null,
    areaSqm: (p as any).areaSqm as number | null,
    projectTitle: p.project?.title ?? null,
    customerName: p.project?.customer?.companyName ?? p.customer?.companyName ?? null,
    imageUrl: p.images.find((img: any) => img.isPrimary)?.url ?? p.images[0]?.url ?? null,
    apiEnabled: p.apiEnabled,
  }));

  return (
    <section className="admin-content">
      <AdminPropertyTable
        rows={rows}
        addUrl={customerId ? `/admin/properties/new?customerId=${customerId}` : "/admin/properties/new"}
        filterCustomerName={filterCustomer?.companyName ?? null}
        showAllUrl={filterCustomer ? "/admin/properties" : null}
      />
    </section>
  );
}
