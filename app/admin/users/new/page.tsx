import { AdminUserForm } from "@/components/forms/admin-user-form";
import { checkPageAccess } from "@/lib/check-access";

export default async function NewUserPage() {
  await checkPageAccess("users");
  return (
    <main className="section">
      <div className="container">
        <p className="eyebrow">Admin</p>
        <h1>Create User</h1>
        <AdminUserForm mode="create" />
      </div>
    </main>
  );
}
