import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { db } from "@/lib/db";

export default async function AdminInquiriesPage() {
  const inquiries = await db.inquiry.findMany({
    include: { property: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
        <h1>Inquiries</h1>
        <p className="muted">{inquiries.length} total inquiries</p>

        <div className="card">
          <div className="admin-header-row muted">
            <div>Name</div>
            <div>Email</div>
            <div>Property</div>
            <div>Date</div>
            <div>Message</div>
          </div>
          {inquiries.length === 0 && (
            <div className="table-row">
              <div className="muted">No inquiries yet.</div>
            </div>
          )}
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="table-row">
              <div>{inquiry.fullName}</div>
              <div>{inquiry.email}</div>
              <div>{inquiry.property.title}</div>
              <div>{inquiry.createdAt.toLocaleDateString()}</div>
              <div className="muted">{inquiry.message.slice(0, 80)}{inquiry.message.length > 80 ? "…" : ""}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
