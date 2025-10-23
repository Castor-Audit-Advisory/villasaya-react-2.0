import { Calendar } from 'lucide-react';

interface ExpenseListItemProps {
  date: string;
  type: string;
  amount: number;
  status?: 'review' | 'approved' | 'rejected';
}

export function ExpenseListItem({ date, type, amount, status = 'review' }: ExpenseListItemProps) {
  return (
    <div className="bg-white rounded-2xl p-4 mb-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-[#F3F2F7] rounded-lg flex items-center justify-center">
          <Calendar className="w-4 h-4 text-[#7B5FEB]" />
        </div>
        <span className="text-[#5E5873] text-[15px] font-medium">{date}</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[#B9B9C3] text-sm mb-1">Type</div>
          <div className="text-[#5E5873] text-[15px] font-medium">{type}</div>
        </div>
        <div className="text-right">
          <div className="text-[#B9B9C3] text-sm mb-1">Total Expense</div>
          <div className="text-[#5E5873] text-[15px] font-semibold">${amount}</div>
        </div>
      </div>
    </div>
  );
}
