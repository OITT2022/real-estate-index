/**
 * Orphan finder. Compares the storage backend (local /uploads or S3
 * uploads/ prefix) against every DB column that holds a blob URL, and
 * writes a markdown report at docs/orphan-report.md.
 *
 * READ-ONLY. This script never deletes anything — it produces a list
 * of suggested commands that the user runs manually after review.
 *
 *   npm run find-orphans
 */

import { PrismaClient } from "@prisma/client";
import fs from "node:fs/promises";
import path from "node:path";
import { getStorage } from "@/lib/storage";

const db = new PrismaClient();

type DbRef = {
  table: string;
  column: string;
  id: string;
  url: string;
};

const SITE_SETTING_IMAGE_KEYS = ["about_image", "contact_image"];

/**
 * Decide whether a URL points at our storage backend (and therefore
 * matters for the orphan diff). External URLs (videoUrl, websiteUrl,
 * /about-illustration.png shipped in /public, etc.) are ignored.
 */
function looksLikeUploadedBlob(url: string): boolean {
  if (!url) return false;
  if (url.startsWith("/uploads/")) return true;
  if (url.includes(".s3.") && url.includes(".amazonaws.com/uploads/")) return true;
  // DO Spaces (or any other S3-compatible endpoint): https://<bucket>.<endpoint>/uploads/...
  const endpoint = process.env.S3_ENDPOINT?.replace(/^https?:\/\//, "");
  if (endpoint && url.includes(`.${endpoint}/uploads/`)) return true;
  return false;
}

async function collectDbReferences(): Promise<DbRef[]> {
  const refs: DbRef[] = [];

  const propertyImages = await db.propertyImage.findMany({ select: { id: true, url: true } });
  for (const r of propertyImages) refs.push({ table: "PropertyImage", column: "url", id: r.id, url: r.url });

  const projectImages = await db.projectImage.findMany({ select: { id: true, url: true } });
  for (const r of projectImages) refs.push({ table: "ProjectImage", column: "url", id: r.id, url: r.url });

  const projectDocs = await db.projectDocument.findMany({ select: { id: true, url: true } });
  for (const r of projectDocs) refs.push({ table: "ProjectDocument", column: "url", id: r.id, url: r.url });

  const bankImages = await db.imageBank.findMany({ select: { id: true, url: true } });
  for (const r of bankImages) refs.push({ table: "ImageBank", column: "url", id: r.id, url: r.url });

  const heroImages = await db.heroImage.findMany({ select: { id: true, url: true } });
  for (const r of heroImages) refs.push({ table: "HeroImage", column: "url", id: r.id, url: r.url });

  const projects = await db.project.findMany({
    where: { environmentExrUrl: { not: null } },
    select: { id: true, environmentExrUrl: true },
  });
  for (const r of projects) {
    if (r.environmentExrUrl) refs.push({ table: "Project", column: "environmentExrUrl", id: r.id, url: r.environmentExrUrl });
  }

  const customers = await db.customer.findMany({
    where: { logoUrl: { not: null } },
    select: { id: true, logoUrl: true },
  });
  for (const r of customers) {
    if (r.logoUrl) refs.push({ table: "Customer", column: "logoUrl", id: r.id, url: r.logoUrl });
  }

  const adminUsers = await db.adminUser.findMany({
    where: { profileImage: { not: null } },
    select: { id: true, profileImage: true },
  });
  for (const r of adminUsers) {
    if (r.profileImage) refs.push({ table: "AdminUser", column: "profileImage", id: r.id, url: r.profileImage });
  }

  const settings = await db.siteSetting.findMany({
    where: { key: { in: SITE_SETTING_IMAGE_KEYS } },
    select: { key: true, value: true },
  });
  for (const r of settings) {
    if (r.value) refs.push({ table: "SiteSetting", column: r.key, id: r.key, url: r.value });
  }

  return refs;
}

async function fileSize(localUrl: string): Promise<string> {
  if (!localUrl.startsWith("/uploads/")) return "?";
  try {
    const abs = path.join(process.cwd(), "public", localUrl);
    const stat = await fs.stat(abs);
    const kb = stat.size / 1024;
    return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
  } catch {
    return "?";
  }
}

function deleteCommand(url: string, backend: "local" | "s3"): string {
  if (backend === "local" && url.startsWith("/uploads/")) {
    return `rm "public${url}"`;
  }
  if (backend === "s3") {
    try {
      const u = new URL(url);
      // u.pathname starts with `/`, e.g. "/uploads/abc.jpg"
      const key = u.pathname.replace(/^\//, "");
      const bucket = u.hostname.split(".")[0];
      const endpoint = process.env.S3_ENDPOINT;
      const endpointFlag = endpoint ? ` --endpoint-url ${endpoint}` : "";
      return `aws s3 rm s3://${bucket}/${key}${endpointFlag}`;
    } catch {
      return `# unparseable URL: ${url}`;
    }
  }
  return `# manual delete required: ${url}`;
}

async function main() {
  const backend = (process.env.STORAGE_PROVIDER ?? "local").toLowerCase() === "s3" ? "s3" : "local";
  console.log(`[find-orphans] backend=${backend}`);

  const storage = getStorage();
  const [storageUrls, dbRefs] = await Promise.all([storage.list(), collectDbReferences()]);

  const dbBlobUrls = new Set(
    dbRefs.filter((r) => looksLikeUploadedBlob(r.url)).map((r) => r.url),
  );
  const storageSet = new Set(storageUrls);

  const orphanFiles = storageUrls.filter((u) => !dbBlobUrls.has(u));
  const brokenRefs = dbRefs.filter((r) => looksLikeUploadedBlob(r.url) && !storageSet.has(r.url));

  // Build the report
  const lines: string[] = [];
  const now = new Date().toISOString().replace("T", " ").slice(0, 16);
  lines.push(`# Orphan Report — ${now}`);
  lines.push("");
  lines.push(`Storage backend: **${backend}**${backend === "local" ? " (./public/uploads)" : ` (s3://${process.env.S3_BUCKET ?? "aradre-assets"}/uploads/${process.env.S3_ENDPOINT ? ` via ${process.env.S3_ENDPOINT}` : " on AWS S3"})`}`);
  lines.push(`Files in storage: **${storageUrls.length}**`);
  lines.push(`Blob URLs referenced in DB: **${dbBlobUrls.size}**`);
  lines.push("");

  lines.push(`## Orphan files (in storage, not referenced by any DB row): **${orphanFiles.length}**`);
  if (orphanFiles.length === 0) {
    lines.push("");
    lines.push("_None._");
  } else {
    lines.push("");
    for (const url of orphanFiles) {
      const size = backend === "local" ? await fileSize(url) : "?";
      lines.push(`- \`${url}\`  (size: ${size})`);
    }
  }
  lines.push("");

  lines.push(`## Broken DB references (DB row → missing file): **${brokenRefs.length}**`);
  if (brokenRefs.length === 0) {
    lines.push("");
    lines.push("_None._");
  } else {
    lines.push("");
    for (const r of brokenRefs) {
      lines.push(`- \`${r.table}(id=${r.id}).${r.column}\` → \`${r.url}\` (NOT in storage)`);
    }
  }
  lines.push("");

  if (orphanFiles.length > 0) {
    lines.push("## To delete the orphan files (review, then run manually)");
    lines.push("");
    lines.push("```bash");
    for (const url of orphanFiles) {
      lines.push(deleteCommand(url, backend));
    }
    lines.push("```");
    lines.push("");
  }

  if (brokenRefs.length > 0) {
    lines.push("## To clear broken DB references (review, then run manually)");
    lines.push("");
    lines.push("Each broken reference points at a file that no longer exists. Decide whether to set the column to NULL or to delete the row entirely. Sample SQL:");
    lines.push("");
    lines.push("```sql");
    for (const r of brokenRefs) {
      if (r.column === "url" && (r.table === "PropertyImage" || r.table === "ProjectImage" || r.table === "ProjectDocument" || r.table === "ImageBank" || r.table === "HeroImage")) {
        lines.push(`DELETE FROM "${r.table}" WHERE id = '${r.id}';`);
      } else if (r.table === "SiteSetting") {
        lines.push(`UPDATE "SiteSetting" SET value = '' WHERE key = '${r.id}';`);
      } else {
        lines.push(`UPDATE "${r.table}" SET "${r.column}" = NULL WHERE id = '${r.id}';`);
      }
    }
    lines.push("```");
    lines.push("");
  }

  const reportPath = path.join(process.cwd(), "docs", "orphan-report.md");
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, lines.join("\n"), "utf8");

  console.log(`[find-orphans] storage=${storageUrls.length} dbBlobs=${dbBlobUrls.size} orphans=${orphanFiles.length} broken=${brokenRefs.length}`);
  console.log(`[find-orphans] wrote ${reportPath}`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await db.$disconnect();
    process.exit(1);
  });
