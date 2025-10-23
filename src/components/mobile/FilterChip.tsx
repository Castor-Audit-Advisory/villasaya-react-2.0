import { ReactNode } from 'react';

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  badge?: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error';
}

export function FilterChip({
  label,
  active,
  onClick,
  count,
  badge,
  variant = 'primary',
}: FilterChipProps) {
  const variantColors = {
    primary: 'bg-vs-primary text-white',
    success: 'bg-vs-success text-white',
    warning: 'bg-vs-warning text-white',
    error: 'bg-vs-error text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`
        filter-chip
        ${active ? variantColors[variant] : 'filter-chip-inactive'}
      `}
    >
      {label}
      {typeof count === 'number' && (
        <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-sm ${
          active ? 'bg-white/20' : 'bg-vs-gray-300 text-vs-text-tertiary'
        }`}>
          {count}
        </span>
      )}
      {badge && badge}
    </button>
  );
}
