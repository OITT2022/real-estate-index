"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, Bell, LogOut } from "lucide-react";
import { ADMIN_PAGES } from "@/lib/admin-pages";

export function AdminTopbar({ inquiryCount }: { inquiryCount?: number }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as { name?: string; email?: string } | undefined;

  const displayName = user?.name || user?.email || "";
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "A";

  // Build breadcrumb from pathname
  const crumbs = buildBreadcrumb(pathname);

  return (
    <div className="admin-topbar">
      <img src="/logo-icon.png" alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0 }} />
      <div className="admin-topbar-breadcrumb">
        {crumbs.map((crumb, i) => (
          <span key={i}>
            {i > 0 && <span className="sep">/</span>}
            {crumb.href ? (
              <a href={crumb.href}>{crumb.label}</a>
            ) : (
              <span className="current">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>

      <div className="admin-topbar-search">
        <Search size={15} />
        <input type="text" placeholder="Search..." />
      </div>

      <div className="admin-topbar-actions">
        <button type="button" className="admin-topbar-icon" title="Notifications">
          <Bell size={18} />
          {(inquiryCount ?? 0) > 0 && (
            <span className="admin-topbar-badge">{inquiryCount}</span>
          )}
        </button>

        <div className="admin-topbar-user">
          <div className="admin-topbar-avatar">{initials}</div>
          <div className="admin-topbar-user-info">
            <div className="admin-topbar-user-name">{displayName}</div>
            <div className="admin-topbar-user-role">Admin</div>
          </div>
        </div>

        <button
          type="button"
          className="admin-topbar-icon"
          title="Sign out"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

interface Crumb {
  label: string;
  href?: string;
}

function buildBreadcrumb(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Admin", href: "/admin/dashboard" }];

  // Match known admin pages
  const matched = ADMIN_PAGES.find(
    (p) => pathname === p.path || pathname.startsWith(p.path + "/")
  );

  if (matched) {
    // If we're on a sub-page (e.g. /admin/properties/abc), add the parent
    if (pathname !== matched.path) {
      crumbs.push({ label: matched.label, href: matched.path });
      // Determine sub-page type
      const sub = pathname.slice(matched.path.length + 1);
      if (sub === "new") {
        crumbs.push({ label: "New" });
      } else {
        crumbs.push({ label: "Edit" });
      }
    } else {
      crumbs.push({ label: matched.label });
    }
  }

  return crumbs;
}
