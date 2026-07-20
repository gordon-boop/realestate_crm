ALTER TABLE "properties"
ADD COLUMN "intake_draft_json" JSONB,
ADD COLUMN "draft_intake_step" INTEGER NOT NULL DEFAULT 1;
