"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ADMIN_PAGES } from "@/lib/admin-pages";

export function AdminSidebar() {
  const { data: session } = useSession();
  const user = session?.user as { name?: string; email?: string; isSuperAdmin?: boolean; allowedPages?: string[] } | undefined;

  const isSuperAdmin = user?.isSuperAdmin ?? false;
  const allowedPages = (user?.allowedPages ?? []) as string[];

  const visiblePages = ADMIN_PAGES.filter((page) => {
    if (isSuperAdmin) return true;
    return allowedPages.includes(page.key);
  });

  const displayName = user?.name || user?.email || "";

  return (
    <aside className="admin-sidebar">
      <p className="eyebrow">Admin</p>
      <nav>
        {visiblePages.map((page) => (
          <Link key={page.key} href={page.path}>{page.label}</Link>
        ))}
        <div style={{ borderTop: "1px solid var(--line)", marginTop: 12, paddingTop: 12 }}>
          {displayName && (
            <p style={{ margin: "0 0 8px", fontSize: "0.85rem", fontWeight: 600 }}>{displayName}</p>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", color: "var(--muted)", font: "inherit", fontSize: "0.9rem" }}
          >
            Sign out
          </button>
        </div>
      </nav>
    </aside>
  );
}
