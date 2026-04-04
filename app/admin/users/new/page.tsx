import { AdminUserForm } from "@/components/forms/admin-user-form";
import { getAllCustomersForSelect } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  await checkPageAccess("users");
  const customers = await getAllCustomersForSelect();

  return (
    <main className="section">
      <div className="container">
        <p className="eyebrow">Admin</p>
        <h1>Create User</h1>
        <AdminUserForm mode="create" customers={customers} />
      </div>
    </main>
  );
}
