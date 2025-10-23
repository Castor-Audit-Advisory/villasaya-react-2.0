import { ReactNode, KeyboardEvent } from 'react';

interface MobileCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  'aria-label'?: string;
  role?: string;
}

export function MobileCard({ 
  children, 
  onClick, 
  className = '',
  padding = 'md',
  'aria-label': ariaLabel,
  role
}: MobileCardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  // If clickable, make it keyboard accessible
  const interactiveProps = onClick ? {
    role: role || 'button',
    tabIndex: 0,
    'aria-label': ariaLabel,
    onKeyDown: handleKeyDown,
  } : {};

  return (
    <div
      onClick={onClick}
      className={`
        mobile-card
        ${paddingClasses[padding]}
        ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}
        ${className}
      `}
      {...interactiveProps}
    >
      {children}
    </div>
  );
}
