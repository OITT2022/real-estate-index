import { test, expect } from "@playwright/test";
import { loginAsCustomerManager } from "../helpers/auth";
import { testDb } from "../helpers/db";

test.describe("Customer-manager scope enforcement", () => {
  test("manager only sees their own customer's properties", async ({ page }) => {
    const db = testDb();
    const custB = await db.customer.findFirst({ where: { companyName: { contains: "Beta", mode: "insensitive" } } });
    const customerBProperty = await db.property.findFirst({ where: { customerId: custB?.id } });

    await loginAsCustomerManager(page);
    await page.goto("/admin/properties");

    // Customer Alpha properties should be visible
    await expect(page.locator("body")).toContainText(/active marina apartment/i);

    // Customer Beta's draft property should NOT be visible to the Alpha manager
    if (customerBProperty) {
      await expect(page.getByText(customerBProperty.title, { exact: true })).toHaveCount(0);
    }

    await db.$disconnect();
  });

  test("manager hitting another customer's property by direct URL is rejected", async ({ page }) => {
    const db = testDb();
    const custB = await db.customer.findFirst({ where: { companyName: { contains: "Beta", mode: "insensitive" } } });
    const otherProp = await db.property.findFirst({ where: { customerId: custB?.id } });
    if (!otherProp) {
      await db.$disconnect();
      test.skip(true, "no cross-customer property in fixtures");
      return;
    }

    await loginAsCustomerManager(page);
    const res = await page.goto(`/admin/properties/${otherProp.id}`);
    const status = res?.status();

    // Either 403/404 (same URL, rejected in place) OR a redirect away from the edit screen.
    if (status !== undefined && [403, 404].includes(status)) {
      // Rejected in place — sufficient on its own, no redirect required.
    } else {
      expect(status === undefined || [200, 302].includes(status)).toBeTruthy();
      const url = page.url();
      expect(url.includes(otherProp.id) && url.includes("/admin/properties/")).toBeFalsy();
    }

    await db.$disconnect();
  });
});
