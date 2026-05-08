/**
 * Lightweight DB helper for E2E specs. Each spec gets its own client and is
 * responsible for closing it via test.afterAll.
 */
import { PrismaClient } from "@prisma/client";

export function testDb() {
  if (!process.env.DATABASE_URL?.includes("real_estate_index_test")) {
    throw new Error("testDb() called outside the test environment");
  }
  return new PrismaClient();
}
