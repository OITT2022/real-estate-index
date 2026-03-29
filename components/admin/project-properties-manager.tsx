"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { linkPropertyToProject, unlinkPropertyFromProject } from "@/lib/actions";

type PropertySummary = {
  id: string;
  title: string;
  city: string;
  price: number | { toString(): string };
  published: boolean;
  currentProjectTitle: string | null;
};

type Props = {
  projectId: string;
  linkedProperties: PropertySummary[];
  allProperties: PropertySummary[];
};

export function ProjectPropertiesManager({ projectId, linkedProperties, allProperties }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [linking, setLinking] = useState(false);

  const unlinkedProperties = allProperties.filter(
    (p) => !linkedProperties.some((lp) => lp.id === p.id)
  );

  async function handleLink() {
    if (!selectedId) return;
    const prop = unlinkedProperties.find((p) => p.id === selectedId);
    if (prop?.currentProjectTitle) {
      if (!confirm(`"${prop.title}" is already linked to "${prop.currentProjectTitle}". Move it to this project?`)) return;
    }
    setLinking(true);
    await linkPropertyToProject(selectedId, projectId);
    setSelectedId("");
    setLinking(false);
    router.refresh();
  }

  async function handleUnlink(propertyId: string) {
    await unlinkPropertyFromProject(propertyId);
    router.refresh();
  }

  return (
    <div className="card">
      <div style={{ marginBottom: 16 }}>
        <p className="eyebrow">Connected Properties</p>
        <p className="muted">{linkedProperties.length} apartment{linkedProperties.length !== 1 ? "s" : ""} linked to this project</p>
      </div>

      {linkedProperties.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {linkedProperties.map((p) => (
            <div key={p.id} className="table-row" style={{ gridTemplateColumns: "2fr 1fr 1fr auto" }}>
              <div>
                <Link href={`/admin/properties/${p.id}`} style={{ color: "var(--accent)", textDecoration: "underline" }}>
                  {p.title}
                </Link>
              </div>
              <div>{p.city}</div>
              <div>€{Number(p.price).toLocaleString()}</div>
              <button type="button" className="button-secondary" onClick={() => handleUnlink(p.id)}>Unlink</button>
            </div>
          ))}
        </div>
      )}

      {unlinkedProperties.length > 0 && (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid var(--line)" }}
          >
            <option value="">Select a property to link...</option>
            {unlinkedProperties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.city}{p.currentProjectTitle ? ` (in: ${p.currentProjectTitle})` : ""}
              </option>
            ))}
          </select>
          <button type="button" className="button-primary" onClick={handleLink} disabled={!selectedId || linking}>
            {linking ? "Linking..." : "Link"}
          </button>
        </div>
      )}

      {unlinkedProperties.length === 0 && linkedProperties.length === 0 && (
        <p className="muted">No properties available. Create properties first, then link them here.</p>
      )}
    </div>
  );
}
