"use client";

import Link from "next/link";
import { PropertyActions } from "@/components/admin/property-actions";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ApiToggle } from "@/components/admin/api-toggle";
import { SortableTable } from "@/components/admin/sortable-table";

type Row = {
  id: string;
  title: string;
  city: string;
  price: number;
  published: boolean;
  projectTitle: string | null;
  customerName: string | null;
  imageUrl: string | null;
  apiEnabled: boolean;
};

export function AdminPropertyTable({ rows }: { rows: Row[] }) {
  return (
    <SortableTable
      data={rows}
      getKey={(r) => r.id}
      gridTemplate="48px 2fr 1fr 1fr 1fr 1.2fr 90px 60px 80px"
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
        { key: "customer", label: "Customer", getValue: (r) => r.customerName, render: (r) => <span className={r.customerName ? "" : "muted"}>{r.customerName ?? "—"}</span> },
        {
          key: "status", label: "Status", getValue: (r) => r.published ? "Published" : "Draft",
          render: (r) => <PublishToggle type="property" id={r.id} published={r.published} />,
        },
        {
          key: "api", label: "API", getValue: (r) => r.apiEnabled ? "On" : "Off",
          render: (r) => <ApiToggle type="property" id={r.id} enabled={r.apiEnabled} />,
        },
      ]}
      actions={(r) => (
        <>
          <Link href={`/admin/properties/${r.id}`} className="icon-btn" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </Link>
          <PropertyActions propertyId={r.id} published={r.published} />
        </>
      )}
    />
  );
}
