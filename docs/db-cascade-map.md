# Database Cascade Map

This document describes what happens to related rows and uploaded blobs when
each top-level entity is deleted. It is the source of truth that the E2E suite
asserts in `tests/e2e/cascade.spec.ts`.

## Quick reference

| Deleting…       | DB rows cascade-deleted                                              | Set NULL (rows survive)                          | Storage blobs cleaned   |
|-----------------|----------------------------------------------------------------------|--------------------------------------------------|-------------------------|
| **Property**    | `PropertyImage`, `Inquiry` (+ `InquiryNote`, `Appointment`, `EmailLog`) | `ProjectUnit.propertyId`                       | YES (Phase A1)          |
| **Project**     | `ProjectImage`, `ProjectDocument`, `ProjectUnit`                     | `Property.projectId`, `Inquiry.projectId`        | YES (Phase A2)          |
| **Inquiry**     | `InquiryNote`, `Appointment`, `EmailLog`                             | —                                                | n/a                     |
| **Customer**    | —                                                                    | `AdminUser.customerId`, `Property.customerId`, `Project.customerId`, `ApiClient.customerId` | logoUrl deleted        |
| **AdminUser**   | —                                                                    | —                                                | n/a (super admin blocked from deletion) |
| **PropertyImage / ProjectImage / ProjectDocument** (explicit removal) | — | — | YES (per-action call to `deleteImage`) |

## Why these rules

- **Property → cascade Inquiry:** an inquiry only makes sense in the context of the property it was made about. Orphaned inquiries are useless.
- **Project → SetNull on Property/Inquiry:** the property is the durable asset. Removing a project (a marketing-level grouping) should not delete the underlying listings. Inquiries lose project context but still belong to a property.
- **Customer → SetNull on everything:** customer rows are administrative groupings. Wiping a customer should not silently delete listings/users; an admin can reassign or hard-delete those manually.
- **Admin user delete:** super admins are blocked from deletion to prevent lockout. Other users have no dependents.

## Storage blob policy

Image and document blobs live in the storage backend (`STORAGE_PROVIDER=local`
writes to `public/uploads`; `=s3` writes to S3). Prisma cascade does not know
about these blobs, so without explicit cleanup they orphan.

- `lib/actions.ts deleteProperty` reads `PropertyImage.url` rows up front and
  calls `deleteImage(url)` for each before the DB delete.
- `lib/actions.ts deleteProject` does the same for `ProjectImage`,
  `ProjectDocument`, and the `Project.environmentExrUrl` field.
- A storage failure is logged but does not abort the DB delete — the row
  removal must always succeed.

## Soft-delete state

There is no `deletedAt` column. Soft-archival uses the status enums
(`PropertyStatus.ARCHIVED`, `ProjectStatus.ARCHIVED`). Public queries filter on
`published=true` and `status IN (ACTIVE, SOLD)`, so an archive is effectively
hidden without losing data.
