import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { getDashboardStats, getDashboardChartData } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser } from "@/lib/scope";
import { Building2, Eye, FolderKanban, MessageSquare, Users } from "lucide-react";
import { DashboardCharts } from "@/components/admin/charts/dashboard-charts";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await checkPageAccess("dashboard");
  const sessionUser = await getSessionUser();
  const [stats, chartData] = await Promise.all([
    getDashboardStats(sessionUser ?? undefined),
    getDashboardChartData(),
  ]);

  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
          <h1 style={{ marginTop: 0, marginBottom: 20 }}>Dashboard</h1>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 20 }}>
            <StatCard icon={<Building2 />} iconClass="stat-card-icon-teal" label="Properties" value={stats.total} desc="Total listings" />
            <StatCard icon={<Eye />} iconClass="stat-card-icon-blue" label="Published" value={stats.published} desc="Live on site" />
            <StatCard icon={<FolderKanban />} iconClass="stat-card-icon-amber" label="Projects" value={stats.projects} desc="Development projects" />
            <StatCard icon={<MessageSquare />} iconClass="stat-card-icon-rose" label="Inquiries" value={stats.inquiries} desc="Contact requests" />
            <StatCard icon={<Users />} iconClass="stat-card-icon-purple" label="Units" value={chartData.unitsCount} desc="Project units" />
          </div>

          {/* Charts */}
          <DashboardCharts chartData={chartData} />
        </section>
    </main>
  );
}

function StatCard({ icon, iconClass, label, value, desc }: {
  icon: React.ReactNode; iconClass: string; label: string; value: number; desc: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-card-icon ${iconClass}`}>{icon}</div>
      <div className="stat-card-body">
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value.toLocaleString()}</p>
        <p className="stat-card-desc">{desc}</p>
      </div>
    </div>
  );
}
