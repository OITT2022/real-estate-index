import { CreatePropertyFlow } from "@/components/admin/create-property-flow";
import { getAllProjectsForSelect, getAllCustomersForSelect } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser, getUserScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

export default async function NewPropertyPage() {
  await checkPageAccess("properties");
  const sessionUser = await getSessionUser();
  const [projects, customers, userScope] = await Promise.all([
    getAllProjectsForSelect(sessionUser ?? undefined),
    getAllCustomersForSelect(),
    sessionUser ? getUserScope(sessionUser) : Promise.resolve(null),
  ]);

  return (
    <main className="section">
      <div className="container">
        <p className="eyebrow">Admin</p>
        <h1>Create property</h1>
        <p className="muted">Fill in the details and save. You will be redirected to upload images.</p>
        <CreatePropertyFlow projects={projects} customers={customers} userScope={userScope} />
      </div>
    </main>
  );
}
