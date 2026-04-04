import { notFound } from "next/navigation";
import { AdminUserForm } from "@/components/forms/admin-user-form";
import { getAdminUserById, getAllCustomersForSelect } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await checkPageAccess("users");
  const { id } = await params;
  const [user, customers] = await Promise.all([
    getAdminUserById(id),
    getAllCustomersForSelect(),
  ]);

  if (!user) return notFound();

  return (
    <main className="section">
      <div className="container">
        <p className="eyebrow">Admin</p>
        <h1>Edit User</h1>
        <AdminUserForm mode="edit" user={user} customers={customers} />
      </div>
    </main>
  );
}
