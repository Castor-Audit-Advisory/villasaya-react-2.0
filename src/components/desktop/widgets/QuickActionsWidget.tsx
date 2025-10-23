import React from 'react';
import { Plus, FileText, Users, Building2, DollarSign, Calendar } from 'lucide-react';

export const QuickActionsWidget: React.FC = () => {
  const actions = [
    { icon: <Plus size={18} />, label: 'New Task', color: '#7152F3' },
    { icon: <DollarSign size={18} />, label: 'Add Expense', color: '#FF6B9D' },
    { icon: <Calendar size={18} />, label: 'Schedule Event', color: '#FFA94D' },
    { icon: <Users size={18} />, label: 'Add Staff', color: '#20E3B2' },
    { icon: <Building2 size={18} />, label: 'Add Villa', color: '#5B8DEF' },
    { icon: <FileText size={18} />, label: 'Generate Report', color: '#A78BFA' },
  ];

  return (
    <div className="quick-actions-widget">
      {actions.map((action, index) => (
        <button key={index} className="action-button" onClick={() => alert(`${action.label} clicked`)}>
          <div className="action-icon" style={{ background: action.color }}>
            {action.icon}
          </div>
          <div className="action-label">{action.label}</div>
        </button>
      ))}

      <style>{`
        .quick-actions-widget {
          height: 100%;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--desktop-gap-sm);
        }

        .action-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--desktop-gap-sm);
          padding: var(--desktop-gap-md);
          background: var(--desktop-gray-10);
          border: none;
          border-radius: var(--desktop-radius-md);
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-button:hover {
          background: var(--desktop-gray-25);
          transform: translateY(-2px);
        }

        .action-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--desktop-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .action-label {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-medium);
          color: var(--desktop-dark-500);
          text-align: center;
        }
      `}</style>
    </div>
  );
};
