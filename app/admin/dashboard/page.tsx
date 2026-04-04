import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getDashboardStats } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser } from "@/lib/scope";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await checkPageAccess("dashboard");
  const sessionUser = await getSessionUser();
  const stats = await getDashboardStats(sessionUser ?? undefined);

  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
        <h1>Admin dashboard</h1>
        <div className="grid grid-3">
          <div className="card">
            <p className="eyebrow">Properties</p>
            <strong>{stats.total}</strong>
            <p className="muted">Total listings</p>
          </div>
          <div className="card">
            <p className="eyebrow">Published</p>
            <strong>{stats.published}</strong>
            <p className="muted">Visible on the public site</p>
          </div>
          <div className="card">
            <p className="eyebrow">Projects</p>
            <strong>{stats.projects}</strong>
            <p className="muted">Development projects</p>
          </div>
          <div className="card">
            <p className="eyebrow">Inquiries</p>
            <strong>{stats.inquiries}</strong>
            <p className="muted">Contact requests received</p>
          </div>
        </div>
      </section>
    </main>
  );
}
