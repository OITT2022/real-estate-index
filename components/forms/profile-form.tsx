"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validations";
import { updateOwnProfile } from "@/lib/actions";
import type { CountryOption } from "@/lib/countries";

type ProfileUser = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  phonePrefix: string | null;
  country: string | null;
  timezone: string | null;
  profileImage: string | null;
};

type Props = {
  user: ProfileUser;
  countries: CountryOption[];
  timezones: string[];
};

export function ProfileForm({ user, countries, timezones }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name ?? "",
      phone: user.phone ?? "",
      phonePrefix: user.phonePrefix ?? "",
      country: user.country ?? "",
      timezone: user.timezone ?? "",
      profileImage: user.profileImage ?? "",
    },
  });

  const profileImage = watch("profileImage");
  const country = watch("country");
  const phonePrefix = watch("phonePrefix");

  // Deduplicated list of dial codes for the prefix dropdown.
  const dialCodes = useMemo(() => {
    const set = new Set<string>();
    for (const c of countries) set.add(c.dialCode);
    return [...set].sort((a, b) => Number(a) - Number(b));
  }, [countries]);

  function handleCountryChange(next: string) {
    setValue("country", next);
    if (!next) return;
    const opt = countries.find((c) => c.code === next);
    if (!opt) return;
    // If the prefix is empty or matches some country's dial code already
    // (i.e. user hasn't manually typed something exotic), update it.
    const knownPrefix = !phonePrefix || dialCodes.includes(phonePrefix);
    if (knownPrefix) setValue("phonePrefix", opt.dialCode);
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setServerError(null);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("bankImage", "true");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setValue("profileImage", data.url);
    } catch {
      setServerError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: ProfileFormValues) {
    setServerError(null);
    setSuccess(false);
    const result = await updateOwnProfile(values);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="admin-form" style={{ display: "grid", gap: 20, maxWidth: 640 }}>
      {serverError && <p className="form-error">{serverError}</p>}
      {success && (
        <p
          style={{
            color: "#166534",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            padding: "10px 14px",
            borderRadius: 8,
          }}
        >
          Profile updated.
        </p>
      )}

      <div className="card" style={{ display: "grid", gap: 16 }}>
        <p className="eyebrow">Avatar</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--line)" }}
            />
          ) : (
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "var(--accent)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.4rem",
                fontWeight: 700,
              }}
            >
              {(watch("name") || user.email || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid var(--line)",
                cursor: "pointer",
                fontSize: "0.8rem",
                background: "white",
              }}
            >
              {uploading ? "Uploading..." : "Upload photo"}
              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </label>
            {profileImage && (
              <button
                type="button"
                onClick={() => setValue("profileImage", "")}
                className="muted"
                style={{ background: "transparent", border: 0, cursor: "pointer", fontSize: "0.78rem", textAlign: "left" }}
              >
                Remove avatar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ display: "grid", gap: 16 }}>
        <p className="eyebrow">Account</p>

        <div>
          <label className="admin-label">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            readOnly
            className="admin-input"
            style={{ background: "var(--surface-alt)", color: "var(--muted)" }}
          />
          <p className="muted" style={{ fontSize: "0.78rem", marginTop: 4 }}>
            Email is your sign-in identity and can&apos;t be changed here. Ask a super admin if you need it updated.
          </p>
        </div>

        <div>
          <label className="admin-label">Name</label>
          <input type="text" {...register("name")} className="admin-input" />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        <div>
          <label className="admin-label">Phone</label>
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 8 }}>
            <select
              className="admin-input"
              value={phonePrefix ?? ""}
              onChange={(e) => setValue("phonePrefix", e.target.value)}
            >
              <option value="">Code…</option>
              {dialCodes.map((d) => (
                <option key={d} value={d}>+{d}</option>
              ))}
            </select>
            <input type="tel" {...register("phone")} className="admin-input" placeholder="National number" />
          </div>
          {errors.phonePrefix && <p className="form-error">{errors.phonePrefix.message}</p>}
        </div>
      </div>

      <div className="card" style={{ display: "grid", gap: 16 }}>
        <p className="eyebrow">Location</p>

        <div>
          <label className="admin-label">Country</label>
          <select
            className="admin-input"
            value={country ?? ""}
            onChange={(e) => handleCountryChange(e.target.value)}
          >
            <option value="">Select country…</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name} (+{c.dialCode})</option>
            ))}
          </select>
          {errors.country && <p className="form-error">{errors.country.message}</p>}
        </div>

        <div>
          <label className="admin-label">Time zone</label>
          <select className="admin-input" {...register("timezone")}>
            <option value="">Select time zone…</option>
            {timezones.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button type="submit" className="button-primary" disabled={isSubmitting || uploading}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
