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
      <button type="button" className="icon-btn" onClick={handleToggle} title={published ? "Unpublish" : "Publish"}>
        {published ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
        )}
      </button>
      <button type="button" className="icon-btn icon-btn-danger" onClick={handleDelete} title="Delete">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </>
  );
}
