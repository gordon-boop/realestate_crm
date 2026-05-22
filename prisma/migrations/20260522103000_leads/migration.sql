-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('homepage', 'admin', 'partner', 'other');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'QUALIFIED', 'ASSIGNED', 'CONTACTED', 'CONVERTED', 'REJECTED');

-- AlterEnum
ALTER TYPE "ActivityEntityType" ADD VALUE IF NOT EXISTS 'lead';

-- CreateTable
CREATE TABLE "leads" (
  "id" TEXT NOT NULL,
  "lead_number" TEXT NOT NULL,
  "source" "LeadSource" NOT NULL DEFAULT 'homepage',
  "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  "assigned_partner_id" TEXT,
  "assigned_by_user_id" TEXT,
  "assigned_at" TIMESTAMP(3),
  "converted_customer_id" TEXT,
  "converted_property_id" TEXT,
  "converted_at" TIMESTAMP(3),
  "first_name" TEXT,
  "last_name" TEXT,
  "name" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "postal_code" TEXT,
  "city" TEXT,
  "property_type" "PropertyType",
  "estimated_property_value_range" TEXT,
  "youngest_owner_age_range" TEXT,
  "message" TEXT,
  "product_interest" "DesiredModel",
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_lead_number_key" ON "leads"("lead_number");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_assigned_partner_id_idx" ON "leads"("assigned_partner_id");
