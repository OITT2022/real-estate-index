import { notFound } from "next/navigation";
import { ApiClientForm } from "@/components/forms/api-client-form";
import { getApiClientById } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function EditApiClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getApiClientById(id);

  if (!client) return notFound();

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 800 }}>
        <p className="eyebrow">Admin</p>
        <h1>Edit API Client</h1>
        <ApiClientForm
          mode="edit"
          client={{
            id: client.id,
            name: client.name,
            description: client.description,
            tokenPrefix: client.tokenPrefix,
            active: client.active,
            allowedPropertyFields: client.allowedPropertyFields,
            allowedProjectFields: client.allowedProjectFields,
            includeImages: client.includeImages,
            includeDocuments: client.includeDocuments,
          }}
        />
      </div>
    </main>
  );
}
