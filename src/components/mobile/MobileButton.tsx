import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface MobileButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  type = 'button',
  icon,
  fullWidth = true,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: MobileButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-primary text-white shadow-xl',
    secondary: 'bg-vs-gray-200 text-vs-text-secondary',
    success: 'bg-gradient-success text-white shadow-lg shadow-[#28C76F]/30',
    error: 'bg-gradient-error text-white shadow-lg shadow-[#EA5455]/30',
    outline: 'bg-white border-2 border-vs-primary text-vs-primary',
  };

  const sizeClasses = {
    sm: 'h-[48px] text-[14px]',
    md: 'h-[52px] text-[15px]',
    lg: 'h-[56px] text-[16px]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={`
        mobile-button
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
        flex items-center justify-center gap-2
        px-6
        ${className}
      `}
    >
      {loading && <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />}
      {!loading && icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
}
