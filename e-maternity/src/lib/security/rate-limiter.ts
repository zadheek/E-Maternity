// lib/security/rate-limiter.ts
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per interval
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configurable cleanup interval (default: 5 minutes)
const CLEANUP_INTERVAL = parseInt(process.env.RATE_LIMIT_CLEANUP_INTERVAL || '300000', 10);

// Cleanup expired entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        keysToDelete.push(key);
      }
    }
    
    // Batch delete to avoid modifying during iteration
    keysToDelete.forEach(key => rateLimitStore.delete(key));
    
    if (keysToDelete.length > 0 && process.env.NODE_ENV === 'development') {
      console.log(`🧹 Rate limiter: Cleaned up ${keysToDelete.length} expired entries`);
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Rate limiter middleware
 */
export function rateLimit(config: RateLimitConfig) {
  const { interval, maxRequests } = config;

  return (request: NextRequest): NextResponse | null => {
    // Get identifier (IP address or user ID from session)
    const identifier = getIdentifier(request);
    const now = Date.now();

    let entry = rateLimitStore.get(identifier);

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetTime: now + interval,
      };
      rateLimitStore.set(identifier, entry);
      return null; // Allow request
    }

    entry.count++;

    if (entry.count > maxRequests) {
      const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            retryAfter: resetInSeconds,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': resetInSeconds.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
          },
        }
      );
    }

    return null; // Allow request
  };
}

/**
 * Get client identifier for rate limiting
 */
function getIdentifier(request: NextRequest): string {
  // Try to get user ID from session (preferred for authenticated users)
  // For now, use IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  // Strict limit for authentication endpoints
  auth: {
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  
  // Standard API endpoints
  api: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
  
  // More lenient for read-only operations
  read: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 120,
  },
  
  // Very strict for sensitive operations (password reset, etc.)
  sensitive: {
    interval: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },
};

/**
 * Simple rate limiter class for API routes
 */
export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is allowed
   */
  check(identifier: string): {
    allowed: boolean;
    limit: number;
    remaining: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    let entry = this.store.get(identifier);

    if (!entry || entry.resetTime < now) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetTime: now + this.config.interval,
      };
      this.store.set(identifier, entry);
      
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
      };
    }

    entry.count++;

    if (entry.count > this.config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      return {
        allowed: false,
        limit: this.config.maxRequests,
        remaining: 0,
        retryAfter,
      };
    }

    return {
      allowed: true,
      limit: this.config.maxRequests,
      remaining: this.config.maxRequests - entry.count,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Clear all rate limit entries
   */
  clear(): void {
    this.store.clear();
  }
}

/**
 * Create a rate limiter with a preset or custom config
 */
export function createRateLimiter(
  preset: keyof typeof RateLimitPresets | RateLimitConfig
): RateLimiter {
  if (typeof preset === 'string') {
    return new RateLimiter(RateLimitPresets[preset]);
  }
  return new RateLimiter(preset);
}

