ALTER TABLE "customers"
  ADD COLUMN IF NOT EXISTS "house_number" TEXT;

ALTER TABLE "leads"
  ADD COLUMN IF NOT EXISTS "house_number" TEXT;
