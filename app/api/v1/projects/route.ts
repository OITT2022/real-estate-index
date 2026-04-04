import { NextRequest, NextResponse } from "next/server";
import { authenticateApiClient, filterFields } from "@/lib/api-auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const client = await authenticateApiClient(req);
  if (!client) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allowedProjectFields = client.allowedProjectFields as string[];
  const allowedPropertyFields = client.allowedPropertyFields as string[];

  const where: Record<string, unknown> = {
    published: true,
    status: "ACTIVE",
    apiEnabled: true,
  };

  // Customer scope filtering
  if (client.scopeType === "customer" && client.customerId) {
    where.customerId = client.customerId;
  }

  const projects = await db.project.findMany({
    where,
    include: {
      images: client.includeImages ? { orderBy: { sortOrder: "asc" } } : false,
      documents: client.includeDocuments ? { orderBy: { sortOrder: "asc" } } : false,
      properties: {
        where: { published: true, status: "ACTIVE", apiEnabled: true },
        include: {
          images: client.includeImages ? { orderBy: { sortOrder: "asc" } } : false,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = projects.map((proj) => {
    const record = proj as unknown as Record<string, unknown>;
    const filtered = filterFields(record, allowedProjectFields);

    if (client.includeImages && proj.images) {
      filtered.images = (proj.images as unknown[]).map((img) => {
        const i = img as Record<string, unknown>;
        return { url: i.url, altText: i.altText, isPrimary: i.isPrimary };
      });
    }

    if (client.includeDocuments && proj.documents) {
      filtered.documents = (proj.documents as unknown[]).map((doc) => {
        const d = doc as Record<string, unknown>;
        return { url: d.url, fileName: d.fileName, fileType: d.fileType };
      });
    }

    if (proj.properties) {
      filtered.properties = proj.properties.map((p) => {
        const pRecord = p as unknown as Record<string, unknown>;
        const pFiltered = filterFields(pRecord, allowedPropertyFields);
        if (client.includeImages && p.images) {
          pFiltered.images = (p.images as unknown[]).map((img) => {
            const i = img as Record<string, unknown>;
            return { url: i.url, altText: i.altText, isPrimary: i.isPrimary };
          });
        }
        return pFiltered;
      });
    }

    return filtered;
  });

  return NextResponse.json({ data }, {
    headers: { "Cache-Control": "no-store" },
  });
}
