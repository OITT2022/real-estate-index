"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { deleteImage } from "@/lib/upload";
import { z } from "zod";
import { propertyFormSchema, projectFormSchema, inquirySchema, apiClientFormSchema, adminUserFormSchema, customerFormSchema } from "@/lib/validations";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getSessionUser, canAccessCustomer, isCustomerManager, propertyCustomerScope, inquiryCustomerScope } from "@/lib/scope";
import { slugify } from "@/lib/slug";
import { resolveCustomerId } from "@/lib/customer-scope";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

// ── Property CRUD ──────────────────────────────────────────────

function cleanNumericFields(data: unknown): unknown {
  if (typeof data !== "object" || data === null) return data;
  const obj = { ...(data as Record<string, unknown>) };
  for (const key of ["bedrooms", "bathrooms", "areaSqm", "floor"]) {
    if (obj[key] === "" || obj[key] === undefined) obj[key] = undefined;
  }
  return obj;
}

export async function createProperty(data: unknown): Promise<ActionResult> {
  const parsed = propertyFormSchema.safeParse(cleanNumericFields(data));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const sessionUser = await getSessionUser();
  const { latitude, longitude, price, projectId, customerId, sold, ...rest } = parsed.data;
  rest.slug = slugify(rest.slug);

  const scope = await resolveCustomerId(sessionUser, customerId, projectId);
  if (!scope.ok) return { success: false, error: scope.error };

  const property = await db.property.create({
    data: {
      ...rest,
      latitude,
      longitude,
      price,
      sold,
      projectId: projectId || null,
      customerId: scope.customerId,
      sellerName: rest.sellerName ?? "",
      status: sold ? "SOLD" : rest.published ? "ACTIVE" : "DRAFT",
    },
  });

  revalidatePath("/admin/properties");
  revalidatePath("/");
  return { success: true, id: property.id };
}

export async function updateProperty(id: string, data: unknown): Promise<ActionResult> {
  const parsed = propertyFormSchema.safeParse(cleanNumericFields(data));
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const sessionUser = await getSessionUser();

  // Scope check: customer manager can only edit their own properties
  if (sessionUser && isCustomerManager(sessionUser)) {
    const existing = await db.property.findUnique({ where: { id }, include: { project: { select: { customerId: true } } } });
    if (!existing) return { success: false, error: "Property not found" };
    const effectiveCust = existing.project?.customerId ?? existing.customerId;
    if (effectiveCust && effectiveCust !== sessionUser.customerId) {
      return { success: false, error: "You cannot edit a property from another customer" };
    }
  }

  const { latitude, longitude, price, projectId, customerId, sold, ...rest } = parsed.data;
  rest.slug = slugify(rest.slug);

  const scope = await resolveCustomerId(sessionUser, customerId, projectId);
  if (!scope.ok) return { success: false, error: scope.error };

  await db.property.update({
    where: { id },
    data: {
      ...rest,
      latitude,
      longitude,
      price,
      sold,
      projectId: projectId || null,
      customerId: scope.customerId,
      status: sold ? "SOLD" : rest.published ? "ACTIVE" : "DRAFT",
    },
  });

  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${id}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  // Fetch image URLs before cascade so we can clean storage. FK cascade
  // will drop PropertyImage rows, but the underlying blobs would orphan.
  const images = await db.propertyImage.findMany({ where: { propertyId: id }, select: { url: true } });
  for (const img of images) {
    try {
      await deleteImage(img.url);
    } catch (err) {
      console.error(`[deleteProperty] failed to delete blob ${img.url}`, err);
    }
  }
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

  const sessionUser = await getSessionUser();
  const { latitude, longitude, customerId, ...rest } = parsed.data;
  rest.slug = slugify(rest.slug);

  const scope = await resolveCustomerId(sessionUser, customerId, null);
  if (!scope.ok) return { success: false, error: scope.error };

  const project = await db.project.create({
    data: { ...rest, latitude, longitude, customerId: scope.customerId, status: rest.published ? "ACTIVE" : "DRAFT" },
  });

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  revalidatePath("/");
  return { success: true, id: project.id };
}

