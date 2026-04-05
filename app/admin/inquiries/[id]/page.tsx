import { notFound } from "next/navigation";
import { getInquiryById } from "@/lib/site-data";
import { InquiryCrm } from "@/components/admin/inquiry-crm";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await checkPageAccess("inquiries");
  const { id } = await params;
  const inquiry = await getInquiryById(id);

  if (!inquiry) return notFound();

  const serialized = {
    ...inquiry,
    createdAt: inquiry.createdAt.toISOString(),
    notes: inquiry.notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })),
    appointments: inquiry.appointments.map((a) => ({
      ...a,
      dateTime: a.dateTime.toISOString(),
      createdAt: a.createdAt.toISOString(),
    })),
    emails: inquiry.emails.map((e) => ({ ...e, sentAt: e.sentAt.toISOString() })),
  };

  return (
    <section className="admin-content">
        <InquiryCrm inquiry={serialized} />
      </section>
  );
}
