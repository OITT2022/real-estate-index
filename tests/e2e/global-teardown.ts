import { PrismaClient } from "@prisma/client";
import path from "node:path";
import fs from "node:fs/promises";

export default async function globalTeardown() {
  if (!process.env.DATABASE_URL?.includes("real_estate_index_test")) {
    // Refuse to wipe anything that isn't the test DB.
    return;
  }

  const db = new PrismaClient();
  try {
    // Truncate everything but leave the schema in place so re-runs are fast.
    await db.$executeRawUnsafe(`
      TRUNCATE TABLE
        "EmailLog",
        "Appointment",
        "InquiryNote",
        "Inquiry",
        "ProjectUnit",
        "ProjectDocument",
        "ProjectImage",
        "PropertyImage",
        "Property",
        "Project",
        "ImageBank",
        "HeroImage",
        "ApiClient",
        "AdminUser",
        "Customer",
        "SiteSetting"
      RESTART IDENTITY CASCADE;
    `);
  } finally {
    await db.$disconnect();
  }

  // Best-effort: clear test upload dir
  const uploadDir = path.join(process.cwd(), "public", "uploads-test");
  await fs.rm(uploadDir, { recursive: true, force: true }).catch(() => {});
}
