-- Per-unit sold flag. The same property can be linked to several units
-- across floors; ProjectUnit.sold lets each slot mark itself sold
-- independently of the listing-level Property.sold.
ALTER TABLE "ProjectUnit" ADD COLUMN IF NOT EXISTS "sold" BOOLEAN NOT NULL DEFAULT false;
