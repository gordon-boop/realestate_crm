ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "residential_right_person" TEXT;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "additional_offer_residential_right_recipients" "ResidentialRightRecipients";
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "additional_offer_residential_right_person" TEXT;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "additional_offer_rental_model_disclosure_accepted" BOOLEAN NOT NULL DEFAULT false;
