// lib/security/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // AES block size
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

// Cache encryption key to avoid repeated Buffer.from() calls
let cachedEncryptionKey: Buffer | null = null;

/**
 * Get encryption key from environment or generate a secure one
 */
function getEncryptionKey(): Buffer {
  if (cachedEncryptionKey) {
    return cachedEncryptionKey;
  }

  const keyHex = process.env.ENCRYPTION_KEY;
  
  if (!keyHex) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'ENCRYPTION_KEY environment variable is required in production. ' +
        'Generate one with: openssl rand -hex 32'
      );
    }
    // Development fallback (not secure, just for development)
    console.warn('⚠️ Using default encryption key. Set ENCRYPTION_KEY in production!');
    cachedEncryptionKey = Buffer.from('0'.repeat(64), 'hex');
    return cachedEncryptionKey;
  }

  cachedEncryptionKey = Buffer.from(keyHex, 'hex');
  return cachedEncryptionKey;
}

/**
 * Encrypt sensitive data (e.g., NIC, health records)
 * Returns: base64(iv:authTag:encrypted)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return '';

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Combine iv:authTag:encrypted
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'base64'),
  ]);

  return combined.toString('base64');
}

/**
 * Decrypt sensitive data
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return '';

  try {
    const combined = Buffer.from(ciphertext, 'base64');

    // Extract iv, authTag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.toString('base64'), 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data. Data may be corrupted or key is incorrect.');
  }
}

/**
 * Hash data with salt (for one-way hashing like SSN, national IDs)
 * Use when you need to verify but never retrieve original value
 */
export function hashWithSalt(data: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');

  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verify hashed data
 */
export function verifyHash(data: string, hashedData: string): boolean {
  const [saltHex, originalHash] = hashedData.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const hash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');

  return hash.toString('hex') === originalHash;
}

/**
 * Generate a secure random token (for password reset, etc.)
 */
export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Mask sensitive data for display (e.g., show last 4 digits of NIC)
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) return data;
  
  const masked = '*'.repeat(data.length - visibleChars);
  const visible = data.slice(-visibleChars);
  
  return masked + visible;
}
