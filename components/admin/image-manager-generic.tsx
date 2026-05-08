"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  setImagePrimary,
  reorderImages,
  removeImage,
  setProjectImagePrimary,
  reorderProjectImages,
  removeProjectImage,
} from "@/lib/actions";

export type ManagedImage = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

type Props = {
  entityType: "property" | "project";
  entityId: string;
  images: ManagedImage[];
  heading?: string;
};

const ACTIONS = {
  property: { setPrimary: setImagePrimary, reorder: reorderImages, remove: removeImage, formField: "propertyId", defaultLabel: "Images" },
  project: { setPrimary: setProjectImagePrimary, reorder: reorderProjectImages, remove: removeProjectImage, formField: "projectId", defaultLabel: "Project Images" },
} as const;

export function ImageManagerGeneric({ entityType, entityId, images: initial, heading }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => { setImages(initial); }, [initial]);

  const refresh = useCallback(() => router.refresh(), [router]);
  const cfg = ACTIONS[entityType];

  async function handleUpload(files: FileList) {
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.set("file", file);
      form.set(cfg.formField, entityId);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) {
        const img = await res.json();
        setImages((prev) => [...prev, img]);
      }
    }
    setUploading(false);
    refresh();
  }

  async function handleSetPrimary(imageId: string) {
    await cfg.setPrimary(imageId);
    setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
  }

  async function handleRemove(imageId: string) {
    await cfg.remove(imageId);
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  function handleDragStart(idx: number) { setDragIdx(idx); }

  async function handleDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(targetIdx, 0, moved);
    setImages(reordered);
    setDragIdx(null);
    await cfg.reorder(entityId, reordered.map((img) => img.id));
  }

  const label = heading ?? cfg.defaultLabel;

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <p className="eyebrow">{label}</p>
          <p className="muted">{images.length} image{images.length !== 1 ? "s" : ""} — drag to reorder</p>
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

      {images.length === 0 && <p className="muted">No images yet. Upload images to get started.</p>}

      <div className="image-grid">
        {images.map((img, idx) => (
          <div
            key={img.id}
            className={`image-thumb${img.isPrimary ? " image-primary" : ""}${dragIdx === idx ? " image-dragging" : ""}`}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(idx)}
          >
            <img src={img.url} alt={img.altText ?? ""} />
            {img.isPrimary && <span className="image-badge">Primary</span>}
            <div className="image-actions">
              {!img.isPrimary && (
                <button type="button" onClick={() => handleSetPrimary(img.id)} title="Set as primary">★</button>
              )}
              <button type="button" onClick={() => handleRemove(img.id)} title="Delete">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
