-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('TWENTY_FOUR_HOURS', 'TWO_HOURS');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "EmailReminder" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "reminderType" "ReminderType" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailReminder_scheduledAt_status_idx" ON "EmailReminder"("scheduledAt", "status");

-- AddForeignKey
ALTER TABLE "EmailReminder" ADD CONSTRAINT "EmailReminder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
