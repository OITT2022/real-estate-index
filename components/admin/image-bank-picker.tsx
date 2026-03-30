"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { linkBankImageToProperty, linkBankImageToProject, deleteBankImage } from "@/lib/actions";

type BankImage = { id: string; url: string; altText: string | null };

type Props = {
  bankImages: BankImage[];
  targetType: "property" | "project";
  targetId: string;
};

export function ImageBankPicker({ bankImages: initial, targetType, targetId }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleUploadToBank(files: FileList) {
    setUploading(true);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.set("file", file);
      form.set("bankImage", "true");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      if (res.ok) {
        const img = await res.json();
        setImages((prev) => [img, ...prev]);
      }
    }
    setUploading(false);
  }

  async function handleLink(bankImageId: string) {
    if (targetType === "property") {
      await linkBankImageToProperty(bankImageId, targetId);
    } else {
      await linkBankImageToProject(bankImageId, targetId);
    }
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this image from the bank?")) return;
    await deleteBankImage(id);
    setImages((prev) => prev.filter((img) => img.id !== id));
  }

  if (!open) {
    return (
      <button type="button" className="button-secondary" onClick={() => setOpen(true)} style={{ width: "100%" }}>
        Browse Image Bank ({images.length} images)
      </button>
    );
  }

  return (
    <div className="card" style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="eyebrow">Image Bank</p>
          <p className="muted">Click an image to add it to this {targetType}. Upload new images to the shared bank.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="button-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload to Bank"}
          </button>
          <button type="button" className="button-secondary" onClick={() => setOpen(false)}>Close</button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => e.target.files && handleUploadToBank(e.target.files)} />
      </div>

      {images.length === 0 && <p className="muted">No images in the bank yet. Upload some to get started.</p>}

      <div className="image-grid">
        {images.map((img) => (
          <div key={img.id} className="image-thumb" style={{ cursor: "pointer" }}>
            <img src={img.url} alt={img.altText ?? ""} onClick={() => handleLink(img.id)} />
            <div className="image-actions">
              <button type="button" onClick={() => handleLink(img.id)} title="Add to this item">+</button>
              <button type="button" onClick={() => handleDelete(img.id)} title="Delete from bank">✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
