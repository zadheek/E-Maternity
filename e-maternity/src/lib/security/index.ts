// lib/security/index.ts
/**
 * Centralized security module exports
 * Import security features from one location
 */

// Encryption
export {
  encrypt,
  decrypt,
  hashWithSalt,
  verifyHash,
  generateSecureToken,
  maskSensitiveData,
} from './encryption';

export {
  encryptFields,
  decryptFields,
} from './encrypted-fields';

// Rate Limiting
export {
  rateLimit,
  RateLimitPresets,
  createRateLimiter,
} from './rate-limiter';

// Input Sanitization
export {
  sanitizeHtml,
  sanitizeText,
  sanitizeSqlIdentifier,
  sanitizeFileName,
} from './sanitize';

// Audit Logging
export {
  AuditAction,
  logAudit,
  extractRequestMetadata,
  withAudit,
} from './audit-logger';

export type {
  AuditLogEntry,
} from './audit-logger';

// Environment Validation
export {
  validateEnv,
} from './env-validator';

export type {
  Env,
} from './env-validator';

// Security Headers
export {
  securityHeaders,
} from './headers';
