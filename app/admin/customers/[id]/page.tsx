import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/forms/customer-form";
import { getCustomerById } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await checkPageAccess("customers");
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) return notFound();

  return (
    <main className="section">
      <div className="container">
        <p className="eyebrow">Admin</p>
        <h1>Edit Customer</h1>
        <CustomerForm mode="edit" customer={customer} />
      </div>
    </main>
  );
}
