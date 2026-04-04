import { PrismaClient, PropertyStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD || "ChangeMe123!", 10);

  await prisma.adminUser.upsert({
    where: { email: process.env.ADMIN_SEED_EMAIL || "admin@example.com" },
    update: { isSuperAdmin: true },
    create: {
      email: process.env.ADMIN_SEED_EMAIL || "admin@example.com",
      name: "Admin",
      passwordHash,
      isSuperAdmin: true,
    },
  });

  await prisma.property.createMany({
    data: [
      {
        title: "Sea View Penthouse",
        slug: "sea-view-penthouse",
        shortDescription: "Large penthouse overlooking the sea",
        description: "Premium three-bedroom penthouse with wide open sea views, large terrace, high finish level, and parking.",
        price: 820000,
        currency: "EUR",
        city: "Larnaca",
        neighborhood: "Skala",
        address: "Skala Area, Larnaca",
        latitude: 34.9056,
        longitude: 33.6232,
        propertyType: "Penthouse",
        bedrooms: 3,
        bathrooms: 2,
        areaSqm: 146,
        floor: 5,
        parking: true,
        balcony: true,
        videoUrl: "https://example.com/video/sea-view-penthouse",
        sellerName: "Sales Office",
        sellerEmail: "sales@example.com",
        sellerPhone: "+357-99-123456",
        status: PropertyStatus.ACTIVE,
        published: true,
        featured: true,
        metaTitle: "Sea View Penthouse in Larnaca",
        metaDescription: "Premium penthouse for sale in Larnaca with sea views.",
      },
      {
        title: "Modern City Apartment",
        slug: "modern-city-apartment",
        shortDescription: "Modern apartment in a prime urban location",
        description: "Bright apartment near cafes, shopping, and transit. Ideal for living or investment.",
        price: 285000,
        currency: "EUR",
        city: "Nicosia",
        neighborhood: "Center",
        address: "City Center",
        latitude: 35.1856,
        longitude: 33.3823,
        propertyType: "Apartment",
        bedrooms: 2,
        bathrooms: 2,
        areaSqm: 88,
        floor: 3,
        parking: true,
        balcony: true,
        sellerName: "Sales Office",
        sellerEmail: "sales@example.com",
        sellerPhone: "+357-99-123456",
        status: PropertyStatus.ACTIVE,
        published: true,
        featured: false,
        metaTitle: "Modern City Apartment",
        metaDescription: "Modern apartment in a prime city location.",
      },
      {
        title: "Garden Duplex Residence",
        slug: "garden-duplex-residence",
        shortDescription: "Spacious duplex with private garden",
        description: "Luxurious four-bedroom duplex featuring a large private garden, modern kitchen, double parking, and quiet residential neighborhood. Perfect for families.",
        price: 465000,
        currency: "EUR",
        city: "Limassol",
        neighborhood: "Mesa Geitonia",
        address: "Residential Quarter, Limassol",
        latitude: 34.6841,
        longitude: 33.0379,
        propertyType: "Duplex",
        bedrooms: 4,
        bathrooms: 3,
        areaSqm: 172,
        floor: 0,
        parking: true,
        balcony: true,
        sellerName: "Sales Office",
        sellerEmail: "sales@example.com",
        sellerPhone: "+357-99-123456",
        status: PropertyStatus.ACTIVE,
        published: true,
        featured: true,
        metaTitle: "Garden Duplex in Limassol",
        metaDescription: "Spacious duplex for sale in Limassol with private garden.",
      },
    ],
    skipDuplicates: true,
  });

  // Seed images with real Unsplash photos
  const properties = await prisma.property.findMany();

  const imagesBySlug: Record<string, { url: string; alt: string }[]> = {
    "sea-view-penthouse": [
      { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", alt: "Penthouse exterior with sea view" },
      { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", alt: "Modern living room" },
      { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80", alt: "Spacious terrace" },
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", alt: "Luxury bedroom" },
      { url: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=80", alt: "Designer bathroom" },
    ],
    "modern-city-apartment": [
      { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", alt: "Bright apartment living room" },
      { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80", alt: "Modern apartment interior" },
      { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", alt: "Contemporary kitchen" },
      { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80", alt: "Cozy bedroom" },
    ],
    "garden-duplex-residence": [
      { url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80", alt: "Duplex exterior with garden" },
      { url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80", alt: "Open plan living area" },
      { url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80", alt: "Modern kitchen" },
      { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80", alt: "Garden view" },
      { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80", alt: "Master bedroom" },
    ],
  };

  for (const property of properties) {
    const images = imagesBySlug[property.slug];
    if (!images) continue;

    const existing = await prisma.propertyImage.count({ where: { propertyId: property.id } });
    if (existing > 0) continue;

    await prisma.propertyImage.createMany({
      data: images.map((img, i) => ({
        propertyId: property.id,
        url: img.url,
        altText: img.alt,
        sortOrder: i,
        isPrimary: i === 0,
      })),
    });
  }

  console.log("Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
