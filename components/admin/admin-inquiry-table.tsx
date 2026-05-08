"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Plus, X, MessageSquare, Eye } from "lucide-react";
import { useTableSort, SortIcon } from "@/lib/use-table-sort";

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
  const [customerFilter, setCustomerFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const customers = useMemo(() => [...new Set(rows.map((r) => r.customerName).filter(Boolean) as string[])].sort(), [rows]);
  const projects = useMemo(() => [...new Set(rows.map((r) => r.projectTitle).filter(Boolean) as string[])].sort(), [rows]);

  const hasFilters = search || statusFilter || customerFilter || projectFilter;

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        if (!r.fullName.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q) && !r.propertyTitle.toLowerCase().includes(q)) return false;
      }
      if (statusFilter && r.status !== statusFilter) return false;
      if (customerFilter && r.customerName !== customerFilter) return false;
      if (projectFilter && r.projectTitle !== projectFilter) return false;
      return true;
    });
  }, [rows, search, statusFilter, customerFilter, projectFilter]);

  const { sorted, sortKey, sortDir, toggleSort } = useTableSort<Row, SortKey>(filtered, (a, b, key) => {
    switch (key) {
      case "name": return a.fullName.localeCompare(b.fullName);
      case "email": return a.email.localeCompare(b.email);
      case "property": return a.propertyTitle.localeCompare(b.propertyTitle);
      case "status": return a.status.localeCompare(b.status);
      case "date": return a.date.localeCompare(b.date);
      default: return 0;
    }
  });

  function clearFilters() { setSearch(""); setStatusFilter(""); setCustomerFilter(""); setProjectFilter(""); }

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
            <select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} className="at-filter-select">
              <option value="">All Customers</option>
              {customers.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="at-filter-select">
              <option value="">All Projects</option>
              {projects.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {hasFilters && <button type="button" onClick={clearFilters} className="at-filter-clear"><X size={14} /> Clear</button>}
          </div>
          <div className="at-toolbar-right">
            <Link href="/admin/inquiries/new" className="at-btn-primary"><Plus size={16} /> Add Inquiry</Link>
          </div>
        </div>
      </div>

      <div className="at-table-card">
        <div className="at-table-head" style={{ gridTemplateColumns: gridCols }}>
          <div className="at-th" onClick={() => toggleSort("name")}>Name <SortIcon active={sortKey === "name"} dir={sortDir} /></div>
          <div className="at-th" onClick={() => toggleSort("email")}>Email <SortIcon active={sortKey === "email"} dir={sortDir} /></div>
          <div className="at-th" onClick={() => toggleSort("property")}>Property <SortIcon active={sortKey === "property"} dir={sortDir} /></div>
          <div className="at-th">Project</div>
          <div className="at-th">Customer</div>
          <div className="at-th" onClick={() => toggleSort("status")}>Status <SortIcon active={sortKey === "status"} dir={sortDir} /></div>
          <div className="at-th" onClick={() => toggleSort("date")}>Date <SortIcon active={sortKey === "date"} dir={sortDir} /></div>
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
