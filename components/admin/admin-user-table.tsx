"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { deleteAdminUser } from "@/lib/actions";
import { Search, Plus, ChevronUp, ChevronDown, X, Shield, SlidersHorizontal } from "lucide-react";

type Row = {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  active: boolean;
  pageCount: number;
  createdAt: string;
};

type SortKey = "name" | "email" | "role" | "status" | "createdAt";

export function AdminUserTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const hasFilters = search || roleFilter || statusFilter;

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        if (!r.name.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q)) return false;
      }
      if (roleFilter === "super" && !r.isSuperAdmin) return false;
      if (roleFilter === "user" && r.isSuperAdmin) return false;
      if (statusFilter === "active" && !r.active) return false;
      if (statusFilter === "inactive" && r.active) return false;
      return true;
    });
  }, [rows, search, roleFilter, statusFilter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "email": cmp = a.email.localeCompare(b.email); break;
        case "role": cmp = (a.isSuperAdmin ? 1 : 0) - (b.isSuperAdmin ? 1 : 0); break;
        case "status": cmp = (a.active ? 1 : 0) - (b.active ? 1 : 0); break;
        case "createdAt": cmp = a.createdAt.localeCompare(b.createdAt); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }
  function clearFilters() { setSearch(""); setRoleFilter(""); setStatusFilter(""); }
  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp size={14} style={{ marginLeft: 2, opacity: 0.7 }} /> : <ChevronDown size={14} style={{ marginLeft: 2, opacity: 0.7 }} />;
  }

  async function handleDelete(id: string, isSuperAdmin: boolean) {
    if (isSuperAdmin) { alert("Cannot delete a super admin"); return; }
    if (!confirm("Delete this user?")) return;
    await deleteAdminUser(id);
    router.refresh();
  }

  const gridCols = "2fr 2fr 1fr 1fr 1fr 90px";

  return (
    <div>
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">User Management</h1>
          <p className="at-page-subtitle">{rows.length} admin user{rows.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="at-filter-card">
        <div className="at-filter-row">
          <div className="at-search-box">
            <Search size={16} className="at-search-icon" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="at-search-input" />
            {search && <button type="button" onClick={() => setSearch("")} className="at-search-clear"><X size={14} /></button>}
          </div>
          <div className="at-filter-group">
            <SlidersHorizontal size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="at-filter-select">
              <option value="">All Roles</option>
              <option value="super">Super Admin</option>
              <option value="user">User</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="at-filter-select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {hasFilters && <button type="button" onClick={clearFilters} className="at-filter-clear"><X size={14} /> Clear</button>}
          </div>
          <div className="at-toolbar-right">
            <Link href="/admin/users/new" className="at-btn-primary"><Plus size={16} /> Add User</Link>
          </div>
        </div>
      </div>

      <div className="at-table-card">
        <div className="at-table-head" style={{ gridTemplateColumns: gridCols }}>
          <div className="at-th" onClick={() => toggleSort("name")}>Name <SortIcon col="name" /></div>
          <div className="at-th" onClick={() => toggleSort("email")}>Email <SortIcon col="email" /></div>
          <div className="at-th" onClick={() => toggleSort("role")}>Role <SortIcon col="role" /></div>
          <div className="at-th">Pages</div>
          <div className="at-th" onClick={() => toggleSort("status")}>Status <SortIcon col="status" /></div>
          <div className="at-th">Actions</div>
        </div>

        {sorted.length === 0 && (
          <div className="at-empty">
            <Shield size={40} strokeWidth={1} />
            <p className="at-empty-title">{hasFilters ? "No users match your filters" : "No users yet"}</p>
            <p className="at-empty-sub">{hasFilters ? "Try adjusting your search or filters." : "Add your first admin user."}</p>
          </div>
        )}

        {sorted.map((r) => (
          <div key={r.id} className="at-table-row" style={{ gridTemplateColumns: gridCols }}>
            <div className="at-cell-title"><span className="at-title">{r.name}</span></div>
            <div className="at-cell" style={{ fontSize: "0.85rem" }}>{r.email}</div>
            <div className="at-cell">
              <span className={`api-badge ${r.isSuperAdmin ? "api-badge-on" : "api-badge-off"}`}>
                {r.isSuperAdmin ? "Super Admin" : "User"}
              </span>
            </div>
            <div className="at-cell">{r.isSuperAdmin ? "All" : `${r.pageCount} pages`}</div>
            <div className="at-cell">
              <span className={`publish-badge ${r.active ? "publish-badge-on" : "publish-badge-off"}`}>
                {r.active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="at-cell at-actions">
              <Link href={`/admin/users/${r.id}`} className="icon-btn" title="Edit">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </Link>
              {!r.isSuperAdmin && (
                <button type="button" className="icon-btn icon-btn-danger" onClick={() => handleDelete(r.id, r.isSuperAdmin)} title="Delete">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              )}
            </div>
          </div>
        ))}

        {sorted.length > 0 && (
          <div className="at-table-footer">
            <span>Showing <strong>{sorted.length}</strong> of <strong>{rows.length}</strong> users</span>
          </div>
        )}
      </div>
    </div>
  );
}
