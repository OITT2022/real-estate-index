import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads with hero, featured listings, and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/.+/);
    // The hero section uses a slideshow of HeroImage rows
    await expect(page.locator("body")).toContainText(/properties|projects/i);
    // Featured property from seed should appear
    await expect(page.getByText(/active marina apartment/i)).toBeVisible();
    // Navigation to properties listing works
    const propsLink = page.getByRole("link", { name: /^properties$/i }).first();
    if (await propsLink.count()) {
      await propsLink.click();
      await expect(page).toHaveURL(/\/properties/);
    }
  });

  test("draft property is NOT visible on home", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/draft listing/i)).toHaveCount(0);
  });
});
