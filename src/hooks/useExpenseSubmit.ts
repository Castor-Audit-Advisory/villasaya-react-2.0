/**
 * useExpenseSubmit Hook
 * 
 * Custom hook for managing expense submission form including:
 * - Form state management
 * - Real-time field validation
 * - File upload handling
 * - Form submission
 * 
 * @example
 * ```tsx
 * const {
 *   formData,
 *   fieldErrors,
 *   uploadedFiles,
 *   handleFieldChange,
 *   handleFilesChange,
 *   handleSubmit,
 *   handleUseTemplate,
 *   validateField: validateFormField
 * } = useExpenseSubmit({
 *   villaId: 'villa-123',
 *   onSubmit: (data) => console.log('Submitted:', data)
 * });
 * ```
 */

import React, { useState, useCallback } from 'react';
import { validateField as validateFieldUtil } from '../utils/formValidation';
import { toast } from 'sonner';

export interface ExpenseFormData {
  category: string;
  date: string;
  amount: string;
  description: string;
}

export interface UseExpenseSubmitOptions {
  /** Villa ID for the expense */
  villaId?: string;
  
  /** Callback when form is submitted successfully */
  onSubmit: (data: any) => void;
  
  /** Initial form data (optional) */
  initialData?: Partial<ExpenseFormData>;
}

export interface UseExpenseSubmitResult {
  /** Current form data */
  formData: ExpenseFormData;
  
  /** Field validation errors */
  fieldErrors: { [key: string]: string };
  
  /** Uploaded files */
  uploadedFiles: any[];
  
  /** Update a form field value */
  handleFieldChange: (field: keyof ExpenseFormData, value: string) => void;
  
  /** Update uploaded files */
  handleFilesChange: (files: any[]) => void;
  
  /** Submit the form */
  handleSubmit: (e: React.FormEvent) => void;
  
  /** Apply a template to the form */
  handleUseTemplate: (template: any) => void;
  
  /** Validate a specific field */
  validateField: (field: string, value: string | number) => boolean;
  
  /** Reset the form */
  resetForm: () => void;
}

export function useExpenseSubmit(
  options: UseExpenseSubmitOptions
): UseExpenseSubmitResult {
  const { villaId, onSubmit, initialData = {} } = options;

  const defaultFormData: ExpenseFormData = {
    category: initialData.category || '',
    date: initialData.date || '',
    amount: initialData.amount || '',
    description: initialData.description || '',
  };

  const [formData, setFormData] = useState<ExpenseFormData>(defaultFormData);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  /**
   * Validate a form field
   */
  const validateField = useCallback((field: string, value: string | number): boolean => {
    let validation;

    if (field === 'category') {
      validation = validateFieldUtil(value, { required: 'Please select a category' });
    } else if (field === 'date') {
      validation = validateFieldUtil(value, { required: 'Please select a date' });
    } else if (field === 'amount') {
      validation = validateFieldUtil(value, {
        required: 'Please enter an amount',
        min: { value: 0.01, message: 'Amount must be greater than 0' },
      });
    } else if (field === 'description') {
      validation = validateFieldUtil(value, {
        required: 'Please enter a description',
        minLength: { value: 10, message: 'Description must be at least 10 characters' },
      });
    } else {
      validation = { isValid: true };
    }

    setFieldErrors((prev) => ({
      ...prev,
      [field]: validation.isValid ? '' : validation.error || '',
    }));

    return validation.isValid;
  }, []);

  /**
   * Update a form field value
   */
  const handleFieldChange = useCallback((field: keyof ExpenseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error for this field if it exists
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }, [fieldErrors]);

  /**
   * Update uploaded files
   */
  const handleFilesChange = useCallback((files: any[]) => {
    setUploadedFiles(files);
  }, []);

  /**
   * Submit the form
   */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const categoryValid = validateField('category', formData.category);
    const dateValid = validateField('date', formData.date);
    const amountValid = validateField('amount', parseFloat(formData.amount));
    const descriptionValid = validateField('description', formData.description);

    if (!categoryValid || !dateValid || !amountValid || !descriptionValid) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    onSubmit({
      ...formData,
      villa_id: villaId,
      status: 'pending',
      files: uploadedFiles,
    });
  }, [formData, uploadedFiles, villaId, onSubmit, validateField]);

  /**
   * Apply a template to the form
   */
  const handleUseTemplate = useCallback((template: any) => {
    setFormData((prev) => ({
      category: template.category,
      date: prev.date, // Keep current date
      amount: template.amount?.toString() || '',
      description: template.description,
    }));
  }, []);

  /**
   * Reset the form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
    setFieldErrors({});
    setUploadedFiles([]);
  }, [defaultFormData]);

  return {
    formData,
    fieldErrors,
    uploadedFiles,
    handleFieldChange,
    handleFilesChange,
    handleSubmit,
    handleUseTemplate,
    validateField,
    resetForm,
  };
}
