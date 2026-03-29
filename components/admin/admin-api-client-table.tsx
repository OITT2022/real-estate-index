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
      gridTemplate="2fr 1fr 1fr 1fr 1fr 160px"
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
          <Link href={`/admin/api/${r.id}`} className="button-secondary">Edit</Link>
          <ApiClientActions clientId={r.id} active={r.active} />
        </>
      )}
    />
  );
}
