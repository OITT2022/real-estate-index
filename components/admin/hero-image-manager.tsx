"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { HeroImage } from "@prisma/client";
import { toggleHeroImageActive, removeHeroImage } from "@/lib/actions";

type Props = { images: HeroImage[] };

export function HeroImageManager({ images: initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initial);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(files: FileList) {
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.set("file", file);
      form.set("heroImage", "true");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) {
        const img = await res.json();
        setImages((prev) => [...prev, img]);
      }
    }
    setUploading(false);
    router.refresh();
  }

  async function handleToggle(id: string) {
    await toggleHeroImageActive(id);
    setImages((prev) => prev.map((img) => img.id === id ? { ...img, active: !img.active } : img));
  }

  async function handleRemove(id: string) {
    await removeHeroImage(id);
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  const activeCount = images.filter((img) => img.active).length;

  return (
    <div className="card" style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="eyebrow">Hero Images</p>
          <p className="muted">
            {images.length} image{images.length !== 1 ? "s" : ""} uploaded, {activeCount} active.
            {activeCount > 1 && " Multiple active images will show as a slideshow."}
          </p>
        </div>
        <button
          type="button"
          className="button-primary"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload images"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
        />
      </div>

      {images.length === 0 && (
        <p className="muted">No hero images yet. Upload images to replace the default.</p>
      )}

      <div className="image-grid">
        {images.map((img) => (
          <div key={img.id} className={`image-thumb${img.active ? " image-primary" : ""}`} style={{ opacity: img.active ? 1 : 0.5 }}>
            <img src={img.url} alt={img.altText ?? ""} />
            {img.active && <span className="image-badge">Active</span>}
            <div className="image-actions">
              <button
                type="button"
                onClick={() => handleToggle(img.id)}
                title={img.active ? "Deactivate" : "Activate"}
              >
                {img.active ? "✓" : "○"}
              </button>
              <button type="button" onClick={() => handleRemove(img.id)} title="Delete">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
