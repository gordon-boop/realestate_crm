-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'partner');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('house', 'single_family', 'semi_detached', 'row_house', 'apartment', 'multi_family', 'other');

-- CreateEnum
CREATE TYPE "PropertyCondition" AS ENUM ('very_good', 'good', 'average', 'renovation_needed');

-- CreateEnum
CREATE TYPE "DesiredModel" AS ENUM ('fixed_residential_right', 'sale_and_leaseback', 'other');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'DATA_INCOMPLETE', 'VALUATION_PENDING', 'VALUATED', 'OFFER_CALCULATED', 'OFFER_DRAFTED', 'INTERNAL_REVIEW', 'APPROVED', 'SENT', 'APPOINTMENT_SCHEDULED', 'REJECTED', 'WON', 'SOLD', 'LOST');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('photos', 'land_register', 'floorplan', 'section', 'living_area_calculation', 'energy_certificate', 'declaration_of_division', 'service_charge_statement', 'owners_meeting_minutes', 'maintenance_reserve', 'power_of_attorney', 'repair_offer', 'other');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('pending', 'ok', 'missing', 'review_required', 'rejected');

-- CreateEnum
CREATE TYPE "DocumentRequirementLevel" AS ENUM ('required', 'optional', 'recommended');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'diverse', 'not_specified');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('single', 'married', 'divorced', 'widowed', 'other');

-- CreateEnum
CREATE TYPE "IncomeRange" AS ENUM ('under_1000', 'from_1000_to_2000', 'from_2000_to_3000', 'over_3000');

-- CreateEnum
CREATE TYPE "ResidentialRightRecipients" AS ENUM ('one_person', 'both');

-- CreateEnum
CREATE TYPE "RatingSix" AS ENUM ('very_bad', 'bad', 'moderate', 'medium', 'good', 'very_good');

-- CreateEnum
CREATE TYPE "ModernizationScope" AS ENUM ('none', 'partial', 'complete');

-- CreateEnum
CREATE TYPE "BasementType" AS ENUM ('none', 'partial', 'full');

-- CreateEnum
CREATE TYPE "ParkingType" AS ENUM ('garage', 'carport', 'outdoor_space', 'duplex');

-- CreateEnum
CREATE TYPE "ValuationProvider" AS ENUM ('mock', 'pricehubble', 'sprengnetter', 'other');

