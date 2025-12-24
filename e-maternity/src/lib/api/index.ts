// lib/api/index.ts
/**
 * Centralized API utilities export
 */

export {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  badRequestResponse,
  withErrorHandler,
} from './error-handler';

export type {
  ApiError,
  ApiResponse,
} from './error-handler';

export {
  getPaginationParams,
  createPaginationInfo,
  getQueryParams,
} from './pagination';

export type {
  PaginationParams,
  PaginationInfo,
  QueryParams,
} from './pagination';
