import { AdminInquiryForm } from "@/components/forms/admin-inquiry-form";
import { db } from "@/lib/db";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser, isCustomerManager } from "@/lib/scope";

export const dynamic = "force-dynamic";

export default async function NewInquiryPage() {
  await checkPageAccess("inquiries");
  const sessionUser = await getSessionUser();
  const isCustManager = sessionUser ? isCustomerManager(sessionUser) : false;

  // Super admin: all customers; Customer manager: only their customer
  const customers = isCustManager
    ? await db.customer.findMany({
        where: { id: sessionUser!.customerId! },
        select: { id: true, companyName: true },
      })
    : await db.customer.findMany({
        select: { id: true, companyName: true },
        orderBy: { companyName: "asc" },
      });

  // Super admin: all projects; Customer manager: only their customer's projects
  const projects = isCustManager
    ? await db.project.findMany({
        where: { customerId: sessionUser!.customerId! },
        select: { id: true, title: true, customerId: true },
        orderBy: { title: "asc" },
      })
    : await db.project.findMany({
        select: { id: true, title: true, customerId: true },
        orderBy: { title: "asc" },
      });

  // Super admin: all properties; Customer manager: only their customer's properties
  const properties = isCustManager
    ? await db.property.findMany({
        where: {
          OR: [
            { customerId: sessionUser!.customerId! },
            { project: { customerId: sessionUser!.customerId! } },
          ],
        },
        select: { id: true, title: true, projectId: true, customerId: true },
        orderBy: { title: "asc" },
      })
    : await db.property.findMany({
        select: { id: true, title: true, projectId: true, customerId: true },
        orderBy: { title: "asc" },
      });

  return (
    <section className="admin-content">
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Create Inquiry</h1>
          <p className="at-page-subtitle">Add a new customer inquiry for a property</p>
        </div>
      </div>
      <AdminInquiryForm
        customers={customers}
        projects={projects}
        properties={properties}
        isSuperAdmin={!isCustManager}
      />
    </section>
  );
}
