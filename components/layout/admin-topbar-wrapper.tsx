"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AdminTopbar } from "./admin-topbar";

const NO_CHROME_PATHS = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);

export function AdminTopbarWrapper() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (NO_CHROME_PATHS.has(pathname)) return null;

  const mustChange = (session?.user as { mustChangePassword?: boolean } | undefined)?.mustChangePassword;
  if (pathname === "/admin/change-password" && mustChange) return null;

  return <AdminTopbar />;
}
