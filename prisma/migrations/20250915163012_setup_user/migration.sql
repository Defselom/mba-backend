/*
  Warnings:

  - You are about to drop the column `uploadDate` on the `supports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."supports" DROP COLUMN "uploadDate",
ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