-- CreateEnum
CREATE TYPE "ValuationStatus" AS ENUM ('not_started', 'pending', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "OfferKind" AS ENUM ('indicative', 'binding');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('draft', 'review', 'approved', 'sent', 'rejected');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('open', 'done', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "ActivitySource" AS ENUM ('system', 'user', 'partner', 'admin');

-- CreateEnum
CREATE TYPE "ActivityEntityType" AS ENUM ('property', 'customer', 'document', 'valuation', 'offer', 'reminder');

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "status" "PartnerStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "display_name" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "age_at_submission" INTEGER,
    "gender" "Gender",
    "email" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "marital_status" "MaritalStatus",
    "monthly_income_range" "IncomeRange",
    "street" TEXT,
    "postal_code" TEXT,
    "city" TEXT,
    "address_text" TEXT,
    "consent_data_processing" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "case_number" TEXT,
    "object_title" TEXT,
    "customer_id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "property_type" "PropertyType" NOT NULL,
    "street" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "living_area_sqm" INTEGER NOT NULL,
    "plot_area_sqm" INTEGER,
    "year_built" INTEGER,
    "condition" "PropertyCondition" NOT NULL,
    "occupancy_status" TEXT,
    "desired_model" "DesiredModel" NOT NULL,
    "preferred_valuation_provider" "ValuationProvider" NOT NULL DEFAULT 'sprengnetter',
    "residential_right_recipients" "ResidentialRightRecipients",
    "desired_residential_right_years" INTEGER,
    "second_residential_right_wanted" BOOLEAN NOT NULL DEFAULT false,
    "second_residential_right_years" INTEGER,
    "fixed_term_reason" TEXT,
    "rental_option_deselected" BOOLEAN NOT NULL DEFAULT false,
    "usable_area_sqm" INTEGER,
    "co_ownership_shares" TEXT,
    "parking_available" BOOLEAN,
    "parking_type" "ParkingType",
    "parking_count" INTEGER,
    "basement_type" "BasementType",
    "heating_type" TEXT,
    "heating_year" INTEGER,
    "energy_carriers_json" JSONB,
    "window_material" TEXT,
    "window_installation_year" INTEGER,
    "asbestos_roof_known" BOOLEAN,
    "energy_certificate_available" BOOLEAN,
    "energy_certificate_type" TEXT,
    "energy_class" TEXT,
    "visual_condition_rating" "RatingSix",
    "leasehold_or_monument" BOOLEAN NOT NULL DEFAULT false,
    "leasehold" BOOLEAN NOT NULL DEFAULT false,
    "monument_protection" BOOLEAN NOT NULL DEFAULT false,
    "known_defects" TEXT,
    "remaining_debt_amount" DECIMAL(14,2),
    "modernization_json" JSONB,
    "building_condition_json" JSONB,
    "follow_up_required" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_reason" TEXT,
    "follow_up_due_at" TIMESTAMP(3),
    "customer_feedback_received_at" TIMESTAMP(3),
    "offer_calculation_source" TEXT,
    "last_activity_label" TEXT,
    "last_activity_at" TIMESTAMP(3),
    "notes" TEXT,
    "status" "PropertyStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "customer_id" TEXT,
    "uploaded_by_user_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "display_name" TEXT,
    "file_type" TEXT NOT NULL,
    "storage_url" TEXT NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "requirement_level" "DocumentRequirementLevel" NOT NULL DEFAULT 'optional',
    "status" "DocumentStatus" NOT NULL DEFAULT 'pending',
    "missing_reason" TEXT,
    "reviewed_by_user_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valuations" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "provider" "ValuationProvider" NOT NULL DEFAULT 'mock',
    "status" "ValuationStatus" NOT NULL DEFAULT 'completed',
    "source_label" TEXT,
    "market_value" DECIMAL(14,2) NOT NULL,
    "value_min" DECIMAL(14,2) NOT NULL,
    "value_max" DECIMAL(14,2) NOT NULL,
    "confidence_score" DECIMAL(5,2) NOT NULL,
    "raw_response_json" JSONB NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "valuations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "valuation_id" TEXT NOT NULL,
    "offer_number" TEXT NOT NULL,
    "kind" "OfferKind" NOT NULL DEFAULT 'indicative',
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "market_value" DECIMAL(14,2) NOT NULL,
    "adjusted_market_value" DECIMAL(14,2) NOT NULL,
    "residential_right_value" DECIMAL(14,2) NOT NULL,
    "risk_discount" DECIMAL(14,2) NOT NULL,
    "company_margin" DECIMAL(14,2) NOT NULL,
    "payout_amount" DECIMAL(14,2) NOT NULL,
    "model" "DesiredModel" NOT NULL,
    "residential_right_years" INTEGER,
    "assumptions_json" JSONB NOT NULL,
    "ai_customer_text" TEXT,
    "ai_partner_summary" TEXT,
    "ai_internal_rationale" TEXT,
    "binding_offer_text" TEXT,
    "valid_until" TIMESTAMP(3),
    "status" "OfferStatus" NOT NULL DEFAULT 'draft',
    "approved_by_user_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_versions" (
    "id" TEXT NOT NULL,
    "offer_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot_json" JSONB NOT NULL,
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "source" "ActivitySource" NOT NULL DEFAULT 'user',
    "entity_type" "ActivityEntityType",
    "entity_id" TEXT,
    "metadata_json" JSONB,
    "previous_activity_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "assigned_to_user_id" TEXT,
    "created_by_user_id" TEXT NOT NULL,
    "completed_by_user_id" TEXT,
    "reason" TEXT NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'open',
    "due_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "last_reminder_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_versions" (
    "id" TEXT NOT NULL,
    "activity_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot_json" JSONB NOT NULL,
    "created_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_email_key" ON "partners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "customers_partner_id_idx" ON "customers"("partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "properties_case_number_key" ON "properties"("case_number");

-- CreateIndex
CREATE INDEX "properties_partner_id_idx" ON "properties"("partner_id");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "documents_property_id_idx" ON "documents"("property_id");

-- CreateIndex
CREATE INDEX "valuations_property_id_idx" ON "valuations"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "offers_offer_number_key" ON "offers"("offer_number");

-- CreateIndex
CREATE INDEX "offers_property_id_idx" ON "offers"("property_id");

-- CreateIndex
CREATE INDEX "offers_status_idx" ON "offers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "offer_versions_offer_id_version_key" ON "offer_versions"("offer_id", "version");

-- CreateIndex
CREATE INDEX "activities_property_id_idx" ON "activities"("property_id");

-- CreateIndex
CREATE INDEX "reminders_property_id_idx" ON "reminders"("property_id");

-- CreateIndex
CREATE INDEX "reminders_status_idx" ON "reminders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "activity_versions_activity_id_version_key" ON "activity_versions"("activity_id", "version");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_reviewed_by_user_id_fkey" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "valuations" ADD CONSTRAINT "valuations_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_valuation_id_fkey" FOREIGN KEY ("valuation_id") REFERENCES "valuations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_versions" ADD CONSTRAINT "offer_versions_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_completed_by_user_id_fkey" FOREIGN KEY ("completed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_versions" ADD CONSTRAINT "activity_versions_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_versions" ADD CONSTRAINT "activity_versions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
