import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/scope";
import { customerScope, propertyCustomerScope } from "@/lib/scope";

const propertyInclude = { images: { orderBy: { sortOrder: "asc" as const } } };
const projectInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  _count: { select: { properties: true } },
};

// ── Properties ─────────────────────────────────────────────────

export async function getPublishedProperties() {
  return db.property.findMany({
    where: { published: true, status: "ACTIVE" },
    include: propertyInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getFeaturedProperties() {
  return db.property.findMany({
    where: { published: true, status: "ACTIVE", featured: true },
    include: propertyInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPropertyBySlug(slug: string) {
  return db.property.findFirst({
    where: { slug, published: true, status: "ACTIVE" },
    include: {
      ...propertyInclude,
      project: { select: { title: true, slug: true } },
    },
  });
}

export async function getRelatedProperties(slug: string, city?: string) {
  return db.property.findMany({
    where: {
      slug: { not: slug },
      published: true,
      status: "ACTIVE",
      ...(city ? { city } : {}),
    },
    include: propertyInclude,
    take: 3,
    orderBy: { createdAt: "desc" },
  });
}

export type SearchFilters = {
  city?: string;
  propertyType?: string;
  bedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
};

export async function searchProperties(filters: SearchFilters) {
  const where: Record<string, unknown> = { published: true, status: "ACTIVE" };

  if (filters.city) {
    where.city = { contains: filters.city, mode: "insensitive" };
  }
  if (filters.propertyType) {
    where.propertyType = { equals: filters.propertyType, mode: "insensitive" };
  }
  if (filters.bedrooms) {
    where.bedrooms = { gte: filters.bedrooms };
  }
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    };
  }

  return db.property.findMany({
    where,
    include: propertyInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getDistinctCities() {
  const results = await db.property.findMany({
    where: { published: true, status: "ACTIVE" },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  return results.map((r) => r.city);
}

export async function getDistinctPropertyTypes() {
  const results = await db.property.findMany({
    where: { published: true, status: "ACTIVE", propertyType: { not: null } },
    select: { propertyType: true },
    distinct: ["propertyType"],
    orderBy: { propertyType: "asc" },
  });
  return results.map((r) => r.propertyType).filter(Boolean) as string[];
}

export async function getAllProperties(user?: SessionUser, customerId?: string) {
  const where: any = user ? propertyCustomerScope(user) : undefined;
  // Additional customer filter (from URL param)
  if (customerId) {
    const custFilter = {
      OR: [
        { customerId },
        { project: { customerId } },
      ],
    };
    return db.property.findMany({
      where: where ? { AND: [where, custFilter] } : custFilter,
      include: { ...propertyInclude, project: { select: { title: true, customerId: true, customer: { select: { companyName: true } } } }, customer: { select: { companyName: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
  return db.property.findMany({
    where,
    include: { ...propertyInclude, project: { select: { title: true, customerId: true, customer: { select: { companyName: true } } } }, customer: { select: { companyName: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPropertyById(id: string) {
  return db.property.findUnique({
    where: { id },
    include: propertyInclude,
  });
}

// ── Projects ───────────────────────────────────────────────────

export async function getPublishedProjects() {
  return db.project.findMany({
    where: { published: true, status: "ACTIVE" },
    include: projectInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectBySlug(slug: string) {
  return db.project.findFirst({
    where: { slug, published: true, status: "ACTIVE" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      documents: { orderBy: { sortOrder: "asc" } },
      properties: {
        where: { published: true, status: "ACTIVE" },
        include: { images: { orderBy: { sortOrder: "asc" } } },
        orderBy: { price: "asc" },
      },
    },
  });
}

export async function getAllProjects(user?: SessionUser, customerId?: string) {
  let where: any = user ? customerScope(user) : undefined;
  if (customerId) {
    where = where ? { AND: [where, { customerId }] } : { customerId };
  }
  return db.project.findMany({
    where,
    include: { ...projectInclude, customer: { select: { companyName: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProjectById(id: string) {
  return db.project.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      documents: { orderBy: { sortOrder: "asc" } },
      properties: {
        include: { images: { orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getAllProjectsForSelect(user?: SessionUser) {
  return db.project.findMany({
    where: user ? customerScope(user) : undefined,
    select: { id: true, title: true, customerId: true },
    orderBy: { title: "asc" },
  });
}

export async function getAllCustomersForSelect() {
  return db.customer.findMany({
    select: { id: true, companyName: true },
    orderBy: { companyName: "asc" },
  });
}

// ── Image Bank ─────────────────────────────────────────────────

export async function getAllBankImages() {
  return db.imageBank.findMany({ orderBy: { createdAt: "desc" } });
}

// ── Inquiries CRM ──────────────────────────────────────────────

export async function getInquiryById(id: string) {
  return db.inquiry.findUnique({
    where: { id },
    include: {
      property: { select: { title: true, slug: true } },
      project: { select: { title: true, slug: true } },
      notes: { orderBy: { createdAt: "desc" } },
      appointments: { orderBy: { dateTime: "desc" } },
      emails: { orderBy: { sentAt: "desc" } },
    },
  });
}

// ── Customers ─────────────────────────────────────────────────

export async function getAllCustomers(search?: string) {
  return db.customer.findMany({
    where: search
      ? { companyName: { contains: search, mode: "insensitive" } }
      : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomerById(id: string) {
  return db.customer.findUnique({ where: { id } });
}

// ── Admin Users ────────────────────────────────────────────────

export async function getAllAdminUsers() {
  return db.adminUser.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAdminUserById(id: string) {
  return db.adminUser.findUnique({ where: { id } });
}

// ── Hero Images ────────────────────────────────────────────────

export async function getAllHeroImages() {
  return db.heroImage.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getActiveHeroImages() {
  return db.heroImage.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

// ── API Clients ────────────────────────────────────────────────

export async function getAllApiClients() {
  return db.apiClient.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getApiClientById(id: string) {
  return db.apiClient.findUnique({ where: { id } });
}

// ── Dashboard ──────────────────────────────────────────────────

export async function getDashboardStats(user?: SessionUser) {
  const propWhere = user ? (propertyCustomerScope(user) ?? {}) : {};
  const projWhere = user ? (customerScope(user) ?? {}) : {};

  const [total, published, inquiries, projects] = await Promise.all([
    db.property.count({ where: propWhere }),
    db.property.count({ where: { ...propWhere, published: true, status: "ACTIVE" } }),
    db.inquiry.count({ where: user && !user.isSuperAdmin && user.customerId ? { property: { OR: [{ customerId: user.customerId }, { project: { customerId: user.customerId } }] } } : undefined }),
    db.project.count({ where: projWhere }),
  ]);
  return { total, published, inquiries, projects };
}
