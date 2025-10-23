import { useState, useEffect, useCallback, useRef, useMemo, Dispatch, SetStateAction } from 'react';
import { apiRequest } from '../utils/api';
import { toast } from 'sonner';

/**
 * Stable default data extractor to prevent infinite loops
 * Defined at module level so it maintains the same reference across all calls
 */
const defaultDataExtractor = <T>(data: any): T[] => data;

/**
 * Configuration options for useResourceData hook
 */
export interface UseResourceDataOptions<T> {
  /**
   * API endpoint to fetch data from
   */
  endpoint: string;

  /**
   * Function to extract data array from API response
   * @default (data) => data
   */
  dataExtractor?: (response: any) => T[];

  /**
   * Whether to fetch data immediately on mount
   * @default true
   */
  fetchOnMount?: boolean;

  /**
   * Custom error message to show on fetch failure
   */
  errorMessage?: string;

  /**
   * Query parameters to append to the endpoint
   */
  queryParams?: Record<string, string | number | boolean>;

  /**
   * Whether to show error toast on failure
   * @default true
   */
  showErrorToast?: boolean;

  /**
   * Callback fired when data is successfully loaded
   */
  onSuccess?: (data: T[]) => void;

  /**
   * Callback fired when an error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Dependencies array for re-fetching data
   */
  dependencies?: any[];
}

/**
 * Return type for useResourceData hook
 */
export interface UseResourceDataResult<T> {
  /**
   * The fetched data array
   */
  data: T[];

  /**
   * Whether this is the initial load (useful for showing skeleton screens)
   */
  isInitialLoad: boolean;

  /**
   * Whether data is currently being fetched
   */
  isLoading: boolean;

  /**
   * Error object if the request failed
   */
  error: Error | null;

  /**
   * Manually trigger a data refresh
   */
  refresh: () => Promise<void>;

  /**
   * Update the local data state without refetching
   */
  setData: Dispatch<SetStateAction<T[]>>;

  /**
   * Whether the data has been loaded at least once
   */
  hasLoaded: boolean;
}

/**
 * Generic hook for fetching resource data from API endpoints
 * 
 * Features:
 * - Automatic data fetching on mount
 * - Loading and error state management
 * - Manual refresh capability
 * - Customizable data extraction
 * - Query parameter support
 * - Success/error callbacks
 * 
 * @example
 * ```tsx
 * const { data, isInitialLoad, refresh } = useResourceData<Task>({
 *   endpoint: '/tasks',
 *   dataExtractor: (res) => res.tasks || [],
 *   errorMessage: 'Failed to load tasks'
 * });
 * ```
 */
export function useResourceData<T = any>(
  options: UseResourceDataOptions<T>
): UseResourceDataResult<T> {
  const {
    endpoint,
    dataExtractor = defaultDataExtractor,
    fetchOnMount = true,
    errorMessage = 'Failed to load data',
    queryParams,
    showErrorToast = true,
    onSuccess,
    onError,
    dependencies = [],
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  /**
   * Fetch data from the API
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build endpoint with current query params
      let fullEndpoint = endpoint;
      if (queryParams) {
        const params = new URLSearchParams();
        Object.entries(queryParams).forEach(([key, value]) => {
          params.append(key, String(value));
        });
        const separator = endpoint.includes('?') ? '&' : '?';
        fullEndpoint = `${endpoint}${separator}${params.toString()}`;
      }

      const response = await apiRequest(fullEndpoint);
      const extractedData = dataExtractor(response);

      if (isMountedRef.current) {
        setData(extractedData);
        setHasLoaded(true);
        onSuccess?.(extractedData);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (isMountedRef.current) {
        setError(error);
        console.error(`Error fetching data from ${endpoint}:`, error);
        
        if (showErrorToast) {
          toast.error(errorMessage);
        }
        
        onError?.(error);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    }
  }, [endpoint, queryParams, dataExtractor, errorMessage, showErrorToast, onSuccess, onError]);

  /**
   * Refresh data manually
   */
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    // Reset mounted flag at start of effect (handles dependency re-runs)
    isMountedRef.current = true;
    
    if (fetchOnMount) {
      fetchData();
    }
    
    // Cleanup function only runs on unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchOnMount, fetchData, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    isInitialLoad,
    isLoading,
    error,
    refresh,
    setData,
    hasLoaded,
  };
}

/**
 * Hook for resource data that supports pagination
 */
export interface UsePaginatedResourceDataOptions<T> extends UseResourceDataOptions<T> {
  /**
   * Number of items per page
   * @default 20
   */
  pageSize?: number;
}

export interface UsePaginatedResourceDataResult<T> extends UseResourceDataResult<T> {
  /**
   * Load the next page of data
   */
  loadMore: () => Promise<void>;

  /**
   * Whether there are more pages to load
   */
  hasMore: boolean;

  /**
   * Current page number
   */
  currentPage: number;
}

/**
 * Hook for fetching paginated resource data
 */
export function usePaginatedResourceData<T = any>(
  options: UsePaginatedResourceDataOptions<T>
): UsePaginatedResourceDataResult<T> {
  const { pageSize = 20, ...baseOptions } = options;
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Memoize query params to prevent infinite loops
  const queryParams = useMemo(() => ({
    ...baseOptions.queryParams,
    limit: pageSize,
    offset: (currentPage - 1) * pageSize,
  }), [baseOptions.queryParams, pageSize, currentPage]);

  const result = useResourceData<T>({
    ...baseOptions,
    queryParams,
  });

  const loadMore = useCallback(async () => {
    if (!hasMore || result.isLoading) return;
    
    setCurrentPage(prev => prev + 1);
  }, [hasMore, result.isLoading]);

  // Update hasMore based on data length
  useEffect(() => {
    if (result.data.length < pageSize) {
      setHasMore(false);
    }
  }, [result.data.length, pageSize]);

  return {
    ...result,
    loadMore,
    hasMore,
    currentPage,
  };
}
