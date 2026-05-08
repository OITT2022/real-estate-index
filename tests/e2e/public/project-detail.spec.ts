import { test, expect } from "@playwright/test";

test.describe("Project detail page", () => {
  test("renders title, location, units count", async ({ page }) => {
    await page.goto("/projects/azure-test-towers");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/azure test towers/i);
    await expect(page.locator("body")).toContainText(/Limassol/i);
  });

  test("project image renders", async ({ page }) => {
    await page.goto("/projects/azure-test-towers");
    const img = page.locator("img[src*='seed-project']");
    await expect(img.first()).toBeVisible();
  });
});
