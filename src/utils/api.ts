import { getSupabaseUrl, getPublicAnonKey } from './supabase/info';
import { authManager, csrfManager } from './auth';
import { ApiResponse } from '../types';
import { z } from 'zod';
import { validateRequest } from './validation';

const API_BASE = `${getSupabaseUrl()}/functions/v1/make-server-41a1615d`;

// Rate limiting implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests = 60; // Max requests per minute
  private readonly windowMs = 60000; // 1 minute window

  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(endpoint) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(endpoint, validRequests);
    return true;
  }

  getRemainingTime(endpoint: string): number {
    const requests = this.requests.get(endpoint) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }
}

const rateLimiter = new RateLimiter();

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  useAuth: boolean = true
): Promise<T> {
  // Check rate limiting
  if (!rateLimiter.canMakeRequest(endpoint)) {
    const waitTime = rateLimiter.getRemainingTime(endpoint);
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authentication
  if (useAuth) {
    try {
      const accessToken = await authManager.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      } else {
        // Only use public anon key for non-authenticated endpoints
        // For protected endpoints, throw an error instead
        throw new Error('Authentication required. Please sign in.');
      }
    } catch (error) {
      console.error('Failed to get access token:', error);
      // Don't fallback to public key for protected endpoints
      throw new Error('Authentication failed. Please sign in again.');
    }
  } else {
    // For public endpoints, use the anon key
    headers['Authorization'] = `Bearer ${getPublicAnonKey()}`;
  }

  // Add CSRF token for state-changing operations
  const method = options.method?.toUpperCase() || 'GET';
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    headers['X-CSRF-Token'] = csrfManager.getToken();
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && useAuth) {
      const session = await authManager.refreshSession();
      if (session) {
        // Retry with new token
        headers['Authorization'] = `Bearer ${session.access_token}`;
        const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        });
        
        const retryData = await retryResponse.json();
        
        if (!retryResponse.ok) {
          authManager.handleAuthError({ status: retryResponse.status });
          throw new Error(retryData.error || 'Authentication failed');
        }
        
        return retryData;
      } else {
        authManager.handleAuthError({ status: 401 });
      }
    }

    const data = await response.json();

    if (!response.ok) {
      console.error(`API Error [${endpoint}]:`, data);
      
      // Handle specific error cases with user-friendly messages
      if (response.status === 401) {
        authManager.handleAuthError({ status: 401 });
        throw new Error('Your session has expired. Please sign in again.');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      } else if (response.status === 404) {
        throw new Error('The requested resource was not found.');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      } else if (response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      // Use the error message from server if available, otherwise generic message
      throw new Error(data.error || 'An unexpected error occurred. Please try again.');
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('JWT expired')) {
      authManager.handleAuthError(error);
    }
    throw error;
  }
}

// Paginated API request helper (page-based)
export async function paginatedApiRequest<T = any>(
  endpoint: string,
  page: number = 1,
  pageSize: number = 20,
  options: RequestInit = {},
  useAuth: boolean = true
) {
  const paginatedEndpoint = `${endpoint}?page=${page}&pageSize=${pageSize}`;
  return apiRequest<{ items: T[], total: number, hasMore: boolean }>(
    paginatedEndpoint,
    options,
    useAuth
  );
}

// Cursor-based pagination types
export interface CursorPaginationParams {
  limit?: number;
  cursor?: string | null;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
  totalCount?: number;
}

// Cursor-based paginated API request helper (more efficient for large datasets)
export async function cursorPaginatedApiRequest<T = any>(
  endpoint: string,
  params: CursorPaginationParams = {},
  options: RequestInit = {},
  useAuth: boolean = true
): Promise<CursorPaginatedResponse<T>> {
  const queryParams = new URLSearchParams();
  
  // Add pagination parameters
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.cursor) queryParams.append('cursor', params.cursor);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  // Add filters
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(`filter[${key}]`, String(value));
      }
    });
  }
  
  const fullEndpoint = queryParams.toString() 
    ? `${endpoint}?${queryParams.toString()}`
    : endpoint;
  
  return apiRequest<CursorPaginatedResponse<T>>(
    fullEndpoint,
    options,
    useAuth
  );
}

