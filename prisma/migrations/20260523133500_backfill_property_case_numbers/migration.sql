WITH existing_case_numbers AS (
  SELECT COALESCE(MAX((regexp_match("case_number", '^WK-2026-([0-9]+)$'))[1]::integer), 0) AS max_number
  FROM "properties"
  WHERE "case_number" ~ '^WK-2026-[0-9]+$'
),
missing_case_numbers AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "created_at", "id") AS row_number
  FROM "properties"
  WHERE "case_number" IS NULL OR "case_number" = ''
)
UPDATE "properties" AS property
SET "case_number" = 'WK-2026-' || LPAD((existing_case_numbers.max_number + missing_case_numbers.row_number)::text, 3, '0')
FROM existing_case_numbers, missing_case_numbers
WHERE property."id" = missing_case_numbers."id";
