CREATE TYPE "DocumentScanStatus" AS ENUM ('pending', 'clean', 'suspicious', 'failed');

ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "scan_status" "DocumentScanStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "scan_note" TEXT;
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "scanned_at" TIMESTAMP(3);
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "current_version" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS "documents_status_idx" ON "documents"("status");
CREATE INDEX IF NOT EXISTS "documents_scan_status_idx" ON "documents"("scan_status");

CREATE TABLE IF NOT EXISTS "document_versions" (
  "id" TEXT NOT NULL,
  "document_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "snapshot_json" JSONB NOT NULL,
  "created_by_user_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "document_versions_document_id_version_key" ON "document_versions"("document_id", "version");

ALTER TABLE "document_versions"
  ADD CONSTRAINT "document_versions_document_id_fkey"
  FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
