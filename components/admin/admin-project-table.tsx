"use client";

import Link from "next/link";
import { ProjectActions } from "@/components/admin/project-actions";
import { SortableTable } from "@/components/admin/sortable-table";

type Row = {
  id: string;
  title: string;
  city: string;
  developerName: string;
  units: number;
  published: boolean;
  imageUrl: string | null;
};

export function AdminProjectTable({ rows }: { rows: Row[] }) {
  return (
    <SortableTable
      data={rows}
      getKey={(r) => r.id}
      gridTemplate="48px 2fr 1fr 1fr 1fr 1fr"
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
        { key: "units", label: "Properties", getValue: (r) => r.units },
        { key: "status", label: "Status", getValue: (r) => r.published ? "Published" : "Draft" },
      ]}
      actions={(r) => (
        <>
          <Link href={`/admin/projects/${r.id}`} className="button-secondary">Edit</Link>
          <ProjectActions projectId={r.id} published={r.published} />
        </>
      )}
    />
  );
}
