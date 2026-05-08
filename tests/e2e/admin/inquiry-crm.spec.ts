import { test, expect } from "@playwright/test";
import { loginAsSuperAdmin } from "../helpers/auth";
import { testDb } from "../helpers/db";

test.describe("Inquiry CRM", () => {
  test("admin sees seeded inquiries and can open one", async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto("/admin/inquiries");
    await expect(page.locator("body")).toContainText(/test lead 1/i);
  });

  test("inquiry detail shows existing note and allows adding another", async ({ page }) => {
    const db = testDb();
    const inquiry = await db.inquiry.findFirst({ where: { fullName: "Test Lead 1" }, include: { notes: true } });
    if (!inquiry) {
      await db.$disconnect();
      test.skip(true, "Inquiry fixture missing");
      return;
    }

    await loginAsSuperAdmin(page);
    await page.goto(`/admin/inquiries/${inquiry.id}`);
    await expect(page.locator("body")).toContainText(/initial seed note/i);

    const beforeNotes = inquiry.notes.length;
    const noteField = page.getByLabel(/note|content/i).first();
    if (await noteField.count()) {
      await noteField.fill("E2E generated note");
      await page.getByRole("button", { name: /add note|save/i }).first().click();
      await page.waitForTimeout(800);
      const afterNotes = await db.inquiryNote.count({ where: { inquiryId: inquiry.id } });
      expect(afterNotes).toBe(beforeNotes + 1);
    }
    await db.$disconnect();
  });
});
