"use client";

import Link from "next/link";
import { ProjectActions } from "@/components/admin/project-actions";
import { PublishToggle } from "@/components/admin/publish-toggle";
import { ApiToggle } from "@/components/admin/api-toggle";
import { SortableTable } from "@/components/admin/sortable-table";

type Row = {
  id: string;
  title: string;
  city: string;
  developerName: string;
  customerName: string | null;
  units: number;
  published: boolean;
  imageUrl: string | null;
  apiEnabled: boolean;
};

export function AdminProjectTable({ rows }: { rows: Row[] }) {
  return (
    <SortableTable
      data={rows}
      getKey={(r) => r.id}
      gridTemplate="48px 2fr 1fr 1fr 1.2fr 1fr 90px 60px 80px"
      emptyMessage="No projects yet. Create your first project."
      columns={[
        {
          key: "image", label: "", getValue: () => "",
          render: (r) => r.imageUrl
            ? <img src={r.imageUrl} alt="" className="admin-thumb" />
            : <div className="admin-thumb admin-thumb-empty" />,
        },
        { key: "title", label: "Title", getValue: (r) => r.title },
        { key: "city", label: "City", getValue: (r) => r.city },
        { key: "developer", label: "Developer", getValue: (r) => r.developerName },
        { key: "customer", label: "Customer", getValue: (r) => r.customerName, render: (r) => <span className={r.customerName ? "" : "muted"}>{r.customerName ?? "—"}</span> },
        { key: "units", label: "Properties", getValue: (r) => r.units },
        {
          key: "status", label: "Status", getValue: (r) => r.published ? "Published" : "Draft",
          render: (r) => <PublishToggle type="project" id={r.id} published={r.published} />,
        },
        {
          key: "api", label: "API", getValue: (r) => r.apiEnabled ? "On" : "Off",
          render: (r) => <ApiToggle type="project" id={r.id} enabled={r.apiEnabled} />,
        },
      ]}
      actions={(r) => (
        <>
          <Link href={`/admin/projects/${r.id}`} className="icon-btn" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </Link>
          <ProjectActions projectId={r.id} published={r.published} />
        </>
      )}
    />
  );
}
