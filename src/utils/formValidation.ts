/**
 * Form Validation Utilities
 * Provides real-time validation feedback for form inputs
 */

export interface ValidationRule {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  validate?: (value: any) => boolean | string;
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate a single field value against rules
 */
export function validateField(value: any, rules: ValidationRule): ValidationResult {
  // Required validation
  if (rules.required) {
    const isEmpty = value === undefined || value === null || value === '' || 
                    (Array.isArray(value) && value.length === 0);
    if (isEmpty) {
      const message = typeof rules.required === 'string' 
        ? rules.required 
        : 'This field is required';
      return { isValid: false, error: message };
    }
  }

  // Skip other validations if value is empty and not required
  if (!value && !rules.required) {
    return { isValid: true };
  }

  // MinLength validation
  if (rules.minLength) {
    const minLength = typeof rules.minLength === 'number' 
      ? rules.minLength 
      : rules.minLength.value;
    const message = typeof rules.minLength === 'object' 
      ? rules.minLength.message 
      : `Minimum length is ${minLength} characters`;
    
    if (String(value).length < minLength) {
      return { isValid: false, error: message };
    }
  }

  // MaxLength validation
  if (rules.maxLength) {
    const maxLength = typeof rules.maxLength === 'number' 
      ? rules.maxLength 
      : rules.maxLength.value;
    const message = typeof rules.maxLength === 'object' 
      ? rules.maxLength.message 
      : `Maximum length is ${maxLength} characters`;
    
    if (String(value).length > maxLength) {
      return { isValid: false, error: message };
    }
  }

  // Pattern validation
  if (rules.pattern) {
    const pattern = rules.pattern instanceof RegExp 
      ? rules.pattern 
      : rules.pattern.value;
    const message = typeof rules.pattern === 'object' && 'message' in rules.pattern
      ? rules.pattern.message 
      : 'Invalid format';
    
    if (!pattern.test(String(value))) {
      return { isValid: false, error: message };
    }
  }

  // Min value validation (for numbers)
  if (rules.min !== undefined) {
    const min = typeof rules.min === 'number' 
      ? rules.min 
      : rules.min.value;
    const message = typeof rules.min === 'object' 
      ? rules.min.message 
      : `Minimum value is ${min}`;
    
    if (Number(value) < min) {
      return { isValid: false, error: message };
    }
  }

  // Max value validation (for numbers)
  if (rules.max !== undefined) {
    const max = typeof rules.max === 'number' 
      ? rules.max 
      : rules.max.value;
    const message = typeof rules.max === 'object' 
      ? rules.max.message 
      : `Maximum value is ${max}`;
    
    if (Number(value) > max) {
      return { isValid: false, error: message };
    }
  }

  // Custom validation
  if (rules.validate) {
    const result = rules.validate(value);
    if (typeof result === 'string') {
      return { isValid: false, error: result };
    }
    if (!result) {
      return { isValid: false, error: 'Validation failed' };
    }
  }

  if (rules.custom) {
    const result = rules.custom(value);
    if (typeof result === 'string') {
      return { isValid: false, error: result };
    }
    if (!result) {
      return { isValid: false, error: 'Validation failed' };
    }
  }

  return { isValid: true };
}

/**
 * Common validation patterns
 */
export const validationPatterns = {
  email: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  phone: {
    value: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,12}$/,
    message: 'Please enter a valid phone number'
  },
  url: {
    value: /^https?:\/\/.+/,
    message: 'Please enter a valid URL'
  },
  alphanumeric: {
    value: /^[a-zA-Z0-9]+$/,
    message: 'Only letters and numbers are allowed'
  },
  numeric: {
    value: /^[0-9]+$/,
    message: 'Only numbers are allowed'
  },
  password: {
    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
  }
};

/**
 * Debounce validation to avoid excessive validation calls
 */
export function debounceValidation(
  fn: Function,
  delay: number = 300
): (...args: any[]) => void {
  let timeoutId: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Validate multiple fields
 */
export function validateForm(
  values: Record<string, any>,
  rules: Record<string, ValidationRule>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.keys(rules).forEach((field) => {
    const result = validateField(values[field], rules[field]);
    if (!result.isValid && result.error) {
      errors[field] = result.error;
      isValid = false;
    }
  });

  return { isValid, errors };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number, currency: string = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Parse currency input (removes non-numeric characters)
 */
export function parseCurrencyInput(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
}

/**
 * Sanitize input (remove potentially dangerous characters and XSS vectors)
 * Protects against: script tags, HTML tags, javascript: URLs, event handlers
 */
export function sanitizeInput(value: string): string {
  if (typeof value !== 'string') return value;
  
  return value
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove all HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove javascript: and data: URLs
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    // Remove event handlers (onclick, onerror, etc.)
    .replace(/on\w+\s*=/gi, '')
    // Trim whitespace
    .trim();
}

/**
 * Sanitize text input for safe display (preserves safe formatting)
 * Use this for user-generated content that needs to be displayed
 */
export function sanitizeTextForDisplay(value: string): string {
  if (typeof value !== 'string') return value;
  
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Check if a string contains potential XSS vectors
 */
export function containsXSS(value: string): boolean {
  if (typeof value !== 'string') return false;
  
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:text\/html/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(value));
}
