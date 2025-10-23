import React from 'react';
import { Bell, AlertCircle, Info, CheckCircle } from 'lucide-react';

export const AnnouncementsWidget: React.FC = () => {
  const announcements = [
    { 
      id: 1, 
      type: 'important', 
      title: 'System Maintenance Scheduled', 
      message: 'Scheduled maintenance on Dec 25, 2:00 AM - 4:00 AM', 
      time: '1 hour ago',
      icon: <AlertCircle size={18} />
    },
    { 
      id: 2, 
      type: 'success', 
      title: 'New Feature Released', 
      message: 'Calendar integration with Google is now available', 
      time: '3 hours ago',
      icon: <CheckCircle size={18} />
    },
    { 
      id: 3, 
      type: 'info', 
      title: 'Holiday Schedule', 
      message: 'Office will be closed from Dec 24-26 for holidays', 
      time: '1 day ago',
      icon: <Info size={18} />
    },
  ];

  return (
    <div className="announcements-widget">
      <div className="announcements-list">
        {announcements.map((announcement) => (
          <div key={announcement.id} className={`announcement-item ${announcement.type}`}>
            <div className="announcement-icon">
              {announcement.icon}
            </div>
            <div className="announcement-content">
              <div className="announcement-header">
                <div className="announcement-title">{announcement.title}</div>
                <div className="announcement-time">{announcement.time}</div>
              </div>
              <div className="announcement-message">{announcement.message}</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .announcements-widget {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .announcements-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-md);
        }

        .announcement-item {
          display: flex;
          gap: var(--desktop-gap-md);
          padding: var(--desktop-gap-md);
          border-radius: var(--desktop-radius-md);
          border-left: 3px solid;
        }

        .announcement-item.important {
          background: var(--desktop-error-10);
          border-color: var(--desktop-error-500);
        }

        .announcement-item.success {
          background: var(--desktop-success-10);
          border-color: var(--desktop-success-500);
        }

        .announcement-item.info {
          background: var(--desktop-primary-10);
          border-color: var(--desktop-primary-500);
        }

        .announcement-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .announcement-item.important .announcement-icon {
          color: var(--desktop-error-500);
        }

        .announcement-item.success .announcement-icon {
          color: var(--desktop-success-500);
        }

        .announcement-item.info .announcement-icon {
          color: var(--desktop-primary-500);
        }

        .announcement-content {
          flex: 1;
          min-width: 0;
        }

        .announcement-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--desktop-gap-sm);
          margin-bottom: 4px;
        }

        .announcement-title {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
        }

        .announcement-time {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          flex-shrink: 0;
        }

        .announcement-message {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-600);
        }
      `}</style>
    </div>
  );
};