export async function updateProject(id: string, data: unknown): Promise<ActionResult> {
  const parsed = projectFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const sessionUser = await getSessionUser();

  // Scope check: customer manager can only edit their own projects
  if (sessionUser && isCustomerManager(sessionUser)) {
    const existing = await db.project.findUnique({ where: { id }, select: { customerId: true } });
    if (existing?.customerId && existing.customerId !== sessionUser.customerId) {
      return { success: false, error: "You cannot edit a project from another customer" };
    }
  }

  const { latitude, longitude, customerId, ...rest } = parsed.data;
  rest.slug = slugify(rest.slug);

  const scope = await resolveCustomerId(sessionUser, customerId, null);
  if (!scope.ok) return { success: false, error: scope.error };

  await db.project.update({
    where: { id },
    data: { ...rest, latitude, longitude, customerId: scope.customerId, status: rest.published ? "ACTIVE" : "DRAFT" },
  });

  // If project customer changed, clear direct customerId on properties that now inherit
  if (customerId) {
    await db.property.updateMany({
      where: { projectId: id, customerId: { not: null } },
      data: { customerId: null },
    });
  }

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/projects");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  // Fetch all blob URLs before cascade so storage doesn't orphan.
  const [images, documents, project] = await Promise.all([
    db.projectImage.findMany({ where: { projectId: id }, select: { url: true } }),
    db.projectDocument.findMany({ where: { projectId: id }, select: { url: true } }),
    db.project.findUnique({ where: { id }, select: { environmentExrUrl: true } }),
  ]);
  const urls = [
    ...images.map((i) => i.url),
    ...documents.map((d) => d.url),
    ...(project?.environmentExrUrl ? [project.environmentExrUrl] : []),
  ];
  for (const url of urls) {
    try {
      await deleteImage(url);
    } catch (err) {
      console.error(`[deleteProject] failed to delete blob ${url}`, err);
    }
  }
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

// ── Image action helpers (shared between Property & Project images) ──
// `model` is a Prisma delegate (db.propertyImage or db.projectImage). We use
// `any` here intentionally — Prisma's generated delegate types are highly
// specific per-model and the two delegates have structurally identical
// methods for our use, so plumbing exact generics through provides no real
// type safety while making the code dramatically more verbose.

type ImageDelegate = {
  findUnique: (args: { where: { id: string } }) => Promise<any>;
  findFirst: (args: { where: Record<string, string>; orderBy: { sortOrder: "asc" } }) => Promise<{ id: string } | null>;
  update: (args: { where: { id: string }; data: Record<string, unknown> }) => any;
  updateMany: (args: { where: Record<string, string>; data: { isPrimary: boolean } }) => any;
  delete: (args: { where: { id: string } }) => Promise<unknown>;
};

async function imageSetPrimary(model: ImageDelegate, imageId: string, entityField: string, paths: string[]): Promise<ActionResult> {
  const image = await model.findUnique({ where: { id: imageId } });
  if (!image) return { success: false, error: "Image not found" };
  const entityId = image[entityField] as string;
  await db.$transaction([
    model.updateMany({ where: { [entityField]: entityId }, data: { isPrimary: false } }),
    model.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);
  for (const p of paths) revalidatePath(p.replace("[id]", entityId));
  return { success: true };
}

async function imageReorder(model: ImageDelegate, entityId: string, orderedIds: string[], paths: string[]): Promise<ActionResult> {
  await db.$transaction(
    orderedIds.map((id, index) => model.update({ where: { id }, data: { sortOrder: index } }))
  );
  for (const p of paths) revalidatePath(p.replace("[id]", entityId));
  return { success: true };
}

async function imageRemove(model: ImageDelegate, imageId: string, entityField: string, paths: string[]): Promise<ActionResult> {
  const image = await model.findUnique({ where: { id: imageId } });
  if (!image) return { success: false, error: "Image not found" };
  const entityId = image[entityField] as string;
  await deleteImage(image.url);
  await model.delete({ where: { id: imageId } });
  if (image.isPrimary) {
    const next = await model.findFirst({ where: { [entityField]: entityId }, orderBy: { sortOrder: "asc" } });
    if (next) await model.update({ where: { id: next.id }, data: { isPrimary: true } });
  }
  for (const p of paths) revalidatePath(p.replace("[id]", entityId));
  return { success: true };
}

// ── Property Images ───────────────────────────────────────────

const PROPERTY_IMAGE_PATHS = ["/admin/properties/[id]", "/"];

export async function setImagePrimary(imageId: string): Promise<ActionResult> {
  return imageSetPrimary(db.propertyImage as unknown as ImageDelegate, imageId, "propertyId", PROPERTY_IMAGE_PATHS);
}

export async function reorderImages(propertyId: string, orderedIds: string[]): Promise<ActionResult> {
  return imageReorder(db.propertyImage as unknown as ImageDelegate, propertyId, orderedIds, PROPERTY_IMAGE_PATHS);
}

export async function removeImage(imageId: string): Promise<ActionResult> {
  return imageRemove(db.propertyImage as unknown as ImageDelegate, imageId, "propertyId", PROPERTY_IMAGE_PATHS);
}

// ── Project Images ────────────────────────────────────────────

const PROJECT_IMAGE_PATHS = ["/admin/projects/[id]", "/projects"];

export async function setProjectImagePrimary(imageId: string): Promise<ActionResult> {
  return imageSetPrimary(db.projectImage as unknown as ImageDelegate, imageId, "projectId", PROJECT_IMAGE_PATHS);
}

export async function reorderProjectImages(projectId: string, orderedIds: string[]): Promise<ActionResult> {
  return imageReorder(db.projectImage as unknown as ImageDelegate, projectId, orderedIds, PROJECT_IMAGE_PATHS);
}

export async function removeProjectImage(imageId: string): Promise<ActionResult> {
  return imageRemove(db.projectImage as unknown as ImageDelegate, imageId, "projectId", PROJECT_IMAGE_PATHS);
}

// ── Project Environment EXR ───────────────────────────────────

export async function clearProjectExr(projectId: string): Promise<ActionResult> {
  const project = await db.project.findUnique({ where: { id: projectId }, select: { environmentExrUrl: true } });
  if (!project) return { success: false, error: "Project not found" };
  if (project.environmentExrUrl) {
    await deleteImage(project.environmentExrUrl);
  }
  await db.project.update({ where: { id: projectId }, data: { environmentExrUrl: null } });
  revalidatePath(`/admin/projects/${projectId}`);
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

export async function createAdminInquiry(data: unknown): Promise<ActionResult> {
  const schema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional().or(z.literal("")),
    message: z.string().min(5),
    propertyId: z.string().min(1),
    status: z.string().optional(),
  });
  const parsed = schema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const property = await db.property.findUnique({ where: { id: parsed.data.propertyId }, select: { id: true, projectId: true } });
  if (!property) return { success: false, error: "Property not found" };

  await db.inquiry.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
      propertyId: property.id,
      projectId: property.projectId,
      status: parsed.data.status || "new",
    },
  });

  revalidatePath("/admin/inquiries");
  return { success: true };
}

