-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MOTHER', 'MIDWIFE', 'DOCTOR', 'PHI', 'ADMIN');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('SINHALA', 'TAMIL', 'ENGLISH');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('WEIGHT', 'BLOOD_PRESSURE_SYSTOLIC', 'BLOOD_PRESSURE_DIASTOLIC', 'BLOOD_GLUCOSE', 'HEMOGLOBIN', 'FETAL_HEART_RATE', 'FUNDAL_HEIGHT');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'MISSED');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('ROUTINE_CHECKUP', 'ULTRASOUND', 'BLOOD_TEST', 'CONSULTATION', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "EmergencyType" AS ENUM ('SEVERE_BLEEDING', 'SEVERE_ABDOMINAL_PAIN', 'HIGH_BLOOD_PRESSURE', 'PREMATURE_LABOR', 'REDUCED_FETAL_MOVEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "EmergencyStatus" AS ENUM ('ACTIVE', 'RESPONDED', 'RESOLVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'ENGLISH',
    "profileImage" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MotherProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "nic" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "expectedDeliveryDate" TIMESTAMP(3) NOT NULL,
    "pregnancyWeek" INTEGER NOT NULL,
    "bloodType" "BloodType" NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "previousPregnancies" INTEGER NOT NULL DEFAULT 0,
    "previousCesareans" INTEGER NOT NULL DEFAULT 0,
    "previousMiscarriages" INTEGER NOT NULL DEFAULT 0,
    "chronicConditions" TEXT[],
    "allergies" TEXT[],
    "currentMedications" TEXT[],
    "familyHistory" TEXT[],
    "assignedMidwifeId" TEXT,
    "assignedDoctorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MotherProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL,
    "motherProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "hospital" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "consultationFee" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MidwifeProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "assignedRegion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MidwifeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PHIProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "assignedDistrict" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PHIProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentSlot" (
    "id" TEXT NOT NULL,
    "doctorProfileId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "maxBookings" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppointmentSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthMetric" (
    "id" TEXT NOT NULL,
    "motherId" TEXT NOT NULL,
    "type" "MetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "motherId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "type" "AppointmentType" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "hospitalId" TEXT,
    "clinicId" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "motherId" TEXT NOT NULL,
    "prescribedById" TEXT NOT NULL,
    "medications" JSONB NOT NULL,
    "instructions" TEXT NOT NULL,
    "prescribedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyAlert" (
    "id" TEXT NOT NULL,
    "motherId" TEXT NOT NULL,
    "type" "EmergencyType" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "EmergencyStatus" NOT NULL DEFAULT 'ACTIVE',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "responders" TEXT[],
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "emergencyNumber" TEXT NOT NULL,
    "hasMaternityWard" BOOLEAN NOT NULL DEFAULT false,
    "availableBeds" INTEGER NOT NULL DEFAULT 0,
    "facilities" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalDocument" (
    "id" TEXT NOT NULL,
    "motherId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "description" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "MotherProfile_userId_key" ON "MotherProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MotherProfile_nic_key" ON "MotherProfile"("nic");

-- CreateIndex
CREATE INDEX "MotherProfile_nic_idx" ON "MotherProfile"("nic");

-- CreateIndex
CREATE INDEX "MotherProfile_district_idx" ON "MotherProfile"("district");

-- CreateIndex
CREATE INDEX "MotherProfile_riskLevel_idx" ON "MotherProfile"("riskLevel");

-- CreateIndex
CREATE INDEX "MotherProfile_assignedMidwifeId_idx" ON "MotherProfile"("assignedMidwifeId");

-- CreateIndex
CREATE INDEX "MotherProfile_assignedDoctorId_idx" ON "MotherProfile"("assignedDoctorId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "DoctorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_licenseNumber_key" ON "DoctorProfile"("licenseNumber");

-- CreateIndex
CREATE INDEX "DoctorProfile_licenseNumber_idx" ON "DoctorProfile"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MidwifeProfile_userId_key" ON "MidwifeProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MidwifeProfile_licenseNumber_key" ON "MidwifeProfile"("licenseNumber");

-- CreateIndex
CREATE INDEX "MidwifeProfile_licenseNumber_idx" ON "MidwifeProfile"("licenseNumber");

-- CreateIndex
CREATE INDEX "MidwifeProfile_assignedRegion_idx" ON "MidwifeProfile"("assignedRegion");

-- CreateIndex
CREATE UNIQUE INDEX "PHIProfile_userId_key" ON "PHIProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PHIProfile_employeeId_key" ON "PHIProfile"("employeeId");

-- CreateIndex
CREATE INDEX "PHIProfile_employeeId_idx" ON "PHIProfile"("employeeId");

-- CreateIndex
CREATE INDEX "PHIProfile_assignedDistrict_idx" ON "PHIProfile"("assignedDistrict");

-- CreateIndex
CREATE INDEX "HealthMetric_motherId_type_recordedAt_idx" ON "HealthMetric"("motherId", "type", "recordedAt");

-- CreateIndex
CREATE INDEX "HealthMetric_recordedAt_idx" ON "HealthMetric"("recordedAt");

-- CreateIndex
CREATE INDEX "Appointment_motherId_scheduledDate_idx" ON "Appointment"("motherId", "scheduledDate");

-- CreateIndex
CREATE INDEX "Appointment_providerId_scheduledDate_idx" ON "Appointment"("providerId", "scheduledDate");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Prescription_motherId_prescribedDate_idx" ON "Prescription"("motherId", "prescribedDate");

-- CreateIndex
CREATE INDEX "EmergencyAlert_motherId_status_idx" ON "EmergencyAlert"("motherId", "status");

-- CreateIndex
CREATE INDEX "EmergencyAlert_createdAt_idx" ON "EmergencyAlert"("createdAt");

-- CreateIndex
CREATE INDEX "Hospital_district_idx" ON "Hospital"("district");

-- CreateIndex
CREATE INDEX "Hospital_latitude_longitude_idx" ON "Hospital"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "MedicalDocument_motherId_documentType_idx" ON "MedicalDocument"("motherId", "documentType");

-- AddForeignKey
ALTER TABLE "MotherProfile" ADD CONSTRAINT "MotherProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotherProfile" ADD CONSTRAINT "MotherProfile_assignedMidwifeId_fkey" FOREIGN KEY ("assignedMidwifeId") REFERENCES "MidwifeProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MotherProfile" ADD CONSTRAINT "MotherProfile_assignedDoctorId_fkey" FOREIGN KEY ("assignedDoctorId") REFERENCES "DoctorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_motherProfileId_fkey" FOREIGN KEY ("motherProfileId") REFERENCES "MotherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MidwifeProfile" ADD CONSTRAINT "MidwifeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PHIProfile" ADD CONSTRAINT "PHIProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentSlot" ADD CONSTRAINT "AppointmentSlot_doctorProfileId_fkey" FOREIGN KEY ("doctorProfileId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthMetric" ADD CONSTRAINT "HealthMetric_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_prescribedById_fkey" FOREIGN KEY ("prescribedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyAlert" ADD CONSTRAINT "EmergencyAlert_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
