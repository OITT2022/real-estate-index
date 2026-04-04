-- AlterTable
ALTER TABLE "ApiClient" ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "scopeType" TEXT NOT NULL DEFAULT 'all';

-- CreateIndex
CREATE INDEX "ApiClient_customerId_idx" ON "ApiClient"("customerId");

-- AddForeignKey
ALTER TABLE "ApiClient" ADD CONSTRAINT "ApiClient_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
