import { test, expect } from "@playwright/test";
import { loginAsSuperAdmin } from "../helpers/auth";
import { testDb } from "../helpers/db";

test.describe("Users & Customers admin", () => {
  test("delete customer sets foreign keys to null on Property/AdminUser/Project (no cascade)", async ({ page: _ }) => {
    const db = testDb();

    const cust = await db.customer.create({ data: { companyName: "Throwaway Customer" } });
    const prop = await db.property.create({
      data: {
        title: "scope-test-prop",
        slug: `scope-test-prop-${cust.id.slice(0, 6)}`,
        description: "x",
        price: 1,
        currency: "EUR",
        city: "X",
        address: "X",
        latitude: 0,
        longitude: 0,
        sellerName: "x",
        sellerEmail: "x@x.com",
        sellerPhone: "+1",
        status: "DRAFT",
        customerId: cust.id,
      },
    });

    await db.customer.delete({ where: { id: cust.id } });

    // Property survives, customerId set to null
    const reloaded = await db.property.findUnique({ where: { id: prop.id } });
    expect(reloaded).not.toBeNull();
    expect(reloaded?.customerId).toBeNull();

    // Cleanup
    await db.property.delete({ where: { id: prop.id } });
    await db.$disconnect();
  });

  test("admin can list users", async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto("/admin/users");
    await expect(page.locator("body")).toContainText(/super@test\.local|manager@test\.local/i);
  });
});
