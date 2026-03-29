"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectDocument } from "@prisma/client";
import { removeProjectDocument } from "@/lib/actions";

type Props = {
  projectId: string;
  documents: ProjectDocument[];
};

const FILE_TYPE_LABELS: Record<string, string> = {
  plan: "Floor Plan",
  brochure: "Brochure",
  other: "Document",
};

export function ProjectDocumentManager({ projectId, documents: initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState("plan");

  async function handleUpload(files: FileList) {
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.set("file", file);
      form.set("projectId", projectId);
      form.set("documentType", selectedType);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) {
        const doc = await res.json();
        setDocuments((prev) => [...prev, doc]);
      }
    }
    setUploading(false);
    router.refresh();
  }

  async function handleRemove(docId: string) {
    await removeProjectDocument(docId);
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }

  const plans = documents.filter((d) => d.fileType === "plan");
  const brochures = documents.filter((d) => d.fileType === "brochure");
  const others = documents.filter((d) => d.fileType === "other");

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <p className="eyebrow">Documents</p>
          <p className="muted">Upload floor plans, brochures, and PDF files</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid var(--line)" }}
          >
            <option value="plan">Floor Plan</option>
            <option value="brochure">Brochure</option>
            <option value="other">Other</option>
          </select>
          <button
            type="button"
            className="button-primary"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>
      </div>

      {documents.length === 0 && (
        <p className="muted">No documents uploaded yet.</p>
      )}

      {[
        { label: "Floor Plans", items: plans },
        { label: "Brochures", items: brochures },
        { label: "Other Documents", items: others },
      ]
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <div key={group.label} style={{ marginBottom: 16 }}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>{group.label}</p>
            {group.items.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: "1.2rem" }}>
                    {doc.fileName.endsWith(".pdf") ? "📄" : "🖼️"}
                  </span>
                  <div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--accent)", textDecoration: "underline" }}
                    >
                      {doc.fileName}
                    </a>
                    <p className="muted" style={{ margin: 0, fontSize: "0.8rem" }}>
                      {FILE_TYPE_LABELS[doc.fileType] ?? doc.fileType}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => handleRemove(doc.id)}
                  style={{ padding: "6px 12px", fontSize: "0.85rem" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
