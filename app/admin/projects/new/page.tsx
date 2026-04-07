import { CreateProjectFlow } from "@/components/admin/create-project-flow";
import { getAllCustomersForSelect } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";
import { getSessionUser, getUserScope } from "@/lib/scope";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await checkPageAccess("projects");
  const sessionUser = await getSessionUser();
  const [customers, userScope] = await Promise.all([
    getAllCustomersForSelect(),
    sessionUser ? getUserScope(sessionUser) : Promise.resolve(null),
  ]);

  return (
    <section className="admin-content">
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Create Project</h1>
          <p className="at-page-subtitle">Fill in project details. You can upload images and link properties after saving.</p>
        </div>
      </div>
      <CreateProjectFlow customers={customers} userScope={userScope} />
    </section>
  );
}
