UPDATE "properties"
SET "portfolio_entered_at" = "portfolio_transfer_completed_at"
WHERE "portfolio_entered_at" IS NULL
  AND "portfolio_transfer_completed_at" IS NOT NULL;

ALTER TABLE "properties" DROP COLUMN "portfolio_transfer_completed_at";
