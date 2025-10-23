import { useState, useEffect } from 'react';
import { Plus, Bookmark, ChevronRight, Edit, Trash2, ChevronLeft } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';
import { MobileButton, MobileInput, MobileCard } from '../mobile';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ExpenseTemplate {
  id: string;
  name: string;
  category: string;
  amount: number | null;
  description: string;
  usageCount: number;
  lastUsedAt?: string;
}

interface MobileExpenseTemplatesProps {
  villaId?: string;
  onSelectTemplate?: (template: ExpenseTemplate) => void;
  onBack?: () => void;
}

export function MobileExpenseTemplates({
  villaId,
  onSelectTemplate,
  onBack,
}: MobileExpenseTemplatesProps) {
  const [templates, setTemplates] = useState<ExpenseTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExpenseTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    loadTemplates();
  }, [villaId]);

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

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        const { template } = await apiRequest(`/expense-templates/${editingTemplate.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...formData,
            amount: formData.amount ? parseFloat(formData.amount) : null,
          }),
        });
        setTemplates(templates.map((t) => (t.id === template.id ? template : t)));
        toast.success('Template updated!');
      } else {
        const { template } = await apiRequest('/expense-templates', {
          method: 'POST',
          body: JSON.stringify({
            ...formData,
            amount: formData.amount ? parseFloat(formData.amount) : null,
            villaId,
          }),
        });
        setTemplates([...templates, template]);
        toast.success('Template created!');
      }

      resetForm();
      setShowForm(false);
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(error.message || 'Failed to save template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Delete this template?')) return;

    try {
      await apiRequest(`/expense-templates/${templateId}`, {
        method: 'DELETE',
      });
      setTemplates(templates.filter((t) => t.id !== templateId));
      toast.success('Template deleted');
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast.error(error.message || 'Failed to delete template');
    }
  };

  const handleUseTemplate = async (template: ExpenseTemplate) => {
    try {
      await apiRequest(`/expense-templates/${template.id}/use`, {
        method: 'POST',
      });

      setTemplates(
        templates.map((t) =>
          t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
        )
      );

      onSelectTemplate?.(template);
    } catch (error: any) {
      console.error('Error using template:', error);
    }
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    resetForm();
    setShowForm(true);
  };

  const openEditDialog = (template: ExpenseTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      amount: template.amount?.toString() || '',
      description: template.description,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      amount: '',
      description: '',
    });
    setEditingTemplate(null);
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-[#F8F8F8]">
        {/* Header */}
        <div className="bg-white px-6 py-4 flex items-center gap-4 border-b border-[#E8E8E8]">
          <button
            onClick={() => setShowForm(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6 text-[#5E5873]" />
          </button>
          <h1 className="text-[#1F1F1F] text-[18px] font-semibold">
            {editingTemplate ? 'Edit Template' : 'Create Template'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveTemplate} className="p-6 pb-24 space-y-4">
          <MobileCard padding="lg">
            <div className="space-y-4">
              <MobileInput
                label="Template Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Weekly Groceries"
                required
              />

              <div>
                <label className="text-[#5E5873] text-[14px] font-medium block mb-2">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="mobile-input">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="supplies">Supplies</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="meals">Meals</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <MobileInput
                label="Default Amount (optional)"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />

              <div>
                <label className="text-[#5E5873] text-[14px] font-medium block mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Add a description..."
                  className="mobile-input min-h-[100px] resize-none"
                />
              </div>
            </div>
          </MobileCard>

          <MobileButton type="submit" variant="primary">
            {editingTemplate ? 'Update Template' : 'Create Template'}
          </MobileButton>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center gap-4 border-b border-[#E8E8E8]">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-6 h-6 text-[#5E5873]" />
          </button>
        )}
        <h1 className="text-[#1F1F1F] text-[18px] font-semibold flex-1">
          Expense Templates
        </h1>
        <button
          onClick={openCreateDialog}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-primary text-white"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-[#B9B9C3]">Loading templates...</div>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#F3F2F7] rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-[#7B5FEB]" />
            </div>
            <h3 className="text-[#1F1F1F] text-[18px] font-semibold mb-2">
              No Templates Yet
            </h3>
            <p className="text-[#B9B9C3] text-[14px] mb-6">
              Create templates for frequently used expenses
            </p>
            <button
              onClick={openCreateDialog}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-full font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Template
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <MobileCard
                key={template.id}
                padding="md"
                onClick={() => handleUseTemplate(template)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-[#F3F2F7] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bookmark className="w-6 h-6 text-[#7B5FEB]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[#1F1F1F] text-[16px] font-semibold mb-1 truncate">
                      {template.name}
                    </h4>
                    <p className="text-[#B9B9C3] text-sm capitalize mb-1">
                      {template.category}
                    </p>
                    {template.amount && (
                      <p className="text-[#7B5FEB] text-[15px] font-semibold">
                        ${template.amount.toFixed(2)}
                      </p>
                    )}
                    <p className="text-[#B9B9C3] text-sm mt-2">
                      Used {template.usageCount || 0} times
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(template);
                      }}
                      className="p-2 hover:bg-[#F3F2F7] rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-[#7B5FEB]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-[#EA5455]" />
                    </button>
                  </div>
                </div>

                {template.description && (
                  <p className="text-[#5E5873] text-sm mt-3 line-clamp-2">
                    {template.description}
                  </p>
                )}
              </MobileCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
