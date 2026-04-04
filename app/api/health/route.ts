import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, string> = {};

  // Env vars
  checks.DATABASE_URL = process.env.DATABASE_URL ? "set" : "MISSING";
  checks.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ? "set" : "MISSING";
  checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL ?? "MISSING";
  checks.PLATFORM = process.env.PLATFORM ?? "not set";
  checks.NODE_ENV = process.env.NODE_ENV ?? "not set";

  // Database
  try {
    await db.$queryRawUnsafe("SELECT 1 as ok");
    checks.database = "connected";
  } catch (e: any) {
    checks.database = `FAILED: ${e.message?.slice(0, 200)}`;
  }

  // Storage
  checks.STORAGE_PROVIDER = process.env.STORAGE_PROVIDER ?? "not set (defaults to local)";
  checks.S3_BUCKET = process.env.S3_BUCKET ?? "not set";
  checks.S3_REGION = process.env.S3_REGION ?? "not set";
  checks.S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID ? "set" : "MISSING";

  // Test S3 write
  if (process.env.STORAGE_PROVIDER === "s3") {
    try {
      const { getStorage } = await import("@/lib/storage");
      const storage = getStorage();
      const testFile = new File(["test"], "health-check.txt", { type: "text/plain" });
      const url = await storage.upload(testFile);
      checks.s3Upload = `OK: ${url}`;
      await storage.delete(url);
      checks.s3Delete = "OK";
    } catch (e: any) {
      checks.s3Upload = `FAILED: ${e.message?.slice(0, 300)}`;
    }
  }

  const allOk = checks.DATABASE_URL === "set" && checks.database === "connected";

  return NextResponse.json(
    { status: allOk ? "healthy" : "unhealthy", checks },
    { status: allOk ? 200 : 500 }
  );
}
