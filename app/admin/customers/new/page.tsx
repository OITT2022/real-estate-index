import { CustomerForm } from "@/components/forms/customer-form";
import { checkPageAccess } from "@/lib/check-access";

export default async function NewCustomerPage() {
  await checkPageAccess("customers");
  return (
    <section className="admin-content">
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Create Customer</h1>
          <p className="at-page-subtitle">Add a new customer to the platform</p>
        </div>
      </div>
      <CustomerForm mode="create" />
    </section>
  );
}
