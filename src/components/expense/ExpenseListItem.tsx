import { Calendar } from 'lucide-react';

interface ExpenseListItemProps {
  date: string;
  type: string;
  amount: number;
  status?: 'review' | 'approved' | 'rejected';
}

export function ExpenseListItem({ date, type, amount, status = 'review' }: ExpenseListItemProps) {
  const statusConfig: Record<Required<ExpenseListItemProps>['status'], { label: string; badgeClass: string; dotClass: string }> = {
    review: {
      label: 'Pending Review',
      badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      dotClass: 'bg-amber-500',
    },
    approved: {
      label: 'Approved',
      badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      dotClass: 'bg-emerald-500',
    },
    rejected: {
      label: 'Rejected',
      badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
      dotClass: 'bg-rose-500',
    },
  };

  const statusStyles = statusConfig[status];

  return (
    <div className="bg-white rounded-2xl p-4 mb-3">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F3F2F7] rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-[#7B5FEB]" />
          </div>
          <span className="text-[#5E5873] text-[15px] font-medium">{date}</span>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold leading-none ${statusStyles.badgeClass}`}
        >
          <span className={`h-2 w-2 rounded-full ${statusStyles.dotClass}`} aria-hidden="true" />
          {statusStyles.label}
        </span>
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
