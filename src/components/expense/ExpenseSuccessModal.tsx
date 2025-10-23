import { Receipt } from 'lucide-react';

interface ExpenseSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewHistory: () => void;
}

export function ExpenseSuccessModal({ isOpen, onClose, onViewHistory }: ExpenseSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-8 mx-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] rounded-3xl flex items-center justify-center shadow-lg shadow-[#7B5FEB]/30">
            <Receipt className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-[#1F1F1F] text-[24px] font-semibold mb-3">
            Expense Submitted!
          </h2>
          <p className="text-[#6E6B7B] text-[15px] leading-relaxed">
            Your expense report is in! You'll receive your reimbursement with your payroll.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onViewHistory}
          className="w-full h-[56px] bg-gradient-to-r from-[#7B5FEB] to-[#6B4FDB] text-white rounded-full font-semibold text-[16px] shadow-xl shadow-[#7B5FEB]/30 active:scale-[0.98] transition-transform px-6 flex items-center justify-center"
        >
          View Expense History
        </button>
      </div>
    </div>
  );
}