// Pagination cache manager for optimized data fetching
class PaginationCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes
  
  getCacheKey(endpoint: string, params: CursorPaginationParams): string {
    try {
      return `${endpoint}:${JSON.stringify(params)}`;
    } catch (error) {
      // If JSON.stringify fails (circular reference, etc.), disable caching for this request
      console.warn('Failed to stringify cache params, caching disabled for this request:', error);
      // Return null to signal caching should be skipped
      return '';
    }
  }
  
  get(endpoint: string, params: CursorPaginationParams): any | null {
    const key = this.getCacheKey(endpoint, params);
    
    // Skip cache if key generation failed
    if (!key) return null;
    
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  set(endpoint: string, params: CursorPaginationParams, data: any): void {
    const key = this.getCacheKey(endpoint, params);
    
    // Skip caching if key generation failed
    if (!key) return;
    
    this.cache.set(key, { data, timestamp: Date.now() });
    
    // Limit cache size
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }
  
  invalidate(endpoint?: string): void {
    if (endpoint) {
      // Invalidate all entries for a specific endpoint
      Array.from(this.cache.keys())
        .filter(key => key.startsWith(endpoint))
        .forEach(key => this.cache.delete(key));
    } else {
      // Clear entire cache
      this.cache.clear();
    }
  }
}

export const paginationCache = new PaginationCache();

// Cached cursor-based pagination request
export async function cachedCursorPaginatedRequest<T = any>(
  endpoint: string,
  params: CursorPaginationParams = {},
  options: RequestInit = {},
  useAuth: boolean = true,
  useCache: boolean = true
): Promise<CursorPaginatedResponse<T>> {
  // Check cache first (only for GET requests)
  const method = options.method?.toUpperCase() || 'GET';
  if (useCache && method === 'GET') {
    const cached = paginationCache.get(endpoint, params);
    if (cached) {
      return cached;
    }
  }
  
  // Fetch fresh data
  const response = await cursorPaginatedApiRequest<T>(
    endpoint,
    params,
    options,
    useAuth
  );
  
  // Cache the response
  if (useCache && method === 'GET') {
    paginationCache.set(endpoint, params, response);
  }
  
  return response;
}

// Validated API request with Zod schema
export async function validatedApiRequest<T>(
  endpoint: string,
  options: RequestInit & { 
    requestSchema?: z.ZodSchema;
    responseSchema?: z.ZodSchema<T>;
  } = {},
  useAuth: boolean = true
): Promise<T> {
  const { requestSchema, responseSchema, ...fetchOptions } = options;
  
  // Validate request body if schema provided
  if (requestSchema && fetchOptions.body) {
    let bodyData;
    try {
      bodyData = typeof fetchOptions.body === 'string' 
        ? JSON.parse(fetchOptions.body)
        : fetchOptions.body;
    } catch (error) {
      throw new Error(`Invalid JSON in request body: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
    
    const validation = validateRequest(requestSchema, bodyData);
    if (validation.success === false) {
      throw new Error(
        `Request validation failed: ${validation.errors.issues
          .map(err => `${err.path.join('.')}: ${err.message}`)
          .join(', ')}`
      );
    } else {
      // Use validated data
      fetchOptions.body = JSON.stringify(validation.data);
    }
  }
  
  // Make the API request
  const response = await apiRequest<T>(endpoint, fetchOptions, useAuth);
  
  // Validate response if schema provided
  if (responseSchema) {
    const validation = validateRequest(responseSchema, response);
    if (validation.success === false) {
      console.error('Response validation failed:', validation.errors);
      throw new Error(
        `Response validation failed: ${validation.errors.issues
          .map(err => `${err.path.join('.')}: ${err.message}`)
          .join(', ')}`
      );
    } else {
      return validation.data;
    }
  }
  
  return response;
}

// Batch request helper for fetching multiple resources
export async function batchApiRequest<T = any>(
  requests: Array<{
    endpoint: string;
    options?: RequestInit;
    useAuth?: boolean;
  }>
): Promise<Array<{ success: boolean; data?: T; error?: string }>> {
  const results = await Promise.allSettled(
    requests.map(req => 
      apiRequest<T>(
        req.endpoint,
        req.options || {},
        req.useAuth !== undefined ? req.useAuth : true
      )
    )
  );
  
  return results.map(result => {
    if (result.status === 'fulfilled') {
      return { success: true, data: result.value };
    } else {
      return { success: false, error: result.reason.message };
    }
  });
}
