import { put, del } from "@vercel/blob";
import path from "path";
import fs from "fs/promises";

const useVercelBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function uploadImage(file: File): Promise<string> {
  if (useVercelBlob) {
    return uploadToVercelBlob(file);
  }
  return uploadToLocal(file);
}

async function uploadToLocal(file: File): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filepath = path.join(uploadsDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

async function uploadToVercelBlob(file: File): Promise<string> {
  const blob = await put(file.name, file, {
    access: "public",
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function deleteImage(url: string): Promise<void> {
  if (useVercelBlob && url.includes("vercel-storage.com")) {
    await del(url);
  } else if (url.startsWith("/uploads/")) {
    const filepath = path.join(process.cwd(), "public", url);
    await fs.unlink(filepath).catch(() => {});
  }
}
