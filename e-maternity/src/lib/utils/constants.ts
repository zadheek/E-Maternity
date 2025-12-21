// lib/utils/constants.ts
export const APP_NAME = 'E-Maternity';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Smart Maternal Health Management System';

export const COLORS = {
  primary: '#2196F3',
  secondary: '#00BCD4',
  accent: '#0288D1',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  background: '#FAFAFA',
  textPrimary: '#212121',
  textSecondary: '#757575',
};

export const DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
];

export const BLOOD_TYPES = [
  'A_POSITIVE',
  'A_NEGATIVE',
  'B_POSITIVE',
  'B_NEGATIVE',
  'O_POSITIVE',
  'O_NEGATIVE',
  'AB_POSITIVE',
  'AB_NEGATIVE',
];

export const METRIC_UNITS = {
  WEIGHT: 'kg',
  BLOOD_PRESSURE_SYSTOLIC: 'mmHg',
  BLOOD_PRESSURE_DIASTOLIC: 'mmHg',
  BLOOD_GLUCOSE: 'mg/dL',
  HEMOGLOBIN: 'g/dL',
  FETAL_HEART_RATE: 'bpm',
  FUNDAL_HEIGHT: 'cm',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf'],
};

export const APPOINTMENT_DURATION = {
  ROUTINE_CHECKUP: 30,
  ULTRASOUND: 45,
  BLOOD_TEST: 15,
  CONSULTATION: 60,
  EMERGENCY: 120,
};

export const PREGNANCY_WEEKS = {
  MIN: 1,
  MAX: 42,
  TERM: 37,
};

export const HEALTH_METRIC_RANGES = {
  WEIGHT: { min: 40, max: 150 },
  BLOOD_PRESSURE_SYSTOLIC: { min: 90, max: 180, normal: { min: 90, max: 120 } },
  BLOOD_PRESSURE_DIASTOLIC: { min: 60, max: 120, normal: { min: 60, max: 80 } },
  BLOOD_GLUCOSE: { min: 70, max: 300, normal: { min: 70, max: 140 } },
  HEMOGLOBIN: { min: 7, max: 20, normal: { min: 11, max: 16 } },
  FETAL_HEART_RATE: { min: 110, max: 180, normal: { min: 120, max: 160 } },
  FUNDAL_HEIGHT: { min: 10, max: 45 },
};

