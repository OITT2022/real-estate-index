"use client";

import { SortableTable } from "@/components/admin/sortable-table";

type Row = {
  id: string;
  fullName: string;
  email: string;
  propertyTitle: string;
  date: string;
  message: string;
};

export function AdminInquiryTable({ rows }: { rows: Row[] }) {
  return (
    <SortableTable
      data={rows}
      getKey={(r) => r.id}
      gridTemplate="1.5fr 1.5fr 1.5fr 1fr 2fr"
      emptyMessage="No inquiries yet."
      columns={[
        { key: "name", label: "Name", getValue: (r) => r.fullName },
        { key: "email", label: "Email", getValue: (r) => r.email },
        { key: "property", label: "Property", getValue: (r) => r.propertyTitle },
        { key: "date", label: "Date", getValue: (r) => r.date },
        {
          key: "message",
          label: "Message",
          getValue: (r) => r.message,
          render: (r) => (
            <span className="muted">
              {r.message.slice(0, 80)}{r.message.length > 80 ? "…" : ""}
            </span>
          ),
        },
      ]}
    />
  );
}
