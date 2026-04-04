"use client";

import { useState } from "react";
import { ProjectForm } from "@/components/forms/project-form";
import { ProjectImageManager } from "@/components/admin/project-image-manager";
import { ProjectStructureEditor } from "@/components/admin/project-structure-editor";
import { AddPropertyModal } from "@/components/admin/add-property-modal";
import { ProjectWizard } from "@/components/admin/project-wizard";

type UserScope = { customerId: string; customerName: string } | null;

type Props = {
  customers?: { id: string; companyName: string }[];
  userScope?: UserScope;
};

export function CreateProjectFlow({ customers, userScope }: Props) {
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");

  if (!createdId) {
    return (
      <ProjectWizard initialStep={1}>
        {/* Step 1: General Info — the form. After submit, project is created */}
        <div>
          <ProjectForm
            mode="create"
            customers={customers}
            userScope={userScope}
            onCreated={(id: string, title?: string) => { setCreatedId(id); setProjectTitle(title ?? ""); }}
          />
        </div>
        {/* Steps 2-4 are placeholders until project is created */}
        <div className="card" style={{ padding: 30, textAlign: "center" }}>
          <p className="muted">Complete Step 1 first to unlock media uploads.</p>
        </div>
        <div className="card" style={{ padding: 30, textAlign: "center" }}>
          <p className="muted">Complete Step 1 first to set up the building structure.</p>
        </div>
        <div className="card" style={{ padding: 30, textAlign: "center" }}>
          <p className="muted">Complete Step 1 first.</p>
        </div>
      </ProjectWizard>
    );
  }

  return (
    <div>
      <div className="card" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", marginBottom: 20 }}>
        <p style={{ margin: 0 }}>
          <strong>Project "{projectTitle}" created.</strong> Continue with the steps below, or{" "}
          <a href={`/admin/projects/${createdId}`} style={{ color: "var(--accent)", textDecoration: "underline" }}>
            open full editor
          </a>.
        </p>
      </div>

      <ProjectWizard initialStep={2}>
        {/* Step 1: Done */}
        <div className="card" style={{ padding: 30, textAlign: "center", background: "#f0fdf4" }}>
          <p style={{ margin: 0 }}><strong>General information saved.</strong> You can edit it later from the full project page.</p>
        </div>

        {/* Step 2: Media */}
        <div style={{ display: "grid", gap: 20 }}>
          <ProjectImageManager projectId={createdId} images={[]} />
        </div>

        {/* Step 3: Structure */}
        <div style={{ display: "grid", gap: 20 }}>
          <ProjectStructureEditor
            projectId={createdId}
            projectTitle={projectTitle}
            units={[]}
            availableProperties={[]}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p className="eyebrow" style={{ margin: 0 }}>Properties</p>
            <AddPropertyModal projectId={createdId} projectTitle={projectTitle} />
          </div>
        </div>

        {/* Step 4: Finish */}
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>&#10003;</div>
          <h2 style={{ margin: "0 0 8px" }}>Project Created</h2>
          <p className="muted" style={{ margin: "0 0 20px" }}>
            Your project is ready. You can continue editing or go back to the list.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <a href={`/admin/projects/${createdId}`} className="button-secondary">Edit Project</a>
            <a href="/admin/projects" className="button-primary">Back to Projects</a>
          </div>
        </div>
      </ProjectWizard>
    </div>
  );
}
