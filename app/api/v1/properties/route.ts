import { NextRequest, NextResponse } from "next/server";
import { authenticateApiClient, filterFields } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const client = await authenticateApiClient(req);
  if (!client) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const propertyType = searchParams.get("propertyType");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  const where: Record<string, unknown> = {
    published: true,
    status: "ACTIVE",
    apiEnabled: true,
  };

  // Customer scope filtering
  if (client.scopeType === "customer" && client.customerId) {
    where.OR = [
      { customerId: client.customerId },
      { project: { customerId: client.customerId } },
    ];
  }

  if (city) where.city = { contains: city, mode: "insensitive" };
  if (propertyType) where.propertyType = { equals: propertyType, mode: "insensitive" };

  const allowedFields = client.allowedPropertyFields as string[];

  const [properties, total] = await Promise.all([
    db.property.findMany({
      where,
      include: {
        images: client.includeImages ? { orderBy: { sortOrder: "asc" } } : false,
        project: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.property.count({ where }),
  ]);

  const data = properties.map((p) => {
    const record = p as unknown as Record<string, unknown>;
    const filtered = filterFields(record, allowedFields);

    if (client.includeImages && p.images) {
      filtered.images = (p.images as unknown[]).map((img) => {
        const i = img as Record<string, unknown>;
        return { url: i.url, altText: i.altText, isPrimary: i.isPrimary };
      });
    }

    if (p.project) {
      filtered.project = { id: p.project.id, title: p.project.title, slug: p.project.slug };
    }

    return filtered;
  });

  return NextResponse.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
