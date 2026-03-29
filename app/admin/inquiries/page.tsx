import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminInquiryTable } from "@/components/admin/admin-inquiry-table";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const inquiries = await db.inquiry.findMany({
    include: { property: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows = inquiries.map((inq) => ({
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
        <AdminInquiryTable rows={rows} />
      </section>
    </main>
  );
}
