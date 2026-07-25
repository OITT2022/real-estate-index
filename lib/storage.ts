/**
 * Storage abstraction layer.
 *
 * STORAGE_PROVIDER=local  -> local filesystem (default, dev)
 * STORAGE_PROVIDER=s3     -> AWS S3 (production)
 */

import fs from "fs/promises";
import path from "path";

// ── Interface ──

export interface StorageProvider {
  upload(file: File): Promise<string>;
  delete(url: string): Promise<void>;
  /** Return the public URL of every object the provider currently holds. */
  list(): Promise<string[]>;
}

// ── Local filesystem provider ──

function localUploadSubdir(): string {
  return process.env.LOCAL_UPLOAD_DIR?.replace(/^\.\//, "").replace(/^public\//, "") ?? "uploads";
}

class LocalStorageProvider implements StorageProvider {
  async upload(file: File): Promise<string> {
    const subdir = localUploadSubdir();
    const uploadsDir = path.join(process.cwd(), "public", subdir);
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    return `/${subdir}/${filename}`;
  }

  async delete(url: string): Promise<void> {
    const subdir = localUploadSubdir();
    if (url.startsWith(`/${subdir}/`)) {
      const filepath = path.join(process.cwd(), "public", url);
      await fs.unlink(filepath).catch(() => {});
    }
  }

  async list(): Promise<string[]> {
    const subdir = localUploadSubdir();
    const uploadsDir = path.join(process.cwd(), "public", subdir);
    try {
      const entries = await fs.readdir(uploadsDir, { withFileTypes: true });
      return entries.filter((e) => e.isFile()).map((e) => `/${subdir}/${e.name}`);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
  }
}

// ── S3 provider ──
//
// Also used against DigitalOcean Spaces (S3-compatible): set S3_ENDPOINT to
// e.g. https://fra1.digitaloceanspaces.com. Leave it unset to talk to AWS S3.

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";

function resolveS3Endpoint(): { endpoint?: string; forcePathStyle?: boolean } {
  const endpoint = process.env.S3_ENDPOINT;
  return endpoint ? { endpoint, forcePathStyle: false } : {};
}

export function getS3PublicUrl(bucket: string, region: string, key: string): string {
  const endpoint = process.env.S3_ENDPOINT;
  if (endpoint) {
    return `https://${bucket}.${endpoint.replace(/^https?:\/\//, "")}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

class S3StorageProvider implements StorageProvider {
  private bucket: string;
  private region: string;
  private _client: S3Client | null = null;

  constructor() {
    this.bucket = process.env.S3_BUCKET ?? "aradre-assets";
    this.region = process.env.S3_REGION ?? "eu-north-1";
  }

  private getClient(): S3Client {
    if (this._client) return this._client;
    // Amplify blocks AWS_ prefix env vars — use S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
    this._client = new S3Client({
      region: this.region,
      ...resolveS3Endpoint(),
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
    });
    return this._client;
  }

  async upload(file: File): Promise<string> {
    const ext = path.extname(file.name) || ".jpg";
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await this.getClient().send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
        ACL: "public-read",
      })
    );

    return getS3PublicUrl(this.bucket, this.region, key);
  }

  async delete(url: string): Promise<void> {
    const urlObj = new URL(url);
    const key = urlObj.pathname.slice(1);
    await this.getClient().send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }

  async list(): Promise<string[]> {
    const out: string[] = [];
    let continuationToken: string | undefined = undefined;
    do {
      const res: import("@aws-sdk/client-s3").ListObjectsV2CommandOutput = await this.getClient().send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: "uploads/",
          ContinuationToken: continuationToken,
        }),
      );
      for (const obj of res.Contents ?? []) {
        if (obj.Key) {
          out.push(getS3PublicUrl(this.bucket, this.region, obj.Key));
        }
      }
      continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (continuationToken);
    return out;
  }
}

// ── Factory ──

let _instance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (_instance) return _instance;
  const provider = process.env.STORAGE_PROVIDER?.trim().toLowerCase();
  if (provider === "s3") {
    _instance = new S3StorageProvider();
  } else {
    _instance = new LocalStorageProvider();
  }
  return _instance;
}
