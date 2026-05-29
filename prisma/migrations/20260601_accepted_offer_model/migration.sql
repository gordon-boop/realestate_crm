ALTER TABLE "properties"
  ADD COLUMN "indicative_accepted_offer_model" "DesiredModel",
  ADD COLUMN "indicative_accepted_offer_id" TEXT,
  ADD COLUMN "indicative_accepted_offer_model_at" TIMESTAMP(3),
  ADD COLUMN "indicative_accepted_offer_model_by_user_id" TEXT,
  ADD COLUMN "binding_accepted_offer_model" "DesiredModel",
  ADD COLUMN "binding_accepted_offer_id" TEXT,
  ADD COLUMN "binding_accepted_offer_model_at" TIMESTAMP(3),
  ADD COLUMN "binding_accepted_offer_model_by_user_id" TEXT;

UPDATE "properties"
SET
  "indicative_accepted_offer_model" = "desired_model",
  "indicative_accepted_offer_model_at" = COALESCE("offer_accepted_at", "updated_at")
WHERE "offer_accepted_at" IS NOT NULL
  AND "indicative_accepted_offer_model" IS NULL;

UPDATE "properties"
SET
  "binding_accepted_offer_model" = COALESCE("indicative_accepted_offer_model", "desired_model"),
  "binding_accepted_offer_model_at" = COALESCE("binding_offer_accepted_at", "updated_at")
WHERE "binding_offer_accepted_at" IS NOT NULL
  AND "binding_accepted_offer_model" IS NULL;
