// types/index.ts
export enum UserRole {
  MOTHER = 'MOTHER',
  MIDWIFE = 'MIDWIFE',
  DOCTOR = 'DOCTOR',
  PHI = 'PHI',
  ADMIN = 'ADMIN'
}

export enum Language {
  SINHALA = 'SINHALA',
  TAMIL = 'TAMIL',
  ENGLISH = 'ENGLISH'
}

export enum RiskLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum MetricType {
  WEIGHT = 'WEIGHT',
  BLOOD_PRESSURE_SYSTOLIC = 'BLOOD_PRESSURE_SYSTOLIC',
  BLOOD_PRESSURE_DIASTOLIC = 'BLOOD_PRESSURE_DIASTOLIC',
  BLOOD_GLUCOSE = 'BLOOD_GLUCOSE',
  HEMOGLOBIN = 'HEMOGLOBIN',
  FETAL_HEART_RATE = 'FETAL_HEART_RATE',
  FUNDAL_HEIGHT = 'FUNDAL_HEIGHT'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  MISSED = 'MISSED'
}

export enum AppointmentType {
  ROUTINE_CHECKUP = 'ROUTINE_CHECKUP',
  ULTRASOUND = 'ULTRASOUND',
  BLOOD_TEST = 'BLOOD_TEST',
  CONSULTATION = 'CONSULTATION',
  EMERGENCY = 'EMERGENCY'
}

export enum EmergencyType {
  SEVERE_BLEEDING = 'SEVERE_BLEEDING',
  SEVERE_ABDOMINAL_PAIN = 'SEVERE_ABDOMINAL_PAIN',
  HIGH_BLOOD_PRESSURE = 'HIGH_BLOOD_PRESSURE',
  PREMATURE_LABOR = 'PREMATURE_LABOR',
  REDUCED_FETAL_MOVEMENT = 'REDUCED_FETAL_MOVEMENT',
  OTHER = 'OTHER'
}

export enum EmergencyStatus {
  ACTIVE = 'ACTIVE',
  RESPONDED = 'RESPONDED',
  RESOLVED = 'RESOLVED'
}

export enum VitaminType {
  FOLIC_ACID = 'FOLIC_ACID',
  IRON = 'IRON',
  CALCIUM = 'CALCIUM',
  VITAMIN_D = 'VITAMIN_D',
  MULTIVITAMIN = 'MULTIVITAMIN',
  VITAMIN_B12 = 'VITAMIN_B12',
  DHA_OMEGA3 = 'DHA_OMEGA3',
  OTHER = 'OTHER'
}

export enum ImmunizationType {
  TETANUS = 'TETANUS',
  RUBELLA = 'RUBELLA',
  HEPATITIS_B = 'HEPATITIS_B',
  INFLUENZA = 'INFLUENZA',
  COVID19 = 'COVID19',
  OTHER = 'OTHER'
}

// Import Prisma types
import type {
  User,
  MotherProfile,
  DoctorProfile,
  MidwifeProfile,
  HealthMetric,
  Appointment,
  EmergencyAlert,
  EmergencyContact,
  Hospital,
  Prescription,
  MedicalDocument,
  VitaminRecord,
  ImmunizationRecord
} from '@prisma/client';

// Extended types with relations
export type MotherWithRelations = MotherProfile & {
  user: User;
  assignedMidwife?: MidwifeProfile & { user: User } | null;
  assignedDoctor?: DoctorProfile & { user: User } | null;
  emergencyContacts: EmergencyContact[];
};

export type AppointmentWithRelations = Appointment & {
  mother: User;
  provider: User;
};

export type EmergencyAlertWithRelations = EmergencyAlert & {
  mother: User;
};

export type PrescriptionWithRelations = Prescription & {
  mother: User;
  prescribedBy: User;
};

export type VitaminRecordWithRelations = VitaminRecord & {
  motherProfile: MotherProfile;
  prescribedBy: User;
};

export type ImmunizationRecordWithRelations = ImmunizationRecord & {
  motherProfile: MotherProfile;
  administeredBy: User;
};

// Abnormal baby record type
export interface AbnormalBabyRecord {
  id: string;
  year: number;
  condition: string;
  description: string;
  outcome: string; // 'stillbirth', 'neonatal_death', 'survived_with_condition'
}

// Risk assessment factors
export interface RiskAssessmentFactors {
  isUnderweight: boolean;
  hasChronicConditions: boolean;
  hadAbnormalBabies: boolean;
  age: number;
  previousCesareans: number;
  previousMiscarriages: number;
  bloodPressure?: { systolic: number; diastolic: number };
  hemoglobin?: number;
  bloodGlucose?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: PaginationInfo;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Re-export Prisma types
export type {
  User,
  MotherProfile,
  DoctorProfile,
  MidwifeProfile,
  HealthMetric,
  Appointment,
  EmergencyAlert,
  EmergencyContact,
  Hospital,
  Prescription,
  MedicalDocument,
  VitaminRecord,
  ImmunizationRecord
};
