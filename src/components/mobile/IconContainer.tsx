import { ReactNode } from 'react';

interface IconContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export function IconContainer({
  children,
  size = 'md',
  variant = 'primary',
  className = '',
}: IconContainerProps) {
  const sizeClasses = {
    sm: 'icon-container-sm',
    md: 'icon-container-md',
    lg: 'icon-container-lg',
  };

  const variantClasses = {
    primary: 'bg-vs-primary/10 text-vs-primary',
    success: 'bg-vs-success/10 text-vs-success',
    warning: 'bg-vs-warning/10 text-vs-warning',
    error: 'bg-vs-error/10 text-vs-error',
    info: 'bg-vs-info/10 text-vs-info',
    neutral: 'bg-vs-gray-200 text-vs-text-secondary',
  };

  return (
    <div className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}
