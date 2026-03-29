"use client";

import Link from "next/link";
import { ApiClientActions } from "@/components/admin/api-client-actions";
import { SortableTable } from "@/components/admin/sortable-table";

type Row = {
  id: string;
  name: string;
  tokenPrefix: string;
  active: boolean;
  createdAt: string;
  propertyFieldCount: number;
  projectFieldCount: number;
};

export function AdminApiClientTable({ rows }: { rows: Row[] }) {
  return (
    <SortableTable
      data={rows}
      getKey={(r) => r.id}
      gridTemplate="2fr 1fr 1fr 1fr 1fr 80px"
      emptyMessage="No API clients yet. Create your first client."
      columns={[
        { key: "name", label: "Name", getValue: (r) => r.name },
        {
          key: "token", label: "Token", getValue: (r) => r.tokenPrefix,
          render: (r) => <code style={{ fontSize: "0.85rem", color: "var(--muted)" }}>{r.tokenPrefix}...</code>,
        },
        {
          key: "fields", label: "Fields", getValue: (r) => r.propertyFieldCount + r.projectFieldCount,
          render: (r) => <span>{r.propertyFieldCount}P / {r.projectFieldCount}Pr</span>,
        },
        {
          key: "status", label: "Status", getValue: (r) => r.active ? "Active" : "Inactive",
          render: (r) => (
            <span className={`api-badge ${r.active ? "api-badge-on" : "api-badge-off"}`}>
              {r.active ? "Active" : "Inactive"}
            </span>
          ),
        },
        { key: "created", label: "Created", getValue: (r) => r.createdAt },
      ]}
      actions={(r) => (
        <>
          <Link href={`/admin/api/${r.id}`} className="icon-btn" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </Link>
          <ApiClientActions clientId={r.id} active={r.active} />
        </>
      )}
    />
  );
}
