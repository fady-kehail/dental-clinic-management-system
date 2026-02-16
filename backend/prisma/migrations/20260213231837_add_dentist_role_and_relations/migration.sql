-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'DENTIST';

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_dentistId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "dentistUserId" TEXT,
ALTER COLUMN "dentistId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "specialty" TEXT;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_dentistId_fkey" FOREIGN KEY ("dentistId") REFERENCES "Dentist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_dentistUserId_fkey" FOREIGN KEY ("dentistUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
