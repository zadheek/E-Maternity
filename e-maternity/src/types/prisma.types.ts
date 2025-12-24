// Re-export all Prisma types and enums for consistent imports
export type {
  User,
  MotherProfile,
  DoctorProfile,
  MidwifeProfile,
  HealthMetric,
  Appointment,
  Prescription,
  EmergencyAlert,
  EmergencyContact,
  Hospital,
  MedicalDocument,
  HomeVisit,
  ProgressNote,
  Referral,
  AppointmentSlot,
} from '@prisma/client';

export {
  UserRole,
  Language,
  RiskLevel,
  BloodType,
  AppointmentStatus,
  AppointmentType,
} from '@prisma/client';

// Define enum types that might not be in Prisma client
export enum MetricType {
  WEIGHT = 'WEIGHT',
  BLOOD_PRESSURE_SYSTOLIC = 'BLOOD_PRESSURE_SYSTOLIC',
  BLOOD_PRESSURE_DIASTOLIC = 'BLOOD_PRESSURE_DIASTOLIC',
  BLOOD_GLUCOSE = 'BLOOD_GLUCOSE',
  HEMOGLOBIN = 'HEMOGLOBIN',
  FETAL_HEART_RATE = 'FETAL_HEART_RATE',
  FUNDAL_HEIGHT = 'FUNDAL_HEIGHT',
}

export enum EmergencyType {
  SEVERE_BLEEDING = 'SEVERE_BLEEDING',
  SEVERE_ABDOMINAL_PAIN = 'SEVERE_ABDOMINAL_PAIN',
  HIGH_BLOOD_PRESSURE = 'HIGH_BLOOD_PRESSURE',
  PREMATURE_LABOR = 'PREMATURE_LABOR',
  REDUCED_FETAL_MOVEMENT = 'REDUCED_FETAL_MOVEMENT',
  OTHER = 'OTHER',
}

export enum EmergencyStatus {
  ACTIVE = 'ACTIVE',
  RESPONDED = 'RESPONDED',
  RESOLVED = 'RESOLVED',
}
