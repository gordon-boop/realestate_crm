CREATE TYPE "ResidentStatus" AS ENUM ('ACTIVE', 'MOVE_OUT_PLANNED', 'MOVED_OUT', 'DECEASED');

ALTER TABLE "properties"
  ADD COLUMN "resident_status" "ResidentStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "resident_move_out_date" TIMESTAMP(3),
  ADD COLUMN "resident_death_date" TIMESTAMP(3),
  ADD COLUMN "resident_status_changed_at" TIMESTAMP(3),
  ADD COLUMN "resident_status_changed_by_user_id" TEXT,
  ADD COLUMN "resident_status_note" TEXT;
