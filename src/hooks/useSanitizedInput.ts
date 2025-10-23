import { useCallback, ChangeEvent } from 'react';
import { sanitizeInput, containsXSS } from '../utils/formValidation';
import { logger } from '../utils/logger';

interface UseSanitizedInputOptions {
  /**
   * Whether to warn when XSS is detected (uses production-safe logger)
   */
  warnOnXSS?: boolean;
  /**
   * Custom sanitization function
   */
  customSanitize?: (value: string) => string;
  /**
   * Input types that should NOT be sanitized
   */
  skipTypes?: string[];
}

/**
 * Hook to automatically sanitize text input values
 * Protects against XSS attacks by removing dangerous characters
 */
export function useSanitizedInput(options: UseSanitizedInputOptions = {}) {
  const {
    warnOnXSS = true,
    customSanitize,
    skipTypes = ['number', 'date', 'time', 'datetime-local', 'email', 'tel', 'url']
  } = options;

  /**
   * Sanitize onChange handler
   * Wraps the original onChange to sanitize the input value
   */
  const sanitizeOnChange = useCallback(
    (
      originalOnChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
      inputType?: string
    ) => {
      return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Skip sanitization for specific input types
        if (inputType && skipTypes.includes(inputType)) {
          originalOnChange?.(e);
          return;
        }

        const originalValue = e.target.value;

        // Check for XSS patterns
        if (warnOnXSS && containsXSS(originalValue)) {
          logger.warn('[Security] Potential XSS detected in input, sanitizing...');
        }

        // Apply sanitization
        const sanitizedValue = customSanitize
          ? customSanitize(originalValue)
          : sanitizeInput(originalValue);

        // Update the event target value
        e.target.value = sanitizedValue;

        // Call the original onChange handler
        originalOnChange?.(e);
      };
    },
    [warnOnXSS, customSanitize, skipTypes]
  );

  /**
   * Sanitize a single value
   */
  const sanitizeValue = useCallback(
    (value: string): string => {
      if (warnOnXSS && containsXSS(value)) {
        logger.warn('[Security] Potential XSS detected in value, sanitizing...');
      }

      return customSanitize ? customSanitize(value) : sanitizeInput(value);
    },
    [warnOnXSS, customSanitize]
  );

  return {
    sanitizeOnChange,
    sanitizeValue,
  };
}
