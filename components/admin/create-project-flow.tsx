"use client";

import { useState } from "react";
import { ProjectForm } from "@/components/forms/project-form";
import { ProjectImageManager } from "@/components/admin/project-image-manager";

type UserScope = { customerId: string; customerName: string } | null;

type Props = {
  customers?: { id: string; companyName: string }[];
  userScope?: UserScope;
};

export function CreateProjectFlow({ customers, userScope }: Props) {
  const [createdId, setCreatedId] = useState<string | null>(null);

  if (createdId) {
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <div className="card" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
          <p style={{ margin: 0 }}>
            <strong>Project created.</strong> Upload images below, then{" "}
            <a href={`/admin/projects/${createdId}`} style={{ color: "var(--accent)", textDecoration: "underline" }}>
              edit this project
            </a>{" "}
            to link properties, or{" "}
            <a href="/admin/projects" style={{ color: "var(--accent)", textDecoration: "underline" }}>
              go to project list
            </a>.
          </p>
        </div>
        <ProjectImageManager projectId={createdId} images={[]} />
      </div>
    );
  }

  return <ProjectForm mode="create" customers={customers} userScope={userScope} onCreated={(id) => setCreatedId(id)} />;
}
