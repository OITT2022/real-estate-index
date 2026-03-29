"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteAdminUser } from "@/lib/actions";
import { SortableTable } from "@/components/admin/sortable-table";

type Row = {
  id: string;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  active: boolean;
  pageCount: number;
  createdAt: string;
};

export function AdminUserTable({ rows }: { rows: Row[] }) {
  const router = useRouter();

  async function handleDelete(id: string, isSuperAdmin: boolean) {
    if (isSuperAdmin) { alert("Cannot delete a super admin"); return; }
    if (!confirm("Delete this user?")) return;
    await deleteAdminUser(id);
    router.refresh();
  }

  return (
    <SortableTable
      data={rows}
      getKey={(r) => r.id}
      gridTemplate="2fr 2fr 1fr 1fr 1fr 80px"
      emptyMessage="No users yet."
      columns={[
        { key: "name", label: "Name", getValue: (r) => r.name },
        { key: "email", label: "Email", getValue: (r) => r.email },
        {
          key: "role", label: "Role", getValue: (r) => r.isSuperAdmin ? "Super Admin" : "User",
          render: (r) => (
            <span className={`api-badge ${r.isSuperAdmin ? "api-badge-on" : "api-badge-off"}`}>
              {r.isSuperAdmin ? "Super Admin" : "User"}
            </span>
          ),
        },
        {
          key: "pages", label: "Pages", getValue: (r) => r.isSuperAdmin ? "All" : r.pageCount,
          render: (r) => <span>{r.isSuperAdmin ? "All" : `${r.pageCount} pages`}</span>,
        },
        {
          key: "status", label: "Status", getValue: (r) => r.active ? "Active" : "Inactive",
          render: (r) => (
            <span className={`publish-badge ${r.active ? "publish-badge-on" : "publish-badge-off"}`}>
              {r.active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      actions={(r) => (
        <>
          <Link href={`/admin/users/${r.id}`} className="icon-btn" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </Link>
          {!r.isSuperAdmin && (
            <button type="button" className="icon-btn icon-btn-danger" onClick={() => handleDelete(r.id, r.isSuperAdmin)} title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          )}
        </>
      )}
    />
  );
}
