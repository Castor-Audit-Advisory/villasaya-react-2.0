import React from 'react';
import { FileText, Calendar, User } from 'lucide-react';

export const LeaveRequestsWidget: React.FC = () => {
  const leaveRequests = [
    { id: 1, name: 'Alice Cooper', type: 'Annual Leave', days: 3, startDate: 'Dec 20', avatar: 'AC' },
    { id: 2, name: 'Bob Martinez', type: 'Sick Leave', days: 2, startDate: 'Dec 18', avatar: 'BM' },
    { id: 3, name: 'Carol White', type: 'Personal Leave', days: 1, startDate: 'Dec 22', avatar: 'CW' },
  ];

  const pendingCount = leaveRequests.length;

  return (
    <div className="leave-requests-widget">
      <div className="pending-badge">
        <FileText size={18} />
        <span>{pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}</span>
      </div>

      <div className="requests-list">
        {leaveRequests.map((request) => (
          <div key={request.id} className="request-item">
            <div className="request-avatar">{request.avatar}</div>
            <div className="request-content">
              <div className="request-name">{request.name}</div>
              <div className="request-details">
                <span className="request-detail">
                  <FileText size={12} />
                  {request.type}
                </span>
                <span className="request-detail">
                  <Calendar size={12} />
                  {request.days} day{request.days !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <div className="request-actions">
              <button className="action-btn approve">✓</button>
              <button className="action-btn reject">✕</button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .leave-requests-widget {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-md);
        }

        .pending-badge {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-sm);
          padding: var(--desktop-gap-md);
          background: var(--desktop-warning-50);
          color: var(--desktop-warning-600);
          border-radius: var(--desktop-radius-md);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-semibold);
        }

        .requests-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-sm);
        }

        .request-item {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-sm);
          padding: var(--desktop-gap-md);
          background: var(--desktop-gray-10);
          border-radius: var(--desktop-radius-md);
        }

        .request-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--desktop-primary-100);
          color: var(--desktop-primary-500);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-semibold);
          flex-shrink: 0;
        }

        .request-content {
          flex: 1;
          min-width: 0;
        }

        .request-name {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-medium);
          color: var(--desktop-dark-500);
          margin-bottom: 4px;
        }

        .request-details {
          display: flex;
          gap: var(--desktop-gap-sm);
          flex-wrap: wrap;
        }

        .request-detail {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .request-actions {
          display: flex;
          gap: var(--desktop-gap-xs);
          flex-shrink: 0;
        }

        .action-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--desktop-radius-sm);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.2s;
        }

        .action-btn.approve {
          background: var(--desktop-success-50);
          color: var(--desktop-success-500);
        }

        .action-btn.approve:hover {
          background: var(--desktop-success-100);
        }

        .action-btn.reject {
          background: var(--desktop-error-50);
          color: var(--desktop-error-500);
        }

        .action-btn.reject:hover {
          background: var(--desktop-error-100);
        }
      `}</style>
    </div>
  );
};
