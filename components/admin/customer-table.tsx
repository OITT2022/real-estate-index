"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteCustomer } from "@/lib/actions";
import { SortableTable } from "@/components/admin/sortable-table";

type Row = {
  id: string;
  companyName: string;
  logoUrl: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
};

export function CustomerTable({ rows }: { rows: Row[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Delete this customer?")) return;
    await deleteCustomer(id);
    router.refresh();
  }

  return (
    <SortableTable
      data={rows}
      getKey={(r) => r.id}
      gridTemplate="48px 2fr 1.5fr 2fr 1.5fr 1fr 80px"
      emptyMessage="No customers yet."
      columns={[
        {
          key: "logo", label: "", getValue: () => "",
          render: (r) => (
            r.logoUrl
              ? <img src={r.logoUrl} alt={r.companyName} style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
              : <div style={{ width: 36, height: 36, borderRadius: 6, background: "var(--bg-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", color: "var(--muted)" }}>{r.companyName.charAt(0)}</div>
          ),
        },
        { key: "companyName", label: "Company", getValue: (r) => r.companyName },
        { key: "contactName", label: "Contact", getValue: (r) => r.contactName ?? "" },
        { key: "contactEmail", label: "Email", getValue: (r) => r.contactEmail ?? "" },
        { key: "contactPhone", label: "Phone", getValue: (r) => r.contactPhone ?? "" },
        { key: "createdAt", label: "Created", getValue: (r) => r.createdAt },
      ]}
      actions={(r) => (
        <>
          <Link href={`/admin/customers/${r.id}`} className="icon-btn" title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </Link>
          <button type="button" className="icon-btn icon-btn-danger" onClick={() => handleDelete(r.id)} title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </>
      )}
    />
  );
}
