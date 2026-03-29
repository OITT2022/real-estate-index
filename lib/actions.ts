"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { deleteImage } from "@/lib/upload";
import { propertyFormSchema, inquirySchema } from "@/lib/validations";

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Property CRUD ──────────────────────────────────────────────

export async function createProperty(data: unknown): Promise<ActionResult> {
  const parsed = propertyFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { latitude, longitude, price, ...rest } = parsed.data;
  rest.slug = slugify(rest.slug);

  const property = await db.property.create({
    data: {
      ...rest,
      latitude,
      longitude,
      price,
      sellerName: rest.sellerName ?? "",
      status: rest.published ? "ACTIVE" : "DRAFT",
    },
  });

  revalidatePath("/admin/properties");
  revalidatePath("/");
  return { success: true, id: property.id };
}

export async function updateProperty(id: string, data: unknown): Promise<ActionResult> {
  const parsed = propertyFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { latitude, longitude, price, ...rest } = parsed.data;
  rest.slug = slugify(rest.slug);

  await db.property.update({
    where: { id },
    data: {
      ...rest,
      latitude,
      longitude,
      price,
      status: rest.published ? "ACTIVE" : "DRAFT",
    },
  });

  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${id}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  await db.property.delete({ where: { id } });

  revalidatePath("/admin/properties");
  revalidatePath("/");
  return { success: true };
}

export async function togglePropertyPublish(id: string): Promise<ActionResult> {
  const property = await db.property.findUnique({ where: { id } });
  if (!property) return { success: false, error: "Property not found" };

  const published = !property.published;
  await db.property.update({
    where: { id },
    data: {
      published,
      status: published ? "ACTIVE" : "DRAFT",
    },
  });

  revalidatePath("/admin/properties");
  revalidatePath("/");
  return { success: true };
}

// ── Images ─────────────────────────────────────────────────────

export async function setImagePrimary(imageId: string): Promise<ActionResult> {
  const image = await db.propertyImage.findUnique({ where: { id: imageId } });
  if (!image) return { success: false, error: "Image not found" };

  await db.$transaction([
    db.propertyImage.updateMany({
      where: { propertyId: image.propertyId },
      data: { isPrimary: false },
    }),
    db.propertyImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    }),
  ]);

  revalidatePath(`/admin/properties/${image.propertyId}`);
  revalidatePath("/");
  return { success: true };
}

export async function reorderImages(
  propertyId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  await db.$transaction(
    orderedIds.map((id, index) =>
      db.propertyImage.update({ where: { id }, data: { sortOrder: index } })
    )
  );

  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/");
  return { success: true };
}

export async function removeImage(imageId: string): Promise<ActionResult> {
  const image = await db.propertyImage.findUnique({ where: { id: imageId } });
  if (!image) return { success: false, error: "Image not found" };

  await deleteImage(image.url);
  await db.propertyImage.delete({ where: { id: imageId } });

  if (image.isPrimary) {
    const next = await db.propertyImage.findFirst({
      where: { propertyId: image.propertyId },
      orderBy: { sortOrder: "asc" },
    });
    if (next) {
      await db.propertyImage.update({
        where: { id: next.id },
        data: { isPrimary: true },
      });
    }
  }

  revalidatePath(`/admin/properties/${image.propertyId}`);
  revalidatePath("/");
  return { success: true };
}

// ── Inquiries ──────────────────────────────────────────────────

export async function createInquiry(data: unknown): Promise<ActionResult> {
  const parsed = inquirySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const property = await db.property.findUnique({ where: { id: parsed.data.propertyId } });
  if (!property) return { success: false, error: "Property not found" };

  await db.inquiry.create({ data: parsed.data });

  return { success: true };
}
