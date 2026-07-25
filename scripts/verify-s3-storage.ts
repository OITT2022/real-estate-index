/**
 * Standalone smoke test for the S3-compatible StorageProvider (AWS S3 or
 * DigitalOcean Spaces, selected via S3_ENDPOINT). Does a real
 * upload -> list -> delete round-trip against whatever bucket/endpoint is
 * configured in the environment. Run against a dedicated test bucket, not
 * the production bucket.
 *
 *   STORAGE_PROVIDER=s3 S3_ENDPOINT=... S3_BUCKET=... S3_REGION=... \
 *   S3_ACCESS_KEY_ID=... S3_SECRET_ACCESS_KEY=... npm run verify:s3-storage
 */

import { getStorage } from "@/lib/storage";

async function main() {
  if (process.env.STORAGE_PROVIDER !== "s3") {
    console.error("Set STORAGE_PROVIDER=s3 (plus S3_ENDPOINT/S3_BUCKET/S3_REGION/S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY) to run this.");
    process.exit(1);
  }

  const storage = getStorage();
  const file = new File([Buffer.from("verify-s3-storage smoke test")], "verify-s3-storage.txt", {
    type: "text/plain",
  });

  const url = await storage.upload(file);
  console.log("uploaded:", url);

  const listedAfterUpload = await storage.list();
  if (!listedAfterUpload.includes(url)) throw new Error("Uploaded object not found via list()");

  await storage.delete(url);
  const listedAfterDelete = await storage.list();
  if (listedAfterDelete.includes(url)) throw new Error("Deleted object still present via list()");

  console.log("OK: upload -> list -> delete round-trip verified against", process.env.S3_ENDPOINT ?? "AWS S3");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
