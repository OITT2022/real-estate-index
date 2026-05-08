import { test, expect } from "@playwright/test";
import { loginAsSuperAdmin } from "../helpers/auth";
import { testDb } from "../helpers/db";

test.describe("Project CRUD", () => {
  test("delete project removes DB row, cascades children, and cleans blobs (Phase A2)", async ({ page }) => {
    const db = testDb();
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    const imgPath = "/uploads-test/cascade-proj-img.jpg";
    const docPath = "/uploads-test/cascade-proj-doc.pdf";
    const exrPath = "/uploads-test/cascade-proj-env.exr";
    for (const p of [imgPath, docPath, exrPath]) {
      await fs.writeFile(path.join(process.cwd(), "public", p), "x");
    }

    const project = await db.project.create({
      data: {
        title: "Cascade Test Project",
        slug: "cascade-test-project",
        description: "to be deleted",
        city: "Limassol",
        address: "Test",
        latitude: 34.7,
        longitude: 33.0,
        developerName: "Tester",
        status: "DRAFT",
        published: false,
        environmentExrUrl: exrPath,
        images: { create: [{ url: imgPath, sortOrder: 0, isPrimary: true }] },
        documents: { create: [{ url: docPath, fileName: "doc.pdf", fileType: "application/pdf", sortOrder: 0 }] },
        units: { create: [{ building: "1", entrance: "A", floor: 1, unitNumber: "1" }] },
      },
    });

    await loginAsSuperAdmin(page);
    await page.goto(`/admin/projects/${project.id}`);
    page.on("dialog", (d) => d.accept());
    await page.getByRole("button", { name: /delete/i }).first().click();
    await page.waitForTimeout(1500);

    expect(await db.project.findUnique({ where: { id: project.id } })).toBeNull();
    expect((await db.projectImage.findMany({ where: { projectId: project.id } })).length).toBe(0);
    expect((await db.projectDocument.findMany({ where: { projectId: project.id } })).length).toBe(0);
    expect((await db.projectUnit.findMany({ where: { projectId: project.id } })).length).toBe(0);

    for (const p of [imgPath, docPath, exrPath]) {
      const gone = await fs.stat(path.join(process.cwd(), "public", p)).then(() => false).catch(() => true);
      expect(gone, `${p} should be deleted from storage`).toBe(true);
    }

    await db.$disconnect();
  });
});
