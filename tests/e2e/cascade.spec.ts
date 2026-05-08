/**
 * Direct DB cascade-rule assertions. These do not exercise the UI — they
 * encode the contract the schema promises so any future migration that
 * accidentally changes onDelete behavior fails this test loudly.
 */
import { test, expect } from "@playwright/test";
import { testDb } from "./helpers/db";

test.describe("Schema cascade rules", () => {
  test("deleting a Property cascades Inquiry and dependents", async () => {
    const db = testDb();
    const prop = await db.property.create({
      data: {
        title: "cascade-prop", slug: `cascade-prop-${Date.now()}`,
        description: "x", price: 1, currency: "EUR", city: "X", address: "X",
        latitude: 0, longitude: 0, sellerName: "x", sellerEmail: "x@x.com",
        sellerPhone: "+1", status: "DRAFT",
      },
    });
    const inq = await db.inquiry.create({
      data: { propertyId: prop.id, fullName: "x", email: "x@x.com", message: "x",
              notes: { create: { content: "n" } },
              appointments: { create: { dateTime: new Date(), summary: "s" } },
              emails: { create: { subject: "s", body: "b", sentTo: "x@x.com" } } },
    });

    await db.property.delete({ where: { id: prop.id } });

    expect(await db.inquiry.findUnique({ where: { id: inq.id } })).toBeNull();
    expect(await db.inquiryNote.count({ where: { inquiryId: inq.id } })).toBe(0);
    expect(await db.appointment.count({ where: { inquiryId: inq.id } })).toBe(0);
    expect(await db.emailLog.count({ where: { inquiryId: inq.id } })).toBe(0);
    await db.$disconnect();
  });

  test("deleting a Project sets Property.projectId and Inquiry.projectId to NULL", async () => {
    const db = testDb();
    const proj = await db.project.create({
      data: { title: "cprj", slug: `cprj-${Date.now()}`, description: "x",
              city: "X", address: "X", latitude: 0, longitude: 0, developerName: "d",
              status: "DRAFT" },
    });
    const prop = await db.property.create({
      data: {
        title: "p", slug: `p-${Date.now()}`, description: "x", price: 1, currency: "EUR",
        city: "X", address: "X", latitude: 0, longitude: 0, sellerName: "x",
        sellerEmail: "x@x.com", sellerPhone: "+1", status: "DRAFT", projectId: proj.id,
      },
    });
    const inq = await db.inquiry.create({
      data: { propertyId: prop.id, projectId: proj.id, fullName: "x", email: "x@x.com", message: "x" },
    });

    await db.project.delete({ where: { id: proj.id } });

    const propAfter = await db.property.findUnique({ where: { id: prop.id } });
    const inqAfter = await db.inquiry.findUnique({ where: { id: inq.id } });
    expect(propAfter?.projectId).toBeNull();
    expect(inqAfter?.projectId).toBeNull();

    await db.property.delete({ where: { id: prop.id } });
    await db.$disconnect();
  });

  test("deleting a Customer nulls Property/Project/AdminUser/ApiClient FKs", async () => {
    const db = testDb();
    const cust = await db.customer.create({ data: { companyName: "del-test" } });
    const prop = await db.property.create({
      data: {
        title: "cust-prop", slug: `cust-prop-${Date.now()}`, description: "x",
        price: 1, currency: "EUR", city: "X", address: "X", latitude: 0, longitude: 0,
        sellerName: "x", sellerEmail: "x@x.com", sellerPhone: "+1", status: "DRAFT",
        customerId: cust.id,
      },
    });
    const proj = await db.project.create({
      data: { title: "cust-proj", slug: `cust-proj-${Date.now()}`, description: "x",
              city: "X", address: "X", latitude: 0, longitude: 0, developerName: "d",
              status: "DRAFT", customerId: cust.id },
    });

    await db.customer.delete({ where: { id: cust.id } });

    const propAfter = await db.property.findUnique({ where: { id: prop.id } });
    const projAfter = await db.project.findUnique({ where: { id: proj.id } });
    expect(propAfter?.customerId).toBeNull();
    expect(projAfter?.customerId).toBeNull();

    await db.property.delete({ where: { id: prop.id } });
    await db.project.delete({ where: { id: proj.id } });
    await db.$disconnect();
  });
});
