import { db } from "@/lib/db";

const propertyInclude = { images: { orderBy: { sortOrder: "asc" as const } } };

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
    include: propertyInclude,
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
    include: propertyInclude,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPropertyById(id: string) {
  return db.property.findUnique({
    where: { id },
    include: propertyInclude,
  });
}

export async function getDashboardStats() {
  const [total, published, inquiries] = await Promise.all([
    db.property.count(),
    db.property.count({ where: { published: true, status: "ACTIVE" } }),
    db.inquiry.count(),
  ]);
  return { total, published, inquiries };
}
