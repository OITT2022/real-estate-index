import { AdminUserForm } from "@/components/forms/admin-user-form";

export default function NewUserPage() {
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
