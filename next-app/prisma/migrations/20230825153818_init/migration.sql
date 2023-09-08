/*
  Warnings:

  - You are about to drop the column `accessCodeId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AccessCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_accessCodeId_fkey";

-- DropIndex
DROP INDEX "User_accessCodeId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accessCodeId";

-- DropTable
DROP TABLE "AccessCode";

-- CreateTable
CREATE TABLE "AllowedSignInEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "AllowedSignInEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllowedSignInEmail_email_key" ON "AllowedSignInEmail"("email");
