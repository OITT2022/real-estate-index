"use client";

import { useRouter } from "next/navigation";
import { deleteApiClient } from "@/lib/actions";

type Props = { clientId: string; active: boolean };

export function ApiClientActions({ clientId }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this API client? This will revoke their access.")) return;
    await deleteApiClient(clientId);
    router.refresh();
  }

  return (
    <button type="button" className="button-secondary" onClick={handleDelete}>Delete</button>
  );
}
