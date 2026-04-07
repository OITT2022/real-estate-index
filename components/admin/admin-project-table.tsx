"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { ProjectActions } from "@/components/admin/project-actions";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ApiToggle } from "@/components/admin/api-toggle";
import { Search, SlidersHorizontal, Plus, ChevronUp, ChevronDown, X, FolderKanban, LayoutGrid, List, MapPin, Building2 } from "lucide-react";

type Row = {
  id: string;
  title: string;
  slug: string;
  city: string;
  developerName: string;
  customerName: string | null;
  units: number;
  published: boolean;
  status: string;
  imageUrl: string | null;
  apiEnabled: boolean;
};

type Props = {
  rows: Row[];
  addUrl: string;
  filterCustomerName: string | null;
  showAllUrl: string | null;
};

type SortKey = "title" | "city" | "developer" | "customer" | "units" | "status";

export function AdminProjectTable({ rows, addUrl, filterCustomerName, showAllUrl }: Props) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const cities = useMemo(() => [...new Set(rows.map((r) => r.city))].sort(), [rows]);
  const hasFilters = search || statusFilter || cityFilter;

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        if (!r.title.toLowerCase().includes(q) && !r.city.toLowerCase().includes(q) && !r.developerName.toLowerCase().includes(q)) return false;
      }
      if (statusFilter === "published" && !r.published) return false;
      if (statusFilter === "draft" && r.published) return false;
      if (cityFilter && r.city !== cityFilter) return false;
      return true;
    });
  }, [rows, search, statusFilter, cityFilter]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title": cmp = a.title.localeCompare(b.title); break;
        case "city": cmp = a.city.localeCompare(b.city); break;
        case "developer": cmp = a.developerName.localeCompare(b.developerName); break;
        case "customer": cmp = (a.customerName ?? "").localeCompare(b.customerName ?? ""); break;
        case "units": cmp = a.units - b.units; break;
        case "status": cmp = (a.published ? 1 : 0) - (b.published ? 1 : 0); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }
  function clearFilters() { setSearch(""); setStatusFilter(""); setCityFilter(""); }
  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? <ChevronUp size={14} style={{ marginLeft: 2, opacity: 0.7 }} /> : <ChevronDown size={14} style={{ marginLeft: 2, opacity: 0.7 }} />;
  }

  const gridCols = "56px 2fr 1fr 1.2fr 1fr 80px 90px 60px 90px";

  return (
    <div>
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">{filterCustomerName ? `Projects — ${filterCustomerName}` : "Projects"}</h1>
          <p className="at-page-subtitle">
            {rows.length} total project{rows.length !== 1 ? "s" : ""}
            {showAllUrl && <> &middot; <Link href={showAllUrl} className="at-link">Show all</Link></>}
          </p>
        </div>
      </div>

      <div className="at-filter-card">
        <div className="at-filter-row">
          <div className="at-search-box">
            <Search size={16} className="at-search-icon" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, city, or developer..." className="at-search-input" />
            {search && <button type="button" onClick={() => setSearch("")} className="at-search-clear"><X size={14} /></button>}
          </div>
          <div className="at-filter-group">
            <SlidersHorizontal size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="at-filter-select">
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="at-filter-select">
              <option value="">All Cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {hasFilters && <button type="button" onClick={clearFilters} className="at-filter-clear"><X size={14} /> Clear</button>}
          </div>
          <div className="at-toolbar-right">
            <div className="at-view-toggle">
              <button type="button" className={`at-view-btn ${viewMode === "list" ? "at-view-btn-active" : ""}`} onClick={() => setViewMode("list")} title="List view"><List size={16} /></button>
              <button type="button" className={`at-view-btn ${viewMode === "grid" ? "at-view-btn-active" : ""}`} onClick={() => setViewMode("grid")} title="Grid view"><LayoutGrid size={16} /></button>
            </div>
            <Link href={addUrl} className="at-btn-primary"><Plus size={16} /> Add Project</Link>
          </div>
        </div>
      </div>

      {/* Empty */}
      {sorted.length === 0 && (
        <div className="at-table-card">
          <div className="at-empty">
            <FolderKanban size={40} strokeWidth={1} />
            <p className="at-empty-title">{hasFilters ? "No projects match your filters" : "No projects yet"}</p>
            <p className="at-empty-sub">{hasFilters ? "Try adjusting your search or filters." : "Create your first project to get started."}</p>
            {hasFilters && <button type="button" onClick={clearFilters} className="at-btn-secondary" style={{ marginTop: 8 }}>Clear Filters</button>}
          </div>
        </div>
      )}

      {/* List View */}
      {sorted.length > 0 && viewMode === "list" && (
        <div className="at-table-card">
          <div className="at-table-head" style={{ gridTemplateColumns: gridCols }}>
            <div></div>
            <div className="at-th" onClick={() => toggleSort("title")}>Project <SortIcon col="title" /></div>
            <div className="at-th" onClick={() => toggleSort("city")}>City <SortIcon col="city" /></div>
            <div className="at-th" onClick={() => toggleSort("developer")}>Developer <SortIcon col="developer" /></div>
            <div className="at-th" onClick={() => toggleSort("customer")}>Customer <SortIcon col="customer" /></div>
            <div className="at-th" onClick={() => toggleSort("units")}>Units <SortIcon col="units" /></div>
            <div className="at-th" onClick={() => toggleSort("status")}>Status <SortIcon col="status" /></div>
            <div className="at-th">API</div>
            <div className="at-th">Actions</div>
          </div>
          {sorted.map((r) => (
            <div key={r.id} className="at-table-row" style={{ gridTemplateColumns: gridCols }}>
              <div>{r.imageUrl ? <img src={r.imageUrl} alt="" className="at-thumb" /> : <div className="at-thumb at-thumb-empty"><FolderKanban size={18} strokeWidth={1.5} /></div>}</div>
              <div className="at-cell-title"><span className="at-title">{r.title}</span></div>
              <div className="at-cell">{r.city}</div>
              <div className="at-cell">{r.developerName}</div>
              <div className="at-cell">{r.customerName ? <span>{r.customerName}</span> : <span className="at-muted">—</span>}</div>
              <div className="at-cell"><strong>{r.units}</strong></div>
              <div className="at-cell"><PublishToggle type="project" id={r.id} published={r.published} /></div>
              <div className="at-cell"><ApiToggle type="project" id={r.id} enabled={r.apiEnabled} /></div>
              <div className="at-cell at-actions">
                <Link href={`/admin/projects/${r.id}`} className="icon-btn" title="Edit">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </Link>
                <ProjectActions projectId={r.id} published={r.published} />
              </div>
            </div>
          ))}
          <div className="at-table-footer"><span>Showing <strong>{sorted.length}</strong> of <strong>{rows.length}</strong> projects</span></div>
        </div>
      )}

      {/* Grid View */}
      {sorted.length > 0 && viewMode === "grid" && (
        <>
          <div className="at-card-grid">
            {sorted.map((r) => (
              <div key={r.id} className="at-property-card">
                <div className="at-pcard-img-wrap">
                  {r.imageUrl ? <img src={r.imageUrl} alt={r.title} className="at-pcard-img" /> : <div className="at-pcard-img at-pcard-img-empty"><FolderKanban size={32} strokeWidth={1} /></div>}
                  <div className="at-pcard-badges"><PublishToggle type="project" id={r.id} published={r.published} /></div>
                </div>
                <div className="at-pcard-body">
                  <h3 className="at-pcard-title">{r.title}</h3>
                  <p className="at-pcard-location"><MapPin size={13} /> {r.city}</p>
                  <div className="at-pcard-specs">
                    <span className="at-pcard-spec"><Building2 size={14} /> {r.developerName}</span>
                    <span className="at-pcard-spec">{r.units} propert{r.units !== 1 ? "ies" : "y"}</span>
                  </div>
                  {r.customerName && <div style={{ marginTop: 8 }}><span className="at-tag">{r.customerName}</span></div>}
                </div>
                <div className="at-pcard-footer">
                  <Link href={`/admin/projects/${r.id}`} className="icon-btn" title="Edit">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </Link>
                  <ProjectActions projectId={r.id} published={r.published} />
                </div>
              </div>
            ))}
          </div>
          <div className="at-table-card" style={{ marginTop: 16 }}><div className="at-table-footer"><span>Showing <strong>{sorted.length}</strong> of <strong>{rows.length}</strong> projects</span></div></div>
        </>
      )}
    </div>
  );
}
