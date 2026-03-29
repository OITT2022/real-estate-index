"use client";

import Link from "next/link";
import { PropertyActions } from "@/components/admin/property-actions";
import { SortableTable } from "@/components/admin/sortable-table";

type Row = {
  id: string;
  title: string;
  city: string;
  price: number;
  published: boolean;
  projectTitle: string | null;
  imageUrl: string | null;
};

export function AdminPropertyTable({ rows }: { rows: Row[] }) {
  return (
    <SortableTable
      data={rows}
      getKey={(r) => r.id}
      gridTemplate="48px 2fr 1fr 1fr 1fr 1fr"
      emptyMessage="No properties yet. Create your first listing."
      columns={[
        {
          key: "image", label: "", getValue: () => "",
          render: (r) => r.imageUrl
            ? <img src={r.imageUrl} alt="" className="admin-thumb" />
            : <div className="admin-thumb admin-thumb-empty" />,
        },
        { key: "title", label: "Title", getValue: (r) => r.title },
        { key: "city", label: "City", getValue: (r) => r.city },
        { key: "price", label: "Price", getValue: (r) => r.price, render: (r) => <span>€{r.price.toLocaleString()}</span> },
        { key: "project", label: "Project", getValue: (r) => r.projectTitle, render: (r) => <span className={r.projectTitle ? "" : "muted"}>{r.projectTitle ?? "—"}</span> },
        { key: "status", label: "Status", getValue: (r) => r.published ? "Published" : "Draft" },
      ]}
      actions={(r) => (
        <>
          <Link href={`/admin/properties/${r.id}`} className="button-secondary">Edit</Link>
          <PropertyActions propertyId={r.id} published={r.published} />
        </>
      )}
    />
  );
}
