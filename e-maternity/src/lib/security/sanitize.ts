// lib/security/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize plain text input (remove any HTML/script tags)
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  
  // Remove all HTML tags
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Sanitize SQL identifiers (table/column names)
 * Only allow alphanumeric and underscore
 */
export function sanitizeSqlIdentifier(identifier: string): string {
  if (!identifier) return '';
  return identifier.replace(/[^a-zA-Z0-9_]/g, '');
}

/**
 * Sanitize file name to prevent directory traversal
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName) return '';
  
  // Remove path separators and special characters
  return fileName
    .replace(/[\/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 255); // Limit length
}

/**
 * Sanitize phone number (keep only digits and +)
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (!email) return '';
  return email.toLowerCase().trim();
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Remove null bytes from string (prevents SQL injection in some DBs)
 */
export function removeNullBytes(str: string): string {
  if (!str) return '';
  return str.replace(/\0/g, '');
}

/**
 * Comprehensive input sanitization for user data
 */
export function sanitizeUserInput(input: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }
    
    if (typeof value === 'string') {
      sanitized[key] = removeNullBytes(sanitizeText(value));
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeUserInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? removeNullBytes(sanitizeText(item)) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
