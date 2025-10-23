import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

// Loading spinner component
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`} 
      aria-label="Loading"
    />
  );
};

// Full page loading state
export const PageLoading: React.FC<{
  message?: string;
}> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

// Inline loading state for sections
export const SectionLoading: React.FC<{
  message?: string;
  height?: string;
}> = ({ message = 'Loading...', height = '200px' }) => {
  return (
    <div 
      className="flex flex-col items-center justify-center space-y-2"
      style={{ minHeight: height }}
    >
      <LoadingSpinner size="md" />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
};

// Button loading state
export const ButtonLoading: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
}> = ({ 
  loading, 
  children, 
  loadingText = 'Loading...', 
  onClick, 
  className = '',
  variant = 'default',
  size = 'default',
  disabled = false
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={loading || disabled}
      className={className}
      variant={variant}
      size={size}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
};

// Card loading skeleton
export const CardSkeleton: React.FC<{
  lines?: number;
  showImage?: boolean;
}> = ({ lines = 3, showImage = false }) => {
  return (
    <div className="p-4 border rounded-lg space-y-3 animate-pulse">
      {showImage && (
        <div className="h-48 bg-muted rounded-md" />
      )}
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
};

// Table loading skeleton
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
}> = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex space-x-4 p-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-muted rounded flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 p-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="h-4 bg-muted rounded flex-1 animate-pulse"
              style={{ animationDelay: `${(rowIndex * 100) + (colIndex * 50)}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// List loading skeleton
export const ListSkeleton: React.FC<{
  items?: number;
}> = ({ items = 5 }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="h-10 w-10 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Error state with retry
export const ErrorState: React.FC<{
  error: string;
  onRetry?: () => void;
  showRetry?: boolean;
}> = ({ error, onRetry, showRetry = true }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4 p-4">
      <div className="text-center space-y-2">
        <p className="text-sm font-medium text-destructive">Error</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
      {showRetry && onRetry && (
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
};

// Empty state
export const EmptyState: React.FC<{
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}> = ({ title, description, action, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4 p-4">
      {icon && (
        <div className="text-muted-foreground">{icon}</div>
      )}
      <div className="text-center space-y-1">
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Loading overlay for existing content
export const LoadingOverlay: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  message?: string;
}> = ({ loading, children, message }) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-2">
            <LoadingSpinner size="md" />
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Progress indicator
export const ProgressIndicator: React.FC<{
  value: number;
  max?: number;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ value, max = 100, showPercent = true, size = 'md' }) => {
  const percentage = Math.min(100, (value / max) * 100);
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="space-y-1">
      <div className={`w-full bg-muted rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercent && (
        <p className="text-sm text-muted-foreground text-right">
          {Math.round(percentage)}%
        </p>
      )}
    </div>
  );
};