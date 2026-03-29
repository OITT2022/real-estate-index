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

  if (!file || !propertyId) {
    return NextResponse.json({ error: "File and propertyId required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
  }

  const url = await uploadImage(file);

  const maxOrder = await db.propertyImage.aggregate({
    where: { propertyId },
    _max: { sortOrder: true },
  });
  const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const existingCount = await db.propertyImage.count({ where: { propertyId } });

  const image = await db.propertyImage.create({
    data: {
      propertyId,
      url,
      altText: file.name.replace(/\.[^.]+$/, ""),
      sortOrder: nextOrder,
      isPrimary: existingCount === 0,
    },
  });

  return NextResponse.json(image);
}
