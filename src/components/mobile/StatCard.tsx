import { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}

export function StatCard({ label, value, icon, color = 'primary', onClick }: StatCardProps) {
  const colorClasses = {
    primary: 'text-vs-primary',
    success: 'text-vs-success',
    warning: 'text-vs-warning',
    error: 'text-vs-error',
  };

  const dotClasses = {
    primary: 'bg-vs-primary',
    success: 'bg-vs-success',
    warning: 'bg-vs-warning',
    error: 'bg-vs-error',
  };

  return (
    <div
      onClick={onClick}
      className={`flex-1 min-w-0 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {icon ? (
          <div className="w-4 h-4">{icon}</div>
        ) : (
          <div className={`w-2 h-2 rounded-full ${dotClasses[color]}`}></div>
        )}
        <span className="text-vs-text-muted text-sm">{label}</span>
      </div>
      <div className={`text-[20px] font-semibold ${colorClasses[color]}`}>{value}</div>
    </div>
  );
}
