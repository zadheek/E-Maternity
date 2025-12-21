-- AlterTable
ALTER TABLE "MotherProfile" ADD COLUMN     "pregnancyStartDate" TIMESTAMP(3),
ADD COLUMN     "previousSurgeries" TEXT[] DEFAULT ARRAY[]::TEXT[];
