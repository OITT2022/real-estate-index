"use client";

import { useRouter } from "next/navigation";
import { toggleProjectPublish, deleteProject } from "@/lib/actions";

type Props = { projectId: string; published: boolean };

export function ProjectActions({ projectId, published }: Props) {
  const router = useRouter();

  async function handleToggle() {
    await toggleProjectPublish(projectId);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this project?")) return;
    await deleteProject(projectId);
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
