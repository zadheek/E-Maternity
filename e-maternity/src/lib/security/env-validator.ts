// lib/security/env-validator.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('Invalid DATABASE_URL'),

  // Authentication
  NEXTAUTH_URL: z.string().url('Invalid NEXTAUTH_URL'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be at least 32 characters')
    .refine(
      (val) => !val.includes('change-this'),
      'NEXTAUTH_SECRET must be changed from default value'
    ),

  // JWT
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .refine(
      (val) => !val.includes('change-this'),
      'JWT_SECRET must be changed from default value'
    ),

  // Optional external services
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email('Invalid EMAIL_FROM').optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),

  // App config
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),

  // File upload
  MAX_FILE_SIZE: z.string().optional(),
  UPLOAD_DIR: z.string().optional(),

  // Encryption key for sensitive data
  ENCRYPTION_KEY: z
    .string()
    .length(64, 'ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)')
    .regex(/^[0-9a-f]{64}$/i, 'ENCRYPTION_KEY must be a valid hex string')
    .optional(),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function validateEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  try {
    cachedEnv = envSchema.parse(process.env);
    return cachedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError;
      const errors = zodError.issues.map((err) => `${err.path.join('.')}: ${err.message}`);
      console.error('❌ Environment validation failed:');
      errors.forEach((err) => console.error(`  - ${err}`));
      throw new Error('Environment validation failed. Check your .env file.');
    }
    throw error;
  }
}

// Validate on import (fail fast) - skip during build/test
const shouldValidate = process.env.NODE_ENV !== 'test' && process.env.SKIP_ENV_VALIDATION !== 'true';

if (shouldValidate) {
  try {
    validateEnv();
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Environment variables validated successfully');
    }
  } catch (error) {
    console.error(error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}
