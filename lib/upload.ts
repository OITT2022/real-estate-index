import path from "path";
import fs from "fs/promises";
import { v2 as cloudinary } from "cloudinary";

const useCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadImage(file: File): Promise<string> {
  if (useCloudinary) {
    return uploadToCloudinary(file);
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

async function uploadToCloudinary(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: "real-estate-index",
  });

  return result.secure_url;
}

export async function deleteImage(url: string): Promise<void> {
  if (useCloudinary && url.includes("cloudinary")) {
    const publicId = url.split("/").slice(-2).join("/").replace(/\.[^.]+$/, "");
    await cloudinary.uploader.destroy(publicId);
  } else if (url.startsWith("/uploads/")) {
    const filepath = path.join(process.cwd(), "public", url);
    await fs.unlink(filepath).catch(() => {});
  }
}