export async function createInquiry(data: unknown): Promise<ActionResult> {
  const ip = await getClientIp();
  const rl = checkRateLimit(`inquiry:${ip}`, 5, 15 * 60_000);
  if (!rl.allowed) {
    const minutes = Math.ceil(rl.retryAfterMs / 60_000);
    return { success: false, error: `Too many requests. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.` };
  }

  const parsed = inquirySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  // Resolve which subject the inquiry is about: a property (which may belong
  // to a project) or a project on its own.
  let propertyId: string | null = null;
  let projectId: string | null = null;
  let notifyEmail = "";
  let subject = "";
  let body = "";

  if (parsed.data.propertyId) {
    const property = await db.property.findUnique({
      where: { id: parsed.data.propertyId },
      include: { project: true },
    });
    if (!property) return { success: false, error: "Property not found" };

    propertyId = property.id;
    projectId = property.projectId;
    notifyEmail = property.sellerEmail || process.env.RESEND_TO_EMAIL || "";
    subject = `New inquiry: ${property.title}`;
    body =
      `New inquiry on ${property.title} (/properties/${property.slug}):\n\n` +
      `Name: ${parsed.data.fullName}\n` +
      `Email: ${parsed.data.email}\n` +
      `Phone: ${parsed.data.phone ?? "—"}\n\n` +
      `Message:\n${parsed.data.message}`;
  } else if (parsed.data.projectId) {
    const project = await db.project.findUnique({
      where: { id: parsed.data.projectId },
      include: { customer: { select: { contactEmail: true } } },
    });
    if (!project) return { success: false, error: "Project not found" };

    projectId = project.id;
    notifyEmail = project.customer?.contactEmail || process.env.RESEND_TO_EMAIL || "";
    subject = `New inquiry: ${project.title}`;
    body =
      `New inquiry on project ${project.title} (/projects/${project.slug}):\n\n` +
      `Name: ${parsed.data.fullName}\n` +
      `Email: ${parsed.data.email}\n` +
      `Phone: ${parsed.data.phone ?? "—"}\n\n` +
      `Message:\n${parsed.data.message}`;
  } else {
    return { success: false, error: "Inquiry must reference a property or a project" };
  }

  const inquiry = await db.inquiry.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
      propertyId,
      projectId,
    },
  });

  // Notify the seller (and admin fallback). Email failures must not block the
  // inquiry from being saved — log to EmailLog so the admin can see the trail.
  if (notifyEmail) {
    try {
      const { sendEmail } = await import("@/lib/email");
      const result = await sendEmail(notifyEmail, subject, body);
      await db.emailLog.create({
        data: {
          inquiryId: inquiry.id,
          subject,
          body: result.success ? body : `[FAILED: ${result.error ?? "unknown"}]\n\n${body}`,
          sentTo: notifyEmail,
        },
      });
    } catch (err) {
      console.error("[createInquiry] notification email failed", err);
    }
  }

  return { success: true };
}

