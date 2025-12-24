// lib/api/error-handler.ts
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logAudit, AuditAction } from '@/lib/security/audit-logger';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

/**
 * Standardized error response builder
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number,
  details?: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && process.env.NODE_ENV === 'development' ? { details } : {}),
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Standardized success response builder
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Global error handler for API routes
 */
export async function handleApiError(
  error: unknown,
  userId?: string,
  request?: Request
): Promise<NextResponse<ApiResponse>> {
  // Log error for monitoring
  console.error('[API ERROR]', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    await logAudit({
      action: AuditAction.VALIDATION_ERROR,
      userId,
      success: false,
      details: { errors: error.issues },
    });

    return createErrorResponse(
      'VALIDATION_ERROR',
      'Invalid request data',
      400,
      error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return createErrorResponse(
          'DUPLICATE_ENTRY',
          'A record with this information already exists',
          409
        );
      case 'P2025':
        return createErrorResponse(
          'NOT_FOUND',
          'The requested resource was not found',
          404
        );
      case 'P2003':
        return createErrorResponse(
          'FOREIGN_KEY_CONSTRAINT',
          'Invalid reference to related data',
          400
        );
      default:
        return createErrorResponse(
          'DATABASE_ERROR',
          'A database error occurred',
          500
        );
    }
  }

  // HTTP-like errors
  if (error instanceof Error && 'status' in error) {
    const httpError = error as Error & { status: number };
    return createErrorResponse(
      'HTTP_ERROR',
      error.message,
      httpError.status
    );
  }

  // Generic errors
  if (error instanceof Error) {
    return createErrorResponse(
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
      500,
      process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
    );
  }

  // Unknown errors
  return createErrorResponse(
    'UNKNOWN_ERROR',
    'An unexpected error occurred',
    500
  );
}

/**
 * Authorization error helper
 */
export function unauthorizedResponse(message: string = 'Authentication required'): NextResponse<ApiResponse> {
  return createErrorResponse('UNAUTHORIZED', message, 401);
}

/**
 * Forbidden error helper
 */
export function forbiddenResponse(message: string = 'Access denied'): NextResponse<ApiResponse> {
  return createErrorResponse('FORBIDDEN', message, 403);
}

/**
 * Not found error helper
 */
export function notFoundResponse(resource: string = 'Resource'): NextResponse<ApiResponse> {
  return createErrorResponse('NOT_FOUND', `${resource} not found`, 404);
}

/**
 * Bad request error helper
 */
export function badRequestResponse(message: string): NextResponse<ApiResponse> {
  return createErrorResponse('BAD_REQUEST', message, 400);
}

/**
 * Wrap API handler with error handling
 */
export function withErrorHandler<T = any>(
  handler: (request: Request, ...args: any[]) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (request: Request, ...args: any[]): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return handleApiError(error) as Promise<NextResponse<ApiResponse<T>>>;
    }
  };
}
