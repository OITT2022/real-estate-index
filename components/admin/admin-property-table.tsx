"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { PropertyActions } from "@/components/admin/property-actions";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ApiToggle } from "@/components/admin/api-toggle";
import { Search, SlidersHorizontal, Plus, X, Building2, Eye, LayoutGrid, List, BedDouble, Ruler, MapPin } from "lucide-react";
import { useTableSort, SortIcon } from "@/lib/use-table-sort";

type Row = {
  id: string;
  title: string;
  slug: string;
  city: string;
  price: number;
  published: boolean;
  sold: boolean;
  status: string;
  propertyType: string | null;
  bedrooms: number | null;
  areaSqm: number | null;
  projectTitle: string | null;
  customerName: string | null;
  imageUrl: string | null;
  apiEnabled: boolean;
};

type Props = {
  rows: Row[];
  addUrl: string;
  filterCustomerName: string | null;
  showAllUrl: string | null;
};

type SortKey = "title" | "city" | "price" | "status" | "project" | "customer";

export function AdminPropertyTable({ rows, addUrl, filterCustomerName, showAllUrl }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Derive filter options from data
  const cities = useMemo(() => [...new Set(rows.map((r) => r.city))].sort(), [rows]);
  const types = useMemo(() => [...new Set(rows.map((r) => r.propertyType).filter(Boolean) as string[])].sort(), [rows]);

  const hasFilters = search || statusFilter || cityFilter || typeFilter;

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search) {
        const q = search.toLowerCase();
        if (!r.title.toLowerCase().includes(q) && !r.city.toLowerCase().includes(q)) return false;
      }
      if (statusFilter === "published" && !r.published) return false;
      if (statusFilter === "draft" && r.published) return false;
      if (statusFilter === "sold" && !r.sold) return false;
      if (cityFilter && r.city !== cityFilter) return false;
      if (typeFilter && r.propertyType !== typeFilter) return false;
      return true;
    });
  }, [rows, search, statusFilter, cityFilter, typeFilter]);

  const { sorted, sortKey, sortDir, toggleSort } = useTableSort<Row, SortKey>(filtered, (a, b, key) => {
    switch (key) {
      case "title": return a.title.localeCompare(b.title);
      case "city": return a.city.localeCompare(b.city);
      case "price": return a.price - b.price;
      case "status": return (a.published ? 1 : 0) - (b.published ? 1 : 0);
      case "project": return (a.projectTitle ?? "").localeCompare(b.projectTitle ?? "");
      case "customer": return (a.customerName ?? "").localeCompare(b.customerName ?? "");
      default: return 0;
    }
  });

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setCityFilter("");
    setTypeFilter("");
  }

  const gridCols = "56px 2.2fr 1fr 1fr 1.2fr 1fr 90px 60px 90px";

  return (
    <div>
      {/* ── Page Header ───────────────────────────────── */}
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">
            {filterCustomerName ? `Properties — ${filterCustomerName}` : "Properties"}
          </h1>
          <p className="at-page-subtitle">
            {rows.length} total listing{rows.length !== 1 ? "s" : ""}
            {showAllUrl && (
              <> &middot; <Link href={showAllUrl} className="at-link">Show all</Link></>
            )}
          </p>
        </div>
      </div>

      {/* ── Toolbar Card: Search + Filters + View Toggle + Add ── */}
      <div className="at-filter-card">
        <div className="at-filter-row">
          <div className="at-search-box">
            <Search size={16} className="at-search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or city..."
              className="at-search-input"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="at-search-clear">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="at-filter-group">
            <SlidersHorizontal size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="at-filter-select">
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="sold">Sold</option>
            </select>

            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="at-filter-select">
              <option value="">All Cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="at-filter-select">
              <option value="">All Types</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            {hasFilters && (
              <button type="button" onClick={clearFilters} className="at-filter-clear">
                <X size={14} /> Clear
              </button>
            )}
          </div>

          {/* View toggle + Add button */}
          <div className="at-toolbar-right">
            <div className="at-view-toggle">
              <button
                type="button"
                className={`at-view-btn ${viewMode === "list" ? "at-view-btn-active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List view"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                className={`at-view-btn ${viewMode === "grid" ? "at-view-btn-active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <Link href={addUrl} className="at-btn-primary">
              <Plus size={16} /> Add Property
            </Link>
          </div>
        </div>
      </div>

      {/* ── Empty State (shared) ─────────────────────── */}
      {sorted.length === 0 && (
        <div className="at-table-card">
          <div className="at-empty">
            <Building2 size={40} strokeWidth={1} />
            <p className="at-empty-title">
              {hasFilters ? "No properties match your filters" : "No properties yet"}
            </p>
            <p className="at-empty-sub">
              {hasFilters
                ? "Try adjusting your search or filters."
                : "Create your first listing to get started."}
            </p>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="at-btn-secondary" style={{ marginTop: 8 }}>
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── List View ─────────────────────────────────── */}
      {sorted.length > 0 && viewMode === "list" && (
        <div className="at-table-card">
          <div className="at-table-head" style={{ gridTemplateColumns: gridCols }}>
            <div></div>
            <div className="at-th" onClick={() => toggleSort("title")}>Property <SortIcon active={sortKey === "title"} dir={sortDir} /></div>
            <div className="at-th" onClick={() => toggleSort("city")}>City <SortIcon active={sortKey === "city"} dir={sortDir} /></div>
            <div className="at-th" onClick={() => toggleSort("price")}>Price <SortIcon active={sortKey === "price"} dir={sortDir} /></div>
            <div className="at-th" onClick={() => toggleSort("project")}>Project <SortIcon active={sortKey === "project"} dir={sortDir} /></div>
            <div className="at-th" onClick={() => toggleSort("customer")}>Customer <SortIcon active={sortKey === "customer"} dir={sortDir} /></div>
            <div className="at-th" onClick={() => toggleSort("status")}>Status <SortIcon active={sortKey === "status"} dir={sortDir} /></div>
            <div className="at-th">API</div>
            <div className="at-th">Actions</div>
          </div>

          {sorted.map((r) => (
            <div key={r.id} className="at-table-row" style={{ gridTemplateColumns: gridCols }}>
              <div>
                {r.imageUrl
                  ? <img src={r.imageUrl} alt="" className="at-thumb" />
                  : <div className="at-thumb at-thumb-empty"><Building2 size={18} strokeWidth={1.5} /></div>
                }
              </div>
              <div className="at-cell-title">
                <span className="at-title">{r.title}</span>
                {r.propertyType && <span className="at-subtitle">{r.propertyType}</span>}
              </div>
              <div className="at-cell">{r.city}</div>
              <div className="at-cell at-price">&euro;{r.price.toLocaleString()}</div>
              <div className="at-cell">
                {r.projectTitle ? <span className="at-tag">{r.projectTitle}</span> : <span className="at-muted">—</span>}
              </div>
              <div className="at-cell">
                {r.customerName ? <span>{r.customerName}</span> : <span className="at-muted">—</span>}
              </div>
              <div className="at-cell"><PublishToggle type="property" id={r.id} published={r.published} /></div>
              <div className="at-cell"><ApiToggle type="property" id={r.id} enabled={r.apiEnabled} /></div>
              <div className="at-cell at-actions">
                <Link href={`/properties/${r.slug}`} className="icon-btn" title="View" target="_blank"><Eye size={15} /></Link>
                <Link href={`/admin/properties/${r.id}`} className="icon-btn" title="Edit">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </Link>
                <PropertyActions propertyId={r.id} published={r.published} />
              </div>
            </div>
          ))}

          <div className="at-table-footer">
            <span>Showing <strong>{sorted.length}</strong> of <strong>{rows.length}</strong> properties</span>
          </div>
        </div>
      )}

      {/* ── Grid / Card View ──────────────────────────── */}
      {sorted.length > 0 && viewMode === "grid" && (
        <>
          <div className="at-card-grid">
            {sorted.map((r) => (
              <div key={r.id} className="at-property-card">
                {/* Image */}
                <div className="at-pcard-img-wrap">
                  {r.imageUrl
                    ? <img src={r.imageUrl} alt={r.title} className="at-pcard-img" />
                    : <div className="at-pcard-img at-pcard-img-empty"><Building2 size={32} strokeWidth={1} /></div>
                  }
                  <div className="at-pcard-badges">
                    <PublishToggle type="property" id={r.id} published={r.published} />
                    {r.sold && <span className="at-pcard-sold">Sold</span>}
                  </div>
                </div>

                {/* Body */}
                <div className="at-pcard-body">
                  <div className="at-pcard-price">&euro;{r.price.toLocaleString()}</div>
                  <h3 className="at-pcard-title">{r.title}</h3>
                  <p className="at-pcard-location"><MapPin size={13} /> {r.city}</p>

                  <div className="at-pcard-specs">
                    {r.bedrooms != null && (
                      <span className="at-pcard-spec"><BedDouble size={14} /> {r.bedrooms} Bed{r.bedrooms !== 1 ? "s" : ""}</span>
                    )}
                    {r.areaSqm != null && (
                      <span className="at-pcard-spec"><Ruler size={14} /> {r.areaSqm} sqm</span>
                    )}
                    {r.propertyType && (
                      <span className="at-pcard-spec">{r.propertyType}</span>
                    )}
                  </div>

                  {r.projectTitle && (
                    <div style={{ marginTop: 8 }}>
                      <span className="at-tag">{r.projectTitle}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="at-pcard-footer">
                  <Link href={`/properties/${r.slug}`} className="icon-btn" title="View" target="_blank"><Eye size={15} /></Link>
                  <Link href={`/admin/properties/${r.id}`} className="icon-btn" title="Edit">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </Link>
                  <PropertyActions propertyId={r.id} published={r.published} />
                </div>
              </div>
            ))}
          </div>
          <div className="at-table-card" style={{ marginTop: 16 }}>
            <div className="at-table-footer">
              <span>Showing <strong>{sorted.length}</strong> of <strong>{rows.length}</strong> properties</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
