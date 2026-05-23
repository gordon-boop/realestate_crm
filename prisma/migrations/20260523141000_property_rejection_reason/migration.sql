ALTER TABLE "properties"
  ADD COLUMN IF NOT EXISTS "rejection_reason_code" TEXT,
  ADD COLUMN IF NOT EXISTS "rejection_reason_label" TEXT,
  ADD COLUMN IF NOT EXISTS "rejection_note" TEXT,
  ADD COLUMN IF NOT EXISTS "rejected_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rejected_by_user_id" TEXT;
