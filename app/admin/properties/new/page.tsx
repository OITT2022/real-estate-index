import { PropertyForm } from "@/components/forms/property-form";

export default function NewPropertyPage() {
  return (
    <main className="section">
      <div className="container">
        <p className="eyebrow">Admin</p>
        <h1>Create property</h1>
        <p className="muted">Fill in the details and save. You will be redirected to upload images.</p>
        <PropertyForm mode="create" />
      </div>
    </main>
  );
}
