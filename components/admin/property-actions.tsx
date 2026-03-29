"use client";

import { useRouter } from "next/navigation";
import { togglePropertyPublish, deleteProperty } from "@/lib/actions";

type Props = {
  propertyId: string;
  published: boolean;
};

export function PropertyActions({ propertyId, published }: Props) {
  const router = useRouter();

  async function handleToggle() {
    await togglePropertyPublish(propertyId);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this property?")) return;
    await deleteProperty(propertyId);
    router.refresh();
  }

  return (
    <>
      <button type="button" className="button-secondary" onClick={handleToggle}>
        {published ? "Unpublish" : "Publish"}
      </button>
      <button type="button" className="button-secondary" onClick={handleDelete}>
        Delete
      </button>
    </>
  );
}
