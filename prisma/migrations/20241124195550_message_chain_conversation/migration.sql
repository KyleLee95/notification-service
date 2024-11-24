/*
  Warnings:

  - You are about to drop the column `messageChainId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `MessageChain` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `conversationId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_messageChainId_fkey";

-- DropForeignKey
ALTER TABLE "MessageChain" DROP CONSTRAINT "MessageChain_userId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "messageChainId",
ADD COLUMN     "conversationId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "MessageChain";

-- CreateTable
CREATE TABLE "Conversation" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
