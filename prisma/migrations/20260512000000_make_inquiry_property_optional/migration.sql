-- Allow project-only inquiries by making propertyId nullable on Inquiry.
-- The FK already cascades on delete; nullability is the only change.
ALTER TABLE "Inquiry" ALTER COLUMN "propertyId" DROP NOT NULL;
