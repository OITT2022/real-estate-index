import { AdminTopbarWrapper } from "@/components/layout/admin-topbar-wrapper";
import { AdminShellWrapper } from "@/components/layout/admin-shell-wrapper";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <AdminTopbarWrapper />
      <AdminShellWrapper>{children}</AdminShellWrapper>
    </div>
  );
}
