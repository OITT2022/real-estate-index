-- DropIndex: remove unique constraint on propertyId to allow one property linked to multiple units
DROP INDEX IF EXISTS "ProjectUnit_propertyId_key";
