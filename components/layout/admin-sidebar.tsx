"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <p className="eyebrow">Admin</p>
      <nav>
        <Link href="/admin/dashboard">Dashboard</Link>
        <Link href="/admin/homepage">Home Page</Link>
        <Link href="/admin/properties">Properties</Link>
        <Link href="/admin/projects">Projects</Link>
        <Link href="/admin/inquiries">Inquiries</Link>
        <Link href="/admin/maps">Maps</Link>
        <Link href="/admin/api">API Clients</Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", color: "inherit", font: "inherit" }}
        >
          Sign out
        </button>
      </nav>
    </aside>
  );
}
