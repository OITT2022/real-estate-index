"use client";

import { useState } from "react";
import { ProjectForm } from "@/components/forms/project-form";
import { ProjectImageManager } from "@/components/admin/project-image-manager";
import { ProjectStructureEditor } from "@/components/admin/project-structure-editor";
import { AddPropertyModal } from "@/components/admin/add-property-modal";

type UserScope = { customerId: string; customerName: string } | null;

type Props = {
  customers?: { id: string; companyName: string }[];
  userScope?: UserScope;
};

export function CreateProjectFlow({ customers, userScope }: Props) {
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");

  if (createdId) {
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <div className="card" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
          <p style={{ margin: 0 }}>
            <strong>Project created.</strong> Now set up the building structure and upload images below, or{" "}
            <a href={`/admin/projects/${createdId}`} style={{ color: "var(--accent)", textDecoration: "underline" }}>
              edit this project
            </a>{" "}
            for full options.
          </p>
        </div>
        <ProjectStructureEditor
          projectId={createdId}
          units={[]}
          availableProperties={[]}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="eyebrow" style={{ margin: 0 }}>Properties</p>
          <AddPropertyModal projectId={createdId} projectTitle={projectTitle} />
        </div>
        <ProjectImageManager projectId={createdId} images={[]} />
      </div>
    );
  }

  return (
    <ProjectForm
      mode="create"
      customers={customers}
      userScope={userScope}
      onCreated={(id: string, title?: string) => { setCreatedId(id); setProjectTitle(title ?? ""); }}
    />
  );
}
