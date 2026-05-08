import { test, expect } from "@playwright/test";
import { loginAsSuperAdmin } from "../helpers/auth";
import { testDb } from "../helpers/db";

test.describe("Property CRUD", () => {
  test("admin can list properties and see seeded rows", async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto("/admin/properties");
    await expect(page.locator("body")).toContainText(/active marina apartment/i);
    await expect(page.locator("body")).toContainText(/draft listing/i);
  });

  test("delete property removes DB row AND its image file (Phase A1 regression)", async ({ page }) => {
    const db = testDb();

    // Create a fresh property with one image directly via Prisma so we don't
    // depend on the upload UI for this test.
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const imgPath = "/uploads-test/cascade-test-img.jpg";
    const absImg = path.join(process.cwd(), "public", imgPath);
    await fs.writeFile(absImg, "delete-me");

    const created = await db.property.create({
      data: {
        title: "Cascade Test Property",
        slug: "cascade-test-property",
        description: "Will be deleted to verify file cleanup.",
        price: 100000,
        currency: "EUR",
        city: "Limassol",
        address: "Test 1",
        latitude: 34.7,
        longitude: 33.0,
        sellerName: "x",
        sellerEmail: "x@x.com",
        sellerPhone: "+1",
        status: "DRAFT",
        published: false,
        images: { create: [{ url: imgPath, sortOrder: 0, isPrimary: true }] },
      },
      include: { images: true },
    });

    expect(await fs.stat(absImg).then(() => true).catch(() => false)).toBe(true);

    // Delete via admin UI
    await loginAsSuperAdmin(page);
    await page.goto(`/admin/properties/${created.id}`);
    page.on("dialog", (d) => d.accept());
    await page.getByRole("button", { name: /delete/i }).first().click();
    await page.waitForTimeout(1500);

    // DB row gone
    const stillThere = await db.property.findUnique({ where: { id: created.id } });
    expect(stillThere).toBeNull();

    // PropertyImage rows gone (FK cascade)
    const imgs = await db.propertyImage.findMany({ where: { propertyId: created.id } });
    expect(imgs.length).toBe(0);

    // Blob on disk gone (Phase A1 cleanup)
    const fileGone = await fs.stat(absImg).then(() => false).catch(() => true);
    expect(fileGone).toBe(true);

    await db.$disconnect();
  });
});
