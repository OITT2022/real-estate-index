/**
 * Neon -> Aurora migration script.
 *
 * Reads all data from the current Neon database (via Prisma) and copies it
 * to an Aurora PostgreSQL cluster using the raw pg driver.
 *
 * Usage:
 *   npx tsx scripts/migrate-to-aurora.ts
 *
 * Required env vars:
 *   DATABASE_URL      = Neon connection string (source — used by Prisma)
 *   AURORA_HOST       = Aurora cluster writer endpoint
 *   AURORA_USER       = Aurora master username (default: postgres)
 *   AURORA_PASSWORD   = Aurora master password
 *   AURORA_DB         = Aurora database name
 */

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

// ── Config ──

const AURORA_HOST =
  process.env.AURORA_HOST || "real-estate-index-advplanner.cjyuu8a6qoc3.eu-north-1.rds.amazonaws.com";
const AURORA_USER = process.env.AURORA_USER || "postgres";
const AURORA_PASSWORD = process.env.AURORA_PASSWORD;
const AURORA_DB = process.env.AURORA_DB || "real_estate_index";

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL (Neon) not set");
  process.exit(1);
}
if (!AURORA_PASSWORD) {
  console.error("ERROR: AURORA_PASSWORD not set");
  process.exit(1);
}

// Tables in dependency order (parents before children).
// Matches the Prisma schema models exactly.
const TABLES = [
  "AdminUser",
  "SiteSetting",
  "HeroImage",
  "ImageBank",
  "ApiClient",
  "Project",
  "Property",
  "ProjectImage",
  "ProjectDocument",
  "PropertyImage",
  "Inquiry",
  "InquiryNote",
  "Appointment",
  "EmailLog",
];

// ── Connections ──

const prisma = new PrismaClient();

const aurora = new Pool({
  host: AURORA_HOST,
  port: 5432,
  user: AURORA_USER,
  password: AURORA_PASSWORD,
  database: AURORA_DB,
  ssl: { rejectUnauthorized: false },
  max: 5,
  connectionTimeoutMillis: 10000,
});

async function auroraExec(text: string, params: any[] = []): Promise<any[]> {
  const res = await aurora.query(text, params);
  return res.rows;
}

// ── Step 1: Run Prisma migrations on Aurora ──

async function runSchema() {
  console.log("\n== Step 1: Applying Prisma schema to Aurora ==\n");
  console.log(
    "  Run this BEFORE the migration script:\n" +
      `  DATABASE_URL="postgresql://${AURORA_USER}:***@${AURORA_HOST}:5432/${AURORA_DB}?sslmode=require" npx prisma migrate deploy\n`
  );
  console.log("  (Assuming migrations have already been applied.)\n");

  // Verify tables exist on Aurora
  const tables = await auroraExec(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
  );
  const tableNames = tables.map((t: any) => t.tablename);
  console.log(`  Aurora tables found: ${tableNames.join(", ")}`);

  for (const table of TABLES) {
    // Prisma uses quoted table names
    if (!tableNames.includes(table)) {
      console.log(`  WARNING: Table "${table}" not found on Aurora!`);
    }
  }
}

// ── Step 2: Copy data ──

