import React from 'react';
import { Users, Building2, DollarSign, Calendar } from 'lucide-react';

export const QuickStatsWidget: React.FC = () => {
  const stats = [
    { icon: <Users size={20} />, label: 'Staff', value: '245' },
    { icon: <Building2 size={20} />, label: 'Villas', value: '38' },
    { icon: <DollarSign size={20} />, label: 'Expenses', value: '$45.8K' },
    { icon: <Calendar size={20} />, label: 'Tasks', value: '127' },
  ];

  return (
    <div className="quick-stats-widget">
      {stats.map((stat, index) => (
        <div key={index} className="stat-item">
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-info">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        </div>
      ))}

      <style>{`
        .quick-stats-widget {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--desktop-gap-md);
          height: 100%;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-sm);
          padding: var(--desktop-gap-md);
          background: var(--desktop-gray-10);
          border-radius: var(--desktop-radius-md);
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--desktop-primary-10);
          color: var(--desktop-primary-500);
          border-radius: var(--desktop-radius-md);
          flex-shrink: 0;
        }

        .stat-info {
          flex: 1;
          min-width: 0;
        }

        .stat-value {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-h4);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          line-height: 1.2;
        }

        .stat-label {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
};
