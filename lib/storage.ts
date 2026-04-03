/**
 * Storage abstraction layer.
 *
 * STORAGE_PROVIDER=local  -> local filesystem (default, dev)
 * STORAGE_PROVIDER=vercel -> @vercel/blob (current production)
 * STORAGE_PROVIDER=s3     -> AWS S3
 */

import fs from "fs/promises";
import path from "path";

// ── Interface ──

export interface StorageProvider {
  upload(file: File): Promise<string>;
  delete(url: string): Promise<void>;
}

// ── Local filesystem provider ──

class LocalStorageProvider implements StorageProvider {
  async upload(file: File): Promise<string> {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    return `/uploads/${filename}`;
  }

  async delete(url: string): Promise<void> {
    if (url.startsWith("/uploads/")) {
      const filepath = path.join(process.cwd(), "public", url);
      await fs.unlink(filepath).catch(() => {});
    }
  }
}

// ── Vercel Blob provider ──

class VercelBlobStorageProvider implements StorageProvider {
  async upload(file: File): Promise<string> {
    const { put } = await import("@vercel/blob");
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return blob.url;
  }

  async delete(url: string): Promise<void> {
    if (url.includes("vercel-storage.com")) {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
  }
}

// ── S3 provider (lazy-loaded) ──

class S3StorageProvider implements StorageProvider {
  private bucket: string;
  private region: string;
  private _sdk: any = null;
  private _client: any = null;

  constructor() {
    this.bucket = process.env.S3_BUCKET ?? "aradre-assets";
    this.region = process.env.AWS_REGION ?? "us-east-1";
  }

  private getSdk(): any {
    if (this._sdk) return this._sdk;
    try {
      const pkg = "@aws-sdk/" + "client-s3";
      this._sdk = require(pkg);
    } catch {
      throw new Error(
        "STORAGE_PROVIDER=s3 requires @aws-sdk/client-s3. Run: npm install @aws-sdk/client-s3"
      );
    }
    return this._sdk;
  }

  private getClient(): any {
    if (this._client) return this._client;
    const sdk = this.getSdk();
    this._client = new sdk.S3Client({ region: this.region });
    return this._client;
  }

  async upload(file: File): Promise<string> {
    const sdk = this.getSdk();
    const ext = path.extname(file.name) || ".jpg";
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await this.getClient().send(
      new sdk.PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      })
    );

    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async delete(url: string): Promise<void> {
    const sdk = this.getSdk();
    // Extract key from full S3 URL
    const urlObj = new URL(url);
    const key = urlObj.pathname.slice(1); // remove leading /
    await this.getClient().send(
      new sdk.DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }
}

// ── Factory ──

let _instance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (_instance) return _instance;
  const provider = process.env.STORAGE_PROVIDER?.trim().toLowerCase();
  if (provider === "s3") {
    _instance = new S3StorageProvider();
  } else if (provider === "vercel") {
    _instance = new VercelBlobStorageProvider();
  } else {
    _instance = new LocalStorageProvider();
  }
  return _instance;
}
