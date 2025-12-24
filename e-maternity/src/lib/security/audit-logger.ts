// lib/security/audit-logger.ts
import { prisma } from '@/lib/db/prisma';

export enum AuditAction {
  // Authentication
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED = 'PASSWORD_RESET_COMPLETED',

  // Data Access
  HEALTH_RECORD_VIEWED = 'HEALTH_RECORD_VIEWED',
  HEALTH_RECORD_CREATED = 'HEALTH_RECORD_CREATED',
  HEALTH_RECORD_UPDATED = 'HEALTH_RECORD_UPDATED',
  HEALTH_RECORD_DELETED = 'HEALTH_RECORD_DELETED',

  // Sensitive Operations
  PRESCRIPTION_CREATED = 'PRESCRIPTION_CREATED',
  PRESCRIPTION_UPDATED = 'PRESCRIPTION_UPDATED',
  EMERGENCY_ALERT_TRIGGERED = 'EMERGENCY_ALERT_TRIGGERED',
  EMERGENCY_ALERT_RESOLVED = 'EMERGENCY_ALERT_RESOLVED',

  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  ROLE_CHANGED = 'ROLE_CHANGED',

  // System
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export interface AuditLogEntry {
  action: AuditAction;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  targetUserId?: string;
  targetResourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

/**
 * Log security-relevant events
 * Note: In production, configure AuditLog table for persistent storage
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const logMessage = {
      timestamp: new Date().toISOString(),
      ...entry,
    };

    if (process.env.NODE_ENV === 'production') {
      // Production: structured JSON logging for external log aggregators
      console.log(JSON.stringify({ type: 'AUDIT', ...logMessage }));
    } else {
      // Development: human-readable logs
      const emoji = entry.success ? '✅' : '❌';
      const message = `${emoji} [AUDIT] ${entry.action}`;
      const metadata = {
        user: entry.userEmail || entry.userId,
        target: entry.targetResourceId,
        ip: entry.ipAddress,
        ...(entry.details && Object.keys(entry.details).length > 0 ? { details: entry.details } : {}),
      };
      console.log(message, metadata);
    }
  } catch (error) {
    // Never fail the main operation due to audit logging errors
    console.error('[AUDIT ERROR]', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Helper to extract request metadata for audit logs
 */
export function extractRequestMetadata(request: Request): Pick<AuditLogEntry, 'ipAddress' | 'userAgent'> {
  const headers = request.headers;
  
  return {
    ipAddress: headers.get('x-forwarded-for')?.split(',')[0] || 
               headers.get('x-real-ip') || 
               'unknown',
    userAgent: headers.get('user-agent') || 'unknown',
  };
}

/**
 * Create audit middleware wrapper for API routes
 */
export function withAudit(
  action: AuditAction,
  handler: (req: Request, ...args: any[]) => Promise<Response>
) {
  return async (req: Request, ...args: any[]): Promise<Response> => {
    const startTime = Date.now();
    const metadata = extractRequestMetadata(req);

    try {
      const response = await handler(req, ...args);
      
      // Log successful operation
      await logAudit({
        action,
        ...metadata,
        success: response.status < 400,
        details: {
          statusCode: response.status,
          duration: Date.now() - startTime,
        },
      });

      return response;
    } catch (error) {
      // Log failed operation
      await logAudit({
        action,
        ...metadata,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        details: {
          duration: Date.now() - startTime,
        },
      });

      throw error;
    }
  };
}
