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
    <section className="admin-content">
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Edit User</h1>
          <p className="at-page-subtitle">{user.name || user.email}</p>
        </div>
      </div>
      <AdminUserForm mode="edit" user={user} customers={customers} />
    </section>
  );
}
