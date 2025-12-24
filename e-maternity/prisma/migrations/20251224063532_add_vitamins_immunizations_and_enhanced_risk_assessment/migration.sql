-- CreateEnum
CREATE TYPE "VitaminType" AS ENUM ('FOLIC_ACID', 'IRON', 'CALCIUM', 'VITAMIN_D', 'MULTIVITAMIN', 'VITAMIN_B12', 'DHA_OMEGA3', 'OTHER');

-- CreateEnum
CREATE TYPE "ImmunizationType" AS ENUM ('TETANUS', 'RUBELLA', 'HEPATITIS_B', 'INFLUENZA', 'COVID19', 'OTHER');

-- AlterTable
ALTER TABLE "MotherProfile" ADD COLUMN     "abnormalBabyDetails" JSONB,
ADD COLUMN     "bmi" DOUBLE PRECISION,
ADD COLUMN     "currentWeight" DOUBLE PRECISION,
ADD COLUMN     "hadAbnormalBabies" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "prePregnancyWeight" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "VitaminRecord" (
    "id" TEXT NOT NULL,
    "motherProfileId" TEXT NOT NULL,
    "vitaminName" TEXT NOT NULL,
    "vitaminType" "VitaminType" NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "prescribedById" TEXT NOT NULL,
    "administeredDates" JSONB,
    "nextDueDate" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VitaminRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImmunizationRecord" (
    "id" TEXT NOT NULL,
    "motherProfileId" TEXT NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "immunizationType" "ImmunizationType" NOT NULL,
    "doseNumber" INTEGER NOT NULL,
    "administeredDate" TIMESTAMP(3) NOT NULL,
    "administeredById" TEXT NOT NULL,
    "nextDueDate" TIMESTAMP(3),
    "batchNumber" TEXT,
    "site" TEXT,
    "sideEffects" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImmunizationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VitaminRecord_motherProfileId_isActive_idx" ON "VitaminRecord"("motherProfileId", "isActive");

-- CreateIndex
CREATE INDEX "VitaminRecord_nextDueDate_idx" ON "VitaminRecord"("nextDueDate");

-- CreateIndex
CREATE INDEX "VitaminRecord_vitaminType_idx" ON "VitaminRecord"("vitaminType");

-- CreateIndex
CREATE INDEX "ImmunizationRecord_motherProfileId_immunizationType_idx" ON "ImmunizationRecord"("motherProfileId", "immunizationType");

-- CreateIndex
CREATE INDEX "ImmunizationRecord_nextDueDate_idx" ON "ImmunizationRecord"("nextDueDate");

-- CreateIndex
CREATE INDEX "ImmunizationRecord_administeredDate_idx" ON "ImmunizationRecord"("administeredDate");

-- AddForeignKey
ALTER TABLE "VitaminRecord" ADD CONSTRAINT "VitaminRecord_motherProfileId_fkey" FOREIGN KEY ("motherProfileId") REFERENCES "MotherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VitaminRecord" ADD CONSTRAINT "VitaminRecord_prescribedById_fkey" FOREIGN KEY ("prescribedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImmunizationRecord" ADD CONSTRAINT "ImmunizationRecord_motherProfileId_fkey" FOREIGN KEY ("motherProfileId") REFERENCES "MotherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImmunizationRecord" ADD CONSTRAINT "ImmunizationRecord_administeredById_fkey" FOREIGN KEY ("administeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
