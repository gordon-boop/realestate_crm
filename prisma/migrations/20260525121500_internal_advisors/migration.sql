ALTER TYPE "InternalUserRole" ADD VALUE IF NOT EXISTS 'advisor';
ALTER TYPE "LeadSource" ADD VALUE IF NOT EXISTS 'internal';

ALTER TABLE "customers" ALTER COLUMN "partner_id" DROP NOT NULL;
ALTER TABLE "properties" ALTER COLUMN "partner_id" DROP NOT NULL;

ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "assigned_advisor_user_id" TEXT;
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "assigned_advisor_user_id" TEXT;
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "assigned_advisor_user_id" TEXT;

CREATE INDEX IF NOT EXISTS "customers_assigned_advisor_user_id_idx" ON "customers"("assigned_advisor_user_id");
CREATE INDEX IF NOT EXISTS "properties_assigned_advisor_user_id_idx" ON "properties"("assigned_advisor_user_id");
CREATE INDEX IF NOT EXISTS "leads_assigned_advisor_user_id_idx" ON "leads"("assigned_advisor_user_id");

ALTER TABLE "customers"
  ADD CONSTRAINT "customers_assigned_advisor_user_id_fkey"
  FOREIGN KEY ("assigned_advisor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "properties"
  ADD CONSTRAINT "properties_assigned_advisor_user_id_fkey"
  FOREIGN KEY ("assigned_advisor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "leads"
  ADD CONSTRAINT "leads_assigned_advisor_user_id_fkey"
  FOREIGN KEY ("assigned_advisor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
