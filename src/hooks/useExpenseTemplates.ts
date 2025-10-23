/**
 * useExpenseTemplates Hook
 * 
 * Custom hook for managing expense templates including:
 * - Loading templates from API
 * - Creating new templates
 * - Updating existing templates
 * - Deleting templates
 * - Tracking template usage
 * 
 * @example
 * ```tsx
 * const {
 *   templates,
 *   loading,
 *   createTemplate,
 *   updateTemplate,
 *   deleteTemplate,
 *   useTemplate,
 *   refresh
 * } = useExpenseTemplates({
 *   villaId: 'villa-123',
 *   onTemplateSelect: (template) => console.log('Selected:', template)
 * });
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../utils/api';
import { toast } from 'sonner';

export interface ExpenseTemplate {
  id: string;
  name: string;
  category: string;
  amount: number | null;
  description: string;
  usageCount: number;
  lastUsedAt?: string;
}

export interface UseExpenseTemplatesOptions {
  /** Villa ID to filter templates (optional) */
  villaId?: string;
  
  /** Callback when a template is selected/used */
  onTemplateSelect?: (template: ExpenseTemplate) => void;
}

export interface UseExpenseTemplatesResult {
  /** List of expense templates */
  templates: ExpenseTemplate[];
  
  /** Loading state for initial fetch */
  loading: boolean;
  
  /** Create a new template */
  createTemplate: (data: {
    name: string;
    category: string;
    amount: number | null;
    description: string;
  }) => Promise<ExpenseTemplate | null>;
  
  /** Update an existing template */
  updateTemplate: (
    templateId: string,
    data: {
      name: string;
      category: string;
      amount: number | null;
      description: string;
    }
  ) => Promise<ExpenseTemplate | null>;
  
  /** Delete a template */
  deleteTemplate: (templateId: string) => Promise<boolean>;
  
  /** Use a template and track its usage */
  useTemplate: (template: ExpenseTemplate) => Promise<void>;
  
  /** Refresh templates list */
  refresh: () => Promise<void>;
}

export function useExpenseTemplates(
  options: UseExpenseTemplatesOptions = {}
): UseExpenseTemplatesResult {
  const { villaId, onTemplateSelect } = options;

  const [templates, setTemplates] = useState<ExpenseTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load templates from API
   */
  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const url = villaId
        ? `/expense-templates?villaId=${villaId}`
        : '/expense-templates';
      const { templates: fetchedTemplates } = await apiRequest(url);
      setTemplates(fetchedTemplates || []);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  /**
   * Create a new template
   */
  const createTemplate = useCallback(async (data: {
    name: string;
    category: string;
    amount: number | null;
    description: string;
  }): Promise<ExpenseTemplate | null> => {
    try {
      const { template } = await apiRequest('/expense-templates', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          villaId,
        }),
      });

      setTemplates((prev) => [...prev, template]);
      toast.success('Template created!');
      return template;
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast.error(error.message || 'Failed to create template');
      return null;
    }
  }, [villaId]);

  /**
   * Update an existing template
   */
  const updateTemplate = useCallback(async (
    templateId: string,
    data: {
      name: string;
      category: string;
      amount: number | null;
      description: string;
    }
  ): Promise<ExpenseTemplate | null> => {
    try {
      const { template } = await apiRequest(`/expense-templates/${templateId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? template : t))
      );
      toast.success('Template updated!');
      return template;
    } catch (error: any) {
      console.error('Error updating template:', error);
      toast.error(error.message || 'Failed to update template');
      return null;
    }
  }, []);

  /**
   * Delete a template
   */
  const deleteTemplate = useCallback(async (templateId: string): Promise<boolean> => {
    try {
      await apiRequest(`/expense-templates/${templateId}`, {
        method: 'DELETE',
      });

      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      toast.success('Template deleted');
      return true;
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error(error.message || 'Failed to delete template');
      return false;
    }
  }, []);

  /**
   * Use a template and track its usage
   */
  const useTemplate = useCallback(async (template: ExpenseTemplate): Promise<void> => {
    try {
      await apiRequest(`/expense-templates/${template.id}/use`, {
        method: 'POST',
      });

      // Update local usage count
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
        )
      );

      onTemplateSelect?.(template);
      toast.success(`Using template: ${template.name}`);
    } catch (error: any) {
      console.error('Error using template:', error);
    }
  }, [onTemplateSelect]);

  /**
   * Initialize: Load templates on mount and when villaId changes
   */
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
    refresh: loadTemplates,
  };
}
