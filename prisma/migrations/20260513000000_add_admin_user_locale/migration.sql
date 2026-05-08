-- Internationalize the user profile: add country, timezone, and a separate
-- phone calling-code prefix on AdminUser. All nullable; existing rows are
-- left untouched and treated as "national number, prefix unknown" until the
-- user re-saves their profile.
ALTER TABLE "AdminUser"
  ADD COLUMN "phonePrefix" TEXT,
  ADD COLUMN "country"     TEXT,
  ADD COLUMN "timezone"    TEXT;
