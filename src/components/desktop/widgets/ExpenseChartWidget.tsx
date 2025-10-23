import React from 'react';
import { TrendingUp } from 'lucide-react';

export const ExpenseChartWidget: React.FC = () => {
  const monthlyData = [
    { month: 'Jul', amount: 38500 },
    { month: 'Aug', amount: 42300 },
    { month: 'Sep', amount: 39800 },
    { month: 'Oct', amount: 45200 },
    { month: 'Nov', amount: 41900 },
    { month: 'Dec', amount: 49200 },
  ];

  const maxAmount = Math.max(...monthlyData.map(d => d.amount));
  const minAmount = Math.min(...monthlyData.map(d => d.amount));

  return (
    <div className="expense-chart-widget">
      <div className="chart-header">
        <div className="chart-title">
          <TrendingUp size={20} />
          <span>Expense Trends</span>
        </div>
        <div className="chart-period">Last 6 Months</div>
      </div>

      <div className="chart-container">
        <div className="chart-bars">
          {monthlyData.map((data, index) => {
            const heightPercent = ((data.amount - minAmount) / (maxAmount - minAmount)) * 100;
            return (
              <div key={index} className="bar-wrapper">
                <div className="bar-value">${(data.amount / 1000).toFixed(1)}K</div>
                <div className="bar-column">
                  <div 
                    className="bar-fill" 
                    style={{ height: `${Math.max(heightPercent, 10)}%` }}
                  />
                </div>
                <div className="bar-label">{data.month}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chart-summary">
        <div className="summary-item">
          <div className="summary-label">Average</div>
          <div className="summary-value">
            ${(monthlyData.reduce((sum, d) => sum + d.amount, 0) / monthlyData.length / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Highest</div>
          <div className="summary-value">${(maxAmount / 1000).toFixed(1)}K</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Lowest</div>
          <div className="summary-value">${(minAmount / 1000).toFixed(1)}K</div>
        </div>
      </div>

      <style>{`
        .expense-chart-widget {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-lg);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chart-title {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-sm);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
        }

        .chart-period {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
        }

        .chart-container {
          flex: 1;
          display: flex;
          align-items: flex-end;
          padding: var(--desktop-gap-md) 0;
        }

        .chart-bars {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          gap: var(--desktop-gap-sm);
        }

        .bar-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--desktop-gap-xs);
          height: 100%;
        }

        .bar-value {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-medium);
          color: var(--desktop-dark-500);
          margin-bottom: auto;
        }

        .bar-column {
          width: 100%;
          height: 180px;
          display: flex;
          align-items: flex-end;
        }

        .bar-fill {
          width: 100%;
          background: linear-gradient(to top, var(--desktop-primary-500), var(--desktop-primary-400));
          border-radius: var(--desktop-radius-sm) var(--desktop-radius-sm) 0 0;
          transition: all 0.3s ease;
        }

        .bar-wrapper:hover .bar-fill {
          opacity: 0.8;
        }

        .bar-label {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-regular);
          color: var(--desktop-gray-500);
        }

        .chart-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--desktop-gap-md);
          padding-top: var(--desktop-gap-md);
          border-top: 1px solid var(--desktop-gray-100);
        }

        .summary-item {
          text-align: center;
        }

        .summary-label {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          margin-bottom: 4px;
        }

        .summary-value {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
        }
      `}</style>
    </div>
  );
};
