import { test, expect } from "@playwright/test";
import { TEST_FIXTURES } from "../seed";
import { loginAsSuperAdmin } from "../helpers/auth";

test.describe("Admin authentication", () => {
  test("unauthenticated visit to /admin/dashboard redirects to login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("rejects bad password", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill(TEST_FIXTURES.superAdmin.email);
    await page.getByLabel(/password/i).fill("WRONG-PASSWORD");
    await page.getByRole("button", { name: /sign in|log in/i }).click();
    // After bad credentials we should remain on the login page
    await page.waitForTimeout(800);
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("super admin can log in and reach dashboard", async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto("/admin/dashboard");
    await expect(page.locator("body")).toContainText(/dashboard|properties|inquiries/i);
  });
});
