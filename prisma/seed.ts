import { PrismaClient, PropertyStatus, ProjectStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ALL_PAGE_DEFAULTS } from "@/lib/settings";

const prisma = new PrismaClient();

async function main() {
  // ── Admin User ──────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(process.env.ADMIN_SEED_PASSWORD || "ChangeMe123!", 10);

  await prisma.adminUser.upsert({
    where: { email: process.env.ADMIN_SEED_EMAIL || "admin@example.com" },
    update: { isSuperAdmin: true },
    create: {
      email: process.env.ADMIN_SEED_EMAIL || "admin@example.com",
      name: "Admin",
      passwordHash,
      isSuperAdmin: true,
      mustChangePassword: false,
    },
  });

  // ── Hero Images ─────────────────────────────────────────────
  const heroCount = await prisma.heroImage.count();
  if (heroCount === 0) {
    await prisma.heroImage.createMany({
      data: [
        { url: "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?w=1200&q=80", altText: "Cyprus coastline with crystal clear sea", active: true, sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80", altText: "Modern luxury villa exterior", active: true, sortOrder: 1 },
        { url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80", altText: "Beautiful home with garden", active: true, sortOrder: 2 },
        { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80", altText: "Luxury modern home poolside", active: true, sortOrder: 3 },
      ],
    });
    console.log("  Hero images created");
  }

  // ── Projects ────────────────────────────────────────────────
  const projectCount = await prisma.project.count();
  if (projectCount === 0) {
    const projectsData = [
      {
        title: "Azure Marina Residences",
        slug: "azure-marina-residences",
        shortDescription: "Premium waterfront living with panoramic Mediterranean views",
        description: "Azure Marina Residences is a flagship development offering 120 luxury apartments overlooking Limassol Marina. The project features world-class amenities including an infinity pool, private beach access, fitness center, concierge service, and underground parking. Each unit is finished to the highest standards with imported Italian marble, floor-to-ceiling windows, and smart home technology. Expected completion Q4 2027.",
        city: "Limassol",
        address: "Limassol Marina, Limassol",
        latitude: 34.6724,
        longitude: 33.0434,
        developerName: "Azure Development Group",
        completionDate: "Q4 2027",
        totalUnits: 120,
        websiteUrl: "https://example.com/azure-marina",
        status: ProjectStatus.ACTIVE,
        published: true,
        featured: true,
        metaTitle: "Azure Marina Residences - Luxury Waterfront Living",
        metaDescription: "Premium waterfront apartments in Limassol Marina with panoramic sea views.",
      },
      {
        title: "Olive Grove Villas",
        slug: "olive-grove-villas",
        shortDescription: "Exclusive hilltop villas surrounded by century-old olive groves",
        description: "Olive Grove Villas is an exclusive collection of 24 detached luxury villas nestled among ancient olive trees on the hills above Paphos. Each villa offers 3-5 bedrooms, private infinity pool, landscaped gardens, and unobstructed sunset views over the Mediterranean. The development includes a private clubhouse, tennis court, and 24/7 security. Built with locally-sourced natural stone and sustainable materials.",
        city: "Paphos",
        address: "Coral Bay Road, Paphos",
        latitude: 34.8393,
        longitude: 32.3921,
        developerName: "Heritage Homes Cyprus",
        completionDate: "Q2 2026",
        totalUnits: 24,
        status: ProjectStatus.ACTIVE,
        published: true,
        featured: true,
        metaTitle: "Olive Grove Villas - Exclusive Hilltop Living in Paphos",
        metaDescription: "Luxury detached villas surrounded by olive groves in Paphos.",
      },
      {
        title: "Central Park Tower",
        slug: "central-park-tower",
        shortDescription: "Nicosia's tallest residential tower with city panoramas",
        description: "Central Park Tower is a 28-story landmark development in the heart of Nicosia. Offering 200 modern apartments from studios to three-bedroom penthouses, the project features a rooftop infinity pool, sky lounge, co-working space, retail podium, and four levels of underground parking. Located steps from Eleftheria Square and the historic old town, it represents the pinnacle of urban living in the capital.",
        city: "Nicosia",
        address: "Makarios Avenue, Nicosia",
        latitude: 35.1675,
        longitude: 33.3617,
        developerName: "Skyline Developments",
        completionDate: "Q1 2028",
        totalUnits: 200,
        status: ProjectStatus.ACTIVE,
        published: true,
        featured: false,
        metaTitle: "Central Park Tower - Urban Living in Nicosia",
        metaDescription: "Modern high-rise apartments in the heart of Nicosia.",
      },
    ];

    for (const data of projectsData) {
      await prisma.project.create({ data });
    }
    console.log("  Projects created");

    // Project images
    const projects = await prisma.project.findMany();
    const projectImageMap: Record<string, { url: string; alt: string }[]> = {
      "azure-marina-residences": [
        { url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80", alt: "Marina residences aerial view" },
        { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", alt: "Modern lobby interior" },
        { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80", alt: "Luxury apartment interior" },
      ],
      "olive-grove-villas": [
        { url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80", alt: "Luxury villa with pool" },
        { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", alt: "Villa exterior" },
        { url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80", alt: "Open plan living" },
      ],
      "central-park-tower": [
        { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", alt: "Modern tower building" },
        { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80", alt: "Modern apartment" },
        { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", alt: "Contemporary kitchen" },
      ],
    };

    for (const project of projects) {
      const imgs = projectImageMap[project.slug];
      if (!imgs) continue;
      await prisma.projectImage.createMany({
        data: imgs.map((img, i) => ({
          projectId: project.id,
          url: img.url,
          altText: img.alt,
          sortOrder: i,
          isPrimary: i === 0,
        })),
      });
    }
    console.log("  Project images created");
  }

  // ── Properties ──────────────────────────────────────────────
  const propCount = await prisma.property.count();
  if (propCount === 0) {
    const propertiesData = [
      {
        title: "Sea View Penthouse",
        slug: "sea-view-penthouse",
        shortDescription: "Large penthouse overlooking the sea",
        description: "Premium three-bedroom penthouse with wide open sea views, large terrace, high finish level, and parking. Located in the sought-after Skala area of Larnaca, this property offers the perfect blend of luxury coastal living. Features include imported marble flooring, a designer kitchen with premium appliances, and a wrap-around terrace perfect for entertaining.",
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
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        sellerName: "Marina Estates",
        sellerEmail: "marina@estates.cy",
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
        description: "Bright apartment near cafes, shopping, and transit. Ideal for living or investment. This contemporary two-bedroom apartment is located in the heart of Nicosia, offering easy access to all amenities. The open-plan living area floods with natural light, and the modern kitchen features integrated appliances. Underground parking included.",
        price: 285000,
        currency: "EUR",
        city: "Nicosia",
        neighborhood: "Center",
        address: "City Center, Nicosia",
        latitude: 35.1856,
        longitude: 33.3823,
        propertyType: "Apartment",
        bedrooms: 2,
        bathrooms: 2,
        areaSqm: 88,
        floor: 3,
        parking: true,
        balcony: true,
        sellerName: "Urban Property Co.",
        sellerEmail: "info@urbanproperty.cy",
        sellerPhone: "+357-22-654321",
        status: PropertyStatus.ACTIVE,
        published: true,
        featured: false,
        metaTitle: "Modern City Apartment in Nicosia",
        metaDescription: "Modern apartment in a prime city location.",
      },
      {
        title: "Garden Duplex Residence",
        slug: "garden-duplex-residence",
        shortDescription: "Spacious duplex with private garden",
        description: "Luxurious four-bedroom duplex featuring a large private garden, modern kitchen, double parking, and quiet residential neighborhood. Perfect for families seeking space and tranquility while remaining close to all amenities. The lower floor features an open-plan living/dining area that opens onto the garden, while the upper floor houses four generous bedrooms each with en-suite bathrooms.",
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
        sellerName: "Limassol Realty",
        sellerEmail: "sales@limassolrealty.cy",
        sellerPhone: "+357-25-111222",
        status: PropertyStatus.ACTIVE,
        published: true,
        featured: true,
        metaTitle: "Garden Duplex in Limassol",
        metaDescription: "Spacious duplex for sale in Limassol with private garden.",
      },
      {
        title: "Coral Bay Beach Villa",
        slug: "coral-bay-beach-villa",
        shortDescription: "Stunning beachfront villa with private pool",
        description: "An exceptional five-bedroom beachfront villa situated just 100 meters from the crystal-clear waters of Coral Bay. This property features a private infinity pool overlooking the sea, expansive outdoor entertaining areas with built-in BBQ, a fully equipped modern kitchen, home cinema room, and a separate guest apartment. The landscaped gardens include mature palm trees and Mediterranean plants. An ideal property for those seeking the ultimate beach lifestyle.",
        price: 1250000,
        currency: "EUR",
        city: "Paphos",
        neighborhood: "Coral Bay",
        address: "Coral Bay Road, Paphos",
        latitude: 34.8418,
        longitude: 32.3538,
        propertyType: "Villa",
        bedrooms: 5,
        bathrooms: 4,
        areaSqm: 320,
        floor: 0,
        parking: true,
        balcony: true,
        websiteUrl: "https://example.com/coral-bay-villa",
        sellerName: "Paphos Luxury Homes",
        sellerEmail: "info@paphosluxury.cy",
        sellerPhone: "+357-26-987654",
        status: PropertyStatus.ACTIVE,
        published: true,
        featured: true,
        metaTitle: "Coral Bay Beach Villa - Luxury Beachfront Living",
        metaDescription: "Five-bedroom beachfront villa with pool in Coral Bay, Paphos.",
      },
      {
        title: "Fig Tree Bay Studio",
        slug: "fig-tree-bay-studio",
        shortDescription: "Investment studio near award-winning beach",
        description: "A compact yet beautifully designed studio apartment just 300 meters from the famous Fig Tree Bay. Perfect as a holiday home or rental investment property. Features include a modern kitchenette, en-suite bathroom with walk-in shower, and a private balcony with partial sea views. The complex offers a communal pool, reception, and on-site management for hassle-free ownership.",
        price: 135000,
        currency: "EUR",
        city: "Protaras",
        neighborhood: "Fig Tree Bay",
        address: "Fig Tree Bay, Protaras",
        latitude: 35.0115,
        longitude: 34.0549,
        propertyType: "Studio",
        bedrooms: 1,
        bathrooms: 1,
        areaSqm: 42,
        floor: 2,
        parking: false,
        balcony: true,
        sellerName: "Famagusta Properties",
        sellerEmail: "sales@famagusta-prop.cy",
        sellerPhone: "+357-23-456789",
        status: PropertyStatus.ACTIVE,
        published: true,
        featured: false,
        metaTitle: "Studio Apartment near Fig Tree Bay, Protaras",
        metaDescription: "Affordable studio apartment near the best beach in Protaras.",
      },
      {
        title: "Troodos Mountain Retreat",
        slug: "troodos-mountain-retreat",
        shortDescription: "Charming stone house in the Troodos mountains",
        description: "A beautifully restored traditional stone house in the picturesque village of Platres, nestled in the Troodos mountains. This three-bedroom retreat offers genuine character with exposed stone walls, wooden ceiling beams, and a large fireplace. The property includes a landscaped garden with fruit trees, outdoor dining terrace with mountain views, and a separate workshop. Perfect for nature lovers seeking tranquility and cooler mountain climate.",
        price: 295000,
        currency: "EUR",
        city: "Platres",
        neighborhood: "Troodos",
        address: "Platres Village, Troodos",
        latitude: 34.8885,
        longitude: 32.8651,
        propertyType: "House",
        bedrooms: 3,
        bathrooms: 2,
        areaSqm: 155,
        floor: 0,
        parking: true,
        balcony: false,
        sellerName: "Mountain Homes Cyprus",
        sellerEmail: "info@mountainhomes.cy",
        sellerPhone: "+357-25-333444",
        status: PropertyStatus.ACTIVE,
        published: true,
        featured: false,
        metaTitle: "Troodos Mountain Retreat - Stone House in Platres",
        metaDescription: "Charming restored stone house in the Troodos mountains.",
      },
      {
        title: "Larnaca Marina Loft",
        slug: "larnaca-marina-loft",
        shortDescription: "Industrial-chic loft apartment near Larnaca Marina",
        description: "A unique loft-style apartment near the upcoming Larnaca Marina development. This two-bedroom property features soaring 4-meter ceilings, exposed brick walls, polished concrete floors, and a mezzanine study area. The open-plan kitchen and living space is flooded with light from oversized industrial windows. Located in the regeneration zone, this is an excellent investment opportunity with significant capital appreciation potential.",
        price: 340000,
        currency: "EUR",
        city: "Larnaca",
        neighborhood: "Marina District",
        address: "Marina District, Larnaca",
        latitude: 34.9148,
        longitude: 33.6357,
        propertyType: "Apartment",
        bedrooms: 2,
        bathrooms: 1,
        areaSqm: 105,
        floor: 1,
        parking: true,
        balcony: true,
        sellerName: "Marina Estates",
        sellerEmail: "marina@estates.cy",
        sellerPhone: "+357-99-123456",
        status: PropertyStatus.ACTIVE,
        published: true,
        featured: false,
        metaTitle: "Larnaca Marina Loft - Industrial Chic Living",
        metaDescription: "Loft apartment near Larnaca Marina development.",
      },
      {
        title: "Ayia Napa Luxury Condo",
        slug: "ayia-napa-luxury-condo",
        shortDescription: "High-end beachside condo with resort amenities",
        description: "An exquisite two-bedroom condo in a boutique beachside development in Ayia Napa. This property comes fully furnished with designer interiors, featuring a gourmet kitchen, spa-inspired bathroom, and a spacious balcony with direct sea views. Residents enjoy resort-style amenities including a heated infinity pool, spa, gym, rooftop bar, and 24/7 concierge. Just a short walk from Nissi Beach.",
        price: 520000,
        currency: "EUR",
        city: "Ayia Napa",
        neighborhood: "Nissi Beach",
        address: "Nissi Avenue, Ayia Napa",
        latitude: 34.9879,
        longitude: 33.9575,
        propertyType: "Apartment",
        bedrooms: 2,
        bathrooms: 2,
        areaSqm: 95,
        floor: 4,
        parking: true,
        balcony: true,
        sellerName: "Napa Elite Properties",
        sellerEmail: "info@napaelite.cy",
        sellerPhone: "+357-23-888999",
        status: PropertyStatus.ACTIVE,
        published: true,
        featured: true,
        metaTitle: "Luxury Condo in Ayia Napa near Nissi Beach",
        metaDescription: "High-end beachside condo with resort amenities in Ayia Napa.",
      },
      {
        title: "Limassol Commercial Office",
        slug: "limassol-commercial-office",
        shortDescription: "Prime office space in Limassol business district",
        description: "A modern Class A office space located in the thriving business district of Limassol. This 200 sqm unit features an open floor plan with partitioned meeting rooms, raised floors for cable management, full-height glazing with sea views, and access to shared conference facilities. The building offers 24-hour security, underground parking, and is within walking distance of restaurants and hotels. Ideal for tech companies, financial services, or professional firms.",
        price: 680000,
        currency: "EUR",
        city: "Limassol",
        neighborhood: "Business District",
        address: "Business Park, Limassol",
        latitude: 34.6817,
        longitude: 33.0456,
        propertyType: "Commercial",
        bedrooms: 0,
        bathrooms: 2,
        areaSqm: 200,
        floor: 8,
        parking: true,
        balcony: false,
        sellerName: "Limassol Commercial",
        sellerEmail: "office@limassolcommercial.cy",
        sellerPhone: "+357-25-555666",
        status: PropertyStatus.ACTIVE,
        published: true,
        featured: false,
        metaTitle: "Commercial Office Space in Limassol",
        metaDescription: "Prime Class A office space in Limassol business district.",
      },
    ];

    await prisma.property.createMany({ data: propertiesData, skipDuplicates: true });
    console.log("  Properties created");
  }

  // ── Property Images ─────────────────────────────────────────
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
    "coral-bay-beach-villa": [
      { url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80", alt: "Beachfront villa with pool" },
      { url: "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&q=80", alt: "Villa living room" },
      { url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80", alt: "Kitchen and dining" },
      { url: "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800&q=80", alt: "Master suite" },
      { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", alt: "Pool and garden area" },
    ],
    "fig-tree-bay-studio": [
      { url: "https://images.unsplash.com/photo-1560448075-bb7ae3a2d4e0?w=800&q=80", alt: "Studio interior" },
      { url: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80", alt: "Kitchenette" },
      { url: "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&q=80", alt: "Bathroom" },
    ],
    "troodos-mountain-retreat": [
      { url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80", alt: "Stone house exterior" },
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", alt: "Rustic interior" },
      { url: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800&q=80", alt: "Mountain garden view" },
      { url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80", alt: "Fireplace lounge" },
    ],
    "larnaca-marina-loft": [
      { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80", alt: "Loft living area" },
      { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", alt: "Industrial kitchen" },
      { url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80", alt: "Mezzanine study" },
    ],
    "ayia-napa-luxury-condo": [
      { url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80", alt: "Beachside development" },
      { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", alt: "Designer interior" },
      { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80", alt: "Sea view balcony" },
      { url: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=80", alt: "Spa bathroom" },
    ],
    "limassol-commercial-office": [
      { url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80", alt: "Office building exterior" },
      { url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80", alt: "Open plan office" },
      { url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80", alt: "Meeting room" },
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
  console.log("  Property images created");

  // ── Link some properties to projects ────────────────────────
  const projects = await prisma.project.findMany();
  const azureMarina = projects.find(p => p.slug === "azure-marina-residences");
  if (azureMarina) {
    const larnacaLoft = await prisma.property.findUnique({ where: { slug: "larnaca-marina-loft" } });
    if (larnacaLoft && !larnacaLoft.projectId) {
      await prisma.property.update({
        where: { id: larnacaLoft.id },
        data: { projectId: azureMarina.id },
      });
    }
  }

  // ── Sample Inquiries ────────────────────────────────────────
  const inquiryCount = await prisma.inquiry.count();
  if (inquiryCount === 0) {
    const penthouse = await prisma.property.findUnique({ where: { slug: "sea-view-penthouse" } });
    const villa = await prisma.property.findUnique({ where: { slug: "coral-bay-beach-villa" } });
    const duplex = await prisma.property.findUnique({ where: { slug: "garden-duplex-residence" } });

    const inquiries = [];
    if (penthouse) {
      inquiries.push(
        { propertyId: penthouse.id, fullName: "James Wilson", email: "james@example.com", phone: "+44-7700-900123", message: "I am very interested in this penthouse. Could you arrange a viewing this weekend?", status: "new" },
        { propertyId: penthouse.id, fullName: "Elena Christou", email: "elena@example.com", phone: "+357-96-112233", message: "Is the price negotiable? I would like to discuss financing options.", status: "contacted" },
      );
    }
    if (villa) {
      inquiries.push(
        { propertyId: villa.id, fullName: "Robert Smith", email: "robert@example.com", phone: "+1-555-0199", message: "We are relocating from the US and this villa looks perfect. Can you send more photos of the pool area?", status: "new" },
        { propertyId: villa.id, fullName: "Anna Petrova", email: "anna.p@example.com", message: "Is this villa available for a December viewing? We will be in Paphos for two weeks.", status: "new" },
      );
    }
    if (duplex) {
      inquiries.push(
        { propertyId: duplex.id, fullName: "Maria Georgiou", email: "maria.g@example.com", phone: "+357-99-445566", message: "My family is interested. Are there schools and parks nearby?", status: "contacted" },
      );
    }

    if (inquiries.length > 0) {
      await prisma.inquiry.createMany({ data: inquiries });
      console.log("  Inquiries created");
    }
  }

  // ── Page Content Defaults (About / Contact / Homepage) ──────
  // Idempotent: only inserts a key if missing, never overwrites an
  // admin's saved value. Keys/values come from ALL_PAGE_DEFAULTS in
  // lib/settings.ts so the seed and the runtime fallbacks stay in sync.
  let pageSettingsCreated = 0;
  for (const [key, value] of Object.entries(ALL_PAGE_DEFAULTS)) {
    const existing = await prisma.siteSetting.findUnique({ where: { key } });
    if (!existing) {
      await prisma.siteSetting.create({ data: { key, value } });
      pageSettingsCreated++;
    }
  }
  if (pageSettingsCreated > 0) {
    console.log(`  Page content defaults created (${pageSettingsCreated} keys)`);
  }

  // ── Customers ───────────────────────────────────────────────
  const customerCount = await prisma.customer.count();
  if (customerCount === 0) {
    await prisma.customer.createMany({
      data: [
        {
          companyName: "Azure Development Group",
          description: "Premium waterfront developers specializing in marina residences",
          contactName: "Andreas Kyriakides",
          contactEmail: "andreas@azuredev.cy",
          contactPhone: "+357-25-100200",
        },
        {
          companyName: "Heritage Homes Cyprus",
          description: "Luxury villa developers in the Paphos region",
          contactName: "Sophia Constantinou",
          contactEmail: "sophia@heritagehomes.cy",
          contactPhone: "+357-26-300400",
        },
        {
          companyName: "Skyline Developments",
          description: "High-rise urban residential and commercial projects",
          contactName: "Michael Papadopoulos",
          contactEmail: "michael@skylinedev.cy",
          contactPhone: "+357-22-500600",
        },
      ],
    });
    console.log("  Customers created");
  }

  console.log("Seed complete!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
