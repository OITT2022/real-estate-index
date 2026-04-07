"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ChevronUp, ChevronDown, X, MessageSquare, Eye } from "lucide-react";

type Row = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  propertyTitle: string;
  projectTitle: string | null;
  customerName: string | null;
  status: string;
  date: string;
  message: string;
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  new: { bg: "#dbeafe", text: "#1e40af" },
  "in-progress": { bg: "#fef9c3", text: "#854d0e" },
  closed: { bg: "#dcfce7", text: "#166534" },
};

type SortKey = "name" | "email" | "property" | "status" | "date";

export function AdminInquiryTable({ rows }: { rows: Row[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const hasFilters = search || statusFilter;

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        if (!r.fullName.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q) && !r.propertyTitle.toLowerCase().includes(q)) return false;
      }
      if (statusFilter && r.status !== statusFilter) return false;
      return true;
    });
  }, [rows, search, statusFilter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.fullName.localeCompare(b.fullName); break;
        case "email": cmp = a.email.localeCompare(b.email); break;
        case "property": cmp = a.propertyTitle.localeCompare(b.propertyTitle); break;
        case "status": cmp = a.status.localeCompare(b.status); break;
        case "date": cmp = a.date.localeCompare(b.date); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }
  function clearFilters() { setSearch(""); setStatusFilter(""); }
  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp size={14} style={{ marginLeft: 2, opacity: 0.7 }} /> : <ChevronDown size={14} style={{ marginLeft: 2, opacity: 0.7 }} />;
  }

  const gridCols = "1.5fr 1.5fr 1.5fr 1fr 1fr 90px 1fr 70px";

  return (
    <div>
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Inquiries</h1>
          <p className="at-page-subtitle">{rows.length} total inquiries</p>
        </div>
      </div>

      <div className="at-filter-card">
        <div className="at-filter-row">
          <div className="at-search-box">
            <Search size={16} className="at-search-icon" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or property..." className="at-search-input" />
            {search && <button type="button" onClick={() => setSearch("")} className="at-search-clear"><X size={14} /></button>}
          </div>
          <div className="at-filter-group">
            <SlidersHorizontal size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="at-filter-select">
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="in-progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
            {hasFilters && <button type="button" onClick={clearFilters} className="at-filter-clear"><X size={14} /> Clear</button>}
          </div>
        </div>
      </div>

      <div className="at-table-card">
        <div className="at-table-head" style={{ gridTemplateColumns: gridCols }}>
          <div className="at-th" onClick={() => toggleSort("name")}>Name <SortIcon col="name" /></div>
          <div className="at-th" onClick={() => toggleSort("email")}>Email <SortIcon col="email" /></div>
          <div className="at-th" onClick={() => toggleSort("property")}>Property <SortIcon col="property" /></div>
          <div className="at-th">Project</div>
          <div className="at-th">Customer</div>
          <div className="at-th" onClick={() => toggleSort("status")}>Status <SortIcon col="status" /></div>
          <div className="at-th" onClick={() => toggleSort("date")}>Date <SortIcon col="date" /></div>
          <div className="at-th">Action</div>
        </div>

        {sorted.length === 0 && (
          <div className="at-empty">
            <MessageSquare size={40} strokeWidth={1} />
            <p className="at-empty-title">{hasFilters ? "No inquiries match your filters" : "No inquiries yet"}</p>
            <p className="at-empty-sub">{hasFilters ? "Try adjusting your search or filters." : "Inquiries from your property pages will appear here."}</p>
            {hasFilters && <button type="button" onClick={clearFilters} className="at-btn-secondary" style={{ marginTop: 8 }}>Clear Filters</button>}
          </div>
        )}

        {sorted.map((r) => {
          const st = STATUS_STYLES[r.status] ?? { bg: "#f1f5f9", text: "#475569" };
          return (
            <div key={r.id} className="at-table-row" style={{ gridTemplateColumns: gridCols }}>
              <div className="at-cell-title">
                <span className="at-title">{r.fullName}</span>
                {r.phone && <span className="at-subtitle">{r.phone}</span>}
              </div>
              <div className="at-cell" style={{ fontSize: "0.85rem" }}>{r.email}</div>
              <div className="at-cell">{r.propertyTitle}</div>
              <div className="at-cell">{r.projectTitle ? <span className="at-tag">{r.projectTitle}</span> : <span className="at-muted">—</span>}</div>
              <div className="at-cell">{r.customerName ?? <span className="at-muted">—</span>}</div>
              <div className="at-cell">
                <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 999, fontSize: "0.75rem", fontWeight: 600, background: st.bg, color: st.text, textTransform: "capitalize" }}>
                  {r.status}
                </span>
              </div>
              <div className="at-cell" style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{r.date}</div>
              <div className="at-cell at-actions">
                <Link href={`/admin/inquiries/${r.id}`} className="icon-btn" title="Open CRM">
                  <Eye size={15} />
                </Link>
              </div>
            </div>
          );
        })}

        {sorted.length > 0 && (
          <div className="at-table-footer">
            <span>Showing <strong>{sorted.length}</strong> of <strong>{rows.length}</strong> inquiries</span>
          </div>
        )}
      </div>
    </div>
  );
}
