"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { deleteImage } from "@/lib/upload";
import { propertyFormSchema, projectFormSchema, inquirySchema, apiClientFormSchema } from "@/lib/validations";
import crypto from "crypto";
import bcrypt from "bcryptjs";

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

  const { latitude, longitude, price, projectId, ...rest } = parsed.data;
  rest.slug = slugify(rest.slug);

  const property = await db.property.create({
    data: {
      ...rest,
      latitude,
      longitude,
      price,
      projectId: projectId || null,
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

  const { latitude, longitude, price, projectId, ...rest } = parsed.data;
  rest.slug = slugify(rest.slug);

  await db.property.update({
    where: { id },
    data: {
      ...rest,
      latitude,
      longitude,
      price,
      projectId: projectId || null,
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
    data: { published, status: published ? "ACTIVE" : "DRAFT" },
  });

  revalidatePath("/admin/properties");
  revalidatePath("/");
  return { success: true };
}

// ── Project CRUD ──────────────────────────────────────────────

export async function createProject(data: unknown): Promise<ActionResult> {
  const parsed = projectFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { latitude, longitude, ...rest } = parsed.data;
  rest.slug = slugify(rest.slug);

  const project = await db.project.create({
    data: { ...rest, latitude, longitude, status: rest.published ? "ACTIVE" : "DRAFT" },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  return { success: true, id: project.id };
}

export async function updateProject(id: string, data: unknown): Promise<ActionResult> {
  const parsed = projectFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const { latitude, longitude, ...rest } = parsed.data;
  rest.slug = slugify(rest.slug);

  await db.project.update({
    where: { id },
    data: { ...rest, latitude, longitude, status: rest.published ? "ACTIVE" : "DRAFT" },
  });

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/projects");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await db.project.delete({ where: { id } });
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  return { success: true };
}

export async function toggleProjectPublish(id: string): Promise<ActionResult> {
  const project = await db.project.findUnique({ where: { id } });
  if (!project) return { success: false, error: "Project not found" };

  const published = !project.published;
  await db.project.update({
    where: { id },
    data: { published, status: published ? "ACTIVE" : "DRAFT" },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  return { success: true };
}

export async function linkPropertyToProject(propertyId: string, projectId: string): Promise<ActionResult> {
  await db.property.update({ where: { id: propertyId }, data: { projectId } });
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/properties");
  return { success: true };
}

export async function unlinkPropertyFromProject(propertyId: string): Promise<ActionResult> {
  const property = await db.property.findUnique({ where: { id: propertyId } });
  if (!property) return { success: false, error: "Property not found" };

  await db.property.update({ where: { id: propertyId }, data: { projectId: null } });
  revalidatePath(`/admin/projects/${property.projectId}`);
  revalidatePath("/admin/properties");
  return { success: true };
}

// ── Property Images ───────────────────────────────────────────

export async function setImagePrimary(imageId: string): Promise<ActionResult> {
  const image = await db.propertyImage.findUnique({ where: { id: imageId } });
  if (!image) return { success: false, error: "Image not found" };

  await db.$transaction([
    db.propertyImage.updateMany({ where: { propertyId: image.propertyId }, data: { isPrimary: false } }),
    db.propertyImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);

  revalidatePath(`/admin/properties/${image.propertyId}`);
  revalidatePath("/");
  return { success: true };
}

export async function reorderImages(propertyId: string, orderedIds: string[]): Promise<ActionResult> {
  await db.$transaction(
    orderedIds.map((id, index) => db.propertyImage.update({ where: { id }, data: { sortOrder: index } }))
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
    const next = await db.propertyImage.findFirst({ where: { propertyId: image.propertyId }, orderBy: { sortOrder: "asc" } });
    if (next) await db.propertyImage.update({ where: { id: next.id }, data: { isPrimary: true } });
  }

  revalidatePath(`/admin/properties/${image.propertyId}`);
  revalidatePath("/");
  return { success: true };
}

// ── Project Images ────────────────────────────────────────────

export async function setProjectImagePrimary(imageId: string): Promise<ActionResult> {
  const image = await db.projectImage.findUnique({ where: { id: imageId } });
  if (!image) return { success: false, error: "Image not found" };

  await db.$transaction([
    db.projectImage.updateMany({ where: { projectId: image.projectId }, data: { isPrimary: false } }),
    db.projectImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);

  revalidatePath(`/admin/projects/${image.projectId}`);
  revalidatePath("/projects");
  return { success: true };
}

export async function reorderProjectImages(projectId: string, orderedIds: string[]): Promise<ActionResult> {
  await db.$transaction(
    orderedIds.map((id, index) => db.projectImage.update({ where: { id }, data: { sortOrder: index } }))
  );
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/projects");
  return { success: true };
}

export async function removeProjectImage(imageId: string): Promise<ActionResult> {
  const image = await db.projectImage.findUnique({ where: { id: imageId } });
  if (!image) return { success: false, error: "Image not found" };

  await deleteImage(image.url);
  await db.projectImage.delete({ where: { id: imageId } });

  if (image.isPrimary) {
    const next = await db.projectImage.findFirst({ where: { projectId: image.projectId }, orderBy: { sortOrder: "asc" } });
    if (next) await db.projectImage.update({ where: { id: next.id }, data: { isPrimary: true } });
  }

  revalidatePath(`/admin/projects/${image.projectId}`);
  revalidatePath("/projects");
  return { success: true };
}

// ── Project Documents ─────────────────────────────────────────

export async function removeProjectDocument(docId: string): Promise<ActionResult> {
  const doc = await db.projectDocument.findUnique({ where: { id: docId } });
  if (!doc) return { success: false, error: "Document not found" };

  await deleteImage(doc.url);
  await db.projectDocument.delete({ where: { id: docId } });

  revalidatePath(`/admin/projects/${doc.projectId}`);
  revalidatePath("/projects");
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

// ── Settings ───────────────────────────────────────────────────

export async function saveMapSettings(data: {
  tileLayer: string;
  defaultZoom: number;
  defaultLat: number;
  defaultLng: number;
}): Promise<ActionResult> {
  const settings = [
    { key: "map_tile_layer", value: data.tileLayer },
    { key: "map_default_zoom", value: String(data.defaultZoom) },
    { key: "map_default_lat", value: String(data.defaultLat) },
    { key: "map_default_lng", value: String(data.defaultLng) },
  ];

  for (const s of settings) {
    await db.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  revalidatePath("/");
  return { success: true };
}

// ── API Clients ────────────────────────────────────────────────

export async function createApiClient(data: unknown): Promise<ActionResult & { token?: string }> {
  const parsed = apiClientFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const token = crypto.randomBytes(48).toString("hex");
  const tokenPrefix = token.substring(0, 8);
  const tokenHash = await bcrypt.hash(token, 10);

  const client = await db.apiClient.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      tokenHash,
      tokenPrefix,
      active: parsed.data.active,
      allowedPropertyFields: parsed.data.allowedPropertyFields,
      allowedProjectFields: parsed.data.allowedProjectFields,
      includeImages: parsed.data.includeImages,
      includeDocuments: parsed.data.includeDocuments,
    },
  });

  revalidatePath("/admin/api");
  return { success: true, id: client.id, token };
}

export async function updateApiClient(id: string, data: unknown): Promise<ActionResult> {
  const parsed = apiClientFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  await db.apiClient.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      active: parsed.data.active,
      allowedPropertyFields: parsed.data.allowedPropertyFields,
      allowedProjectFields: parsed.data.allowedProjectFields,
      includeImages: parsed.data.includeImages,
      includeDocuments: parsed.data.includeDocuments,
    },
  });

  revalidatePath("/admin/api");
  revalidatePath(`/admin/api/${id}`);
  return { success: true };
}

export async function regenerateApiClientToken(id: string): Promise<ActionResult & { token?: string }> {
  const token = crypto.randomBytes(48).toString("hex");
  const tokenPrefix = token.substring(0, 8);
  const tokenHash = await bcrypt.hash(token, 10);

  await db.apiClient.update({ where: { id }, data: { tokenHash, tokenPrefix } });

  revalidatePath("/admin/api");
  return { success: true, token };
}

export async function deleteApiClient(id: string): Promise<ActionResult> {
  await db.apiClient.delete({ where: { id } });
  revalidatePath("/admin/api");
  return { success: true };
}

export async function toggleApiEnabled(type: "property" | "project", id: string): Promise<ActionResult> {
  if (type === "property") {
    const item = await db.property.findUnique({ where: { id } });
    if (!item) return { success: false, error: "Property not found" };
    await db.property.update({ where: { id }, data: { apiEnabled: !item.apiEnabled } });
    revalidatePath("/admin/properties");
  } else {
    const item = await db.project.findUnique({ where: { id } });
    if (!item) return { success: false, error: "Project not found" };
    await db.project.update({ where: { id }, data: { apiEnabled: !item.apiEnabled } });
    revalidatePath("/admin/projects");
  }
  return { success: true };
}
