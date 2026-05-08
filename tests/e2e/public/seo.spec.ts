import { test, expect } from "@playwright/test";

const PUBLIC_PAGES = [
  { url: "/", name: "home" },
  { url: "/properties/active-marina-apt", name: "property detail" },
  { url: "/projects/azure-test-towers", name: "project detail" },
  { url: "/about", name: "about" },
  { url: "/contact", name: "contact" },
];

for (const p of PUBLIC_PAGES) {
  test(`${p.name} has title + meta description`, async ({ page }) => {
    await page.goto(p.url);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    // Either populated or absent — never an empty string
    if (desc !== null) {
      expect(desc.length).toBeGreaterThan(0);
    }
  });
}
