// lib/api/pagination.ts
import { NextRequest } from 'next/server';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Extract and validate pagination parameters from request
 */
export function getPaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url);
  
  const page = Math.max(1, parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10));
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10))
  );
  
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
}

/**
 * Create pagination info object
 */
export function createPaginationInfo(
  page: number,
  limit: number,
  total: number
): PaginationInfo {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  };
}

/**
 * Helper to extract common query parameters
 */
export interface QueryParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
  filters?: Record<string, string>;
}

export function getQueryParams(request: NextRequest): QueryParams {
  const { searchParams } = new URL(request.url);
  const pagination = getPaginationParams(request);
  
  const search = searchParams.get('search') || undefined;
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder = (searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';
  
  // Extract custom filters (any param not in standard list)
  const standardParams = new Set(['page', 'limit', 'search', 'sortBy', 'sortOrder']);
  const filters: Record<string, string> = {};
  
  searchParams.forEach((value, key) => {
    if (!standardParams.has(key)) {
      filters[key] = value;
    }
  });
  
  return {
    ...pagination,
    search,
    sortBy,
    sortOrder,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
  };
}
