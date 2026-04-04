"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminUserFormSchema, type AdminUserFormValues } from "@/lib/validations";
import { createAdminUser, updateAdminUser } from "@/lib/actions";
import { ADMIN_PAGES, ALL_PAGE_KEYS } from "@/lib/admin-pages";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  isSuperAdmin: boolean;
  allowedPages: unknown;
  customerId: string | null;
  active: boolean;
};

type CustomerOption = { id: string; companyName: string };

type Props = {
  mode: "create" | "edit";
  user?: UserData | null;
  customers?: CustomerOption[];
};

export function AdminUserForm({ mode, user, customers }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserFormSchema),
    defaultValues: user
      ? {
          name: user.name ?? "",
          email: user.email,
          password: "",
          isSuperAdmin: user.isSuperAdmin,
          allowedPages: (user.allowedPages as string[]) ?? [],
          customerId: user.customerId ?? "",
          active: user.active,
        }
      : {
          isSuperAdmin: false,
          allowedPages: ALL_PAGE_KEYS.slice(),
          customerId: "",
          active: true,
          password: "",
        },
  });

  const isSuperAdmin = watch("isSuperAdmin");
  const allowedPages = watch("allowedPages");

  function toggleAllPages() {
    setValue("allowedPages", allowedPages.length === ALL_PAGE_KEYS.length ? [] : ALL_PAGE_KEYS.slice());
  }

  function togglePage(key: string) {
    setValue(
      "allowedPages",
      allowedPages.includes(key) ? allowedPages.filter((k) => k !== key) : [...allowedPages, key]
    );
  }

  async function onSubmit(values: AdminUserFormValues) {
    setServerError(null);
    const result = mode === "create"
      ? await createAdminUser(values)
      : await updateAdminUser(user!.id, values);

    if (!result.success) {
      setServerError(result.error);
      return;
    }
    router.push("/admin/users");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form" style={{ display: "grid", gap: 20, maxWidth: 700 }}>
      {serverError && <p className="form-error">{serverError}</p>}

      <div className="card" style={{ display: "grid", gap: 16 }}>
        <p className="eyebrow">User Details</p>
        <div className="admin-form-grid">
          <label>
            <span>Name</span>
            <input {...register("name")} placeholder="John Doe" />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </label>
          <label>
            <span>Email</span>
            <input {...register("email")} type="email" placeholder="user@example.com" />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
          </label>
        </div>
        <label>
          <span>{mode === "create" ? "Password" : "New Password (leave empty to keep current)"}</span>
          <input {...register("password")} type="password" placeholder={mode === "create" ? "Enter password" : "Leave empty to keep current"} />
        </label>
        <div className="checkbox-row">
          <label><input type="checkbox" {...register("active")} /> Active</label>
          <label><input type="checkbox" {...register("isSuperAdmin")} /> Super Admin (full access)</label>
        </div>
      </div>

      {!isSuperAdmin && customers && customers.length > 0 && (
        <div className="card" style={{ display: "grid", gap: 12 }}>
          <p className="eyebrow">Customer Assignment</p>
          <p className="muted" style={{ margin: 0 }}>Assign a customer to make this user a Customer Manager with scoped access.</p>
          <label>
            <span>Assigned Customer</span>
            <select {...register("customerId")} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid var(--line)", background: "white" }}>
              <option value="">None — regular admin user</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {!isSuperAdmin && (
        <div className="card" style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p className="eyebrow" style={{ margin: 0 }}>Page Permissions ({allowedPages.length}/{ALL_PAGE_KEYS.length})</p>
              <p className="muted" style={{ margin: "4px 0 0" }}>Select which admin pages this user can access</p>
            </div>
            <button type="button" className="button-secondary" onClick={toggleAllPages} style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
              {allowedPages.length === ALL_PAGE_KEYS.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="field-checkbox-grid">
            {ADMIN_PAGES.map((page) => (
              <label key={page.key} className="field-checkbox">
                <input type="checkbox" checked={allowedPages.includes(page.key)} onChange={() => togglePage(page.key)} />
                <span>{page.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {isSuperAdmin && (
        <div className="card" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
          <p style={{ margin: 0 }}>Super admins have access to all pages. No need to select individual permissions.</p>
        </div>
      )}

      <div className="admin-actions">
        <button type="submit" className="button-primary" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create User" : "Save Changes"}
        </button>
        <button type="button" className="button-secondary" onClick={() => router.back()}>Cancel</button>
      </div>
    </form>
  );
}
