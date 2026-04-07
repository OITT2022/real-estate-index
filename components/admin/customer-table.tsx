"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { deleteCustomer } from "@/lib/actions";
import { Search, Plus, ChevronUp, ChevronDown, X, Users } from "lucide-react";

type Row = {
  id: string;
  companyName: string;
  logoUrl: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
};

type SortKey = "companyName" | "contactName" | "contactEmail" | "createdAt";

export function CustomerTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const hasFilters = !!search;

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      r.companyName.toLowerCase().includes(q) ||
      (r.contactName?.toLowerCase().includes(q)) ||
      (r.contactEmail?.toLowerCase().includes(q))
    );
  }, [rows, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "companyName": cmp = a.companyName.localeCompare(b.companyName); break;
        case "contactName": cmp = (a.contactName ?? "").localeCompare(b.contactName ?? ""); break;
        case "contactEmail": cmp = (a.contactEmail ?? "").localeCompare(b.contactEmail ?? ""); break;
        case "createdAt": cmp = a.createdAt.localeCompare(b.createdAt); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }
  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp size={14} style={{ marginLeft: 2, opacity: 0.7 }} /> : <ChevronDown size={14} style={{ marginLeft: 2, opacity: 0.7 }} />;
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this customer?")) return;
    await deleteCustomer(id);
    router.refresh();
  }

  const gridCols = "44px 2fr 1.5fr 2fr 1.5fr 1fr 130px";

  return (
    <div>
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Customers</h1>
          <p className="at-page-subtitle">{rows.length} customer{rows.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="at-filter-card">
        <div className="at-filter-row">
          <div className="at-search-box">
            <Search size={16} className="at-search-icon" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by company, contact, or email..." className="at-search-input" />
            {search && <button type="button" onClick={() => setSearch("")} className="at-search-clear"><X size={14} /></button>}
          </div>
          {hasFilters && (
            <button type="button" onClick={() => setSearch("")} className="at-filter-clear"><X size={14} /> Clear</button>
          )}
          <div className="at-toolbar-right">
            <Link href="/admin/customers/new" className="at-btn-primary"><Plus size={16} /> Add Customer</Link>
          </div>
        </div>
      </div>

      <div className="at-table-card">
        <div className="at-table-head" style={{ gridTemplateColumns: gridCols }}>
          <div></div>
          <div className="at-th" onClick={() => toggleSort("companyName")}>Company <SortIcon col="companyName" /></div>
          <div className="at-th" onClick={() => toggleSort("contactName")}>Contact <SortIcon col="contactName" /></div>
          <div className="at-th" onClick={() => toggleSort("contactEmail")}>Email <SortIcon col="contactEmail" /></div>
          <div className="at-th">Phone</div>
          <div className="at-th" onClick={() => toggleSort("createdAt")}>Created <SortIcon col="createdAt" /></div>
          <div className="at-th">Actions</div>
        </div>

        {sorted.length === 0 && (
          <div className="at-empty">
            <Users size={40} strokeWidth={1} />
            <p className="at-empty-title">{hasFilters ? "No customers match your search" : "No customers yet"}</p>
            <p className="at-empty-sub">{hasFilters ? "Try a different search term." : "Add your first customer to get started."}</p>
          </div>
        )}

        {sorted.map((r) => (
          <div key={r.id} className="at-table-row" style={{ gridTemplateColumns: gridCols }}>
            <div>
              {r.logoUrl
                ? <img src={r.logoUrl} alt={r.companyName} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
                : <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-dark)" }}>{r.companyName.charAt(0)}</div>
              }
            </div>
            <div className="at-cell-title"><span className="at-title">{r.companyName}</span></div>
            <div className="at-cell">{r.contactName ?? <span className="at-muted">—</span>}</div>
            <div className="at-cell" style={{ fontSize: "0.85rem" }}>{r.contactEmail ?? <span className="at-muted">—</span>}</div>
            <div className="at-cell" style={{ fontSize: "0.85rem" }}>{r.contactPhone ?? <span className="at-muted">—</span>}</div>
            <div className="at-cell" style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{r.createdAt}</div>
            <div className="at-cell at-actions">
              <Link href={`/admin/projects?customerId=${r.id}`} className="icon-btn" title="Projects">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </Link>
              <Link href={`/admin/properties?customerId=${r.id}`} className="icon-btn" title="Properties">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </Link>
              <Link href={`/admin/customers/${r.id}`} className="icon-btn" title="Edit">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </Link>
              <button type="button" className="icon-btn icon-btn-danger" onClick={() => handleDelete(r.id)} title="Delete">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        ))}

        {sorted.length > 0 && (
          <div className="at-table-footer">
            <span>Showing <strong>{sorted.length}</strong> of <strong>{rows.length}</strong> customers</span>
          </div>
        )}
      </div>
    </div>
  );
}
