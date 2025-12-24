# Security Implementation Guide

## Overview
This document outlines the comprehensive security measures implemented in the Smart Maternal Health Management System, following OWASP best practices and healthcare data protection standards.

## 1. Environment Variable Validation

### Location: `src/lib/security/env-validator.ts`

**Purpose**: Prevent application startup with insecure or missing configuration.

**Features**:
- Validates all environment variables using Zod schemas
- Enforces minimum 32-character secrets
- Detects and rejects default "change-this" values
- Requires 64-character hex ENCRYPTION_KEY for data encryption
- Validates URLs, email addresses, and enum values
- Fail-fast approach: validates on import, exits in production if invalid

**Usage**:
```typescript
// Automatically validates on import
import '@/lib/security/env-validator';

// Access validated environment variables
const config = process.env;
```

**Critical Requirements**:
```bash
# Generate secure secrets (REQUIRED before production):
# NEXTAUTH_SECRET (32+ characters)
openssl rand -base64 32

# JWT_SECRET (32+ characters)
openssl rand -base64 32

# ENCRYPTION_KEY (64 hex characters)
openssl rand -hex 32
```

## 2. Data Encryption

### Location: `src/lib/security/encryption.ts`

**Purpose**: Protect sensitive health and personal data at rest.

**Algorithm**: AES-256-GCM (Authenticated Encryption with Associated Data)

**Key Features**:
- **Encryption/Decryption**: Symmetric encryption with random IV and authentication tags
- **One-Way Hashing**: PBKDF2 for NIC/SSN (searchable but not reversible)
- **Secure Tokens**: Cryptographically random tokens for password reset
- **Data Masking**: Display partial data (e.g., ****1234)

**API**:
```typescript
import { encrypt, decrypt, hashWithSalt, verifyHash, generateSecureToken, maskSensitiveData } from '@/lib/security/encryption';

// Encrypt sensitive data
const encrypted = encrypt('sensitive data');

// Decrypt data
const decrypted = decrypt(encrypted);

// One-way hash (cannot be decrypted)
const hash = hashWithSalt('9876543210V'); // NIC

// Verify hash
const isValid = verifyHash('9876543210V', hash);

// Generate secure token
const token = generateSecureToken(32);

// Mask sensitive data for display
const masked = maskSensitiveData('1234567890', 4); // ******7890
```

### Location: `src/lib/security/encrypted-fields.ts`

**Purpose**: Automatically encrypt/decrypt database fields.

**Encrypted Fields**:
- **MotherProfile**: NIC, chronic conditions, allergies, medications, family history
- **HealthMetric**: Notes
- **EmergencyContact**: Phone numbers
- **MedicalDocument**: Descriptions

**Usage**:
```typescript
// Automatic encryption via Prisma middleware (already configured)
const mother = await prisma.motherProfile.create({
  data: {
    nic: '9876543210V', // Automatically encrypted
    allergies: ['Penicillin', 'Latex'], // Automatically encrypted
  }
});

// Data is automatically decrypted on read
const profile = await prisma.motherProfile.findUnique({
  where: { id: motherId }
}); // profile.nic is decrypted, profile.allergies is decrypted array
```

## 3. Rate Limiting

### Location: `src/lib/security/rate-limiter.ts`

**Purpose**: Prevent brute force attacks and API abuse.

**Implementation**: In-memory token bucket with automatic cleanup.

**Presets**:
- **auth**: 5 requests per 15 minutes (strict for login/register)
- **api**: 60 requests per minute (standard API endpoints)
- **read**: 120 requests per minute (lenient for read operations)
- **sensitive**: 3 requests per hour (password reset, account deletion)

**Usage**:
```typescript
import { createRateLimiter } from '@/lib/security/rate-limiter';

// Apply to API route
const limiter = createRateLimiter('auth'); // Use 'auth' preset

export async function POST(req: Request) {
  // Check rate limit
  const identifier = req.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitResult = limiter.check(identifier);
  
  if (!rateLimitResult.allowed) {
    return new Response('Too many requests', {
      status: 429,
      headers: {
        'Retry-After': rateLimitResult.retryAfter?.toString() || '900',
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
      }
    });
  }

  // Process request...
}
```

**Custom Configuration**:
```typescript
const customLimiter = createRateLimiter({
  maxRequests: 10,
  interval: 60000, // 1 minute
});
```

## 4. Input Sanitization

### Location: `src/lib/security/sanitize.ts`

