import React, { useState } from 'react';
import { Plus, Edit, Trash2, Bookmark, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useExpenseTemplates, ExpenseTemplate } from '../../hooks/useExpenseTemplates';

interface ExpenseTemplateManagerProps {
  villaId?: string;
  onSelectTemplate?: (template: ExpenseTemplate) => void;
  compact?: boolean;
}

export function ExpenseTemplateManager({
  villaId,
  onSelectTemplate,
  compact = false,
}: ExpenseTemplateManagerProps) {
  // Use custom hook for all template management logic
  const {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    useTemplate,
  } = useExpenseTemplates({
    villaId,
    onTemplateSelect: onSelectTemplate,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ExpenseTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    description: '',
  });

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createTemplate({
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : null,
    });

    if (result) {
      resetForm();
      setDialogOpen(false);
    }
  };

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    const result = await updateTemplate(editingTemplate.id, {
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : null,
    });

    if (result) {
      resetForm();
      setDialogOpen(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    await deleteTemplate(templateId);
  };

  const handleUseTemplate = async (template: ExpenseTemplate) => {
    await useTemplate(template);
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (template: ExpenseTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      amount: template.amount?.toString() || '',
      description: template.description,
    });
    setDialogOpen(true);
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

  if (loading) {
    return <div className="text-gray-500">Loading templates...</div>;
  }

  if (compact && templates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Expense Templates</h3>
          <p className="text-sm text-gray-600">Save frequently used expenses</p>
        </div>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Template List */}
      {templates.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No templates yet</p>
          <p className="text-sm text-gray-500 mb-4">
            Create templates for frequently used expenses
          </p>
          <Button onClick={openCreateDialog} variant="outline" size="sm">
            Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleUseTemplate(template)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {template.category}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(template);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                    className="p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {template.amount && (
                <div className="text-lg font-bold text-indigo-600 mb-2">
                  ${template.amount.toFixed(2)}
                </div>
              )}

              {template.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {template.description}
                </p>
              )}

              <div className="flex items-center text-sm text-gray-500">
                <TrendingUp className="w-3 h-3 mr-1" />
                Used {template.usageCount || 0} times
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Weekly Groceries"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
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

              <div>
                <Label htmlFor="amount">Default Amount (optional)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add a description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
