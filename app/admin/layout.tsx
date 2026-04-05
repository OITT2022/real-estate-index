import { AdminTopbarWrapper } from "@/components/layout/admin-topbar-wrapper";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <AdminTopbarWrapper />
      {children}
    </div>
  );
}
