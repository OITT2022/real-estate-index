import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { ApiClient } from "@prisma/client";

export async function authenticateApiClient(req: NextRequest): Promise<ApiClient | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  if (token.length < 8) return null;

  const prefix = token.substring(0, 8);

  const candidates = await db.apiClient.findMany({
    where: { active: true, tokenPrefix: prefix },
  });

  for (const client of candidates) {
    const match = await bcrypt.compare(token, client.tokenHash);
    if (match) return client;
  }

  return null;
}

export function filterFields(
  data: Record<string, unknown>,
  allowedFields: string[]
): Record<string, unknown> {
  const result: Record<string, unknown> = { id: data.id };
  for (const key of allowedFields) {
    if (key in data) result[key] = data[key];
  }
  return result;
}
