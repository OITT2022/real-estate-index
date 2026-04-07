import { AdminUserForm } from "@/components/forms/admin-user-form";
import { getAllCustomersForSelect } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  await checkPageAccess("users");
  const customers = await getAllCustomersForSelect();

  return (
    <section className="admin-content">
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Create User</h1>
          <p className="at-page-subtitle">Add a new admin user</p>
        </div>
      </div>
      <AdminUserForm mode="create" customers={customers} />
    </section>
  );
}
