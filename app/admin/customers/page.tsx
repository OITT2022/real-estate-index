import { getAllCustomers } from "@/lib/site-data";
import { CustomerTable } from "@/components/admin/customer-table";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await checkPageAccess("customers");
  const customers = await getAllCustomers();

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
    <section className="admin-content">
      <CustomerTable rows={rows} />
    </section>
  );
}
