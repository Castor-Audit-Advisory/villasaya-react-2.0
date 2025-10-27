import React, { useState } from 'react';
import { ChevronLeft, Upload, Calendar, DollarSign, Wallet, Bookmark } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MobileFileUpload } from '../mobile/MobileFileUpload';
import { MobileExpenseTemplates } from './MobileExpenseTemplates';
import { useExpenseSubmit } from '../../hooks/useExpenseSubmit';

interface MobileExpenseSubmitProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
  villaId?: string;
}

export function MobileExpenseSubmit({ onBack, onSubmit, villaId }: MobileExpenseSubmitProps) {
  // Use custom hook for all form management logic
  const {
    formData,
    fieldErrors,
    uploadedFiles,
    handleFieldChange,
    handleFilesChange,
    handleSubmit,
    handleUseTemplate,
    validateField: validateFormField,
  } = useExpenseSubmit({
    villaId,
    onSubmit,
  });

  const [showTemplates, setShowTemplates] = useState(false);

  const handleTemplateSelect = (template: any) => {
    handleUseTemplate(template);
    setShowTemplates(false);
  };

  if (showTemplates) {
    return (
      <MobileExpenseTemplates
        villaId={villaId}
        onSelectTemplate={handleTemplateSelect}
        onBack={() => setShowTemplates(false)}
      />
    );
  }

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
          className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-[#5E5873]" />
        </button>
        <h1 className="text-[#1F1F1F] text-[18px] font-semibold flex-1">Submit Expense</h1>
        <button
          onClick={() => setShowTemplates(true)}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-[#F3F2F7] hover:bg-[#E8E7F0]"
          title="Use Template"
        >
          <Bookmark className="w-5 h-5 text-[#7B5FEB]" />
        </button>
      </div>

      {/* Banner */}
      <div className="mx-6 mt-6 mb-4">
        <div className="bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] rounded-2xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-white text-[18px] font-semibold mb-1">
              Ensure All Document Well Prepared
            </h2>
            <p className="text-white/80 text-sm">1000+ Expenses already approved</p>
          </div>
          {/* Illustration placeholder */}
          <div className="absolute bottom-0 right-4 w-32 h-24 flex items-end justify-end gap-2 pb-4">
            <div className="w-14 h-14 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center text-2xl">
              👤
            </div>
            <div className="w-14 h-14 bg-pink-300/40 rounded-full backdrop-blur-sm flex items-center justify-center text-2xl transform translate-y-2">
              👤
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center text-2xl">
              👤
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 pb-24">
        <div className="mb-6">
          <h3 className="text-[#1F1F1F] text-[16px] font-semibold mb-1">
            Fill Claim Information
          </h3>
          <p className="text-[#B9B9C3] text-sm">Information about claim details</p>
        </div>

        {/* Upload Document */}
        <div className="mb-5">
          <label className="text-[#5E5873] text-[14px] font-medium block mb-3">
            Upload Receipts
          </label>
          <MobileFileUpload
            onFilesChange={handleFilesChange}
            maxFiles={5}
            existingFiles={uploadedFiles}
          />
        </div>

        {/* Expense Category */}
        <div className="mb-5">
          <label className="text-[#5E5873] text-[14px] font-medium block mb-2">
            Expense Category
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Wallet className="w-5 h-5 text-[#7B5FEB]" />
            </div>
            <Select value={formData.category} onValueChange={(value) => {
              handleFieldChange('category', value);
              if (fieldErrors.category) validateFormField('category', value);
            }}>
              <SelectTrigger className={`w-full h-[56px] pl-12 pr-4 bg-white border-2 rounded-xl text-[15px] focus:border-[#7B5FEB] ${fieldErrors.category ? 'border-red-500' : 'border-[#E8E8E8]'}`}>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="meals">Meals & Entertainment</SelectItem>
                <SelectItem value="office">Office Supplies</SelectItem>
                <SelectItem value="training">Training & Development</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {fieldErrors.category && (
            <p className="mt-2 text-red-600 text-sm">{fieldErrors.category}</p>
          )}
        </div>

        {/* Transaction Date */}
        <div className="mb-5">
          <label className="text-[#5E5873] text-[14px] font-medium block mb-2">
            Transaction Date
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <Calendar className="w-5 h-5 text-[#7B5FEB]" />
            </div>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleFieldChange('date', e.target.value)}
              onBlur={() => validateFormField('date', formData.date)}
              className={`w-full h-[56px] pl-12 pr-4 bg-white border-2 rounded-xl text-[15px] focus:border-[#7B5FEB] focus:outline-none transition-colors ${fieldErrors.date ? 'border-red-500' : 'border-[#E8E8E8]'}`}
              required
            />
          </div>
          {fieldErrors.date && (
            <p className="mt-2 text-red-600 text-sm">{fieldErrors.date}</p>
          )}
        </div>

        {/* Expense Amount */}
        <div className="mb-5">
          <label className="text-[#5E5873] text-[14px] font-medium block mb-2">
            Expense Amount ($USD)
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              <DollarSign className="w-5 h-5 text-[#7B5FEB]" />
            </div>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => handleFieldChange('amount', e.target.value)}
              onBlur={() => validateFormField('amount', parseFloat(formData.amount))}
              placeholder="Enter Amount"
              className={`w-full h-[56px] pl-12 pr-4 bg-white border-2 rounded-xl text-[15px] placeholder:text-[#B9B9C3] focus:border-[#7B5FEB] focus:outline-none transition-colors ${fieldErrors.amount ? 'border-red-500' : 'border-[#E8E8E8]'}`}
              required
              min="0"
              step="0.01"
            />
          </div>
          {fieldErrors.amount && (
            <p className="mt-2 text-red-600 text-sm">{fieldErrors.amount}</p>
          )}
        </div>

        {/* Expense Description */}
        <div className="mb-5">
          <label className="text-[#5E5873] text-[14px] font-medium block mb-2">
            Expense Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            onBlur={() => validateFormField('description', formData.description)}
            placeholder="Enter Expense Description"
            className={`w-full min-h-[120px] p-4 bg-white border-2 rounded-xl text-[15px] placeholder:text-[#B9B9C3] focus:border-[#7B5FEB] focus:outline-none transition-colors resize-none ${fieldErrors.description ? 'border-red-500' : 'border-[#E8E8E8]'}`}
            required
          />
          {fieldErrors.description && (
            <p className="mt-2 text-red-600 text-sm">{fieldErrors.description}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full h-[56px] bg-gradient-to-r from-[#A89BF5] to-[#9B8DF5] text-white rounded-full font-semibold text-[16px] shadow-lg shadow-[#7B5FEB]/20 active:scale-[0.98] transition-transform disabled:opacity-50 px-6 flex items-center justify-center"
        >
          Submit Expense
        </button>
      </form>
    </div>
  );
}
