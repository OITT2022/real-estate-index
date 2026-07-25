import { test, expect } from "@playwright/test";
import { testDb } from "../helpers/db";

test.describe("Contact page form submission", () => {
  test("submitting the contact form logs an EmailLog row", async ({ page }) => {
    const db = testDb();
    const before = await db.emailLog.count();

    await page.goto("/contact");
    await page.getByLabel(/^name$/i).fill("E2E Contact Tester");
    await page.getByLabel(/^email$/i).fill("e2e-contact@test.local");
    await page.getByLabel(/subject/i).fill("E2E QA contact subject");
    await page.getByLabel(/message/i).fill("E2E contact form message body.");
    await page.getByRole("button", { name: /submit request/i }).click();

    await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 10_000 });

    const after = await db.emailLog.count();
    expect(after).toBeGreaterThan(before);

    const logged = await db.emailLog.findFirst({ orderBy: { sentAt: "desc" } });
    expect(logged?.inquiryId).toBeNull();
    expect(logged?.subject).toContain("E2E QA contact subject");
    expect(logged?.body).toContain("e2e-contact@test.local");

    await db.$disconnect();
  });
});
