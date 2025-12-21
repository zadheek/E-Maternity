// lib/validation/health.schema.ts
import { z } from 'zod';

export const healthMetricSchema = z.object({
  type: z.enum([
    'WEIGHT',
    'BLOOD_PRESSURE_SYSTOLIC',
    'BLOOD_PRESSURE_DIASTOLIC',
    'BLOOD_GLUCOSE',
    'HEMOGLOBIN',
    'FETAL_HEART_RATE',
    'FUNDAL_HEIGHT',
  ]),
  value: z.number().positive('Value must be positive'),
  unit: z.string(),
  notes: z.string().optional(),
  recordedAt: z.string().optional(),
});

export const appointmentSchema = z.object({
  providerId: z.string().uuid('Invalid provider ID'),
  providerType: z.enum(['doctor', 'midwife']),
  type: z.enum([
    'ROUTINE_CHECKUP',
    'ULTRASOUND',
    'BLOOD_TEST',
    'CONSULTATION',
    'EMERGENCY',
  ]),
  scheduledDate: z.string().refine((date) => {
    return new Date(date) > new Date();
  }, 'Appointment date must be in the future'),
  duration: z.number().min(15).max(180),
  hospitalId: z.string().uuid().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const emergencyAlertSchema = z.object({
  type: z.enum([
    'SEVERE_BLEEDING',
    'SEVERE_ABDOMINAL_PAIN',
    'HIGH_BLOOD_PRESSURE',
    'PREMATURE_LABOR',
    'REDUCED_FETAL_MOVEMENT',
    'OTHER',
  ]),
  description: z.string().min(10, 'Please provide more details'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
});

export const prescriptionSchema = z.object({
  motherId: z.string().uuid(),
  medications: z.array(
    z.object({
      name: z.string().min(2),
      dosage: z.string(),
      frequency: z.string(),
      duration: z.string(),
      notes: z.string().optional(),
    })
  ),
  instructions: z.string().min(10),
  validUntil: z.string().optional(),
});

export type HealthMetricInput = z.infer<typeof healthMetricSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type EmergencyAlertInput = z.infer<typeof emergencyAlertSchema>;
export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
