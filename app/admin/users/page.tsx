import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getAllAdminUsers } from "@/lib/site-data";
import { AdminUserTable } from "@/components/admin/admin-user-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
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
    <main className="admin-shell">
      <AdminSidebar />
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
    </main>
  );
}
