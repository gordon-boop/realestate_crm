CREATE TYPE "PropertyOwnership" AS ENUM ('customer_1', 'customer_2', 'both');

ALTER TABLE "customers"
  ADD COLUMN "spouse_first_name" TEXT,
  ADD COLUMN "spouse_last_name" TEXT,
  ADD COLUMN "spouse_gender" "Gender",
  ADD COLUMN "spouse_date_of_birth" TIMESTAMP(3),
  ADD COLUMN "property_ownership" "PropertyOwnership";

ALTER TABLE "properties"
  ADD COLUMN "model_reason" TEXT,
  ADD COLUMN "rental_model_disclosure_accepted" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "additional_offer_requested" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "additional_offer_model" "DesiredModel",
  ADD COLUMN "additional_offer_residential_right_years" INTEGER,
  ADD COLUMN "additional_offer_reason" TEXT,
  ADD COLUMN "heating_energy_source" TEXT,
  ADD COLUMN "heating_energy_source_other" TEXT,
  ADD COLUMN "remaining_debt_known" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "general_property_notes" TEXT;
