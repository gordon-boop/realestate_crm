CREATE TYPE "MoistureDamageStatus" AS ENUM ('NONE', 'MINOR', 'SIGNIFICANT');
CREATE TYPE "AccessibilityAssessment" AS ENUM ('LOW_BARRIER', 'PARTIALLY_RESTRICTED', 'STRONGLY_RESTRICTED');

ALTER TABLE "properties"
  ADD COLUMN "known_major_maintenance_or_special_assessments" BOOLEAN,
  ADD COLUMN "known_major_maintenance_or_special_assessments_description" TEXT,
  ADD COLUMN "moisture_damage_status" "MoistureDamageStatus",
  ADD COLUMN "moisture_damage_description" TEXT,
  ADD COLUMN "accessibility_assessment" "AccessibilityAssessment",
  ADD COLUMN "has_elevator" BOOLEAN;
