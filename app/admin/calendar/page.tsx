import { db } from "@/lib/db";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser, propertyCustomerScope, isCustomerManager } from "@/lib/scope";
import { CalendarView } from "@/components/admin/calendar-view";

export const dynamic = "force-dynamic";

export default async function CalendarSchedulePage() {
  await checkPageAccess("calendar");
  const sessionUser = await getSessionUser();
  const propScope = sessionUser ? propertyCustomerScope(sessionUser) : undefined;

  const appointments = await db.appointment.findMany({
    where: {
      inquiry: propScope ? { property: propScope } : undefined,
    },
    include: {
      inquiry: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              customerId: true,
              customer: { select: { id: true, companyName: true } },
              project: { select: { customerId: true, customer: { select: { id: true, companyName: true } } } },
            },
          },
          project: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { dateTime: "asc" },
  });

  // Customer managers only see their own customer in the dropdown
  const customers = sessionUser && isCustomerManager(sessionUser)
    ? await db.customer.findMany({
        where: { id: sessionUser.customerId! },
        select: { id: true, companyName: true },
      })
    : await db.customer.findMany({
        select: { id: true, companyName: true },
        orderBy: { companyName: "asc" },
      });

  const events = appointments.map((apt) => {
    const inq = apt.inquiry;
    const customerName =
      inq.property.project?.customer?.companyName
      ?? inq.property.customer?.companyName
      ?? null;
    const customerId =
      inq.property.project?.customer?.id
      ?? inq.property.customer?.id
      ?? null;

    const start = apt.dateTime;
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 60 min default

    return {
      id: apt.id,
      title: `${inq.fullName} — ${inq.property.title}`,
      start: start.toISOString(),
      end: end.toISOString(),
      status: apt.status,
      summary: apt.summary,
      inquiryId: inq.id,
      customerName,
      customerId,
      contactName: inq.fullName,
      contactEmail: inq.email,
      contactPhone: inq.phone ?? null,
      propertyTitle: inq.property.title,
      projectTitle: inq.project?.title ?? null,
      message: inq.message,
      inquiryStatus: inq.status,
      createdAt: apt.createdAt.toISOString(),
    };
  });

  return (
    <section className="admin-content">
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Calendar Schedule</h1>
          <p className="at-page-subtitle">{events.length} scheduled appointments</p>
        </div>
      </div>
      <CalendarView
        events={events}
        customers={customers}
      />
    </section>
  );
}