async function copyData() {
  console.log("\n== Step 2: Copying data from Neon to Aurora ==\n");

  // Disable FK checks during import
  // session_replication_role requires superuser on RDS — disable triggers per table instead
  for (const table of TABLES) {
    try { await auroraExec(`ALTER TABLE "${table}" DISABLE TRIGGER ALL`); } catch {}
  }

  for (const table of TABLES) {
    try {
      // Use Prisma's raw query to read from Neon
      const rows: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM "${table}"`
      );

      if (!rows || rows.length === 0) {
        console.log(`  ${table}: empty (0 rows)`);
        continue;
      }

      // Clear target table (safe for re-runs)
      await auroraExec(`DELETE FROM "${table}"`);

      const columns = Object.keys(rows[0]);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
      const quotedCols = columns.map((c) => `"${c}"`).join(", ");
      const insertSql = `INSERT INTO "${table}" (${quotedCols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

      let inserted = 0;
      for (const row of rows) {
        const values = columns.map((c) => {
          const v = row[c];
          if (v === null || v === undefined) return v;
          // Prisma returns Decimal as an object with toFixed/toString
          // Must check this BEFORE the generic object check
          if (typeof v === "object" && typeof v.toFixed === "function") {
            return v.toString();
          }
          // Date objects pass through as-is (pg driver handles them)
          if (v instanceof Date) return v;
          // Buffer pass through
          if (Buffer.isBuffer(v)) return v;
          // JSONB columns: plain objects/arrays must be serialized
          if (typeof v === "object") {
            return JSON.stringify(v);
          }
          return v;
        });
        try {
          await auroraExec(insertSql, values);
          inserted++;
        } catch (e: any) {
          console.log(
            `  ${table}: INSERT error: ${e.message?.slice(0, 120)}`
          );
        }
      }
      console.log(`  ${table}: ${inserted}/${rows.length} rows copied`);
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.includes("does not exist")) {
        console.log(`  ${table}: not found on Neon (skip)`);
      } else {
        console.log(`  ${table}: ERROR: ${msg.slice(0, 120)}`);
      }
    }
  }

  // Re-enable triggers
  for (const table of TABLES) {
    try { await auroraExec(`ALTER TABLE "${table}" ENABLE TRIGGER ALL`); } catch {}
  }
}

// ── Step 3: Verify ──

async function verify() {
  console.log("\n== Step 3: Verification ==\n");
  console.log(
    "  Table                    | Neon   | Aurora | Match"
  );
  console.log(
    "  -------------------------|--------|--------|------"
  );

  let allMatch = true;
  for (const table of TABLES) {
    try {
      let neonCount = 0;
      let auroraCount = 0;
      try {
        const nr: any[] = await prisma.$queryRawUnsafe(
          `SELECT count(*)::int as c FROM "${table}"`
        );
        neonCount = nr[0]?.c ?? 0;
      } catch {}
      try {
        const ar = await auroraExec(
          `SELECT count(*)::int as c FROM "${table}"`
        );
        auroraCount = ar[0]?.c ?? 0;
      } catch {}
      const match = neonCount === auroraCount ? "OK" : "MISMATCH";
      if (match !== "OK") allMatch = false;
      console.log(
        `  ${table.padEnd(25)} | ${String(neonCount).padStart(6)} | ${String(auroraCount).padStart(6)} | ${match}`
      );
    } catch {
      console.log(`  ${table.padEnd(25)} | error`);
    }
  }
  console.log(
    allMatch
      ? "\n  ALL TABLES MATCH\n"
      : "\n  WARNING: Some tables have mismatches\n"
  );
}

// ── Main ──

async function main() {
  console.log("===========================================");
  console.log("  Neon -> Aurora Migration Script");
  console.log("===========================================");
  console.log(
    `  Source: ${process.env.DATABASE_URL?.replace(/:[^@]+@/, ":***@")}`
  );
  console.log(`  Target: ${AURORA_USER}@${AURORA_HOST}/${AURORA_DB}`);

  console.log("\nTesting connections...");
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    console.log("  Neon (Prisma): OK");
  } catch (e: any) {
    console.error("  Neon:   FAILED -", e.message);
    process.exit(1);
  }

  try {
    await auroraExec("SELECT 1");
    console.log("  Aurora:        OK");
  } catch (e: any) {
    console.error("  Aurora: FAILED -", e.message);
    process.exit(1);
  }

  await runSchema();
  await copyData();
  await verify();

  console.log(
    "Done. Update DATABASE_URL to Aurora in your Amplify env vars.\n"
  );
  await aurora.end();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
