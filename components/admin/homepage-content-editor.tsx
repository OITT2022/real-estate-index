"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HomepageContent } from "@/lib/settings";
import { savePageContent } from "@/lib/actions";

type Props = { content: HomepageContent };

export function HomepageContentEditor({ content }: Props) {
  const router = useRouter();
  const [data, setData] = useState(content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: keyof HomepageContent, value: string) {
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

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="card" style={{ display: "grid", gap: 12 }}>
        <p className="eyebrow">"How It Works" Section Header</p>
        <div className="admin-form-grid">
          <label>
            <span>Eyebrow</span>
            <input value={data.homepage_how_eyebrow} onChange={(e) => set("homepage_how_eyebrow", e.target.value)} />
          </label>
          <label>
            <span>Heading</span>
            <input value={data.homepage_how_heading} onChange={(e) => set("homepage_how_heading", e.target.value)} />
          </label>
        </div>
        <label>
          <span>Intro</span>
          <input value={data.homepage_how_intro} onChange={(e) => set("homepage_how_intro", e.target.value)} />
        </label>
      </div>

      <div className="card" style={{ display: "grid", gap: 12 }}>
        <p className="eyebrow">3-Step Cards</p>
        <div className="admin-form-grid">
          <label><span>Card 1 Title</span><input value={data.homepage_card1_title} onChange={(e) => set("homepage_card1_title", e.target.value)} /></label>
          <label><span>Card 1 Text</span><input value={data.homepage_card1_text} onChange={(e) => set("homepage_card1_text", e.target.value)} /></label>
          <label><span>Card 2 Title</span><input value={data.homepage_card2_title} onChange={(e) => set("homepage_card2_title", e.target.value)} /></label>
          <label><span>Card 2 Text</span><input value={data.homepage_card2_text} onChange={(e) => set("homepage_card2_text", e.target.value)} /></label>
          <label><span>Card 3 Title</span><input value={data.homepage_card3_title} onChange={(e) => set("homepage_card3_title", e.target.value)} /></label>
          <label><span>Card 3 Text</span><input value={data.homepage_card3_text} onChange={(e) => set("homepage_card3_text", e.target.value)} /></label>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="button" className="button-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Homepage Content"}
        </button>
        {saved && <span style={{ color: "#16a34a", fontSize: "0.9rem" }}>Saved!</span>}
      </div>
    </div>
  );
}
