import { getStatusConfig } from '../../utils/theme';

interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, showIcon = true, size = 'md' }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  
  const sizeClasses = {
    sm: 'text-sm px-2 py-0.5',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div
      className={`status-badge ${sizeClasses[size]}`}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {showIcon && <div className={`w-2 h-2 rounded-full ${config.dotClass}`}></div>}
      {config.label}
    </div>
  );
}
