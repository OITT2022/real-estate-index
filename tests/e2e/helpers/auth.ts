import { Page } from "@playwright/test";
import { TEST_FIXTURES } from "../seed";

export async function loginAsSuperAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(TEST_FIXTURES.superAdmin.email);
  await page.getByLabel(/password/i).fill(TEST_FIXTURES.superAdmin.password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/admin\/(dashboard|properties|projects)/);
}

export async function loginAsCustomerManager(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(TEST_FIXTURES.customerManager.email);
  await page.getByLabel(/password/i).fill(TEST_FIXTURES.customerManager.password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/admin\/(dashboard|properties|projects)/);
}
