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
    slug: p.slug,
    city: p.city,
    developerName: p.developerName,
    customerName: p.customer?.companyName ?? null,
    units: p._count.properties,
    published: p.published,
    status: p.status,
    imageUrl: p.images.find((img: any) => img.isPrimary)?.url ?? p.images[0]?.url ?? null,
    apiEnabled: p.apiEnabled,
  }));

  return (
    <section className="admin-content">
      <AdminProjectTable
        rows={rows}
        addUrl={customerId ? `/admin/projects/new?customerId=${customerId}` : "/admin/projects/new"}
        filterCustomerName={filterCustomer?.companyName ?? null}
        showAllUrl={filterCustomer ? "/admin/projects" : null}
      />
    </section>
  );
}
