-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "apiEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "apiEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ApiClient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tokenHash" TEXT NOT NULL,
    "tokenPrefix" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "allowedPropertyFields" JSONB NOT NULL,
    "allowedProjectFields" JSONB NOT NULL,
    "includeImages" BOOLEAN NOT NULL DEFAULT false,
    "includeDocuments" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiClient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiClient_tokenHash_key" ON "ApiClient"("tokenHash");

-- CreateIndex
CREATE INDEX "Project_apiEnabled_published_status_idx" ON "Project"("apiEnabled", "published", "status");

-- CreateIndex
CREATE INDEX "Property_apiEnabled_published_status_idx" ON "Property"("apiEnabled", "published", "status");
