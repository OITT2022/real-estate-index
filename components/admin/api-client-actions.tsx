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
    <button type="button" className="icon-btn icon-btn-danger" onClick={handleDelete} title="Delete">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
    </button>
  );
}
