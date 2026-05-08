import { execSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";
import { seedTestFixtures } from "./seed";

export default async function globalSetup() {
  if (!process.env.DATABASE_URL?.includes("real_estate_index_test")) {
    throw new Error(
      "Refusing to run E2E setup: DATABASE_URL is not pointing at the test DB. " +
        "Use `npm run test:e2e` (which loads .env.test).",
    );
  }

  // Apply migrations idempotently to the test DB
  console.log("[e2e setup] running prisma migrate deploy...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });

  // Make sure the local upload dir exists for storage paths in seeds
  const uploadDir = path.join(process.cwd(), "public", "uploads-test");
  await fs.mkdir(uploadDir, { recursive: true });

  // Place placeholder bytes for the seeded image/document URLs so cascade
  // tests can verify deletion from the FS.
  const placeholders = [
    "seed-project-1.jpg",
    "seed-project-2.jpg",
    "seed-project-floorplan.pdf",
    "seed-prop-1.jpg",
    "seed-hero-1.jpg",
  ];
  for (const name of placeholders) {
    await fs.writeFile(path.join(uploadDir, name), "test-placeholder").catch(() => {});
  }

  console.log("[e2e setup] seeding test fixtures...");
  await seedTestFixtures();
  console.log("[e2e setup] done.");
}
