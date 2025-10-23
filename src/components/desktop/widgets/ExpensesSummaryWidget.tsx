import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const ExpensesSummaryWidget: React.FC = () => {
  const expenses = [
    { category: 'Maintenance', amount: 12450, change: +8, color: '#7152F3' },
    { category: 'Utilities', amount: 8920, change: -3, color: '#FF6B9D' },
    { category: 'Salaries', amount: 24500, change: +2, color: '#FFA94D' },
    { category: 'Supplies', amount: 3280, change: -12, color: '#20E3B2' },
  ];

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="expenses-summary-widget">
      <div className="total-section">
        <div className="total-label">Total Expenses</div>
        <div className="total-amount">${total.toLocaleString()}</div>
        <div className="total-period">This Month</div>
      </div>

      <div className="expenses-list">
        {expenses.map((expense, index) => (
          <div key={index} className="expense-item">
            <div className="expense-indicator" style={{ background: expense.color }} />
            <div className="expense-info">
              <div className="expense-category">{expense.category}</div>
              <div className="expense-amount">${expense.amount.toLocaleString()}</div>
            </div>
            <div className={`expense-change ${expense.change > 0 ? 'positive' : 'negative'}`}>
              {expense.change > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(expense.change)}%
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .expenses-summary-widget {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-lg);
        }

        .total-section {
          padding: var(--desktop-gap-lg);
          background: linear-gradient(135deg, var(--desktop-primary-500) 0%, var(--desktop-primary-600) 100%);
          border-radius: var(--desktop-radius-lg);
          color: white;
        }

        .total-label {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          opacity: 0.9;
          margin-bottom: 4px;
        }

        .total-amount {
          font-family: var(--desktop-font-family);
          font-size: 32px;
          font-weight: var(--desktop-weight-bold);
          margin-bottom: 4px;
        }

        .total-period {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          opacity: 0.8;
        }

        .expenses-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-sm);
        }

        .expense-item {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-sm);
          padding: var(--desktop-gap-md);
          background: var(--desktop-gray-10);
          border-radius: var(--desktop-radius-md);
        }

        .expense-indicator {
          width: 4px;
          height: 32px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .expense-info {
          flex: 1;
          min-width: 0;
        }

        .expense-category {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-medium);
          color: var(--desktop-dark-500);
          margin-bottom: 2px;
        }

        .expense-amount {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
        }

        .expense-change {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-medium);
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }

        .expense-change.positive {
          color: var(--desktop-error-500);
        }

        .expense-change.negative {
          color: var(--desktop-success-500);
        }
      `}</style>
    </div>
  );
};
