import { db } from "@/lib/db";
import { AdminUserTable } from "@/components/admin/admin-user-table";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser, isCustomerManager } from "@/lib/scope";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await checkPageAccess("users");
  const sessionUser = await getSessionUser();

  // Customer managers only see users in their org
  const where = sessionUser && isCustomerManager(sessionUser)
    ? { customerId: sessionUser.customerId! }
    : undefined;

  const users = await db.adminUser.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const rows = users.map((u) => ({
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    isSuperAdmin: u.isSuperAdmin,
    active: u.active,
    pageCount: (u.allowedPages as string[]).length,
    createdAt: u.createdAt.toLocaleDateString(),
  }));

  return (
    <section className="admin-content">
      <AdminUserTable rows={rows} />
    </section>
  );
}
