/**
 * Test seed — runs against the TEST DATABASE only.
 * Wipes everything and re-seeds a known fixture set every E2E run.
 *
 * Anything in tests/ may import this. Production seed lives at prisma/seed.ts.
 */

import { PrismaClient, PropertyStatus, ProjectStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const db = new PrismaClient();

export const TEST_FIXTURES = {
  superAdmin: { email: "super@test.local", password: "SuperTest123!" },
  customerManager: { email: "manager@test.local", password: "ManagerTest123!" },
  customerA: { name: "Customer Alpha" },
  customerB: { name: "Customer Beta" },
};

async function wipe() {
  // FK-cascade order: child tables first
  await db.emailLog.deleteMany();
  await db.appointment.deleteMany();
  await db.inquiryNote.deleteMany();
  await db.inquiry.deleteMany();
  await db.projectUnit.deleteMany();
  await db.projectDocument.deleteMany();
  await db.projectImage.deleteMany();
  await db.propertyImage.deleteMany();
  await db.property.deleteMany();
  await db.project.deleteMany();
  await db.imageBank.deleteMany();
  await db.heroImage.deleteMany();
  await db.apiClient.deleteMany();
  await db.adminUser.deleteMany();
  await db.customer.deleteMany();
  await db.siteSetting.deleteMany();
}

export async function seedTestFixtures() {
  await wipe();

  // Customers
  const custA = await db.customer.create({
    data: { companyName: TEST_FIXTURES.customerA.name, contactEmail: "a@test.local" },
  });
  const custB = await db.customer.create({
    data: { companyName: TEST_FIXTURES.customerB.name, contactEmail: "b@test.local" },
  });

  // Admins
  const superHash = await bcrypt.hash(TEST_FIXTURES.superAdmin.password, 10);
  await db.adminUser.create({
    data: {
      email: TEST_FIXTURES.superAdmin.email,
      name: "Super Admin",
      passwordHash: superHash,
      isSuperAdmin: true,
      allowedPages: [],
    },
  });

  const managerHash = await bcrypt.hash(TEST_FIXTURES.customerManager.password, 10);
  await db.adminUser.create({
    data: {
      email: TEST_FIXTURES.customerManager.email,
      name: "Customer Alpha Manager",
      passwordHash: managerHash,
      isSuperAdmin: false,
      customerId: custA.id,
      allowedPages: ["dashboard", "properties", "projects", "inquiries"],
    },
  });

  // Project for customer A
  const projectA = await db.project.create({
    data: {
      title: "Azure Test Towers",
      slug: "azure-test-towers",
      description: "Integration-test project for Customer Alpha.",
      city: "Limassol",
      address: "Limassol Marina",
      latitude: 34.6724,
      longitude: 33.0434,
      developerName: "Azure Dev",
      totalUnits: 4,
      status: ProjectStatus.ACTIVE,
      published: true,
      featured: true,
      apiEnabled: true,
      customerId: custA.id,
      images: {
        create: [
          { url: "/uploads-test/seed-project-1.jpg", altText: "Seed project image 1", sortOrder: 0, isPrimary: true },
          { url: "/uploads-test/seed-project-2.jpg", altText: "Seed project image 2", sortOrder: 1, isPrimary: false },
        ],
      },
      documents: {
        create: [
          { url: "/uploads-test/seed-project-floorplan.pdf", fileName: "floorplan.pdf", fileType: "application/pdf", sortOrder: 0 },
        ],
      },
      units: {
        create: [
          { building: "1", entrance: "A", floor: 1, unitNumber: "101" },
          { building: "1", entrance: "A", floor: 1, unitNumber: "102" },
        ],
      },
    },
  });

  // Properties
  const propActive = await db.property.create({
    data: {
      title: "Active Marina Apartment",
      slug: "active-marina-apt",
      description: "Active published listing for E2E.",
      price: 450000,
      currency: "EUR",
      city: "Limassol",
      address: "Marina Walk 12",
      latitude: 34.6725,
      longitude: 33.0435,
      propertyType: "apartment",
      bedrooms: 2,
      bathrooms: 2,
      areaSqm: 95,
      sellerName: "Seed Seller",
      sellerEmail: "seller@test.local",
      sellerPhone: "+357 99 000 000",
      status: PropertyStatus.ACTIVE,
      published: true,
      featured: true,
      apiEnabled: true,
      projectId: projectA.id,
      customerId: custA.id,
      images: {
        create: [
          { url: "/uploads-test/seed-prop-1.jpg", altText: "prop1", sortOrder: 0, isPrimary: true },
        ],
      },
    },
  });

  await db.property.create({
    data: {
      title: "Draft Listing",
      slug: "draft-listing",
      description: "Draft property — should not appear publicly.",
      price: 300000,
      currency: "EUR",
      city: "Paphos",
      address: "Test Rd 1",
      latitude: 34.7,
      longitude: 32.4,
      propertyType: "house",
      bedrooms: 3,
      bathrooms: 2,
      sellerName: "Seed Seller",
      sellerEmail: "seller@test.local",
      sellerPhone: "+357 99 000 001",
      status: PropertyStatus.DRAFT,
      published: false,
      customerId: custB.id,
    },
  });

  await db.property.create({
    data: {
      title: "Sold Listing",
      slug: "sold-listing",
      description: "Sold property.",
      price: 800000,
      currency: "EUR",
      city: "Limassol",
      address: "Sold St 5",
      latitude: 34.68,
      longitude: 33.05,
      propertyType: "villa",
      sellerName: "Seed Seller",
      sellerEmail: "seller@test.local",
      sellerPhone: "+357 99 000 002",
      status: PropertyStatus.SOLD,
      sold: true,
      published: true,
      customerId: custA.id,
    },
  });

  // Inquiries
  await db.inquiry.create({
    data: {
      propertyId: propActive.id,
      projectId: projectA.id,
      fullName: "Test Lead 1",
      email: "lead1@test.local",
      phone: "+357 99 111 111",
      message: "Interested in the marina apartment.",
      status: "new",
      notes: { create: [{ content: "Initial seed note", createdBy: "seed" }] },
      appointments: { create: [{ dateTime: new Date(Date.now() + 7 * 86400000), summary: "Viewing", status: "scheduled" }] },
    },
  });
  await db.inquiry.create({
    data: {
      propertyId: propActive.id,
      fullName: "Test Lead 2",
      email: "lead2@test.local",
      message: "Quick question.",
      status: "in-progress",
    },
  });

  // API clients
  const apiTokenAll = `at_${crypto.randomBytes(16).toString("hex")}`;
  await db.apiClient.create({
    data: {
      name: "Test API — all data",
      tokenHash: await bcrypt.hash(apiTokenAll, 10),
      tokenPrefix: apiTokenAll.slice(0, 8),
      scopeType: "all",
      allowedPropertyFields: ["title", "slug", "price", "city"],
      allowedProjectFields: ["title", "slug", "city"],
      includeImages: true,
      includeDocuments: false,
    },
  });

  const apiTokenCustomer = `at_${crypto.randomBytes(16).toString("hex")}`;
  await db.apiClient.create({
    data: {
      name: "Test API — customer A only",
      tokenHash: await bcrypt.hash(apiTokenCustomer, 10),
      tokenPrefix: apiTokenCustomer.slice(0, 8),
      scopeType: "customer",
      customerId: custA.id,
      allowedPropertyFields: ["title", "slug", "price"],
      allowedProjectFields: ["title", "slug"],
      includeImages: false,
      includeDocuments: false,
    },
  });

  // Hero images + site settings
  await db.heroImage.create({
    data: { url: "/uploads-test/seed-hero-1.jpg", altText: "Seed hero", active: true, sortOrder: 0 },
  });

  await db.siteSetting.createMany({
    data: [
      { key: "about_title", value: "About Us — Test" },
      { key: "about_text1", value: "Seed about content paragraph 1" },
      { key: "contact_title", value: "Contact — Test" },
      { key: "contact_email", value: "office@test.local" },
    ],
  });

  return { custA, custB, projectA, propActive, apiTokenAll, apiTokenCustomer };
}

if (require.main === module) {
  seedTestFixtures()
    .then((out) => {
      console.log("Test fixtures seeded.", { propActive: out.propActive.id, projectA: out.projectA.id });
      return db.$disconnect();
    })
    .catch(async (err) => {
      console.error(err);
      await db.$disconnect();
      process.exit(1);
    });
}
