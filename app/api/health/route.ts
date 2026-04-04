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

  // Admin users
  try {
    const users = await db.adminUser.findMany({
      select: { id: true, email: true, active: true, isSuperAdmin: true },
    });
    checks.adminUsers = JSON.stringify(
      users.map((u) => ({ email: u.email, active: u.active, isSuperAdmin: u.isSuperAdmin }))
    );
  } catch (e: any) {
    checks.adminUsers = `FAILED: ${e.message?.slice(0, 200)}`;
  }

  const allOk = checks.DATABASE_URL === "set" && checks.database === "connected";

  return NextResponse.json(
    { status: allOk ? "healthy" : "unhealthy", checks },
    { status: allOk ? 200 : 500 }
  );
}
