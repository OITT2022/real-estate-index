import { CreatePropertyFlow } from "@/components/admin/create-property-flow";
import { getAllProjectsForSelect, getAllCustomersForSelect } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function NewPropertyPage() {
  await checkPageAccess("properties");
  const [projects, customers] = await Promise.all([
    getAllProjectsForSelect(),
    getAllCustomersForSelect(),
  ]);

  return (
    <main className="section">
      <div className="container">
        <p className="eyebrow">Admin</p>
        <h1>Create property</h1>
        <p className="muted">Fill in the details and save. You will be redirected to upload images.</p>
        <CreatePropertyFlow projects={projects} customers={customers} />
      </div>
    </main>
  );
}
