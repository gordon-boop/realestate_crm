-- CreateEnum
CREATE TYPE "InternalUserRole" AS ENUM ('employee', 'admin', 'super_admin');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "internal_role" "InternalUserRole";

-- Seed existing internal users as super admins so current demo/admin access keeps working.
UPDATE "users"
SET "internal_role" = 'super_admin'
WHERE "role" = 'admin' AND "internal_role" IS NULL;
