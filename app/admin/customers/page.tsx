import { db } from "@/lib/db";
import { CustomerTable } from "@/components/admin/customer-table";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser, isCustomerManager } from "@/lib/scope";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await checkPageAccess("customers");
  const sessionUser = await getSessionUser();

  // Customer managers only see their own customer
  const where = sessionUser && isCustomerManager(sessionUser)
    ? { id: sessionUser.customerId! }
    : undefined;

  const customers = await db.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

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
