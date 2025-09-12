/*
  Warnings:

  - A unique constraint covering the columns `[webinarId,userId]` on the table `registrations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "registrations_webinarId_userId_key" ON "public"."registrations"("webinarId", "userId");
