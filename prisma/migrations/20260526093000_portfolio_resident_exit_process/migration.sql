DO $$ BEGIN
  CREATE TYPE "UsageModel" AS ENUM (
    'fixed_residential_right',
    'lifelong_residential_right',
    'usufruct',
    'sale_and_leaseback',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ExitTerminationReason" AS ENUM (
    'move_out',
    'resident_death',
    'fixed_term_expired',
    'waiver_agreement',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ExitSalesStatus" AS ENUM (
    'under_review',
    'access_pending',
    'inspection_scheduled',
    'clearance_pending',
    'repairs_pending',
    'sales_preparation',
    'marketing',
    'sold',
    'completed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "properties"
  ADD COLUMN IF NOT EXISTS "notary_appointment_requested_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "purchase_contract_draft_received_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "purchase_contract_draft_reviewed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "priority_notice_registered_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "purchase_price_due_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "purchase_price_paid_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "residential_right_registered_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "benefits_and_burdens_transfer_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "building_insurance_clarified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "property_manager_informed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "service_charge_info_requested" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "property_tax_info_available" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "property_file_complete" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "portfolio_transfer_completed_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "resident_stays_in_property" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "resident_name" TEXT,
  ADD COLUMN IF NOT EXISTS "usage_model" "UsageModel",
  ADD COLUMN IF NOT EXISTS "usage_right_starts_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "usage_right_ends_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "monthly_usage_fee" DECIMAL(14,2),
  ADD COLUMN IF NOT EXISTS "resident_contact_name" TEXT,
  ADD COLUMN IF NOT EXISTS "resident_emergency_contact" TEXT,
  ADD COLUMN IF NOT EXISTS "property_manager_name" TEXT,
  ADD COLUMN IF NOT EXISTS "building_insurance" TEXT,
  ADD COLUMN IF NOT EXISTS "service_charge_status" TEXT,
  ADD COLUMN IF NOT EXISTS "repair_reporting_channel_clarified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "condition_documentation_available" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "next_portfolio_review_at" TIMESTAMP(3);

UPDATE "properties"
SET
  "portfolio_transfer_completed_at" = COALESCE("portfolio_transfer_completed_at", "portfolio_entered_at"),
  "usage_right_starts_at" = COALESCE("usage_right_starts_at", "residential_right_start_at", "rent_start_at"),
  "usage_right_ends_at" = COALESCE("usage_right_ends_at", "residential_right_end_at"),
  "monthly_usage_fee" = COALESCE("monthly_usage_fee", "monthly_rent"),
  "purchase_price_paid_at" = COALESCE("purchase_price_paid_at", "payout_paid_at"),
  "benefits_and_burdens_transfer_at" = COALESCE("benefits_and_burdens_transfer_at", "ownership_transfer_at");

CREATE TABLE IF NOT EXISTS "property_exit_processes" (
  "id" TEXT NOT NULL,
  "property_id" TEXT NOT NULL,
  "usage_right_ended_at" TIMESTAMP(3),
  "termination_reason" "ExitTerminationReason",
  "termination_proof_available" BOOLEAN NOT NULL DEFAULT false,
  "relatives_or_estate_contact" TEXT,
  "relatives_contacted_at" TIMESTAMP(3),
  "property_access_clarified" BOOLEAN NOT NULL DEFAULT false,
  "key_handover_planned_at" TIMESTAMP(3),
  "keys_received_at" TIMESTAMP(3),
  "inspection_planned_at" TIMESTAMP(3),
  "inspection_completed_at" TIMESTAMP(3),
  "post_move_out_condition_report_available" BOOLEAN NOT NULL DEFAULT false,
  "clearance_required" BOOLEAN NOT NULL DEFAULT false,
  "clearance_ordered_at" TIMESTAMP(3),
  "clearance_completed_at" TIMESTAMP(3),
  "safety_inspection_completed" BOOLEAN NOT NULL DEFAULT false,
  "insurance_coverage_checked" BOOLEAN NOT NULL DEFAULT false,
  "repair_need_captured" BOOLEAN NOT NULL DEFAULT false,
  "sales_preparation_started_at" TIMESTAMP(3),
  "broker_mandated_at" TIMESTAMP(3),
  "marketing_started_at" TIMESTAMP(3),
  "sale_price_indication" DECIMAL(14,2),
  "sale_price_final" DECIMAL(14,2),
  "sales_status" "ExitSalesStatus" NOT NULL DEFAULT 'under_review',
  "sale_notarized_at" TIMESTAMP(3),
  "sale_price_received_at" TIMESTAMP(3),
  "exit_completed_at" TIMESTAMP(3),
  "internal_note" TEXT,
  "responsible_user_id" TEXT,
  "follow_up_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "property_exit_processes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "property_exit_processes_property_id_key" ON "property_exit_processes"("property_id");
CREATE INDEX IF NOT EXISTS "property_exit_processes_sales_status_idx" ON "property_exit_processes"("sales_status");
CREATE INDEX IF NOT EXISTS "property_exit_processes_responsible_user_id_idx" ON "property_exit_processes"("responsible_user_id");

DO $$ BEGIN
  ALTER TABLE "property_exit_processes" ADD CONSTRAINT "property_exit_processes_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "property_exit_processes" ADD CONSTRAINT "property_exit_processes_responsible_user_id_fkey" FOREIGN KEY ("responsible_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
