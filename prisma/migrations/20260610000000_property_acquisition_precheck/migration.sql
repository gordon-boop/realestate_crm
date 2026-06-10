ALTER TABLE "properties"
  ADD COLUMN IF NOT EXISTS "acquisition_precheck_json" JSONB;
