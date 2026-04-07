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
    <section className="admin-content">
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Create Property</h1>
          <p className="at-page-subtitle">Fill in the details and save. You can upload images after creation.</p>
        </div>
      </div>
      <CreatePropertyFlow projects={projects} customers={customers} userScope={userScope} />
    </section>
  );
}