export async function updateInquiryStatus(id: string, status: string): Promise<ActionResult> {
  await db.inquiry.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/inquiries/${id}`);
  revalidatePath("/admin/inquiries");
  return { success: true };
}

export async function addInquiryNote(inquiryId: string, content: string): Promise<ActionResult> {
  await db.inquiryNote.create({ data: { inquiryId, content } });
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  return { success: true };
}

export async function addAppointment(inquiryId: string, dateTime: string, summary: string): Promise<ActionResult> {
  await db.appointment.create({ data: { inquiryId, dateTime: new Date(dateTime), summary } });
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  return { success: true };
}

export async function updateAppointmentStatus(id: string, status: string): Promise<ActionResult> {
  const apt = await db.appointment.findUnique({ where: { id } });
  if (!apt) return { success: false, error: "Appointment not found" };
  await db.appointment.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/inquiries/${apt.inquiryId}`);
  return { success: true };
}

export async function sendInquiryEmail(inquiryId: string, subject: string, body: string): Promise<ActionResult> {
  const inquiry = await db.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) return { success: false, error: "Inquiry not found" };

  const { sendEmail } = await import("@/lib/email");
  const result = await sendEmail(inquiry.email, subject, body);
  if (!result.success) return { success: false, error: result.error ?? "Failed to send email" };

  await db.emailLog.create({
    data: { inquiryId, subject, body, sentTo: inquiry.email },
  });

  revalidatePath(`/admin/inquiries/${inquiryId}`);
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

// ── Page Content ──────────────────────────────────────────────

// SiteSetting keys that hold user-uploaded image URLs. When the value is
// replaced, the previous blob (if it lived in our storage) should be
// deleted to avoid orphaning it.
const PAGE_IMAGE_KEYS = new Set(["about_image", "contact_image"]);

