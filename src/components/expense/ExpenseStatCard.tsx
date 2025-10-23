interface ExpenseStatCardProps {
  label: string;
  amount: number;
  icon: 'total' | 'review' | 'approved';
}

export function ExpenseStatCard({ label, amount, icon }: ExpenseStatCardProps) {
  const iconColors = {
    total: 'bg-purple-100',
    review: 'bg-orange-100',
    approved: 'bg-green-100',
  };

  const dotColors = {
    total: 'bg-[#7B5FEB]',
    review: 'bg-[#FF9F43]',
    approved: 'bg-[#28C76F]',
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-2 h-2 rounded-full ${dotColors[icon]}`}></div>
        <span className="text-[#6E6B7B] text-sm">{label}</span>
      </div>
      <div className="text-[#1F1F1F] text-[20px] font-semibold">${amount}</div>
    </div>
  );
}
