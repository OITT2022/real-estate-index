"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AdminSidebar } from "./admin-sidebar";

const NO_CHROME_PATHS = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

export function AdminShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (NO_CHROME_PATHS.has(pathname)) {
    return <>{children}</>;
  }

  // Forced first-time password change: hide nav so the user can't escape.
  const mustChange = (session?.user as { mustChangePassword?: boolean } | undefined)?.mustChangePassword;
  if (pathname === "/admin/change-password" && mustChange) {
    return <>{children}</>;
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div>{children}</div>
    </div>
  );
}