export async function savePageContent(data: Record<string, string>): Promise<ActionResult> {
  for (const [key, value] of Object.entries(data)) {
    if (PAGE_IMAGE_KEYS.has(key)) {
      const existing = await db.siteSetting.findUnique({ where: { key }, select: { value: true } });
      const oldUrl = existing?.value;
      if (
        oldUrl &&
        oldUrl !== value &&
        (oldUrl.startsWith("/uploads/") || oldUrl.includes(".s3."))
      ) {
        try {
          await deleteImage(oldUrl);
        } catch (err) {
          console.error(`[savePageContent] failed to delete replaced blob ${oldUrl}`, err);
        }
      }
    }
    await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/");
  revalidatePath("/admin/pages");
  return { success: true };
}

// ── Image Bank ────────────────────────────────────────────────

export async function linkBankImageToProperty(bankImageId: string, propertyId: string): Promise<ActionResult> {
  const bankImg = await db.imageBank.findUnique({ where: { id: bankImageId } });
  if (!bankImg) return { success: false, error: "Image not found" };

  const maxOrder = await db.propertyImage.aggregate({ where: { propertyId }, _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;
  const existingCount = await db.propertyImage.count({ where: { propertyId } });

  await db.propertyImage.create({
    data: { propertyId, url: bankImg.url, altText: bankImg.altText, sortOrder: nextOrder, isPrimary: existingCount === 0 },
  });

  revalidatePath(`/admin/properties/${propertyId}`);
  revalidatePath("/");
  return { success: true };
}

export async function linkBankImageToProject(bankImageId: string, projectId: string): Promise<ActionResult> {
  const bankImg = await db.imageBank.findUnique({ where: { id: bankImageId } });
  if (!bankImg) return { success: false, error: "Image not found" };

  const maxOrder = await db.projectImage.aggregate({ where: { projectId }, _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;
  const existingCount = await db.projectImage.count({ where: { projectId } });

  await db.projectImage.create({
    data: { projectId, url: bankImg.url, altText: bankImg.altText, sortOrder: nextOrder, isPrimary: existingCount === 0 },
  });

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/projects");
  return { success: true };
}

export async function deleteBankImage(id: string): Promise<ActionResult> {
  const img = await db.imageBank.findUnique({ where: { id } });
  if (!img) return { success: false, error: "Image not found" };
  await deleteImage(img.url);
  await db.imageBank.delete({ where: { id } });
  return { success: true };
}

// ── Customers ────────────────────────────────────────────────

export async function createCustomer(data: unknown): Promise<ActionResult> {
  const parsed = customerFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const customer = await db.customer.create({
    data: {
      companyName: parsed.data.companyName,
      logoUrl: parsed.data.logoUrl || null,
      description: parsed.data.description || null,
      contactName: parsed.data.contactName || null,
      contactEmail: parsed.data.contactEmail || null,
      contactPhone: parsed.data.contactPhone?.trim() || null,
    },
  });

  revalidatePath("/admin/customers");
  return { success: true, id: customer.id };
}

export async function updateCustomer(id: string, data: unknown): Promise<ActionResult> {
  const parsed = customerFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  await db.customer.update({
    where: { id },
    data: {
      companyName: parsed.data.companyName,
      logoUrl: parsed.data.logoUrl || null,
      description: parsed.data.description || null,
      contactName: parsed.data.contactName || null,
      contactEmail: parsed.data.contactEmail || null,
      contactPhone: parsed.data.contactPhone?.trim() || null,
    },
  });

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  return { success: true };
}

export async function deleteCustomer(id: string): Promise<ActionResult> {
  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer) return { success: false, error: "Customer not found" };

  if (customer.logoUrl) {
    await deleteImage(customer.logoUrl);
  }

  await db.customer.delete({ where: { id } });
  revalidatePath("/admin/customers");
  return { success: true };
}

// ── Admin Users ───────────────────────────────────────────────

export async function createAdminUser(data: unknown): Promise<ActionResult> {
  const parsed = adminUserFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  if (!parsed.data.password) return { success: false, error: "Password is required for new users" };

  const existing = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { success: false, error: "A user with this email already exists" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await db.adminUser.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      phoneCountry: parsed.data.phoneCountry || null,
      country: parsed.data.country || null,
      timezone: parsed.data.timezone || null,
      profileImage: parsed.data.profileImage || null,
      passwordHash,
      isSuperAdmin: parsed.data.isSuperAdmin,
      allowedPages: parsed.data.allowedPages,
      customerId: parsed.data.customerId || null,
      active: parsed.data.active,
      // Force the user to change their temp password on first login.
      mustChangePassword: true,
    },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateAdminUser(id: string, data: unknown): Promise<ActionResult> {
  const parsed = adminUserFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const updateData: Record<string, unknown> = {
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    phoneCountry: parsed.data.phoneCountry || null,
    country: parsed.data.country || null,
    timezone: parsed.data.timezone || null,
    profileImage: parsed.data.profileImage || null,
    isSuperAdmin: parsed.data.isSuperAdmin,
    allowedPages: parsed.data.allowedPages,
    customerId: parsed.data.customerId || null,
    active: parsed.data.active,
  };

  if (parsed.data.password) {
    updateData.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }

  await db.adminUser.update({ where: { id }, data: updateData });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}`);
  return { success: true };
}

export async function deleteAdminUser(id: string): Promise<ActionResult> {
  const user = await db.adminUser.findUnique({ where: { id } });
  if (!user) return { success: false, error: "User not found" };
  if (user.isSuperAdmin) return { success: false, error: "Cannot delete a super admin" };

  // Clean up the profile image blob if it lives in our storage. External URLs
  // (e.g. gravatar) and the default placeholder are skipped.
  if (user.profileImage && (user.profileImage.startsWith("/uploads/") || user.profileImage.includes(".s3."))) {
    try {
      await deleteImage(user.profileImage);
    } catch (err) {
      console.error(`[deleteAdminUser] failed to delete blob ${user.profileImage}`, err);
    }
  }

  await db.adminUser.delete({ where: { id } });
  revalidatePath("/admin/users");
  return { success: true };
}

// ── Hero Images ────────────────────────────────────────────────

export async function toggleHeroImageActive(id: string): Promise<ActionResult> {
  const img = await db.heroImage.findUnique({ where: { id } });
  if (!img) return { success: false, error: "Image not found" };
  await db.heroImage.update({ where: { id }, data: { active: !img.active } });
  revalidatePath("/admin/pages");
  revalidatePath("/");
  return { success: true };
}

export async function removeHeroImage(id: string): Promise<ActionResult> {
  const img = await db.heroImage.findUnique({ where: { id } });
  if (!img) return { success: false, error: "Image not found" };
  await deleteImage(img.url);
  await db.heroImage.delete({ where: { id } });
  revalidatePath("/admin/pages");
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

  if (parsed.data.scopeType === "customer" && !parsed.data.customerId) {
    return { success: false, error: "Customer is required for customer-scoped API clients" };
  }

  const client = await db.apiClient.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      tokenHash,
      tokenPrefix,
      active: parsed.data.active,
      scopeType: parsed.data.scopeType,
      customerId: parsed.data.scopeType === "customer" ? (parsed.data.customerId || null) : null,
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

  if (parsed.data.scopeType === "customer" && !parsed.data.customerId) {
    return { success: false, error: "Customer is required for customer-scoped API clients" };
  }

  await db.apiClient.update({
    where: { id },
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      active: parsed.data.active,
      scopeType: parsed.data.scopeType,
      customerId: parsed.data.scopeType === "customer" ? (parsed.data.customerId || null) : null,
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

// ── Project Structure ────────────────────────────────────────

export async function generateProjectStructure(
  projectId: string,
  config: { buildings: number; entrances: number; floors: number; unitsPerFloor: number }
): Promise<ActionResult> {
  const existing = await db.projectUnit.count({ where: { projectId } });
  if (existing > 0) {
    return { success: false, error: "Structure already exists. Clear it first or edit directly." };
  }

  const units: {
    projectId: string;
    building: string;
    entrance: string;
    floor: number;
    unitNumber: string;
  }[] = [];

  let unitCounter = 1;
  for (let b = 1; b <= config.buildings; b++) {
    for (let e = 0; e < config.entrances; e++) {
      const entranceName = String.fromCharCode(65 + e);
      for (let f = 0; f <= config.floors; f++) {
        for (let u = 1; u <= config.unitsPerFloor; u++) {
          units.push({
            projectId,
            building: String(b),
            entrance: entranceName,
            floor: f,
            unitNumber: String(unitCounter++),
          });
        }
      }
    }
  }

  await db.projectUnit.createMany({ data: units });
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function addProjectUnit(
  projectId: string,
  data: { building: string; entrance: string; floor: number; unitNumber: string }
): Promise<ActionResult> {
  await db.projectUnit.create({ data: { projectId, ...data } });
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function updateProjectUnit(
  unitId: string,
  data: { unitNumber?: string; propertyId?: string | null }
): Promise<ActionResult> {
  const unit = await db.projectUnit.findUnique({ where: { id: unitId } });
  if (!unit) return { success: false, error: "Unit not found" };

  if (data.propertyId) {
    const property = await db.property.findUnique({ where: { id: data.propertyId }, select: { projectId: true } });
    if (property && property.projectId && property.projectId !== unit.projectId) {
      return { success: false, error: "Property belongs to a different project" };
    }
    // Property can be linked to multiple units
  }

  await db.projectUnit.update({
    where: { id: unitId },
    data: {
      ...(data.unitNumber !== undefined ? { unitNumber: data.unitNumber } : {}),
      ...(data.propertyId !== undefined ? { propertyId: data.propertyId } : {}),
    },
  });
  revalidatePath(`/admin/projects/${unit.projectId}`);
  return { success: true };
}

export async function deleteProjectUnit(unitId: string): Promise<ActionResult> {
  const unit = await db.projectUnit.findUnique({ where: { id: unitId } });
  if (!unit) return { success: false, error: "Unit not found" };
  if (unit.propertyId) return { success: false, error: "Unlink the property first" };
  await db.projectUnit.delete({ where: { id: unitId } });
  revalidatePath(`/admin/projects/${unit.projectId}`);
  return { success: true };
}

export async function setProjectUnitSold(unitId: string, sold: boolean): Promise<ActionResult> {
  const unit = await db.projectUnit.findUnique({ where: { id: unitId }, select: { projectId: true } });
  if (!unit) return { success: false, error: "Unit not found" };
  await db.projectUnit.update({ where: { id: unitId }, data: { sold } });
  revalidatePath(`/admin/projects/${unit.projectId}`);
  // Public project pages cache unit data — invalidate the listing page.
  revalidatePath("/projects");
  return { success: true };
}

export async function addProjectFloor(
  projectId: string, building: string, entrance: string, floor: number, unitCount: number
): Promise<ActionResult> {
  const units = Array.from({ length: unitCount }, (_, i) => ({
    projectId, building, entrance, floor,
    unitNumber: `${floor}${String(i + 1).padStart(2, "0")}`,
  }));
  await db.projectUnit.createMany({ data: units });
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function deleteProjectFloor(
  projectId: string, building: string, entrance: string, floor: number
): Promise<ActionResult> {
  const linked = await db.projectUnit.count({
    where: { projectId, building, entrance, floor, propertyId: { not: null } },
  });
  if (linked > 0) return { success: false, error: `Cannot delete: ${linked} unit(s) have linked properties` };
  await db.projectUnit.deleteMany({ where: { projectId, building, entrance, floor } });
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

export async function clearProjectStructure(projectId: string): Promise<ActionResult> {
  const linked = await db.projectUnit.count({ where: { projectId, propertyId: { not: null } } });
  if (linked > 0) return { success: false, error: `Cannot clear: ${linked} unit(s) have linked properties` };
  await db.projectUnit.deleteMany({ where: { projectId } });
  revalidatePath(`/admin/projects/${projectId}`);
  return { success: true };
}

// ── Contact Form ──────────────────────────────────────────────

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email"),
  subject: z.string().min(1, "Subject is required").max(500),
  message: z.string().min(1, "Message is required").max(5000),
});

export async function submitContactForm(data: unknown): Promise<ActionResult> {
  const ip = await getClientIp();
  const rl = checkRateLimit(`contact:${ip}`, 5, 15 * 60_000);
  if (!rl.allowed) {
    const minutes = Math.ceil(rl.retryAfterMs / 60_000);
    return { success: false, error: `Too many requests. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.` };
  }

  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { name, email, subject, message } = parsed.data;
  const notifyEmail = process.env.RESEND_TO_EMAIL ?? "avi@aradre.com";
  const emailSubject = `[Contact Form] ${subject}`;
  const body = `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`;

  const { sendEmail } = await import("@/lib/email");
  const result = await sendEmail(notifyEmail, emailSubject, body);

  await db.emailLog.create({
    data: {
      inquiryId: null,
      subject: emailSubject,
      body: result.success ? body : `[FAILED: ${result.error ?? "unknown"}]\n\n${body}`,
      sentTo: notifyEmail,
    },
  }).catch((err) => console.error("[submitContactForm] EmailLog write failed", err));

  if (!result.success) return { success: false, error: result.error ?? "Failed to send email" };
  return { success: true };
}

// ── Password recovery & self-service change ───────────────────────

/**
 * Forgot-password: always returns { success: true } regardless of whether
 * the email matches an account, to prevent enumeration. The reset URL is
 * sent via email, or logged to console if RESEND_API_KEY is unset (dev).
 */
export async function requestPasswordReset(email: string): Promise<ActionResult> {
  const ip = await getClientIp();
  const rl = checkRateLimit(`forgot:${ip}`, 3, 15 * 60_000);
  if (!rl.allowed) {
    const minutes = Math.ceil(rl.retryAfterMs / 60_000);
    return { success: false, error: `Too many requests. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.` };
  }

  const normalized = (email ?? "").trim().toLowerCase();
  if (!normalized) return { success: true }; // generic success — no enumeration

  const user = await db.adminUser.findUnique({ where: { email: normalized } });
  if (!user || !user.active) return { success: true };

  const plaintext = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(plaintext).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60_000); // 1 hour

  await db.passwordResetToken.create({
    data: { adminUserId: user.id, tokenHash, expiresAt },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const url = `${baseUrl}/admin/reset-password?token=${plaintext}`;
  const subject = "Reset your aradre.com admin password";
  const body =
    `A password reset was requested for this account.\n\n` +
    `Open this link to choose a new password (valid for 1 hour):\n${url}\n\n` +
    `If you didn't request this, you can ignore this email — your password is unchanged.`;

  const { sendEmail } = await import("@/lib/email");
  const result = await sendEmail(user.email, subject, body);
  if (!result.success) {
    // Dev fallback: surface the URL so the only super admin can recover.
    console.warn(`[requestPasswordReset] email failed (${result.error}); reset URL: ${url}`);
  }

  return { success: true };
}

/**
 * Validates that a reset token is real, unused, and unexpired.
 * Used by the reset-password page on mount to gate the form.
 */
export async function validateResetToken(token: string): Promise<{ valid: boolean }> {
  if (!token) return { valid: false };
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const row = await db.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!row || row.consumedAt || row.expiresAt <= new Date()) return { valid: false };
  return { valid: true };
}

export async function resetPassword(token: string, newPassword: string): Promise<ActionResult> {
  const { passwordPolicy } = await import("@/lib/validations");
  const pwParsed = passwordPolicy.safeParse(newPassword);
  if (!pwParsed.success) return { success: false, error: pwParsed.error.issues[0].message };

  if (!token) return { success: false, error: "Reset link is invalid or has expired." };
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const row = await db.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!row || row.consumedAt || row.expiresAt <= new Date()) {
    return { success: false, error: "Reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db.$transaction([
    db.adminUser.update({
      where: { id: row.adminUserId },
      data: { passwordHash, mustChangePassword: false },
    }),
    db.passwordResetToken.update({
      where: { id: row.id },
      data: { consumedAt: new Date() },
    }),
    // Invalidate any other live tokens for this user — single account hijack window.
    db.passwordResetToken.updateMany({
      where: { adminUserId: row.adminUserId, consumedAt: null, id: { not: row.id } },
      data: { consumedAt: new Date() },
    }),
  ]);

  return { success: true };
}

/**
 * Self-service password change. Used both for the forced first-time flow
 * (mustChangePassword=true) and voluntary change via profile menu.
 */
export async function changeOwnPassword(currentPassword: string, newPassword: string): Promise<ActionResult> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { success: false, error: "Not signed in." };

  const user = await db.adminUser.findUnique({ where: { id: sessionUser.id } });
  if (!user) return { success: false, error: "Account not found." };

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return { success: false, error: "Current password is incorrect." };

  const { passwordPolicy } = await import("@/lib/validations");
  const pwParsed = passwordPolicy.safeParse(newPassword);
  if (!pwParsed.success) return { success: false, error: pwParsed.error.issues[0].message };

  if (currentPassword === newPassword) {
    return { success: false, error: "New password must differ from current." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.adminUser.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false },
  });

  return { success: true };
}

