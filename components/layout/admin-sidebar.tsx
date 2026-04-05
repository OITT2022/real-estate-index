"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { ADMIN_PAGES, PAGE_GROUPS } from "@/lib/admin-pages";

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as {
    name?: string; email?: string;
    isSuperAdmin?: boolean; allowedPages?: string[];
  } | undefined;

  const isSuperAdmin = user?.isSuperAdmin ?? false;
  const allowedPages = (user?.allowedPages ?? []) as string[];

  const visiblePages = ADMIN_PAGES.filter((page) => {
    if (isSuperAdmin) return true;
    return allowedPages.includes(page.key);
  });

  const displayName = user?.name || user?.email || "";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "A";

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <aside className="admin-sidebar-v2">
      <div className="sidebar-brand">
        <LayoutDashboardIcon />
        Admin Panel
      </div>

      {PAGE_GROUPS.map((group) => {
        const groupPages = visiblePages.filter((p) => p.group === group.key);
        if (groupPages.length === 0) return null;
        return (
          <div key={group.key} className="sidebar-group">
            <div className="sidebar-group-label">{group.label}</div>
            {groupPages.map((page) => {
              const Icon = page.icon;
              const active = isActive(page.path);
              return (
                <Link
                  key={page.key}
                  href={page.path}
                  className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
                >
                  <Icon />
                  {page.label}
                </Link>
              );
            })}
          </div>
        );
      })}

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{displayName}</div>
          <div className="sidebar-user-email">{user?.email || ""}</div>
        </div>
        <button
          type="button"
          className="sidebar-signout"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

function LayoutDashboardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}
