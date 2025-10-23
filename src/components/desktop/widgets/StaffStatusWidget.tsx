import React from 'react';
import { Clock, UserCheck, UserX } from 'lucide-react';

export const StaffStatusWidget: React.FC = () => {
  const staffStatus = {
    clockedIn: 142,
    clockedOut: 103,
    onLeave: 12,
  };

  const recentActivity = [
    { id: 1, name: 'Sarah Johnson', action: 'clocked in', time: '5 min ago', avatar: 'SJ' },
    { id: 2, name: 'Michael Chen', action: 'clocked out', time: '12 min ago', avatar: 'MC' },
    { id: 3, name: 'Emma Davis', action: 'clocked in', time: '28 min ago', avatar: 'ED' },
    { id: 4, name: 'James Wilson', action: 'clocked in', time: '1 hour ago', avatar: 'JW' },
  ];

  return (
    <div className="staff-status-widget">
      <div className="status-overview">
        <div className="status-card clocked-in">
          <UserCheck size={20} />
          <div className="status-info">
            <div className="status-value">{staffStatus.clockedIn}</div>
            <div className="status-label">Clocked In</div>
          </div>
        </div>
        <div className="status-card clocked-out">
          <UserX size={20} />
          <div className="status-info">
            <div className="status-value">{staffStatus.clockedOut}</div>
            <div className="status-label">Clocked Out</div>
          </div>
        </div>
        <div className="status-card on-leave">
          <Clock size={20} />
          <div className="status-info">
            <div className="status-value">{staffStatus.onLeave}</div>
            <div className="status-label">On Leave</div>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <div className="activity-header">Recent Activity</div>
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-avatar">{activity.avatar}</div>
              <div className="activity-content">
                <div className="activity-text">
                  <span className="activity-name">{activity.name}</span> {activity.action}
                </div>
                <div className="activity-time">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .staff-status-widget {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-lg);
        }

        .status-overview {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--desktop-gap-sm);
        }

        .status-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--desktop-gap-sm);
          padding: var(--desktop-gap-md);
          border-radius: var(--desktop-radius-md);
          text-align: center;
        }

        .status-card.clocked-in {
          background: var(--desktop-success-50);
          color: var(--desktop-success-500);
        }

        .status-card.clocked-out {
          background: var(--desktop-gray-50);
          color: var(--desktop-gray-500);
        }

        .status-card.on-leave {
          background: var(--desktop-warning-50);
          color: var(--desktop-warning-500);
        }

        .status-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .status-value {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-h4);
          font-weight: var(--desktop-weight-bold);
        }

        .status-label {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-medium);
        }

        .recent-activity {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .activity-header {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin-bottom: var(--desktop-gap-sm);
        }

        .activity-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-sm);
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-sm);
          padding: var(--desktop-gap-sm);
          background: var(--desktop-gray-10);
          border-radius: var(--desktop-radius-md);
        }

        .activity-avatar {
          width: 32px;
          height: 32px;
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

        .activity-content {
          flex: 1;
          min-width: 0;
        }

        .activity-text {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-regular);
          color: var(--desktop-dark-500);
          margin-bottom: 2px;
        }

        .activity-name {
          font-weight: var(--desktop-weight-medium);
        }

        .activity-time {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
        }
      `}</style>
    </div>
  );
};
