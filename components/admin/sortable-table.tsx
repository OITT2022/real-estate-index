"use client";

import { useState, useMemo } from "react";

type Column<T> = {
  key: string;
  label: string;
  getValue: (item: T) => string | number | boolean | null | undefined;
  render?: (item: T) => React.ReactNode;
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  getKey: (item: T) => string;
  gridTemplate: string;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
};

export function SortableTable<T>({ data, columns, getKey, gridTemplate, actions, emptyMessage }: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;

    return [...data].sort((a, b) => {
      const aVal = col.getValue(a);
      const bVal = col.getValue(b);

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal));
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, columns]);

  const tpl = actions ? `${gridTemplate} auto` : gridTemplate;

  return (
    <div className="card">
      <div className="st-row st-header muted" style={{ gridTemplateColumns: tpl }}>
        {columns.map((col) =>
          col.label ? (
            <div
              key={col.key}
              className="sortable-header"
              onClick={() => handleSort(col.key)}
            >
              {col.label}
              {sortKey === col.key && (
                <span className="sort-arrow">{sortDir === "asc" ? " ▲" : " ▼"}</span>
              )}
            </div>
          ) : (
            <div key={col.key} />
          )
        )}
        {actions && <div>Actions</div>}
      </div>

      {sorted.length === 0 && (
        <div className="st-row" style={{ gridTemplateColumns: "1fr" }}>
          <div className="muted">{emptyMessage ?? "No items."}</div>
        </div>
      )}

      {sorted.map((item) => (
        <div key={getKey(item)} className="st-row" style={{ gridTemplateColumns: tpl }}>
          {columns.map((col) => (
            <div key={col.key}>
              {col.render ? col.render(item) : String(col.getValue(item) ?? "-")}
            </div>
          ))}
          {actions && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {actions(item)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
