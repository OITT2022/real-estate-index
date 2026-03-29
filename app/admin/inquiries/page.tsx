import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { SortableTable } from "@/components/admin/sortable-table";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  fullName: string;
  email: string;
  propertyTitle: string;
  date: string;
  message: string;
};

export default async function AdminInquiriesPage() {
  const inquiries = await db.inquiry.findMany({
    include: { property: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows: Row[] = inquiries.map((inq) => ({
    id: inq.id,
    fullName: inq.fullName,
    email: inq.email,
    propertyTitle: inq.property.title,
    date: inq.createdAt.toLocaleDateString(),
    message: inq.message,
  }));

  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
        <h1>Inquiries</h1>
        <p className="muted">{inquiries.length} total inquiries</p>

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
      </section>
    </main>
  );
}
