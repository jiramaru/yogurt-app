/**
 * Common types for server actions
 */

/**
 * Standard response type for all server actions
 */
export type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
};

/**
 * Pagination parameters for list actions
 */
export type PaginationParams = {
  page?: number;
  limit?: number;
};

/**
 * Sort parameters for list actions
 */
export type SortParams = {
  field: string;
  direction: 'asc' | 'desc';
};

/**
 * Filter parameters for list actions
 */
export type FilterParams = {
  field: string;
  value: string | number | boolean;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
};

/**
 * Query parameters for list actions
 */
export type QueryParams = {
  pagination?: PaginationParams;
  sort?: SortParams;
  filters?: FilterParams[];
  search?: string;
};
