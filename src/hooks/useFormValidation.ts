import React, { useState, useCallback } from 'react';
import { ValidationRule, validateField, validateForm } from '../utils/formValidation';

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface TouchedFields {
  [key: string]: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, ValidationRule>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate a single field
   */
  const validateSingleField = useCallback(
    (fieldName: keyof T, value: any): string | undefined => {
      const rules = validationRules[fieldName];
      if (!rules) return undefined;

      const result = validateField(value, rules);
      return result.isValid ? undefined : result.error;
    },
    [validationRules]
  );

  /**
   * Handle field change
   */
  const handleChange = useCallback(
    (fieldName: keyof T) => (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const value = event.target.value;
      setValues((prev) => ({ ...prev, [fieldName]: value }));

      // Validate on change if field has been touched
      if (touched[fieldName as string]) {
        const error = validateSingleField(fieldName, value);
        setErrors((prev) => ({ ...prev, [fieldName as string]: error }));
      }
    },
    [touched, validateSingleField]
  );

  /**
   * Handle field value change (for non-event values)
   */
  const setValue = useCallback(
    (fieldName: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [fieldName]: value }));

      // Validate on change if field has been touched
      if (touched[fieldName as string]) {
        const error = validateSingleField(fieldName, value);
        setErrors((prev) => ({ ...prev, [fieldName as string]: error }));
      }
    },
    [touched, validateSingleField]
  );

  /**
   * Handle field blur (mark as touched and validate)
   */
  const handleBlur = useCallback(
    (fieldName: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [fieldName as string]: true }));

      // Validate on blur
      const error = validateSingleField(fieldName, values[fieldName]);
      setErrors((prev) => ({ ...prev, [fieldName as string]: error }));
    },
    [values, validateSingleField]
  );

  /**
   * Validate all fields
   */
  const validateAllFields = useCallback((): boolean => {
    const validation = validateForm(values, validationRules as any);
    setErrors(validation.errors);

    // Mark all fields as touched
    const allTouched: TouchedFields = {};
    Object.keys(validationRules).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    return validation.isValid;
  }, [values, validationRules]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) =>
      async (event: React.FormEvent) => {
        event.preventDefault();
        
        const isValid = validateAllFields();
        if (!isValid) {
          return;
        }

        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      },
    [values, validateAllFields]
  );

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Get field props (for easy binding to inputs)
   */
  const getFieldProps = useCallback(
    (fieldName: keyof T) => ({
      value: values[fieldName],
      onChange: handleChange(fieldName),
      onBlur: handleBlur(fieldName),
      error: touched[fieldName as string] ? errors[fieldName as string] : undefined,
    }),
    [values, errors, touched, handleChange, handleBlur]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    resetForm,
    validateAllFields,
    getFieldProps,
  };
}
