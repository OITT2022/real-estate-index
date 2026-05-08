"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import * as flagsByCode from "country-flag-icons/string/3x2";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validations";
import { updateOwnProfile } from "@/lib/actions";
import type { CountryOption } from "@/lib/countries";
import type { TimezoneOption } from "@/lib/timezones";
import { SearchableSelect, type SearchableOption } from "@/components/ui/searchable-select";

type ProfileUser = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  phoneCountry: string | null;
  country: string | null;
  timezone: string | null;
  profileImage: string | null;
};

type Props = {
  user: ProfileUser;
  countries: CountryOption[];
  timezones: TimezoneOption[];
};

const FLAGS = flagsByCode as Record<string, string>;

function Flag({ code, size = 18 }: { code: string; size?: number }) {
  const svg = FLAGS[code];
  if (!svg) return null;
  return (
    <span
      className="ss-flag"
      style={{ width: size * 1.5, height: size, lineHeight: 0 }}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

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
      phoneCountry: user.phoneCountry ?? "",
      country: user.country ?? "",
      timezone: user.timezone ?? "",
      profileImage: user.profileImage ?? "",
    },
  });

  const profileImage = watch("profileImage");
  const country = watch("country");
  const phoneCountry = watch("phoneCountry");

  const countryOptions: SearchableOption[] = useMemo(
    () => countries.map((c) => ({ value: c.code, label: c.name, searchText: c.searchText })),
    [countries],
  );
  const tzOptions: SearchableOption[] = useMemo(
    () => timezones.map((t) => ({ value: t.value, label: t.label, searchText: `${t.label} ${t.value}`.toLowerCase() })),
    [timezones],
  );
  const countriesByCode = useMemo(() => {
    const m = new Map<string, CountryOption>();
    for (const c of countries) m.set(c.code, c);
    return m;
  }, [countries]);

  const phoneCountryInfo = phoneCountry ? countriesByCode.get(phoneCountry) ?? null : null;

  function handleCountryChange(next: string) {
    setValue("country", next, { shouldValidate: true });
    // Auto-fill the phone country if it's empty (don't override an existing
    // explicit choice — user may live in CY but use an IL phone).
    if (!phoneCountry) setValue("phoneCountry", next);
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

  function renderCountryOption(opt: SearchableOption) {
    const info = countriesByCode.get(opt.value);
    return (
      <span className="ss-row">
        <Flag code={opt.value} />
        <span className="ss-row-label">{opt.label}</span>
        {info && <span className="ss-row-aux">+{info.dialCode}</span>}
      </span>
    );
  }

  function renderCountryTrigger(opt: SearchableOption | null) {
    if (!opt) return <span className="ss-placeholder">Select country…</span>;
    const info = countriesByCode.get(opt.value);
    return (
      <span className="ss-row">
        <Flag code={opt.value} />
        <span className="ss-row-label">{opt.label}</span>
        {info && <span className="ss-row-aux">+{info.dialCode}</span>}
      </span>
    );
  }

  function renderPhonePrefixTrigger(opt: SearchableOption | null) {
    if (!opt) return <span className="ss-placeholder">Code</span>;
    const info = countriesByCode.get(opt.value);
    return (
      <span className="ss-row">
        <Flag code={opt.value} />
        {info && <span className="ss-row-aux ss-row-aux-strong">+{info.dialCode}</span>}
      </span>
    );
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
          <div className="phone-input-group">
            <SearchableSelect
              compact
              options={countryOptions}
              value={phoneCountry ?? ""}
              onChange={(next) => setValue("phoneCountry", next, { shouldValidate: true })}
              renderOption={renderCountryOption}
              renderTrigger={renderPhonePrefixTrigger}
              placeholder="Code"
              className="phone-input-prefix"
            />
            <input
              type="tel"
              {...register("phone")}
              className="admin-input phone-input-number"
              placeholder={phoneCountryInfo ? `Phone number` : "Pick a country first"}
            />
          </div>
          {errors.phoneCountry && <p className="form-error">{errors.phoneCountry.message}</p>}
        </div>
      </div>

      <div className="card" style={{ display: "grid", gap: 16 }}>
        <p className="eyebrow">Location</p>

        <div>
          <label className="admin-label">Country</label>
          <SearchableSelect
            options={countryOptions}
            value={country ?? ""}
            onChange={handleCountryChange}
            renderOption={renderCountryOption}
            renderTrigger={renderCountryTrigger}
            placeholder="Select country…"
          />
          {errors.country && <p className="form-error">{errors.country.message}</p>}
        </div>

        <div>
          <label className="admin-label">Time zone</label>
          <SearchableSelect
            options={tzOptions}
            value={watch("timezone") ?? ""}
            onChange={(next) => setValue("timezone", next, { shouldValidate: true })}
            placeholder="Select time zone…"
          />
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
