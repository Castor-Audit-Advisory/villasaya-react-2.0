import { ReactNode, InputHTMLAttributes, useId, ChangeEvent } from 'react';
import { sanitizeInput } from '../../utils/formValidation';

interface MobileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
  /**
   * Disable automatic input sanitization (default: false)
   * Set to true for inputs that should not be sanitized (e.g., passwords)
   */
  disableSanitization?: boolean;
}

export function MobileInput({
  label,
  error,
  leftIcon,
  rightIcon,
  containerClassName = '',
  className = '',
  id,
  disableSanitization = false,
  onChange,
  type = 'text',
  ...props
}: MobileInputProps) {
  // Generate stable unique IDs for accessibility using React 18 useId hook
  const reactId = useId();
  const inputId = id || reactId;
  const errorId = error ? `${inputId}-error` : undefined;
  
  // Input types that should never be sanitized
  const skipSanitization = ['number', 'date', 'time', 'datetime-local', 'email', 'tel', 'url', 'password', 'search'];
  
  // Handle onChange with automatic sanitization for text inputs only
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only sanitize if: not disabled, is text type, and type is not in skip list
    const shouldSanitize = !disableSanitization && 
                          type === 'text' && 
                          !skipSanitization.includes(type);
    
    if (shouldSanitize) {
      const originalValue = e.target.value;
      const sanitizedValue = sanitizeInput(originalValue);
      e.target.value = sanitizedValue;
    }
    onChange?.(e);
  };
  
  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="text-vs-text-secondary text-[14px] font-medium block mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10" aria-hidden="true">
            {leftIcon}
          </div>
        )}
        <input
          {...props}
          type={type}
          id={inputId}
          onChange={handleChange}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId}
          className={`
            mobile-input
            ${leftIcon ? 'pl-12' : ''}
            ${rightIcon ? 'pr-12' : ''}
            ${error ? 'border-vs-error' : ''}
            ${className}
          `}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10" aria-hidden="true">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="mt-2 text-vs-error text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
