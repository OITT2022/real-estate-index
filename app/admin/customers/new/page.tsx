import { CustomerForm } from "@/components/forms/customer-form";
import { checkPageAccess } from "@/lib/check-access";

export default async function NewCustomerPage() {
  await checkPageAccess("customers");
  return (
    <main className="section">
      <div className="container">
        <p className="eyebrow">Admin</p>
        <h1>Create Customer</h1>
        <CustomerForm mode="create" />
      </div>
    </main>
  );
}
