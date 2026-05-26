CREATE TYPE "CaseSource" AS ENUM ('PARTNER', 'INTERNAL');

ALTER TABLE "properties"
ADD COLUMN "case_source" "CaseSource" NOT NULL DEFAULT 'PARTNER';

UPDATE "properties"
SET "case_source" = 'INTERNAL'
WHERE "partner_id" IS NULL;

CREATE INDEX "properties_case_source_idx" ON "properties"("case_source");
