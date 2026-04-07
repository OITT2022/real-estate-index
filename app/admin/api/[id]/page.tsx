import { notFound } from "next/navigation";
import { ApiClientForm } from "@/components/forms/api-client-form";
import { getApiClientById, getAllCustomersForSelect, getApiScopeCounts } from "@/lib/site-data";
import { checkPageAccess } from "@/lib/check-access";

export const dynamic = "force-dynamic";

export default async function EditApiClientPage({ params }: { params: Promise<{ id: string }> }) {
  await checkPageAccess("api");
  const { id } = await params;
  const [client, customers, scopeCounts] = await Promise.all([
    getApiClientById(id),
    getAllCustomersForSelect(),
    getApiScopeCounts(),
  ]);

  if (!client) return notFound();

  return (
    <section className="admin-content">
      <div className="at-page-header">
        <div>
          <h1 className="at-page-title">Edit API Client</h1>
          <p className="at-page-subtitle">{client.name}</p>
        </div>
      </div>
      <ApiClientForm
        mode="edit"
        customers={customers}
        scopeCounts={scopeCounts}
        client={{
          id: client.id,
          name: client.name,
          description: client.description,
          tokenPrefix: client.tokenPrefix,
          active: client.active,
          scopeType: client.scopeType,
          customerId: client.customerId,
          allowedPropertyFields: client.allowedPropertyFields,
          allowedProjectFields: client.allowedProjectFields,
          includeImages: client.includeImages,
          includeDocuments: client.includeDocuments,
        }}
      />
    </section>
  );
}
