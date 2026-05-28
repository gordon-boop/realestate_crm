ALTER TABLE "rating_criteria"
  ADD COLUMN "weight_overrides" JSONB;

ALTER TABLE "rating_return_curves"
  ADD COLUMN "return_rule" JSONB;
