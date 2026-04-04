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
    <main className="section">
      <div className="container">
        <p className="eyebrow">Admin</p>
        <h1>Create project</h1>
        <p className="muted">Fill in project details and save. You can then upload images and link properties.</p>
        <CreateProjectFlow customers={customers} userScope={userScope} />
      </div>
    </main>
  );
}