**Purpose**: Prevent XSS, SQL injection, and other input-based attacks.

**Functions**:
- `sanitizeHtml(dirty)`: Sanitize HTML with DOMPurify (only safe tags)
- `sanitizeText(input)`: Remove all HTML/script tags
- `sanitizeFileName(name)`: Prevent directory traversal
- `sanitizePhoneNumber(phone)`: Keep only digits and +
- `sanitizeEmail(email)`: Normalize email addresses
- `sanitizeUrl(url)`: Validate and sanitize URLs (only http/https)
- `sanitizeUserInput(object)`: Comprehensive sanitization for user data

**Usage**:
```typescript
import { sanitizeUserInput, sanitizeText, sanitizeEmail } from '@/lib/security/sanitize';

// Sanitize all user input before processing
export async function POST(req: Request) {
  const body = await req.json();
  const sanitized = sanitizeUserInput(body);
  
  // Process sanitized data...
}

// Sanitize specific fields
const cleanEmail = sanitizeEmail(userEmail);
const cleanText = sanitizeText(userComment);
```

## 5. Audit Logging

### Location: `src/lib/security/audit-logger.ts`

**Purpose**: Track security-relevant events for compliance and forensics.

**Logged Events**:
- Authentication: Login success/failure, logout, password changes
- Data Access: Health record views, modifications, deletions
- Sensitive Operations: Prescriptions, emergency alerts
- Security Events: Unauthorized access, rate limit exceeded, validation errors

**Usage**:
```typescript
import { logAudit, AuditAction, extractRequestMetadata } from '@/lib/security/audit-logger';

// Manual logging
await logAudit({
  action: AuditAction.LOGIN_SUCCESS,
  userId: user.id,
  userEmail: user.email,
  userRole: user.role,
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  success: true,
});

// With middleware wrapper
import { withAudit } from '@/lib/security/audit-logger';

export const POST = withAudit(
  AuditAction.HEALTH_RECORD_CREATED,
  async (req: Request) => {
    // Your handler logic...
  }
);
```

## 6. Security Headers

### Location: `src/lib/security/headers.ts` & `next.config.ts`

**Purpose**: Implement defense-in-depth with HTTP security headers.

**Headers Implemented**:
- **Strict-Transport-Security**: Force HTTPS (2 years, includeSubDomains, preload)
- **X-Frame-Options**: SAMEORIGIN (prevent clickjacking)
- **X-Content-Type-Options**: nosniff (prevent MIME sniffing)
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Permissions-Policy**: Restrict camera, microphone, geolocation, payment
- **Content-Security-Policy**: Strict CSP with allowed sources

**CSP Policy**:
```
default-src 'self'
script-src 'self' 'unsafe-eval' 'unsafe-inline' (dev only)
style-src 'self' 'unsafe-inline' (Tailwind requirement)
img-src 'self' data: blob: https:
connect-src 'self' https://api.twilio.com https://maps.googleapis.com
frame-src 'self' https://www.youtube.com (educational videos)
object-src 'none'
upgrade-insecure-requests
```

**Configuration**: Already applied in `next.config.ts`.

## 7. Authentication & Authorization

### Location: `src/lib/auth/auth.config.ts`

**Current Implementation**:
- **Provider**: NextAuth.js with Credentials Provider
- **Password Hashing**: bcrypt (12 rounds)
- **Session Strategy**: JWT with 30-day expiration
- **Secrets**: NEXTAUTH_SECRET and JWT_SECRET

**Security Enhancements Needed**:
- [ ] Add rate limiting to login endpoint (5 attempts per 15 minutes)
- [ ] Implement account lockout after failed attempts
- [ ] Add email verification
- [ ] Implement 2FA for high-privilege roles (Doctor, Admin)
- [ ] Session refresh token rotation

## 8. Database Security

### Prisma Configuration: `src/lib/db/prisma.ts`

**Features**:
- Connection pooling via pg adapter
- Automatic field encryption middleware
- Query logging in development
- Error logging in production

**Best Practices**:
- [x] Parameterized queries (Prisma handles this)
- [x] Connection string in environment variables
- [x] Encrypted sensitive fields
- [ ] Row-level security (future: PostgreSQL RLS)
- [ ] Database backup encryption
- [ ] Audit trail table

## 9. Security Checklist

### Before Production Deployment

