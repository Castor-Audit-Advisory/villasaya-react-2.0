import React, { useState } from 'react';
import { ChevronLeft, Calendar, User, Flag, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { validateField } from '../../utils/formValidation';
import { toast } from 'sonner';

interface MobileTaskCreateProps {
  villas: any[];
  onBack: () => void;
  onCreate: (taskData: any) => void;
}

export function MobileTaskCreate({ villas, onBack, onCreate }: MobileTaskCreateProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    villa_id: villas[0]?.id || '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    assignee: '',
    supervisor: '',
  });
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const validateFormField = (field: string, value: string) => {
    let validation;
    
    if (field === 'title') {
      validation = validateField(value, {
        required: 'Please enter a task title',
        minLength: { value: 3, message: 'Title must be at least 3 characters' }
      });
    } else if (field === 'description') {
      validation = validateField(value, {
        required: 'Please enter a description',
        minLength: { value: 10, message: 'Description must be at least 10 characters' }
      });
    } else if (field === 'villa_id') {
      validation = validateField(value, { required: 'Please select a villa' });
    } else {
      validation = { isValid: true };
    }

    setFieldErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? '' : validation.error || ''
    }));

    return validation.isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const titleValid = validateFormField('title', formData.title);
    const descriptionValid = validateFormField('description', formData.description);
    const villaValid = validateFormField('villa_id', formData.villa_id);

    if (!titleValid || !descriptionValid || !villaValid) {
      toast.error('Please fix all errors before creating the task');
      return;
    }

    onCreate(formData);
  };

  return (
    <div className="min-h-dvh bg-[#F8F8F8] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      {/* Status Bar */}
      <div className="bg-white px-6 sm:px-8 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2">
        <div className="text-[#1F1F1F] text-[15px]">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
      </div>

      {/* Header */}
      <div className="bg-white px-6 sm:px-8 py-4 flex items-center gap-4 border-b border-[#E8E8E8]">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-[#5E5873]" />
        </button>
        <h1 className="text-[#1F1F1F] text-[18px] font-semibold">Create Task</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 pb-24">
        <div className="mb-6">
          <h3 className="text-[#1F1F1F] text-[16px] font-semibold mb-1">Task Information</h3>
          <p className="text-[#B9B9C3] text-sm">Fill in the task details</p>
        </div>

        {/* Task Title */}
        <div className="mb-5">
          <label className="text-[#5E5873] text-[14px] font-medium block mb-2">Task Title</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <FileText className="w-5 h-5 text-[#7B5FEB]" />
            </div>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: '' }));
              }}
              onBlur={() => validateFormField('title', formData.title)}
              placeholder="Enter task title"
              className={`w-full h-[56px] pl-12 pr-4 bg-white border-2 rounded-xl text-[15px] placeholder:text-[#B9B9C3] focus:border-[#7B5FEB] focus:outline-none transition-colors ${fieldErrors.title ? 'border-red-500' : 'border-[#E8E8E8]'}`}
              required
            />
          </div>
          {fieldErrors.title && (
            <p className="mt-2 text-red-600 text-sm">{fieldErrors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="text-[#5E5873] text-[14px] font-medium block mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              if (fieldErrors.description) setFieldErrors(prev => ({ ...prev, description: '' }));
            }}
            onBlur={() => validateFormField('description', formData.description)}
            placeholder="Enter task description"
            className={`w-full min-h-[120px] p-4 bg-white border-2 rounded-xl text-[15px] placeholder:text-[#B9B9C3] focus:border-[#7B5FEB] focus:outline-none transition-colors resize-none ${fieldErrors.description ? 'border-red-500' : 'border-[#E8E8E8]'}`}
            required
          />
          {fieldErrors.description && (
            <p className="mt-2 text-red-600 text-sm">{fieldErrors.description}</p>
          )}
        </div>

        {/* Villa Selection */}
        <div className="mb-5">
          <label className="text-[#5E5873] text-[14px] font-medium block mb-2">Villa</label>
          <Select value={formData.villa_id} onValueChange={(value) => setFormData({ ...formData, villa_id: value })}>
            <SelectTrigger className="w-full h-[56px] bg-white border-2 border-[#E8E8E8] rounded-xl text-[15px] focus:border-[#7B5FEB]">
              <SelectValue placeholder="Select Villa" />
            </SelectTrigger>
            <SelectContent>
              {villas.map((villa) => (
                <SelectItem key={villa.id} value={villa.id}>
                  {villa.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="mb-5">
          <label className="text-[#5E5873] text-[14px] font-medium block mb-2">Priority</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Flag className="w-5 h-5 text-[#7B5FEB]" />
            </div>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger className="w-full h-[56px] pl-12 pr-4 bg-white border-2 border-[#E8E8E8] rounded-xl text-[15px] focus:border-[#7B5FEB]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Due Date */}
        <div className="mb-5">
          <label className="text-[#5E5873] text-[14px] font-medium block mb-2">Due Date</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Calendar className="w-5 h-5 text-[#7B5FEB]" />
            </div>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full h-[56px] pl-12 pr-4 bg-white border-2 border-[#E8E8E8] rounded-xl text-[15px] focus:border-[#7B5FEB] focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* Assignee */}
        <div className="mb-5">
          <label className="text-[#5E5873] text-[14px] font-medium block mb-2">Assign To</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <User className="w-5 h-5 text-[#7B5FEB]" />
            </div>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              placeholder="Enter assignee name"
              className="w-full h-[56px] pl-12 pr-4 bg-white border-2 border-[#E8E8E8] rounded-xl text-[15px] placeholder:text-[#B9B9C3] focus:border-[#7B5FEB] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Create Button */}
        <button
          type="submit"
          className="w-full h-[56px] bg-gradient-to-r from-[#7B5FEB] to-[#6B4FDB] text-white rounded-full font-semibold text-[16px] shadow-xl shadow-[#7B5FEB]/30 active:scale-[0.98] transition-transform px-6 flex items-center justify-center"
        >
          Create Task
        </button>
      </form>
    </div>
  );
}
