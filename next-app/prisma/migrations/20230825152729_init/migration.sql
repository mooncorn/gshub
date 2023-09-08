/*
  Warnings:

  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[accessCodeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessCodeId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accessCodeId" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "Example";

-- CreateTable
CREATE TABLE "AccessCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "AccessCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessCode_code_key" ON "AccessCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AccessCode_email_key" ON "AccessCode"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_accessCodeId_key" ON "User"("accessCodeId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accessCodeId_fkey" FOREIGN KEY ("accessCodeId") REFERENCES "AccessCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
