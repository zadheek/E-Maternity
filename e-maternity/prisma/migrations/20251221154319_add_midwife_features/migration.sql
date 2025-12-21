-- CreateTable
CREATE TABLE "HomeVisit" (
    "id" TEXT NOT NULL,
    "motherProfileId" TEXT NOT NULL,
    "midwifeProfileId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "visitType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "observations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressNote" (
    "id" TEXT NOT NULL,
    "motherProfileId" TEXT NOT NULL,
    "midwifeProfileId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "motherProfileId" TEXT NOT NULL,
    "midwifeProfileId" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HomeVisit_motherProfileId_visitDate_idx" ON "HomeVisit"("motherProfileId", "visitDate");

-- CreateIndex
CREATE INDEX "HomeVisit_midwifeProfileId_visitDate_idx" ON "HomeVisit"("midwifeProfileId", "visitDate");

-- CreateIndex
CREATE INDEX "ProgressNote_motherProfileId_createdAt_idx" ON "ProgressNote"("motherProfileId", "createdAt");

-- CreateIndex
CREATE INDEX "Referral_motherProfileId_status_idx" ON "Referral"("motherProfileId", "status");

-- CreateIndex
CREATE INDEX "Referral_doctorProfileId_status_idx" ON "Referral"("doctorProfileId", "status");

-- CreateIndex
CREATE INDEX "Referral_midwifeProfileId_createdAt_idx" ON "Referral"("midwifeProfileId", "createdAt");

-- AddForeignKey
ALTER TABLE "HomeVisit" ADD CONSTRAINT "HomeVisit_motherProfileId_fkey" FOREIGN KEY ("motherProfileId") REFERENCES "MotherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeVisit" ADD CONSTRAINT "HomeVisit_midwifeProfileId_fkey" FOREIGN KEY ("midwifeProfileId") REFERENCES "MidwifeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressNote" ADD CONSTRAINT "ProgressNote_motherProfileId_fkey" FOREIGN KEY ("motherProfileId") REFERENCES "MotherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressNote" ADD CONSTRAINT "ProgressNote_midwifeProfileId_fkey" FOREIGN KEY ("midwifeProfileId") REFERENCES "MidwifeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_motherProfileId_fkey" FOREIGN KEY ("motherProfileId") REFERENCES "MotherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_midwifeProfileId_fkey" FOREIGN KEY ("midwifeProfileId") REFERENCES "MidwifeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
