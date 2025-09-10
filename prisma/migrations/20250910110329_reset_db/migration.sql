/*
  Warnings:

  - You are about to drop the column `birthDay` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profilImage` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `username` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `password` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `firstName` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lastName` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - Added the required column `role` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'SPEAKER', 'MODERATOR', 'COLLABORATOR', 'PARTICIPANT', 'PARTNER');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VALIDATION');

-- CreateEnum
CREATE TYPE "public"."WebinarStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "public"."ApplicationType" AS ENUM ('SPEAKER', 'MODERATOR', 'COLLABORATOR', 'PARTNER', 'PARTICIPANT');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('LAW', 'DECREE', 'UNIFORM_ACT', 'CONVENTION', 'COURT_DECISION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."PersonalizedSupportType" AS ENUM ('LEGAL', 'SCIENTIFIC', 'ENTREPRENEURIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."SupportType" AS ENUM ('PRESENTATION', 'REFERENCE_DOCUMENT', 'VIDEO', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."RegistrationStatus" AS ENUM ('CONFIRMED', 'CANCELED');

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "birthDay",
DROP COLUMN "phoneNumber",
DROP COLUMN "profilImage",
ADD COLUMN     "birthDate" DATE,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLogin" TIMESTAMPTZ(6),
ADD COLUMN     "phone" VARCHAR(20),
ADD COLUMN     "profileImage" VARCHAR(255),
ADD COLUMN     "role" "public"."UserRole" NOT NULL,
ADD COLUMN     "status" "public"."UserStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "email" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "username" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "firstName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "lastName" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(6);

-- CreateTable
CREATE TABLE "public"."admin_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminRights" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."speaker_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "academicLevel" TEXT,
    "currentPosition" TEXT,
    "motivation" TEXT,
    "legalDomains" TEXT,
    "professionalPhoto" TEXT,
    "biography" TEXT,
    "scheduleConstraints" TEXT,
    "animationExperience" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speaker_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."moderator_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentJob" TEXT,
    "academicLevel" TEXT,
    "moderationExperience" TEXT,
    "coordinationAvailability" TEXT,
    "professionalPhoto" TEXT,
    "biography" TEXT,
    "comfortDomains" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."collaborator_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "academicLevel" TEXT,
    "currentStatus" TEXT,
    "collaborationType" TEXT,
    "motivations" TEXT,
    "otherCommitments" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collaborator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."participant_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "academicLevel" TEXT,
    "discoveryChannel" TEXT,
    "participationMotivation" TEXT,
    "otherPlatforms" TEXT,
    "wishedLegalThemes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."partner_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "structureName" TEXT,
    "occupiedPosition" TEXT,
    "partnershipType" TEXT,
    "providedExpertise" TEXT,
    "collaborationExperience" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webinars" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "legalTopic" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "status" "public"."WebinarStatus" NOT NULL,
    "accessLink" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "animatedById" TEXT,
    "moderatedById" TEXT,

    CONSTRAINT "webinars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "public"."DocumentType" NOT NULL,
    "file" TEXT NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "legalDomain" TEXT NOT NULL,
    "description" TEXT,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."testimonials" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."ModerationStatus" NOT NULL,
    "rating" INTEGER,
    "userId" TEXT NOT NULL,
    "webinarId" TEXT,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."applications" (
    "id" TEXT NOT NULL,
    "type" "public"."ApplicationType" NOT NULL,
    "status" "public"."ApplicationStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formData" TEXT,
    "adminComment" TEXT,
    "userId" TEXT NOT NULL,
    "partnerId" TEXT,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."personalized_supports" (
    "id" TEXT NOT NULL,
    "type" "public"."PersonalizedSupportType" NOT NULL,
    "legalDomains" TEXT,
    "frequency" TEXT,
    "scheduleConstraints" TEXT,
    "communicationStyle" TEXT,
    "status" "public"."ModerationStatus" NOT NULL,
    "estimatedCost" DOUBLE PRECISION,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "personalized_supports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."registrations" (
    "id" TEXT NOT NULL,
    "registrationDate" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."RegistrationStatus" NOT NULL,
    "userId" TEXT NOT NULL,
    "webinarId" TEXT NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."supports" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "type" "public"."SupportType" NOT NULL,
    "uploadDate" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "webinarId" TEXT,
    "uploadedById" TEXT,

    CONSTRAINT "supports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_CollaboratorWebinars" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CollaboratorWebinars_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_UserDownloads" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserDownloads_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_userId_key" ON "public"."admin_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "speaker_profiles_userId_key" ON "public"."speaker_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "moderator_profiles_userId_key" ON "public"."moderator_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "collaborator_profiles_userId_key" ON "public"."collaborator_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "participant_profiles_userId_key" ON "public"."participant_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "partner_profiles_userId_key" ON "public"."partner_profiles"("userId");

-- CreateIndex
CREATE INDEX "_CollaboratorWebinars_B_index" ON "public"."_CollaboratorWebinars"("B");

-- CreateIndex
CREATE INDEX "_UserDownloads_B_index" ON "public"."_UserDownloads"("B");

-- AddForeignKey
ALTER TABLE "public"."admin_profiles" ADD CONSTRAINT "admin_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."speaker_profiles" ADD CONSTRAINT "speaker_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."moderator_profiles" ADD CONSTRAINT "moderator_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collaborator_profiles" ADD CONSTRAINT "collaborator_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participant_profiles" ADD CONSTRAINT "participant_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."partner_profiles" ADD CONSTRAINT "partner_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webinars" ADD CONSTRAINT "webinars_animatedById_fkey" FOREIGN KEY ("animatedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."webinars" ADD CONSTRAINT "webinars_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."testimonials" ADD CONSTRAINT "testimonials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."testimonials" ADD CONSTRAINT "testimonials_webinarId_fkey" FOREIGN KEY ("webinarId") REFERENCES "public"."webinars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."applications" ADD CONSTRAINT "applications_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."personalized_supports" ADD CONSTRAINT "personalized_supports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registrations" ADD CONSTRAINT "registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registrations" ADD CONSTRAINT "registrations_webinarId_fkey" FOREIGN KEY ("webinarId") REFERENCES "public"."webinars"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supports" ADD CONSTRAINT "supports_webinarId_fkey" FOREIGN KEY ("webinarId") REFERENCES "public"."webinars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."supports" ADD CONSTRAINT "supports_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CollaboratorWebinars" ADD CONSTRAINT "_CollaboratorWebinars_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CollaboratorWebinars" ADD CONSTRAINT "_CollaboratorWebinars_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."webinars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserDownloads" ADD CONSTRAINT "_UserDownloads_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_UserDownloads" ADD CONSTRAINT "_UserDownloads_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
