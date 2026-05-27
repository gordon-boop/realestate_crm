-- Add coordinate columns to properties for map widget.
-- Both columns are nullable, since legacy rows have no coordinates yet.
-- Backfill is handled separately via scripts/backfill-coordinates.ts.

ALTER TABLE "properties"
  ADD COLUMN "latitude"  DECIMAL(9, 6),
  ADD COLUMN "longitude" DECIMAL(9, 6),
  ADD COLUMN "geocoding_source" TEXT;

-- Index for bounding-box queries (Postgres uses btree on (lat, lng) lookups well enough for our scale).
CREATE INDEX "properties_latitude_longitude_idx" ON "properties" ("latitude", "longitude");
