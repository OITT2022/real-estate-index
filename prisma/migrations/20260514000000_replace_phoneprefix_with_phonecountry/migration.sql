-- Replace phonePrefix (digits) with phoneCountry (ISO-3166 alpha-2). The
-- ISO code lets the UI show a flag and disambiguates dial codes shared
-- across countries (e.g. +1 covers US, CA, and Caribbean nations).
ALTER TABLE "AdminUser" DROP COLUMN "phonePrefix";
ALTER TABLE "AdminUser" ADD COLUMN "phoneCountry" TEXT;
