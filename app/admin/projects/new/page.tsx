import { CreateProjectFlow } from "@/components/admin/create-project-flow";

export default function NewProjectPage() {
  return (
    <main className="section">
      <div className="container">
        <p className="eyebrow">Admin</p>
        <h1>Create project</h1>
        <p className="muted">Fill in project details and save. You can then upload images and link properties.</p>
        <CreateProjectFlow />
      </div>
    </main>
  );
}
