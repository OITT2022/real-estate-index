import { CreatePropertyFlow } from "@/components/admin/create-property-flow";

export default function NewPropertyPage() {
  return (
    <main className="section">
      <div className="container">
        <p className="eyebrow">Admin</p>
        <h1>Create property</h1>
        <CreatePropertyFlow />
      </div>
    </main>
  );
}
