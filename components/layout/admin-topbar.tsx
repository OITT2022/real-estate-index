"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, Bell, LogOut, KeyRound, User } from "lucide-react";
import { ADMIN_PAGES } from "@/lib/admin-pages";
import { getRecentInquiriesForCurrentUser, type RecentInquiry } from "@/lib/actions";

function useDropdownClose(ref: React.RefObject<HTMLElement | null>, onClose: () => void, open: boolean) {
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [ref, onClose, open]);
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function AdminTopbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as { name?: string; email?: string; profileImage?: string | null } | undefined;

  const displayName = user?.name || user?.email || "";
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "A";
  const profileImage = user?.profileImage;

  const crumbs = buildBreadcrumb(pathname);

  // ── Notifications ──
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifs, setNotifs] = useState<RecentInquiry[]>([]);
  const [newCount, setNewCount] = useState<number>(0);
  const notifRef = useRef<HTMLDivElement>(null);
  useDropdownClose(notifRef, () => setNotifOpen(false), notifOpen);

  async function refreshNotifs() {
    setNotifLoading(true);
    try {
      const res = await getRecentInquiriesForCurrentUser(5);
      setNotifs(res.inquiries);
      setNewCount(res.newCount);
    } finally {
      setNotifLoading(false);
    }
  }

  // Initial badge fetch on mount (badge accuracy without opening the popover).
  useEffect(() => {
    if (!session) return;
    refreshNotifs();
  }, [session]);

  function toggleNotif() {
    if (!notifOpen) refreshNotifs();
    setNotifOpen((v) => !v);
    setUserOpen(false);
  }

  // ── User menu ──
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  useDropdownClose(userRef, () => setUserOpen(false), userOpen);

  function toggleUser() {
    setUserOpen((v) => !v);
    setNotifOpen(false);
  }

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
        {/* Bell + notifications popover */}
        <div className="admin-topbar-anchor" ref={notifRef}>
          <button type="button" className="admin-topbar-icon" title="Notifications" onClick={toggleNotif} aria-haspopup="menu" aria-expanded={notifOpen}>
            <Bell size={18} />
            {newCount > 0 && <span className="admin-topbar-badge">{newCount}</span>}
          </button>

          {notifOpen && (
            <div className="admin-dropdown admin-notif-popover" role="menu">
              <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: "0.85rem" }}>Notifications</strong>
                <span className="muted" style={{ fontSize: "0.75rem" }}>{newCount} new</span>
              </div>
              {notifLoading && notifs.length === 0 ? (
                <div className="admin-notif-empty">Loading...</div>
              ) : notifs.length === 0 ? (
                <div className="admin-notif-empty">No new inquiries.</div>
              ) : (
                notifs.map((inq) => (
                  <Link
                    key={inq.id}
                    href={`/admin/inquiries/${inq.id}`}
                    className="admin-dropdown-item admin-notif-row"
                    onClick={() => setNotifOpen(false)}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <strong style={{ fontSize: "0.85rem" }}>{inq.fullName}</strong>
                        <span className="muted" style={{ fontSize: "0.7rem" }}>{timeAgo(inq.createdAt)}</span>
                      </div>
                      <span className="muted" style={{ fontSize: "0.78rem" }}>{inq.subjectTitle}</span>
                    </div>
                  </Link>
                ))
              )}
              <div className="admin-dropdown-divider" />
              <Link
                href="/admin/inquiries"
                className="admin-dropdown-item"
                onClick={() => setNotifOpen(false)}
                style={{ justifyContent: "center", fontWeight: 600 }}
              >
                View all inquiries
              </Link>
            </div>
          )}
        </div>

        {/* Avatar + user menu */}
        <div className="admin-topbar-anchor" ref={userRef}>
          <button
            type="button"
            className="admin-topbar-user"
            onClick={toggleUser}
            aria-haspopup="menu"
            aria-expanded={userOpen}
            style={{ background: "transparent", border: 0 }}
          >
            {profileImage ? (
              <img src={profileImage} alt={displayName} className="admin-topbar-avatar" style={{ objectFit: "cover" }} />
            ) : (
              <div className="admin-topbar-avatar">{initials}</div>
            )}
            <div className="admin-topbar-user-info">
              <div className="admin-topbar-user-name">{displayName}</div>
              <div className="admin-topbar-user-role">Admin</div>
            </div>
          </button>

          {userOpen && (
            <div className="admin-dropdown" role="menu">
              <Link href="/admin/profile" className="admin-dropdown-item" onClick={() => setUserOpen(false)}>
                <User size={15} />
                Profile
              </Link>
              <Link href="/admin/change-password" className="admin-dropdown-item" onClick={() => setUserOpen(false)}>
                <KeyRound size={15} />
                Change password
              </Link>
              <div className="admin-dropdown-divider" />
              <button
                type="button"
                className="admin-dropdown-item"
                onClick={() => {
                  setUserOpen(false);
                  signOut({ callbackUrl: "/admin/login" });
                }}
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
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

  const matched = ADMIN_PAGES.find(
    (p) => pathname === p.path || pathname.startsWith(p.path + "/")
  );

  if (matched) {
    if (pathname !== matched.path) {
      crumbs.push({ label: matched.label, href: matched.path });
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
