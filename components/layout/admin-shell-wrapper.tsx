"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";

export function AdminShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // No sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div>{children}</div>
    </div>
  );
}
