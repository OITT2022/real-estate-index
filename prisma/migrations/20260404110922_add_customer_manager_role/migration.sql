-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "customerId" TEXT;

-- CreateIndex
CREATE INDEX "AdminUser_customerId_idx" ON "AdminUser"("customerId");

-- AddForeignKey
ALTER TABLE "AdminUser" ADD CONSTRAINT "AdminUser_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
