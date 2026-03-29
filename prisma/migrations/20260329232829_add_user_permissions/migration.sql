-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "allowedPages" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;
