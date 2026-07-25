import { test, expect } from "@playwright/test";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { testDb } from "../helpers/db";

test.describe("Public API v1", () => {
  test("rejects requests without a token", async ({ request }) => {
    const res = await request.get("/api/v1/properties");
    expect([401, 403]).toContain(res.status());
  });

  test("rejects requests with an invalid token", async ({ request }) => {
    const res = await request.get("/api/v1/properties", {
      headers: { Authorization: "Bearer at_fakefakefake" },
    });
    expect([401, 403]).toContain(res.status());
  });

  test("returns properties when token is valid + applies field filtering", async ({ request }) => {
    // We don't know the seed token plaintext after the fact (it's hashed).
    // Provision a fresh client with a known token, then make the call.
    const db = testDb();
    const tokenPlain = `at_${crypto.randomBytes(16).toString("hex")}`;
    const tokenHash = await bcrypt.hash(tokenPlain, 10);
    const client = await db.apiClient.create({
      data: {
        name: "Spec runtime client",
        tokenHash,
        tokenPrefix: tokenPlain.slice(0, 8),
        scopeType: "all",
        allowedPropertyFields: ["title", "slug"],
        allowedProjectFields: ["title", "slug"],
        includeImages: false,
        includeDocuments: false,
      },
    });

    const res = await request.get("/api/v1/properties", {
      headers: { Authorization: `Bearer ${tokenPlain}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    const arr = Array.isArray(body) ? body : body.data ?? body.items ?? body.properties;
    expect(Array.isArray(arr)).toBe(true);

    if (arr.length > 0) {
      const first = arr[0];
      // Field filtering: only allowed fields exposed
      expect(first).toHaveProperty("title");
      expect(first).toHaveProperty("slug");
      expect(first).not.toHaveProperty("description");
      expect(first).not.toHaveProperty("price");
    }

    await db.apiClient.delete({ where: { id: client.id } });
    await db.$disconnect();
  });
});
