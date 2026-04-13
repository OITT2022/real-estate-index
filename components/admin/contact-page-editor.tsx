"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContactContent } from "@/lib/settings";
import { savePageContent } from "@/lib/actions";

type Props = { content: ContactContent };

export function ContactPageEditor({ content }: Props) {
  const router = useRouter();
  const [data, setData] = useState(content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set(key: keyof ContactContent, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await savePageContent(data);
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  async function handleImageUpload(files: FileList) {
    setUploading(true);
    const form = new FormData();
    form.set("file", files[0]);
    form.set("imageBank", "true");
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (res.ok) {
      const img = await res.json();
      set("contact_image", img.url);
    }
    setUploading(false);
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Hero Section */}
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <p className="eyebrow">Hero Section</p>
        <div className="admin-form-grid">
          <label>
            <span>Page Title</span>
            <input value={data.contact_title} onChange={(e) => set("contact_title", e.target.value)} />
          </label>
          <label>
            <span>Subtitle</span>
            <input value={data.contact_subtitle} onChange={(e) => set("contact_subtitle", e.target.value)} />
          </label>
        </div>
      </div>

      {/* Form Section */}
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <p className="eyebrow">Form Section</p>
        <div className="admin-form-grid">
          <label>
            <span>Form Heading</span>
            <input value={data.contact_form_heading} onChange={(e) => set("contact_form_heading", e.target.value)} />
          </label>
          <label>
            <span>Form Intro Text</span>
            <input value={data.contact_form_intro} onChange={(e) => set("contact_form_intro", e.target.value)} />
          </label>
        </div>
      </div>

      {/* Info Section */}
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <p className="eyebrow">Contact Information</p>
        <div className="admin-form-grid">
          <label>
            <span>Info Heading</span>
            <input value={data.contact_info_heading} onChange={(e) => set("contact_info_heading", e.target.value)} />
          </label>
          <label>
            <span>Info Intro Text</span>
            <input value={data.contact_info_intro} onChange={(e) => set("contact_info_intro", e.target.value)} />
          </label>
        </div>
        <div className="admin-form-grid">
          <label>
            <span>Office Location</span>
            <input value={data.contact_office} onChange={(e) => set("contact_office", e.target.value)} />
          </label>
          <label>
            <span>Email Address</span>
            <input value={data.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
          </label>
          <label>
            <span>Phone Number</span>
            <input value={data.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
          </label>
        </div>
      </div>

      {/* Image */}
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="eyebrow">Page Image</p>
          <button type="button" className="button-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Image"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files && handleImageUpload(e.target.files)} />
        </div>
        {data.contact_image && (
          <div style={{ maxWidth: 240 }}>
            <img src={data.contact_image} alt="Contact page" style={{ width: "100%", borderRadius: 12 }} />
          </div>
        )}
        <label>
          <span>Image URL</span>
          <input value={data.contact_image} onChange={(e) => set("contact_image", e.target.value)} placeholder="/contact-illustration.png" />
        </label>
      </div>

      {/* Save */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="button" className="button-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Contact Page"}
        </button>
        {saved && <span style={{ color: "#16a34a", fontSize: "0.9rem" }}>Saved!</span>}
      </div>
    </div>
  );
}
