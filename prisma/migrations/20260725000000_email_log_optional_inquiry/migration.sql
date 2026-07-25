-- AlterTable: EmailLog.inquiryId becomes optional so non-inquiry-triggered
-- emails (e.g. the contact form) can be logged without a required FK.
ALTER TABLE "EmailLog" ALTER COLUMN "inquiryId" DROP NOT NULL;
