import { useState, useEffect } from 'react';
import { Bookmark, ChevronDown, Sparkles } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';

interface ExpenseTemplate {
  id: string;
  name: string;
  category: string;
  amount: number | null;
  description: string;
  usageCount: number;
}

interface ExpenseTemplateSelectorProps {
  villaId?: string;
  onSelectTemplate: (template: ExpenseTemplate) => void;
}

export function ExpenseTemplateSelector({
  villaId,
  onSelectTemplate,
}: ExpenseTemplateSelectorProps) {
  const [templates, setTemplates] = useState<ExpenseTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && templates.length === 0) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = async () => {
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
  };

  const handleSelectTemplate = async (template: ExpenseTemplate) => {
    try {
      // Increment usage count
      await apiRequest(`/expense-templates/${template.id}/use`, {
        method: 'POST',
      });

      onSelectTemplate(template);
      setOpen(false);
      toast.success(`Using template: ${template.name}`);
    } catch (error: any) {
      console.error('Error using template:', error);
      // Still allow template usage even if tracking fails
      onSelectTemplate(template);
      setOpen(false);
    }
  };

  if (templates.length === 0 && !loading && open) {
    return null; // Don't show if no templates
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Use Template
          <ChevronDown className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2">
        <div className="space-y-1">
          <div className="px-3 py-2 text-sm font-medium text-gray-700">
            Quick Templates
          </div>
          {loading ? (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No templates yet
            </div>
          ) : (
            templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleSelectTemplate(template)}
                className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bookmark className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate text-sm">
                    {template.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-gray-600 capitalize">
                      {template.category}
                    </span>
                    {template.amount && (
                      <>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm font-medium text-indigo-600">
                          ${template.amount.toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
