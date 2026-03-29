import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { uploadFile } from "@/lib/upload";
import { db } from "@/lib/db";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOC_TYPES = ["application/pdf", ...ALLOWED_IMAGE_TYPES];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const propertyId = formData.get("propertyId") as string | null;
  const projectId = formData.get("projectId") as string | null;
  const documentType = formData.get("documentType") as string | null;
  const heroImage = formData.get("heroImage") as string | null;

  if (!file || (!propertyId && !projectId && !heroImage)) {
    return NextResponse.json({ error: "File and target required" }, { status: 400 });
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 20MB" }, { status: 400 });
  }

  // Hero image upload
  if (heroImage) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }
    const url = await uploadFile(file);
    const maxOrder = await db.heroImage.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const img = await db.heroImage.create({
      data: { url, altText: file.name.replace(/\.[^.]+$/, ""), active: true, sortOrder: nextOrder },
    });
    return NextResponse.json(img);
  }

  // Document upload for projects (PDFs + images)
  if (projectId && documentType) {
    if (!ALLOWED_DOC_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF and image files are allowed" }, { status: 400 });
    }

    const url = await uploadFile(file);
    const maxOrder = await db.projectDocument.aggregate({ where: { projectId }, _max: { sortOrder: true } });
    const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

    const doc = await db.projectDocument.create({
      data: { projectId, url, fileName: file.name, fileType: documentType, sortOrder: nextOrder },
    });
    return NextResponse.json(doc);
  }

  // Image uploads only
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  const url = await uploadFile(file);
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
