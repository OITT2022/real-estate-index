-- AlterTable: convert floor from text to integer (safe conversion)
-- Existing text values like "3rd", "Ground" become NULL; numeric values are preserved
ALTER TABLE "Property" ADD COLUMN "floor_new" INTEGER;
UPDATE "Property" SET "floor_new" = CASE
  WHEN "floor" ~ '^-?\d+$' THEN "floor"::INTEGER
  ELSE NULL
END;
ALTER TABLE "Property" DROP COLUMN "floor";
ALTER TABLE "Property" RENAME COLUMN "floor_new" TO "floor";

-- AddColumn: unitNumber
ALTER TABLE "Property" ADD COLUMN "unitNumber" TEXT;
