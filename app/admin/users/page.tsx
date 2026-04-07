import { getAllAdminUsers } from "@/lib/site-data";
import { AdminUserTable } from "@/components/admin/admin-user-table";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await checkPageAccess("users");
  const users = await getAllAdminUsers();

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
