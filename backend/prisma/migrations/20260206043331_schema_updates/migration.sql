-- AlterTable
ALTER TABLE "Dentist" ALTER COLUMN "imageUrl" SET DEFAULT 'https://picsum.photos/seed/doc/200';

-- AlterTable
ALTER TABLE "Schedule" ALTER COLUMN "dayOfWeek" DROP DEFAULT,
ALTER COLUMN "startTime" DROP DEFAULT,
ALTER COLUMN "endTime" DROP DEFAULT;
