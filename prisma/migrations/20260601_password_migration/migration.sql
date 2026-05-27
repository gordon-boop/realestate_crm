UPDATE "users"
SET "password_hash" = 'NEEDS_RESET'
WHERE "password_hash" IS NOT NULL;

UPDATE "broker_registrations"
SET "password_hash" = 'NEEDS_RESET'
WHERE "password_hash" IS NOT NULL;
