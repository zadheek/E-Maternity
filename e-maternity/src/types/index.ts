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

// Import Prisma types
import type {
  User,
  MotherProfile,
  DoctorProfile,
  MidwifeProfile,
  PHIProfile,
  HealthMetric,
  Appointment,
  EmergencyAlert,
  EmergencyContact,
  Hospital,
  Prescription,
  MedicalDocument
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
  PHIProfile,
  HealthMetric,
  Appointment,
  EmergencyAlert,
  EmergencyContact,
  Hospital,
  Prescription,
  MedicalDocument
};
