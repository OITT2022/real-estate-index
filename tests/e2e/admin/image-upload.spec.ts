import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { loginAsSuperAdmin } from "../helpers/auth";
import { testDb } from "../helpers/db";

test.describe("Admin image upload (real StorageProvider code path)", () => {
  test("uploading via the property edit UI hits /api/upload and persists a real file", async ({ page }) => {
    const db = testDb();
    const property = await db.property.findUniqueOrThrow({ where: { slug: "active-marina-apt" } });
    const before = await db.propertyImage.count({ where: { propertyId: property.id } });

    await loginAsSuperAdmin(page);
    await page.goto(`/admin/properties/${property.id}`);

    const fileInput = page.locator('input[type="file"]').first();
    const [uploadResponse] = await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/upload") && r.request().method() === "POST"),
      fileInput.setInputFiles({
        name: "e2e-upload-test.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("e2e-fake-jpeg-bytes"),
      }),
    ]);
    expect(uploadResponse.ok()).toBeTruthy();

    const after = await db.propertyImage.count({ where: { propertyId: property.id } });
    expect(after).toBe(before + 1);

    const newest = await db.propertyImage.findFirst({
      where: { propertyId: property.id },
      orderBy: { sortOrder: "desc" },
    });
    expect(newest?.url).toMatch(/^\/uploads-test\//);

    const abs = path.join(process.cwd(), "public", newest!.url);
    const exists = await fs.stat(abs).then(() => true).catch(() => false);
    expect(exists).toBe(true);

    await db.$disconnect();
  });
});
