/**
 * DataList Component
 * 
 * A comprehensive list rendering component that handles all states:
 * - Loading: Shows skeleton placeholders
 * - Empty: Shows empty state with icon, message, and optional action
 * - Error: Shows error state with retry option
 * - Data: Renders the actual list items
 * 
 * This eliminates the need for repetitive conditional rendering in components.
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

export interface DataListProps<T> {
  /**
   * The data array to render
   */
  data: T[];

  /**
   * Whether data is currently loading (initial load)
   */
  isLoading: boolean;

  /**
   * Error object if the request failed
   */
  error: Error | null;

  /**
   * Function to render each item in the list
   */
  renderItem: (item: T, index: number) => React.ReactNode;

  /**
   * Function to extract a unique key from each item
   * @default (item, index) => index
   */
  keyExtractor?: (item: T, index: number) => string | number;

  /**
   * Skeleton component to show while loading
   */
  loadingSkeleton?: React.ReactNode;

  /**
   * Number of skeleton items to show while loading
   * @default 5
   */
  loadingCount?: number;

  /**
   * Empty state configuration
   */
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };

  /**
   * Error state configuration
   */
  errorState?: {
    title?: string;
    description?: string;
    showRetry?: boolean;
  };

  /**
   * Callback to retry loading data on error
   */
  onRetry?: () => void;

  /**
   * Container className for styling
   */
  className?: string;

  /**
   * Whether to show a divider between items
   * @default false
   */
  showDivider?: boolean;
}

/**
 * Default skeleton list component
 */
const DefaultSkeleton: React.FC<{ count: number }> = ({ count }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div 
        key={i} 
        className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse"
        style={{ animationDelay: `${i * 100}ms` }}
      >
        <div className="h-10 w-10 bg-muted rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    ))}
  </>
);

/**
 * DataList Component
 */
export function DataList<T>({
  data,
  isLoading,
  error,
  renderItem,
  keyExtractor = (_, index) => index,
  loadingSkeleton,
  loadingCount = 5,
  emptyState,
  errorState,
  onRetry,
  className = '',
  showDivider = false,
}: DataListProps<T>) {
  // Loading state
  if (isLoading) {
    if (loadingSkeleton) {
      return (
        <div className={className}>
          {Array.from({ length: loadingCount }).map((_, i) => (
            <div key={i}>{loadingSkeleton}</div>
          ))}
        </div>
      );
    }
    return (
      <div className={className}>
        <DefaultSkeleton count={loadingCount} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[200px] space-y-4 p-4 ${className}`}>
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-destructive">
            {errorState?.title || 'Error'}
          </p>
          <p className="text-sm text-muted-foreground">
            {errorState?.description || error.message || 'Something went wrong'}
          </p>
        </div>
        {(errorState?.showRetry !== false) && onRetry && (
          <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    if (emptyState) {
      return (
        <div className={`flex flex-col items-center justify-center min-h-[300px] space-y-4 p-4 ${className}`}>
          {emptyState.icon && (
            <div className="text-muted-foreground">{emptyState.icon}</div>
          )}
          <div className="text-center space-y-1">
            <h3 className="font-medium">{emptyState.title}</h3>
            {emptyState.description && (
              <p className="text-sm text-muted-foreground">{emptyState.description}</p>
            )}
          </div>
          {emptyState.action && (
            <Button onClick={emptyState.action.onClick} size="sm">
              {emptyState.action.label}
            </Button>
          )}
        </div>
      );
    }
    return (
      <div className={`flex flex-col items-center justify-center min-h-[200px] p-4 ${className}`}>
        <p className="text-sm text-muted-foreground">No items to display</p>
      </div>
    );
  }

  // Data state - render the list
  return (
    <div className={className}>
      {data.map((item, index) => (
        <React.Fragment key={keyExtractor(item, index)}>
          {renderItem(item, index)}
          {showDivider && index < data.length - 1 && (
            <div className="border-t my-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default DataList;
