"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { apiClientFormSchema, type ApiClientFormValues } from "@/lib/validations";
import { createApiClient, updateApiClient, regenerateApiClientToken } from "@/lib/actions";
import { PROPERTY_API_FIELDS, PROJECT_API_FIELDS, ALL_PROPERTY_FIELD_KEYS, ALL_PROJECT_FIELD_KEYS } from "@/lib/api-fields";

type ClientData = {
  id: string;
  name: string;
  description: string | null;
  tokenPrefix: string;
  active: boolean;
  scopeType: string;
  customerId: string | null;
  allowedPropertyFields: unknown;
  allowedProjectFields: unknown;
  includeImages: boolean;
  includeDocuments: boolean;
};

type CustomerOption = { id: string; companyName: string };

type ScopeCounts = {
  total: { projects: number; properties: number };
  byCustomer: Record<string, { projects: number; properties: number }>;
};

type Props = {
  mode: "create" | "edit";
  client?: ClientData | null;
  customers?: CustomerOption[];
  scopeCounts?: ScopeCounts;
};

export function ApiClientForm({ mode, client, customers, scopeCounts }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ApiClientFormValues>({
    resolver: zodResolver(apiClientFormSchema),
    defaultValues: client
      ? {
          name: client.name,
          description: client.description ?? "",
          scopeType: (client.scopeType as "all" | "customer") ?? "all",
          customerId: client.customerId ?? "",
          allowedPropertyFields: (client.allowedPropertyFields as string[]) ?? [],
          allowedProjectFields: (client.allowedProjectFields as string[]) ?? [],
          includeImages: client.includeImages,
          includeDocuments: client.includeDocuments,
          active: client.active,
        }
      : {
          scopeType: "all" as const,
          customerId: "",
          allowedPropertyFields: ALL_PROPERTY_FIELD_KEYS.slice(),
          allowedProjectFields: ALL_PROJECT_FIELD_KEYS.slice(),
          includeImages: true,
          includeDocuments: true,
          active: true,
        },
  });

  const scopeType = watch("scopeType");
  const selectedCustomerId = watch("customerId");
  const propertyFields = watch("allowedPropertyFields");
  const projectFields = watch("allowedProjectFields");

  const currentCounts = useMemo(() => {
    if (!scopeCounts) return null;
    if (scopeType === "all") return scopeCounts.total;
    if (selectedCustomerId && scopeCounts.byCustomer[selectedCustomerId]) {
      return scopeCounts.byCustomer[selectedCustomerId];
    }
    return null;
  }, [scopeType, selectedCustomerId, scopeCounts]);

  function toggleAllPropertyFields() {
    setValue(
      "allowedPropertyFields",
      propertyFields.length === ALL_PROPERTY_FIELD_KEYS.length ? [] : ALL_PROPERTY_FIELD_KEYS.slice()
    );
  }

  function toggleAllProjectFields() {
    setValue(
      "allowedProjectFields",
      projectFields.length === ALL_PROJECT_FIELD_KEYS.length ? [] : ALL_PROJECT_FIELD_KEYS.slice()
    );
  }

  function togglePropertyField(key: string) {
    const current = propertyFields;
    setValue(
      "allowedPropertyFields",
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
    );
  }

  function toggleProjectField(key: string) {
    const current = projectFields;
    setValue(
      "allowedProjectFields",
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
    );
  }

  async function onSubmit(values: ApiClientFormValues) {
    setServerError(null);
    if (mode === "create") {
      const result = await createApiClient(values);
      if (!result.success) { setServerError(result.error); return; }
      if (result.token) setGeneratedToken(result.token);
    } else {
      const result = await updateApiClient(client!.id, values);
      if (!result.success) { setServerError(result.error); return; }
      router.push("/admin/api");
    }
  }

  async function handleRegenerateToken() {
    if (!confirm("Regenerate token? The old token will stop working immediately.")) return;
    const result = await regenerateApiClientToken(client!.id);
    if (result.success && result.token) {
      setGeneratedToken(result.token);
    }
  }

  function copyToken() {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (generatedToken) {
    return (
      <div className="card" style={{ display: "grid", gap: 16 }}>
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: 20 }}>
          <p style={{ margin: "0 0 8px", fontWeight: 600 }}>API Token Generated</p>
          <p className="muted" style={{ margin: "0 0 12px" }}>
            Copy this token now. It cannot be retrieved later — only regenerated.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <code style={{ flex: 1, background: "#1e293b", color: "#10b981", padding: "12px 14px", borderRadius: 10, fontSize: "0.85rem", wordBreak: "break-all" }}>
              {generatedToken}
            </code>
            <button type="button" className="button-primary" onClick={copyToken}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        <div className="admin-actions">
          <a href="/admin/api" className="button-primary">Go to API Clients</a>
          {mode === "edit" && (
            <a href={`/admin/api/${client!.id}`} className="button-secondary">Back to Edit</a>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form" style={{ display: "grid", gap: 20 }}>
      {serverError && <p className="form-error">{serverError}</p>}

      <div className="card" style={{ display: "grid", gap: 16 }}>
        <p className="eyebrow">Client Details</p>
        <div className="admin-form-grid">
          <label>
            <span>Name</span>
            <input {...register("name")} placeholder="Partner Company" />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </label>
          <label>
            <span>Description</span>
            <input {...register("description")} placeholder="Optional description" />
          </label>
        </div>
        <div className="checkbox-row">
          <label><input type="checkbox" {...register("active")} /> Active</label>
          <label><input type="checkbox" {...register("includeImages")} /> Include Images</label>
          <label><input type="checkbox" {...register("includeDocuments")} /> Include Documents</label>
        </div>
      </div>

      <div className="card" style={{ display: "grid", gap: 16 }}>
        <p className="eyebrow">Data Scope</p>
        <div className="admin-form-grid">
          <label>
            <span>Scope</span>
            <select {...register("scopeType")}>
              <option value="all">All Customers</option>
              <option value="customer">Specific Customer</option>
            </select>
          </label>
          {scopeType === "customer" && customers && customers.length > 0 && (
            <label>
              <span>Customer</span>
              <select {...register("customerId")}>
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </label>
          )}
        </div>
        {currentCounts && (
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ padding: "10px 16px", borderRadius: 10, background: "var(--bg-alt)", flex: 1, textAlign: "center" }}>
              <strong style={{ fontSize: "1.2rem" }}>{currentCounts.projects}</strong>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: "0.8rem" }}>Projects</p>
            </div>
            <div style={{ padding: "10px 16px", borderRadius: 10, background: "var(--bg-alt)", flex: 1, textAlign: "center" }}>
              <strong style={{ fontSize: "1.2rem" }}>{currentCounts.properties}</strong>
              <p className="muted" style={{ margin: "2px 0 0", fontSize: "0.8rem" }}>Properties</p>
            </div>
          </div>
        )}
        <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
          {scopeType === "all"
            ? "This API client will return all eligible projects and properties across all customers."
            : "This API client will only return projects and properties belonging to the selected customer."}
        </p>
      </div>

      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="eyebrow" style={{ margin: 0 }}>Property Fields ({propertyFields.length}/{ALL_PROPERTY_FIELD_KEYS.length})</p>
          <button type="button" className="button-secondary" onClick={toggleAllPropertyFields} style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
            {propertyFields.length === ALL_PROPERTY_FIELD_KEYS.length ? "Deselect All" : "Select All"}
          </button>
        </div>
        <div className="field-checkbox-grid">
          {PROPERTY_API_FIELDS.map((f) => (
            <label key={f.key} className="field-checkbox">
              <input type="checkbox" checked={propertyFields.includes(f.key)} onChange={() => togglePropertyField(f.key)} />
              <span>{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="eyebrow" style={{ margin: 0 }}>Project Fields ({projectFields.length}/{ALL_PROJECT_FIELD_KEYS.length})</p>
          <button type="button" className="button-secondary" onClick={toggleAllProjectFields} style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
            {projectFields.length === ALL_PROJECT_FIELD_KEYS.length ? "Deselect All" : "Select All"}
          </button>
        </div>
        <div className="field-checkbox-grid">
          {PROJECT_API_FIELDS.map((f) => (
            <label key={f.key} className="field-checkbox">
              <input type="checkbox" checked={projectFields.includes(f.key)} onChange={() => toggleProjectField(f.key)} />
              <span>{f.label}</span>
            </label>
          ))}
        </div>
      </div>

      {mode === "edit" && (
        <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>Token</p>
            <p className="muted" style={{ margin: "4px 0 0" }}>Prefix: <code>{client!.tokenPrefix}...</code></p>
          </div>
          <button type="button" className="button-secondary" onClick={handleRegenerateToken}>
            Regenerate Token
          </button>
        </div>
      )}

      <div className="admin-actions">
        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Client & Generate Token" : "Save Changes"}
        </button>
        <button type="button" className="button-secondary" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  );
}
