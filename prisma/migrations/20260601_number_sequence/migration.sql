CREATE TABLE "number_sequences" (
  "key" TEXT NOT NULL,
  "value" INTEGER NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "number_sequences_pkey" PRIMARY KEY ("key")
);

WITH parsed_case_numbers AS (
  SELECT
    matches[1] AS year,
    matches[2]::INTEGER AS sequence_value
  FROM (
    SELECT regexp_match("case_number", '^WK-([0-9]{4})-([0-9]+)$') AS matches
    FROM "properties"
    WHERE "case_number" IS NOT NULL
  ) parsed
  WHERE matches IS NOT NULL
),
case_sequences AS (
  SELECT
    'case:' || year AS key,
    MAX(sequence_value) AS value
  FROM parsed_case_numbers
  GROUP BY year
)
INSERT INTO "number_sequences" ("key", "value")
SELECT key, value
FROM case_sequences
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value";

WITH parsed_offer_numbers AS (
  SELECT
    matches[1] AS year,
    matches[2]::INTEGER AS sequence_value
  FROM (
    SELECT regexp_match("offer_number", '^ANG-([0-9]{4})-([0-9]+)$') AS matches
    FROM "offers"
    WHERE "offer_number" IS NOT NULL
  ) parsed
  WHERE matches IS NOT NULL
),
offer_sequences AS (
  SELECT
    'offer:' || year AS key,
    MAX(sequence_value) AS value
  FROM parsed_offer_numbers
  GROUP BY year
)
INSERT INTO "number_sequences" ("key", "value")
SELECT key, value
FROM offer_sequences
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value";
