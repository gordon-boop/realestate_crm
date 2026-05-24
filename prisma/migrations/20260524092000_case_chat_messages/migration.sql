-- CreateEnum
CREATE TYPE "ChatMessageVisibility" AS ENUM ('shared', 'internal');

-- AlterEnum
ALTER TYPE "ActivityEntityType" ADD VALUE IF NOT EXISTS 'chat';

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" "ActivitySource" NOT NULL DEFAULT 'user',
    "visibility" "ChatMessageVisibility" NOT NULL DEFAULT 'shared',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_messages_property_id_idx" ON "chat_messages"("property_id");

-- CreateIndex
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages"("created_at");

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
