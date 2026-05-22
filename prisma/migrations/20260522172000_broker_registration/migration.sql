CREATE TYPE "BrokerRegistrationStatus" AS ENUM ('email_pending', 'pending_approval', 'approved', 'rejected');

CREATE TABLE "broker_registrations" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "password_hash" TEXT NOT NULL,
    "status" "BrokerRegistrationStatus" NOT NULL DEFAULT 'email_pending',
    "email_confirmation_token" TEXT NOT NULL,
    "email_confirmed_at" TIMESTAMP(3),
    "partner_id" TEXT,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broker_registrations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "broker_registrations_email_key" ON "broker_registrations"("email");
CREATE UNIQUE INDEX "broker_registrations_email_confirmation_token_key" ON "broker_registrations"("email_confirmation_token");
CREATE INDEX "broker_registrations_status_idx" ON "broker_registrations"("status");
