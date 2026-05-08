-- CreateIndex
CREATE INDEX IF NOT EXISTS "Property_price_idx" ON "Property"("price");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Inquiry_status_createdAt_idx" ON "Inquiry"("status", "createdAt" DESC);
