CREATE TABLE IF NOT EXISTS "chat_attachments" (
  "id" TEXT NOT NULL,
  "chat_message_id" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "file_type" TEXT NOT NULL,
  "storage_url" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "chat_attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "chat_message_reads" (
  "id" TEXT NOT NULL,
  "chat_message_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "chat_message_reads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "case_notifications" (
  "id" TEXT NOT NULL,
  "property_id" TEXT NOT NULL,
  "actor_user_id" TEXT,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "process_step" TEXT,
  "source" "ActivitySource" NOT NULL DEFAULT 'system',
  "visibility" "ChatMessageVisibility" NOT NULL DEFAULT 'shared',
  "entity_type" "ActivityEntityType",
  "entity_id" TEXT,
  "email_queued_at" TIMESTAMP(3),
  "email_stub_message_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "case_notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "case_notification_reads" (
  "id" TEXT NOT NULL,
  "notification_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "case_notification_reads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "chat_message_reads_chat_message_id_user_id_key" ON "chat_message_reads"("chat_message_id", "user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "case_notification_reads_notification_id_user_id_key" ON "case_notification_reads"("notification_id", "user_id");
CREATE INDEX IF NOT EXISTS "chat_attachments_chat_message_id_idx" ON "chat_attachments"("chat_message_id");
CREATE INDEX IF NOT EXISTS "chat_message_reads_user_id_idx" ON "chat_message_reads"("user_id");
CREATE INDEX IF NOT EXISTS "case_notifications_property_id_idx" ON "case_notifications"("property_id");
CREATE INDEX IF NOT EXISTS "case_notifications_created_at_idx" ON "case_notifications"("created_at");
CREATE INDEX IF NOT EXISTS "case_notification_reads_user_id_idx" ON "case_notification_reads"("user_id");

ALTER TABLE "chat_attachments" ADD CONSTRAINT "chat_attachments_chat_message_id_fkey" FOREIGN KEY ("chat_message_id") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_message_reads" ADD CONSTRAINT "chat_message_reads_chat_message_id_fkey" FOREIGN KEY ("chat_message_id") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_message_reads" ADD CONSTRAINT "chat_message_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "case_notifications" ADD CONSTRAINT "case_notifications_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "case_notifications" ADD CONSTRAINT "case_notifications_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "case_notification_reads" ADD CONSTRAINT "case_notification_reads_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "case_notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "case_notification_reads" ADD CONSTRAINT "case_notification_reads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
