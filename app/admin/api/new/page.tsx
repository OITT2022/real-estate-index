import { ApiClientForm } from "@/components/forms/api-client-form";

export default function NewApiClientPage() {
  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 800 }}>
        <p className="eyebrow">Admin</p>
        <h1>Create API Client</h1>
        <p className="muted">Configure which data this client can access. A token will be generated after saving.</p>
        <ApiClientForm mode="create" />
      </div>
    </main>
  );
}
