-- Generic translation cache for DB-backed content and UI strings.
-- One row per (entityType, entityId, field, locale).
CREATE TABLE "Translation" (
  "id"         TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId"   TEXT NOT NULL,
  "field"      TEXT NOT NULL,
  "locale"     TEXT NOT NULL,
  "value"      TEXT NOT NULL,
  "source"     TEXT NOT NULL DEFAULT 'auto',
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Translation_entityType_entityId_field_locale_key"
  ON "Translation"("entityType", "entityId", "field", "locale");

CREATE INDEX "Translation_entityType_entityId_locale_idx"
  ON "Translation"("entityType", "entityId", "locale");

CREATE INDEX "Translation_locale_idx" ON "Translation"("locale");
