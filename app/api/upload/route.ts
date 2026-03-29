import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadImage } from "@/lib/upload";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const propertyId = formData.get("propertyId") as string | null;
  const projectId = formData.get("projectId") as string | null;

  if (!file || (!propertyId && !projectId)) {
    return NextResponse.json({ error: "File and propertyId or projectId required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
  }

  const url = await uploadImage(file);
  const altText = file.name.replace(/\.[^.]+$/, "");

  if (projectId) {
    const maxOrder = await db.projectImage.aggregate({ where: { projectId }, _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const existingCount = await db.projectImage.count({ where: { projectId } });

    const image = await db.projectImage.create({
      data: { projectId, url, altText, sortOrder: nextOrder, isPrimary: existingCount === 0 },
    });
    return NextResponse.json(image);
  }

  const maxOrder = await db.propertyImage.aggregate({ where: { propertyId: propertyId! }, _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;
  const existingCount = await db.propertyImage.count({ where: { propertyId: propertyId! } });

  const image = await db.propertyImage.create({
    data: { propertyId: propertyId!, url, altText, sortOrder: nextOrder, isPrimary: existingCount === 0 },
  });
  return NextResponse.json(image);
}
