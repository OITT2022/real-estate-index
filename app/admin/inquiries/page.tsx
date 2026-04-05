import { AdminInquiryTable } from "@/components/admin/admin-inquiry-table";
import { db } from "@/lib/db";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser, propertyCustomerScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  await checkPageAccess("inquiries");
  const sessionUser = await getSessionUser();
  const propScope = sessionUser ? propertyCustomerScope(sessionUser) : undefined;

  const inquiries = await db.inquiry.findMany({
    where: propScope ? { property: propScope } : undefined,
    include: {
      property: {
        select: {
          title: true,
          customerId: true,
          customer: { select: { companyName: true } },
          project: { select: { customerId: true, customer: { select: { companyName: true } } } },
        },
      },
      project: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = inquiries.map((inq) => ({
    id: inq.id,
    fullName: inq.fullName,
    email: inq.email,
    propertyTitle: inq.property.title,
    projectTitle: inq.project?.title ?? null,
    customerName:
      inq.property.project?.customer?.companyName
      ?? inq.property.customer?.companyName
      ?? null,
    status: inq.status,
    date: inq.createdAt.toLocaleDateString(),
    message: inq.message,
  }));

  return (
    <section className="admin-content">
        <h1>Inquiries</h1>
        <p className="muted">{inquiries.length} total inquiries</p>
        <AdminInquiryTable rows={rows} />
      </section>
  );
}
