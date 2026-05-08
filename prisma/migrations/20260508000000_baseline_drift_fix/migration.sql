-- Baseline drift fix: these columns existed in schema.prisma but no
-- migration ever created them. Dev DBs likely have them already (added via
-- `prisma db push` or by hand). Production DBs do not.
--
-- IF NOT EXISTS makes this safe to apply against either state.

-- AlterTable
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "environmentExrUrl" TEXT;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "coolingType" TEXT;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "elevator" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "fireplace" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "heatingType" TEXT;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "sold" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "swimmingPool" BOOLEAN NOT NULL DEFAULT false;
