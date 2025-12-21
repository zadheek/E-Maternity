// lib/validation/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerMotherSchema = z.object({
  // User Info
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z.string().regex(/^(\+94|0)[0-9]{9}$/, 'Invalid Sri Lankan phone number'),
  language: z.enum(['SINHALA', 'TAMIL', 'ENGLISH']),

  // Mother Profile
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const age = (new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 15 && age <= 55;
  }, 'Age must be between 15 and 55'),
  nic: z.string().regex(/^([0-9]{9}[vVxX]|[0-9]{12})$/, 'Invalid NIC number'),
  
  // Address
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  district: z.string().min(2, 'Please select a district'),
  postalCode: z.string().regex(/^[0-9]{5}$/, 'Postal code must be 5 digits'),
  
  // Pregnancy Info
  expectedDeliveryDate: z.string(),
  bloodType: z.enum(['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE']),
  
  // Medical History
  previousPregnancies: z.number().min(0).max(20),
  previousCesareans: z.number().min(0).max(10),
  previousMiscarriages: z.number().min(0).max(10),
  chronicConditions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const otpVerificationSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterMotherInput = z.infer<typeof registerMotherSchema>;
export type OtpVerificationInput = z.infer<typeof otpVerificationSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
