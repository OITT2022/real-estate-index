"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AboutContent } from "@/lib/settings";
import { savePageContent } from "@/lib/actions";

type Props = { content: AboutContent };

export function AboutPageEditor({ content }: Props) {
  const router = useRouter();
  const [data, setData] = useState(content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set(key: keyof AboutContent, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    // about_stat1_value and about_stat2_value are computed live in
    // getAboutContent — don't persist stale snapshots of them.
    const { about_stat1_value: _s1, about_stat2_value: _s2, ...persisted } = data;
    void _s1; void _s2;
    await savePageContent(persisted);
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
      set("about_image", img.url);
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
            <input value={data.about_title} onChange={(e) => set("about_title", e.target.value)} />
          </label>
          <label>
            <span>Subtitle</span>
            <input value={data.about_subtitle} onChange={(e) => set("about_subtitle", e.target.value)} />
          </label>
        </div>
      </div>

      {/* Main Content */}
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <p className="eyebrow">Main Content</p>
        <div className="admin-form-grid">
          <label>
            <span>Eyebrow Text</span>
            <input value={data.about_eyebrow} onChange={(e) => set("about_eyebrow", e.target.value)} />
          </label>
          <label>
            <span>Heading</span>
            <input value={data.about_heading} onChange={(e) => set("about_heading", e.target.value)} />
          </label>
        </div>
        <label>
          <span>Paragraph 1</span>
          <textarea rows={3} value={data.about_text1} onChange={(e) => set("about_text1", e.target.value)} />
        </label>
        <label>
          <span>Paragraph 2</span>
          <textarea rows={3} value={data.about_text2} onChange={(e) => set("about_text2", e.target.value)} />
        </label>
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
        {data.about_image && (
          <div style={{ maxWidth: 240 }}>
            <img src={data.about_image} alt="About page" style={{ width: "100%", borderRadius: 12 }} />
          </div>
        )}
        <label>
          <span>Image URL</span>
          <input value={data.about_image} onChange={(e) => set("about_image", e.target.value)} placeholder="/about-illustration.png" />
        </label>
      </div>

      {/* Stats */}
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <p className="eyebrow">Statistics</p>
        <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
          Stat 1 (count of published properties) and Stat 2 (number of distinct cities) are computed live from the database.
          Their labels are editable; Stat 3 is fully editable.
        </p>
        <div className="admin-form-grid">
          <label>
            <span>Stat 1 Value</span>
            <input value={data.about_stat1_value} disabled readOnly title="Computed from the database" />
          </label>
          <label><span>Stat 1 Label</span><input value={data.about_stat1_label} onChange={(e) => set("about_stat1_label", e.target.value)} /></label>
          <label>
            <span>Stat 2 Value</span>
            <input value={data.about_stat2_value} disabled readOnly title="Computed from the database" />
          </label>
          <label><span>Stat 2 Label</span><input value={data.about_stat2_label} onChange={(e) => set("about_stat2_label", e.target.value)} /></label>
          <label><span>Stat 3 Value</span><input value={data.about_stat3_value} onChange={(e) => set("about_stat3_value", e.target.value)} /></label>
          <label><span>Stat 3 Label</span><input value={data.about_stat3_label} onChange={(e) => set("about_stat3_label", e.target.value)} /></label>
        </div>
      </div>

      {/* Section 2 */}
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <p className="eyebrow">Feature Cards Section</p>
        <div className="admin-form-grid">
          <label><span>Section Eyebrow</span><input value={data.about_section2_eyebrow} onChange={(e) => set("about_section2_eyebrow", e.target.value)} /></label>
          <label><span>Section Heading</span><input value={data.about_section2_heading} onChange={(e) => set("about_section2_heading", e.target.value)} /></label>
        </div>
        <label>
          <span>Section Intro</span>
          <input value={data.about_section2_intro} onChange={(e) => set("about_section2_intro", e.target.value)} />
        </label>
        <div className="admin-form-grid">
          <label><span>Card 1 Title</span><input value={data.about_card1_title} onChange={(e) => set("about_card1_title", e.target.value)} /></label>
          <label><span>Card 1 Text</span><input value={data.about_card1_text} onChange={(e) => set("about_card1_text", e.target.value)} /></label>
          <label><span>Card 2 Title</span><input value={data.about_card2_title} onChange={(e) => set("about_card2_title", e.target.value)} /></label>
          <label><span>Card 2 Text</span><input value={data.about_card2_text} onChange={(e) => set("about_card2_text", e.target.value)} /></label>
          <label><span>Card 3 Title</span><input value={data.about_card3_title} onChange={(e) => set("about_card3_title", e.target.value)} /></label>
          <label><span>Card 3 Text</span><input value={data.about_card3_text} onChange={(e) => set("about_card3_text", e.target.value)} /></label>
        </div>
      </div>

      {/* Save */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="button" className="button-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save About Page"}
        </button>
        {saved && <span style={{ color: "#16a34a", fontSize: "0.9rem" }}>Saved!</span>}
      </div>
    </div>
  );
}
