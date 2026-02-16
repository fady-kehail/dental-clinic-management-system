-- AlterTable: Add notes to Appointment
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- AlterTable: Add experience, imageUrl, bio to Dentist
ALTER TABLE "Dentist" ADD COLUMN IF NOT EXISTS "experience" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Dentist" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "Dentist" ADD COLUMN IF NOT EXISTS "bio" TEXT;

-- AlterTable: Change Schedule from date/isBooked to dayOfWeek/startTime/endTime
ALTER TABLE "Schedule" ADD COLUMN IF NOT EXISTS "dayOfWeek" TEXT NOT NULL DEFAULT 'Monday';
ALTER TABLE "Schedule" ADD COLUMN IF NOT EXISTS "startTime" TEXT NOT NULL DEFAULT '09:00';
ALTER TABLE "Schedule" ADD COLUMN IF NOT EXISTS "endTime" TEXT NOT NULL DEFAULT '17:00';
ALTER TABLE "Schedule" DROP COLUMN IF EXISTS "date";
ALTER TABLE "Schedule" DROP COLUMN IF EXISTS "isBooked";
