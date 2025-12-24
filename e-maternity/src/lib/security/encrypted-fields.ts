// lib/security/encrypted-fields.ts
/**
 * Database field encryption wrapper
 * Transparently encrypts/decrypts sensitive fields
 */

import { encrypt, decrypt, hashWithSalt, verifyHash } from './encryption';

/**
 * Encrypted field type for Prisma models
 */
export interface EncryptedField {
  encrypted: string;
  iv?: string;
  tag?: string;
}

/**
 * Fields that should be encrypted in database
 */
export const ENCRYPTED_FIELDS = {
  MotherProfile: [
    'nic',  // National Identity Card
    'chronicConditions',
    'allergies',
    'currentMedications',
    'familyHistory',
  ],
  HealthMetric: [
    'notes',  // May contain sensitive health information
  ],
  EmergencyContact: [
    'phoneNumber',
  ],
  MedicalDocument: [
    'description',
  ],
} as const;

/**
 * Fields that should be one-way hashed (cannot be decrypted)
 */
export const HASHED_FIELDS = {
  User: ['password'],  // Already handled by bcrypt in auth
  MotherProfile: ['nic'],  // For searchability while maintaining privacy
} as const;

/**
 * Encrypt sensitive data before saving to database
 */
export function encryptField(value: string | string[] | null): string | null {
  if (!value) return null;
  
  try {
    if (Array.isArray(value)) {
      // Encrypt array as JSON string
      return encrypt(JSON.stringify(value));
    }
    return encrypt(value);
  } catch (error) {
    console.error('Field encryption failed:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypt sensitive data after reading from database
 */
export function decryptField(encrypted: string | null): string | string[] | null {
  if (!encrypted) return null;
  
  try {
    const decrypted = decrypt(encrypted);
    
    // Try to parse as JSON (for arrays)
    try {
      const parsed = JSON.parse(decrypted);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Not JSON, return as string
    }
    
    return decrypted;
  } catch (error) {
    console.error('Field decryption failed:', error);
    throw new Error('Failed to decrypt sensitive data');
  }
}

/**
 * Encrypt multiple fields in an object
 */
export function encryptFields<T extends Record<string, any>>(
  data: T,
  fields: readonly string[]
): T {
  const encrypted = { ...data } as any;
  
  for (const field of fields) {
    if (field in encrypted && encrypted[field] !== null && encrypted[field] !== undefined) {
      encrypted[field] = encryptField(encrypted[field]);
    }
  }
  
  return encrypted as T;
}

/**
 * Decrypt multiple fields in an object
 */
export function decryptFields<T extends Record<string, any>>(
  data: T,
  fields: readonly string[]
): T {
  const decrypted = { ...data } as any;
  
  for (const field of fields) {
    if (field in decrypted && decrypted[field] !== null && decrypted[field] !== undefined) {
      decrypted[field] = decryptField(decrypted[field]);
    }
  }
  
  return decrypted as T;
}

/**
 * Create searchable hash for encrypted fields (for queries)
 * This allows searching without decrypting all records
 */
export function createSearchableHash(value: string): string {
  return hashWithSalt(value);
}

/**
 * Verify if a value matches a searchable hash
 */
export function verifySearchableHash(value: string, hash: string): boolean {
  return verifyHash(value, hash);
}

/**
 * Prisma middleware to automatically encrypt/decrypt fields
 */
export function createEncryptionMiddleware() {
  return async function encryptionMiddleware(params: any, next: any) {
    const model = params.model;
    const action = params.action;

    // Encrypt before create/update
    if (['create', 'update', 'upsert', 'createMany', 'updateMany'].includes(action)) {
      if (model && model in ENCRYPTED_FIELDS) {
        const fields = ENCRYPTED_FIELDS[model as keyof typeof ENCRYPTED_FIELDS];
        
        if (params.args.data) {
          params.args.data = encryptFields(params.args.data, fields);
        }
      }
    }

    // Execute query
    const result = await next(params);

    // Decrypt after read operations
    if (['findUnique', 'findFirst', 'findMany'].includes(action)) {
      if (model && model in ENCRYPTED_FIELDS) {
        const fields = ENCRYPTED_FIELDS[model as keyof typeof ENCRYPTED_FIELDS];
        
        if (Array.isArray(result)) {
          return result.map(item => decryptFields(item, fields));
        } else if (result) {
          return decryptFields(result, fields);
        }
      }
    }

    return result;
  };
}
