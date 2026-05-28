ALTER TYPE "ActivityEntityType" ADD VALUE IF NOT EXISTS 'rating';

CREATE TYPE "RatingSourceType" AS ENUM ('questionnaire', 'api', 'analyst', 'document');
CREATE TYPE "ObjectRatingStatus" AS ENUM ('draft', 'analyst_review', 'approved');

CREATE TABLE "rating_versions" (
  "id" TEXT NOT NULL,
  "version_number" INTEGER NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "created_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "rating_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rating_categories" (
  "id" TEXT NOT NULL,
  "version_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "weight" DECIMAL(8,4) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "rating_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rating_criteria" (
  "id" TEXT NOT NULL,
  "version_id" TEXT NOT NULL,
  "category_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "weight" DECIMAL(8,4) NOT NULL,
  "source_type" "RatingSourceType" NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT false,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "rating_criteria_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rating_score_definitions" (
  "id" TEXT NOT NULL,
  "version_id" TEXT NOT NULL,
  "criterion_id" TEXT NOT NULL,
  "score_value" INTEGER NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  CONSTRAINT "rating_score_definitions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rating_field_mappings" (
  "id" TEXT NOT NULL,
  "version_id" TEXT NOT NULL,
  "criterion_id" TEXT NOT NULL,
  "source_type" "RatingSourceType" NOT NULL,
  "source_field" TEXT NOT NULL,
  "mapping_rule" JSONB,
  "confidence_rule" JSONB,
  "active" BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT "rating_field_mappings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rating_return_curves" (
  "id" TEXT NOT NULL,
  "version_id" TEXT NOT NULL,
  "rating_class" TEXT NOT NULL,
  "min_score" DECIMAL(5,2) NOT NULL,
  "max_score" DECIMAL(5,2) NOT NULL,
  "base_target_return" DECIMAL(6,4) NOT NULL,
  "lower_return_bound" DECIMAL(6,4) NOT NULL,
  "upper_return_bound" DECIMAL(6,4) NOT NULL,
  CONSTRAINT "rating_return_curves_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "object_ratings" (
  "id" TEXT NOT NULL,
  "object_id" TEXT NOT NULL,
  "config_version_id" TEXT NOT NULL,
  "total_score" DECIMAL(5,2),
  "rating_class" TEXT,
  "base_target_return" DECIMAL(6,4),
  "lower_return_bound" DECIMAL(6,4),
  "upper_return_bound" DECIMAL(6,4),
  "final_target_return" DECIMAL(6,4),
  "status" "ObjectRatingStatus" NOT NULL DEFAULT 'draft',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approved_at" TIMESTAMP(3),
  "approved_by" TEXT,
  CONSTRAINT "object_ratings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "object_rating_scores" (
  "id" TEXT NOT NULL,
  "object_rating_id" TEXT NOT NULL,
  "criterion_id" TEXT NOT NULL,
  "prefilled_score" INTEGER,
  "analyst_score" INTEGER,
  "final_score" INTEGER,
  "source" "RatingSourceType",
  "confidence" DECIMAL(5,4),
  "comment" TEXT,
  "changed_by" TEXT,
  "changed_at" TIMESTAMP(3),
  CONSTRAINT "object_rating_scores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rating_audit_log" (
  "id" TEXT NOT NULL,
  "object_rating_id" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT,
  "action" TEXT NOT NULL,
  "old_value" JSONB,
  "new_value" JSONB,
  "comment" TEXT,
  "user_id" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "rating_audit_log_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "rating_versions_version_number_key" ON "rating_versions"("version_number");
CREATE INDEX "rating_categories_version_id_idx" ON "rating_categories"("version_id");
CREATE INDEX "rating_criteria_version_id_idx" ON "rating_criteria"("version_id");
CREATE INDEX "rating_criteria_category_id_idx" ON "rating_criteria"("category_id");
CREATE UNIQUE INDEX "rating_score_definitions_criterion_id_score_value_key" ON "rating_score_definitions"("criterion_id", "score_value");
CREATE INDEX "rating_score_definitions_version_id_idx" ON "rating_score_definitions"("version_id");
CREATE INDEX "rating_field_mappings_version_id_idx" ON "rating_field_mappings"("version_id");
CREATE INDEX "rating_field_mappings_criterion_id_idx" ON "rating_field_mappings"("criterion_id");
CREATE INDEX "rating_return_curves_version_id_idx" ON "rating_return_curves"("version_id");
CREATE INDEX "object_ratings_object_id_idx" ON "object_ratings"("object_id");
CREATE INDEX "object_ratings_config_version_id_idx" ON "object_ratings"("config_version_id");
CREATE UNIQUE INDEX "object_rating_scores_object_rating_id_criterion_id_key" ON "object_rating_scores"("object_rating_id", "criterion_id");
CREATE INDEX "object_rating_scores_criterion_id_idx" ON "object_rating_scores"("criterion_id");
CREATE INDEX "rating_audit_log_object_rating_id_idx" ON "rating_audit_log"("object_rating_id");
CREATE INDEX "rating_audit_log_user_id_idx" ON "rating_audit_log"("user_id");

ALTER TABLE "rating_versions" ADD CONSTRAINT "rating_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rating_categories" ADD CONSTRAINT "rating_categories_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "rating_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rating_criteria" ADD CONSTRAINT "rating_criteria_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "rating_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rating_criteria" ADD CONSTRAINT "rating_criteria_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "rating_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rating_score_definitions" ADD CONSTRAINT "rating_score_definitions_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "rating_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rating_score_definitions" ADD CONSTRAINT "rating_score_definitions_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "rating_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rating_field_mappings" ADD CONSTRAINT "rating_field_mappings_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "rating_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rating_field_mappings" ADD CONSTRAINT "rating_field_mappings_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "rating_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rating_return_curves" ADD CONSTRAINT "rating_return_curves_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "rating_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "object_ratings" ADD CONSTRAINT "object_ratings_object_id_fkey" FOREIGN KEY ("object_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "object_ratings" ADD CONSTRAINT "object_ratings_config_version_id_fkey" FOREIGN KEY ("config_version_id") REFERENCES "rating_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "object_ratings" ADD CONSTRAINT "object_ratings_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "object_rating_scores" ADD CONSTRAINT "object_rating_scores_object_rating_id_fkey" FOREIGN KEY ("object_rating_id") REFERENCES "object_ratings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "object_rating_scores" ADD CONSTRAINT "object_rating_scores_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "rating_criteria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "object_rating_scores" ADD CONSTRAINT "object_rating_scores_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "rating_audit_log" ADD CONSTRAINT "rating_audit_log_object_rating_id_fkey" FOREIGN KEY ("object_rating_id") REFERENCES "object_ratings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rating_audit_log" ADD CONSTRAINT "rating_audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
