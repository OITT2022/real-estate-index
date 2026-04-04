import { ApiClientForm } from "@/components/forms/api-client-form";
import { getAllCustomersForSelect } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function NewApiClientPage() {
  await checkPageAccess("api");
  const customers = await getAllCustomersForSelect();

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 800 }}>
        <p className="eyebrow">Admin</p>
        <h1>Create API Client</h1>
        <p className="muted">Configure which data this client can access. A token will be generated after saving.</p>
        <ApiClientForm mode="create" customers={customers} />
      </div>
    </main>
  );
}
