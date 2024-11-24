/*
  Warnings:

  - You are about to drop the column `adminId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Message` table. All the data in the column will be lost.
  - Added the required column `messageChainId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "adminId",
DROP COLUMN "title",
DROP COLUMN "userId",
ADD COLUMN     "messageChainId" INTEGER NOT NULL,
ADD COLUMN     "recipientId" INTEGER NOT NULL,
ADD COLUMN     "senderId" INTEGER NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE "MessageChain" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "MessageChain_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_messageChainId_fkey" FOREIGN KEY ("messageChainId") REFERENCES "MessageChain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageChain" ADD CONSTRAINT "MessageChain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
