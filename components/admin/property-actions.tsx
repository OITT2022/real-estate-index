"use client";

import { useRouter } from "next/navigation";
import { deleteProperty } from "@/lib/actions";

type Props = {
  propertyId: string;
  published: boolean;
  redirectTo?: string;
};

export function PropertyActions({ propertyId, redirectTo }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this property?")) return;
    await deleteProperty(propertyId);
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.refresh();
    }
  }

  return (
    <button type="button" className="icon-btn icon-btn-danger" onClick={handleDelete} title="Delete">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
    </button>
  );
}
