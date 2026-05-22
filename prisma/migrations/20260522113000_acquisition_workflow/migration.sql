-- AlterEnum
ALTER TYPE "PropertyStatus" ADD VALUE IF NOT EXISTS 'OFFER_ACCEPTED';
ALTER TYPE "PropertyStatus" ADD VALUE IF NOT EXISTS 'PURCHASE_STARTED';
ALTER TYPE "PropertyStatus" ADD VALUE IF NOT EXISTS 'NOTARY_APPOINTMENT';
ALTER TYPE "PropertyStatus" ADD VALUE IF NOT EXISTS 'PURCHASED';
ALTER TYPE "PropertyStatus" ADD VALUE IF NOT EXISTS 'IN_PORTFOLIO';

-- AlterTable
ALTER TABLE "properties" ADD COLUMN "offer_accepted_at" TIMESTAMP(3);
ALTER TABLE "properties" ADD COLUMN "purchase_started_at" TIMESTAMP(3);
ALTER TABLE "properties" ADD COLUMN "notary_appointment_at" TIMESTAMP(3);
ALTER TABLE "properties" ADD COLUMN "purchased_at" TIMESTAMP(3);
ALTER TABLE "properties" ADD COLUMN "portfolio_entered_at" TIMESTAMP(3);