#### Critical (Must Complete):
- [ ] **Generate unique NEXTAUTH_SECRET** (`openssl rand -base64 32`)
- [ ] **Generate unique JWT_SECRET** (`openssl rand -base64 32`)
- [ ] **Generate ENCRYPTION_KEY** (`openssl rand -hex 32`)
- [ ] Update .env file with generated secrets
- [ ] Test environment validator (should fail with default secrets)
- [ ] Enable HTTPS/TLS in production
- [ ] Configure firewall rules
- [ ] Set up database backups

#### High Priority:
- [ ] Apply rate limiting to all authentication endpoints
- [ ] Implement audit log storage (create AuditLog table)
- [ ] Add input sanitization to all API routes
- [ ] Test encrypted field encryption/decryption
- [ ] Configure CSP for production (stricter policy)
- [ ] Set up security monitoring/alerting
- [ ] Implement account lockout mechanism
- [ ] Add CAPTCHA to login/register forms

#### Medium Priority:
- [ ] Implement 2FA for privileged accounts
- [ ] Add session timeout warnings
- [ ] Implement password complexity requirements
- [ ] Set up automated security scanning (SAST/DAST)
- [ ] Create security incident response plan
- [ ] Implement file upload virus scanning
- [ ] Add API request/response logging
- [ ] Set up Web Application Firewall (WAF)

#### Nice to Have:
- [ ] Implement anomaly detection
- [ ] Add honeypot fields to forms
- [ ] Implement rate limiting per user (not just IP)
- [ ] Add security headers to email templates
- [ ] Implement Certificate Transparency monitoring
- [ ] Add Content Security Policy reporting

## 10. Testing Security

### Unit Tests:
```typescript
// Test encryption
test('encrypt and decrypt sensitive data', () => {
  const original = 'secret data';
  const encrypted = encrypt(original);
  const decrypted = decrypt(encrypted);
  expect(decrypted).toBe(original);
  expect(encrypted).not.toBe(original);
});

// Test rate limiting
test('rate limiter blocks after max requests', () => {
  const limiter = createRateLimiter({ maxRequests: 3, interval: 60000 });
  
  expect(limiter.check('user1').allowed).toBe(true);
  expect(limiter.check('user1').allowed).toBe(true);
  expect(limiter.check('user1').allowed).toBe(true);
  expect(limiter.check('user1').allowed).toBe(false); // Blocked
});

// Test sanitization
test('sanitize malicious input', () => {
  const dirty = '<script>alert("XSS")</script>Hello';
  const clean = sanitizeText(dirty);
  expect(clean).toBe('Hello');
  expect(clean).not.toContain('<script>');
});
```

### Integration Tests:
- Test login rate limiting
- Test encrypted field CRUD operations
- Test unauthorized access attempts
- Test audit logging for sensitive operations

### Security Scanning:
```bash
# Dependency vulnerabilities
npm audit

# OWASP ZAP automated scan
zap-cli quick-scan http://localhost:3000

# Static code analysis
npm run lint
```

## 11. Compliance

### HIPAA Compliance:
- [x] Encryption at rest (AES-256-GCM)
- [x] Encryption in transit (HTTPS/TLS)
- [x] Access controls (role-based)
- [x] Audit logging
- [ ] Business Associate Agreements
- [ ] Breach notification procedure
- [ ] Regular risk assessments

### GDPR Compliance:
- [x] Data encryption
- [x] Access controls
- [ ] Right to erasure (data deletion)
- [ ] Data portability
- [ ] Consent management
- [ ] Privacy policy
- [ ] Data processing agreement

## 12. Incident Response

### Security Incident Procedure:
1. **Detect**: Monitor logs, alerts, user reports
2. **Contain**: Disable compromised accounts, block IPs
3. **Investigate**: Analyze audit logs, identify scope
4. **Remediate**: Patch vulnerabilities, reset credentials
5. **Recover**: Restore from backups if needed
6. **Report**: Notify affected users, regulatory bodies
7. **Learn**: Post-mortem, update security measures

### Contact Information:
- Security Team: security@e-maternity.lk
- Incident Hotline: +94-XXX-XXXXXXX
- Escalation: CTO, Legal, PR

## 13. Resources

### Documentation:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/security)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/index.html)

### Tools:
- **Scanning**: OWASP ZAP, Burp Suite
- **Monitoring**: Sentry, LogRocket
- **Testing**: Jest, Playwright
- **Auditing**: npm audit, Snyk

---

**Last Updated**: 2025-01-XX  
**Reviewed By**: Senior Security Engineer  
**Next Review**: Quarterly
