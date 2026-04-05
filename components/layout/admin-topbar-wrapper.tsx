"use client";

import { usePathname } from "next/navigation";
import { AdminTopbar } from "./admin-topbar";

export function AdminTopbarWrapper() {
  const pathname = usePathname();

  // Don't show topbar on login page
  if (pathname === "/admin/login") return null;

  return <AdminTopbar />;
}
