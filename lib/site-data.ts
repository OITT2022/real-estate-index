import { db } from "@/lib/db";

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

export async function getAllProperties() {
  return db.property.findMany({
    include: { ...propertyInclude, project: { select: { title: true } } },
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

export async function getAllProjects() {
  return db.project.findMany({
    include: projectInclude,
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

export async function getAllProjectsForSelect() {
  return db.project.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
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

export async function getDashboardStats() {
  const [total, published, inquiries, projects] = await Promise.all([
    db.property.count(),
    db.property.count({ where: { published: true, status: "ACTIVE" } }),
    db.inquiry.count(),
    db.project.count(),
  ]);
  return { total, published, inquiries, projects };
}
