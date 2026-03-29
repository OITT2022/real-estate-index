import { CreatePropertyFlow } from "@/components/admin/create-property-flow";
import { getAllProjectsForSelect } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function NewPropertyPage() {
  const projects = await getAllProjectsForSelect();

  return (
    <main className="section">
      <div className="container">
        <p className="eyebrow">Admin</p>
        <h1>Create property</h1>
        <p className="muted">Fill in the details and save. You will be redirected to upload images.</p>
        <CreatePropertyFlow projects={projects} />
      </div>
    </main>
  );
}
