"use client";

import { useState } from "react";
import { PropertyForm } from "@/components/forms/property-form";
import { ImageManager } from "@/components/admin/image-manager";

type UserScope = { customerId: string; customerName: string } | null;

type Props = {
  projects?: { id: string; title: string; customerId: string | null }[];
  customers?: { id: string; companyName: string }[];
  userScope?: UserScope;
};

export function CreatePropertyFlow({ projects, customers, userScope }: Props) {
  const [createdId, setCreatedId] = useState<string | null>(null);

  if (createdId) {
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <div className="card" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
          <p style={{ margin: 0 }}>
            <strong>Property created.</strong> Now upload images below, then{" "}
            <a href="/admin/properties" style={{ color: "var(--accent)", textDecoration: "underline" }}>
              go to property list
            </a>{" "}
            or{" "}
            <a href={`/admin/properties/${createdId}`} style={{ color: "var(--accent)", textDecoration: "underline" }}>
              edit this property
            </a>.
          </p>
        </div>
        <ImageManager propertyId={createdId} images={[]} />
      </div>
    );
  }

  return <PropertyForm mode="create" projects={projects} customers={customers} userScope={userScope} onCreated={(id) => setCreatedId(id)} />;
}
