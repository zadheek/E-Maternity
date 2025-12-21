-- CreateTable
CREATE TABLE "FetalGrowthRecord" (
    "id" TEXT NOT NULL,
    "motherProfileId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "length" DOUBLE PRECISION NOT NULL,
    "headCircumference" DOUBLE PRECISION NOT NULL,
    "abdominalCircumference" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "recordedBy" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FetalGrowthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UltrasoundRecord" (
    "id" TEXT NOT NULL,
    "motherProfileId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "findings" TEXT NOT NULL,
    "imageUrl" TEXT,
    "performedBy" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UltrasoundRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FetalGrowthRecord_motherProfileId_week_idx" ON "FetalGrowthRecord"("motherProfileId", "week");

-- CreateIndex
CREATE INDEX "UltrasoundRecord_motherProfileId_week_idx" ON "UltrasoundRecord"("motherProfileId", "week");

-- AddForeignKey
ALTER TABLE "FetalGrowthRecord" ADD CONSTRAINT "FetalGrowthRecord_motherProfileId_fkey" FOREIGN KEY ("motherProfileId") REFERENCES "MotherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UltrasoundRecord" ADD CONSTRAINT "UltrasoundRecord_motherProfileId_fkey" FOREIGN KEY ("motherProfileId") REFERENCES "MotherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
