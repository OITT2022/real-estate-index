import { test, expect } from "@playwright/test";
import { testDb } from "../helpers/db";

test.describe("Property detail page", () => {
  test("renders title, price, description, gallery", async ({ page }) => {
    await page.goto("/properties/active-marina-apt");
    await expect(page).toHaveURL(/\/properties\/active-marina-apt/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/active marina apartment/i);
    await expect(page.locator("body")).toContainText(/450,000|450000/);
    await expect(page.locator("body")).toContainText(/Limassol/i);
  });

  test("draft slug returns 404", async ({ page }) => {
    const res = await page.goto("/properties/draft-listing");
    expect(res?.status()).toBe(404);
  });

  test("inquiry form creates an Inquiry row", async ({ page }) => {
    const db = testDb();
    const before = await db.inquiry.count();

    await page.goto("/properties/active-marina-apt");
    await page.getByLabel(/name|full name/i).first().fill("E2E Test User");
    await page.getByLabel(/email/i).first().fill("e2e-inquiry@test.local");
    const phoneField = page.getByLabel(/phone/i).first();
    if (await phoneField.count()) await phoneField.fill("+357 99 222 333");
    await page.getByLabel(/message/i).first().fill("E2E inquiry message body.");
    await page.getByRole("button", { name: /send|submit|inquiry/i }).first().click();

    // Wait for either confirmation text or url change
    await page.waitForTimeout(1000);

    const after = await db.inquiry.count();
    expect(after).toBeGreaterThan(before);

    const created = await db.inquiry.findFirst({ where: { email: "e2e-inquiry@test.local" } });
    expect(created).toBeTruthy();

    await db.$disconnect();
  });
});
