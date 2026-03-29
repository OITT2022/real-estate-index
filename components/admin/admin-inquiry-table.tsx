"use client";

import Link from "next/link";
import { SortableTable } from "@/components/admin/sortable-table";

type Row = {
  id: string;
  fullName: string;
  email: string;
  propertyTitle: string;
  projectTitle: string | null;
  status: string;
  date: string;
  message: string;
};

const STATUS_COLORS: Record<string, string> = {
  new: "publish-badge-off",
  "in-progress": "api-badge-on",
  closed: "publish-badge-on",
};

export function AdminInquiryTable({ rows }: { rows: Row[] }) {
  return (
    <SortableTable
      data={rows}
      getKey={(r) => r.id}
      gridTemplate="1.5fr 1.5fr 1.5fr 1fr 80px 1fr 80px"
      emptyMessage="No inquiries yet."
      columns={[
        { key: "name", label: "Name", getValue: (r) => r.fullName },
        { key: "email", label: "Email", getValue: (r) => r.email },
        { key: "property", label: "Property", getValue: (r) => r.propertyTitle },
        {
          key: "project", label: "Project", getValue: (r) => r.projectTitle,
          render: (r) => <span className={r.projectTitle ? "" : "muted"}>{r.projectTitle ?? "—"}</span>,
        },
        {
          key: "status", label: "Status", getValue: (r) => r.status,
          render: (r) => (
            <span className={`api-badge ${STATUS_COLORS[r.status] ?? "api-badge-off"}`}>
              {r.status}
            </span>
          ),
        },
        { key: "date", label: "Date", getValue: (r) => r.date },
      ]}
      actions={(r) => (
        <Link href={`/admin/inquiries/${r.id}`} className="icon-btn" title="Open CRM">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </Link>
      )}
    />
  );
}
