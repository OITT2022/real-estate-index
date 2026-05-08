import { test, expect } from "@playwright/test";

test.describe("About / Contact pages", () => {
  test("about page reflects SiteSetting content", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator("body")).toContainText(/about us — test/i);
    await expect(page.locator("body")).toContainText(/seed about content paragraph 1/i);
  });

  test("contact page renders office email from settings", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("body")).toContainText(/contact — test/i);
    await expect(page.locator("body")).toContainText(/office@test\.local/i);
  });
});
