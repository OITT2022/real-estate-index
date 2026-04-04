"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { customerFormSchema, type CustomerFormValues } from "@/lib/validations";
import { createCustomer, updateCustomer } from "@/lib/actions";

type CustomerData = {
  id: string;
  companyName: string;
  logoUrl: string | null;
  description: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

type Props = {
  mode: "create" | "edit";
  customer?: CustomerData | null;
};

export function CustomerForm({ mode, customer }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(customer?.logoUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customer
      ? {
          companyName: customer.companyName,
          logoUrl: customer.logoUrl ?? "",
          description: customer.description ?? "",
          contactName: customer.contactName ?? "",
          contactEmail: customer.contactEmail ?? "",
          contactPhone: customer.contactPhone ?? "",
        }
      : {},
  });

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setServerError("Logo must be JPEG, PNG, WebP, or GIF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setServerError("Logo must be under 5MB");
      return;
    }

    setUploading(true);
    setServerError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bankImage", "true");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      setValue("logoUrl", data.url);
      setLogoPreview(data.url);
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function removeLogo() {
    setValue("logoUrl", "");
    setLogoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSubmit(values: CustomerFormValues) {
    setServerError(null);
    const result = mode === "create"
      ? await createCustomer(values)
      : await updateCustomer(customer!.id, values);

    if (!result.success) {
      setServerError(result.error);
      return;
    }
    router.push("/admin/customers");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form" style={{ display: "grid", gap: 20, maxWidth: 700 }}>
      {serverError && <p className="form-error">{serverError}</p>}

      <div className="card" style={{ display: "grid", gap: 16 }}>
        <p className="eyebrow">Company Details</p>

        <label>
          <span>Company Name</span>
          <input {...register("companyName")} placeholder="Acme Real Estate" />
          {errors.companyName && <span className="field-error">{errors.companyName.message}</span>}
        </label>

        <div>
          <span style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: "0.9rem" }}>Logo</span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", border: "1px solid var(--line)" }} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: 8, background: "var(--bg-alt)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: "0.8rem" }}>No logo</div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <label className="button-secondary" style={{ cursor: "pointer", padding: "6px 14px", fontSize: "0.85rem" }}>
                {uploading ? "Uploading..." : "Upload logo"}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} disabled={uploading} />
              </label>
              {logoPreview && (
                <button type="button" className="button-secondary" style={{ padding: "6px 14px", fontSize: "0.85rem" }} onClick={removeLogo}>Remove</button>
              )}
            </div>
          </div>
          <input {...register("logoUrl")} type="hidden" />
        </div>

        <label>
          <span>Description</span>
          <textarea {...register("description")} placeholder="Brief company description" rows={4} />
        </label>
      </div>

      <div className="card" style={{ display: "grid", gap: 16 }}>
        <p className="eyebrow">Contact Information</p>
        <div className="admin-form-grid">
          <label>
            <span>Contact Name</span>
            <input {...register("contactName")} placeholder="John Doe" />
          </label>
          <label>
            <span>Contact Email</span>
            <input {...register("contactEmail")} type="email" placeholder="contact@company.com" />
            {errors.contactEmail && <span className="field-error">{errors.contactEmail.message}</span>}
          </label>
          <label>
            <span>Contact Phone</span>
            <input {...register("contactPhone")} placeholder="+357-99-123456" />
          </label>
        </div>
      </div>

      <div className="admin-actions">
        <button type="submit" className="button-primary" disabled={isSubmitting || uploading}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Customer" : "Save Changes"}
        </button>
        <button type="button" className="button-secondary" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  );
}
