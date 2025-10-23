import React from 'react';
import { MessageSquare } from 'lucide-react';

export const RecentMessagesWidget: React.FC = () => {
  const messages = [
    { id: 1, from: 'John Smith', message: 'Villa maintenance has been completed', time: '2 min ago', unread: true, avatar: 'JS' },
    { id: 2, from: 'Villa Support', message: 'New tenant inquiry received', time: '15 min ago', unread: true, avatar: 'VS' },
    { id: 3, from: 'Maria Garcia', message: 'Leave request approved', time: '1 hour ago', unread: false, avatar: 'MG' },
    { id: 4, from: 'Admin Team', message: 'Monthly report is ready', time: '2 hours ago', unread: false, avatar: 'AT' },
  ];

  return (
    <div className="recent-messages-widget">
      <div className="messages-list">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-item ${msg.unread ? 'unread' : ''}`}>
            <div className="message-avatar">{msg.avatar}</div>
            <div className="message-content">
              <div className="message-header">
                <span className="message-from">{msg.from}</span>
                <span className="message-time">{msg.time}</span>
              </div>
              <div className="message-text">{msg.message}</div>
            </div>
            {msg.unread && <div className="unread-indicator" />}
          </div>
        ))}
      </div>

      <style>{`
        .recent-messages-widget {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .messages-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-sm);
        }

        .message-item {
          display: flex;
          align-items: flex-start;
          gap: var(--desktop-gap-sm);
          padding: var(--desktop-gap-md);
          background: var(--desktop-gray-10);
          border-radius: var(--desktop-radius-md);
          transition: all 0.2s;
          position: relative;
        }

        .message-item:hover {
          background: var(--desktop-gray-25);
        }

        .message-item.unread {
          background: var(--desktop-primary-10);
        }

        .message-avatar {
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

        .message-content {
          flex: 1;
          min-width: 0;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--desktop-gap-sm);
          margin-bottom: 4px;
        }

        .message-from {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
        }

        .message-time {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          flex-shrink: 0;
        }

        .message-text {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-600);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .unread-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--desktop-primary-500);
          position: absolute;
          top: 16px;
          right: 12px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};
