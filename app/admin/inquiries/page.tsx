import { db } from "@/lib/db";
import { AdminInquiryTable } from "@/components/admin/admin-inquiry-table";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser, inquiryCustomerScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  await checkPageAccess("inquiries");
  const sessionUser = await getSessionUser();
  const where = sessionUser ? inquiryCustomerScope(sessionUser) : undefined;

  const inquiries = await db.inquiry.findMany({
    where,
    include: {
      property: {
        select: {
          title: true,
          customerId: true,
          customer: { select: { companyName: true } },
          project: { select: { customerId: true, customer: { select: { companyName: true } } } },
        },
      },
      project: {
        select: {
          title: true,
          customer: { select: { companyName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = inquiries.map((inq) => ({
    id: inq.id,
    fullName: inq.fullName,
    email: inq.email,
    phone: inq.phone ?? null,
    propertyTitle: inq.property?.title ?? null,
    projectTitle: inq.project?.title ?? null,
    customerName:
      inq.property?.project?.customer?.companyName
      ?? inq.property?.customer?.companyName
      ?? inq.project?.customer?.companyName
      ?? null,
    status: inq.status,
    date: inq.createdAt.toLocaleDateString(),
    message: inq.message,
  }));

  return (
    <section className="admin-content">
      <AdminInquiryTable rows={rows} />
    </section>
  );
}
