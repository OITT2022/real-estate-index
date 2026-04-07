import { ApiClientForm } from "@/components/forms/api-client-form";
import { getAllCustomersForSelect, getApiScopeCounts } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function NewApiClientPage() {
  await checkPageAccess("api");
  const [customers, scopeCounts] = await Promise.all([
    getAllCustomersForSelect(),
    getApiScopeCounts(),
  ]);

  return (
    <section className="admin-content">
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Create API Client</h1>
          <p className="at-page-subtitle">Configure data access. A token will be generated after saving.</p>
        </div>
      </div>
      <ApiClientForm mode="create" customers={customers} scopeCounts={scopeCounts} />
    </section>
  );
}
