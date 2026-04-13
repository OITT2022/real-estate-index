"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { deleteImage } from "@/lib/upload";
import { z } from "zod";
import { propertyFormSchema, projectFormSchema, inquirySchema, apiClientFormSchema, adminUserFormSchema, customerFormSchema } from "@/lib/validations";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getSessionUser, canAccessCustomer, isCustomerManager } from "@/lib/scope";

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

  // Resolve effective customerId: if project has a customer, inherit it; clear direct assignment
  let resolvedCustomerId: string | null = customerId || null;

  // Customer manager: force their customer
  if (sessionUser && isCustomerManager(sessionUser)) {
    resolvedCustomerId = sessionUser.customerId;
  }

  if (projectId) {
    const project = await db.project.findUnique({ where: { id: projectId }, select: { customerId: true } });
    // Scope check: customer manager can only use their own projects
    if (sessionUser && isCustomerManager(sessionUser) && project?.customerId && project.customerId !== sessionUser.customerId) {
      return { success: false, error: "You cannot use a project from another customer" };
    }
    if (project?.customerId) {
      resolvedCustomerId = null; // inherited from project, don't store directly
    }
  }

  const property = await db.property.create({
    data: {
      ...rest,
      latitude,
      longitude,
      price,
      sold,
      projectId: projectId || null,
      customerId: resolvedCustomerId,
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

  // Resolve effective customerId
  let resolvedCustomerId: string | null = customerId || null;

  if (sessionUser && isCustomerManager(sessionUser)) {
    resolvedCustomerId = sessionUser.customerId;
  }

  if (projectId) {
    const project = await db.project.findUnique({ where: { id: projectId }, select: { customerId: true } });
    if (sessionUser && isCustomerManager(sessionUser) && project?.customerId && project.customerId !== sessionUser.customerId) {
      return { success: false, error: "You cannot use a project from another customer" };
    }
    if (project?.customerId) {
      resolvedCustomerId = null; // inherited from project
    }
  }

  await db.property.update({
    where: { id },
    data: {
      ...rest,
      latitude,
      longitude,
      price,
      sold,
      projectId: projectId || null,
      customerId: resolvedCustomerId,
      status: sold ? "SOLD" : rest.published ? "ACTIVE" : "DRAFT",
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

  const sessionUser = await getSessionUser();
  const { latitude, longitude, customerId, ...rest } = parsed.data;
  rest.slug = slugify(rest.slug);

  // Customer manager: force their customer
  const resolvedCustomerId = sessionUser && isCustomerManager(sessionUser)
    ? sessionUser.customerId
    : customerId || null;

  const project = await db.project.create({
    data: { ...rest, latitude, longitude, customerId: resolvedCustomerId, status: rest.published ? "ACTIVE" : "DRAFT" },
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

  const resolvedCustomerId = sessionUser && isCustomerManager(sessionUser)
    ? sessionUser.customerId
    : customerId || null;

  await db.project.update({
    where: { id },
    data: { ...rest, latitude, longitude, customerId: resolvedCustomerId, status: rest.published ? "ACTIVE" : "DRAFT" },
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
  const parsed = inquirySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const property = await db.property.findUnique({ where: { id: parsed.data.propertyId }, include: { project: true } });
  if (!property) return { success: false, error: "Property not found" };

  await db.inquiry.create({
    data: {
      ...parsed.data,
      projectId: property.projectId,
    },
  });
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

export async function savePageContent(data: Record<string, string>): Promise<ActionResult> {
  for (const [key, value] of Object.entries(data)) {
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
      profileImage: parsed.data.profileImage || null,
      passwordHash,
      isSuperAdmin: parsed.data.isSuperAdmin,
      allowedPages: parsed.data.allowedPages,
      customerId: parsed.data.customerId || null,
      active: parsed.data.active,
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
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { name, email, subject, message } = parsed.data;

  const { sendEmail } = await import("@/lib/email");
  const result = await sendEmail(
    "avi@aradre.com",
    `[Contact Form] ${subject}`,
    `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
  );

  if (!result.success) return { success: false, error: result.error ?? "Failed to send email" };
  return { success: true };
}