// ── Topbar data: scoped recent inquiries ──────────────────────────

export type RecentInquiry = {
  id: string;
  fullName: string;
  /** Property title, project title, or "Inquiry" if neither is present. */
  subjectTitle: string;
  createdAt: Date;
};

export async function getRecentInquiriesForCurrentUser(
  limit = 5,
): Promise<{ inquiries: RecentInquiry[]; newCount: number }> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { inquiries: [], newCount: 0 };

  const scope = inquiryCustomerScope(sessionUser);
  const where = {
    status: "new",
    ...(scope ?? {}),
  };

  const [rows, newCount] = await Promise.all([
    db.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        property: { select: { title: true } },
        project: { select: { title: true } },
      },
    }),
    db.inquiry.count({ where }),
  ]);

  return {
    inquiries: rows.map((r) => ({
      id: r.id,
      fullName: r.fullName,
      subjectTitle: r.property?.title ?? r.project?.title ?? "Inquiry",
      createdAt: r.createdAt,
    })),
    newCount,
  };
}

// ── Self-service profile update (email is intentionally excluded) ──

export async function updateOwnProfile(data: unknown): Promise<ActionResult> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { success: false, error: "Not signed in." };

  const { profileFormSchema } = await import("@/lib/validations");
  const parsed = profileFormSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  await db.adminUser.update({
    where: { id: sessionUser.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      phoneCountry: parsed.data.phoneCountry || null,
      country: parsed.data.country || null,
      timezone: parsed.data.timezone || null,
      profileImage: parsed.data.profileImage || null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/profile");
  return { success: true };
}
