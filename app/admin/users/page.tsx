import Link from "next/link";
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
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1>User Management</h1>
            <p className="muted">{users.length} admin users</p>
          </div>
          <Link href="/admin/users/new" className="button-primary">Add user</Link>
        </div>
        <AdminUserTable rows={rows} />
      </section>
  );
}
