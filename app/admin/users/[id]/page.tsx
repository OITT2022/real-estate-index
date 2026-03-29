import { notFound } from "next/navigation";
import { AdminUserForm } from "@/components/forms/admin-user-form";
import { getAdminUserById } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAdminUserById(id);

  if (!user) return notFound();

  return (
    <main className="section">
      <div className="container">
        <p className="eyebrow">Admin</p>
        <h1>Edit User</h1>
        <AdminUserForm mode="edit" user={user} />
      </div>
    </main>
  );
}
