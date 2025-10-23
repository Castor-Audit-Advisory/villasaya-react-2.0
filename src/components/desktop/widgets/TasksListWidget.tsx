import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

export const TasksListWidget: React.FC = () => {
  const tasks = [
    { id: 1, title: 'Review maintenance requests', status: 'pending', priority: 'high', dueDate: 'Today' },
    { id: 2, title: 'Approve staff leave applications', status: 'pending', priority: 'medium', dueDate: 'Tomorrow' },
    { id: 3, title: 'Update villa inventory', status: 'in-progress', priority: 'low', dueDate: 'This week' },
    { id: 4, title: 'Process monthly expenses', status: 'pending', priority: 'high', dueDate: 'Today' },
    { id: 5, title: 'Schedule team meeting', status: 'completed', priority: 'medium', dueDate: 'Yesterday' },
  ];

  return (
    <div className="tasks-list-widget">
      <div className="tasks-list">
        {tasks.map((task) => (
          <div key={task.id} className={`task-item ${task.status}`}>
            <div className="task-checkbox">
              {task.status === 'completed' ? (
                <CheckCircle2 size={18} className="completed-icon" />
              ) : (
                <Circle size={18} className="pending-icon" />
              )}
            </div>
            <div className="task-content">
              <div className="task-title">{task.title}</div>
              <div className="task-meta">
                <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                <span className="task-due">
                  <Clock size={12} />
                  {task.dueDate}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .tasks-list-widget {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .tasks-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-sm);
        }

        .task-item {
          display: flex;
          align-items: flex-start;
          gap: var(--desktop-gap-sm);
          padding: var(--desktop-gap-md);
          background: var(--desktop-gray-10);
          border-radius: var(--desktop-radius-md);
          transition: all 0.2s;
        }

        .task-item:hover {
          background: var(--desktop-gray-25);
        }

        .task-item.completed {
          opacity: 0.6;
        }

        .task-checkbox {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .completed-icon {
          color: var(--desktop-success-500);
        }

        .pending-icon {
          color: var(--desktop-gray-300);
        }

        .task-content {
          flex: 1;
          min-width: 0;
        }

        .task-title {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-regular);
          color: var(--desktop-dark-500);
          margin-bottom: 4px;
        }

        .task-item.completed .task-title {
          text-decoration: line-through;
        }

        .task-meta {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-sm);
          flex-wrap: wrap;
        }

        .priority-badge {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-medium);
          padding: 2px 8px;
          border-radius: var(--desktop-radius-sm);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .priority-badge.high {
          background: var(--desktop-error-50);
          color: var(--desktop-error-500);
        }

        .priority-badge.medium {
          background: var(--desktop-warning-50);
          color: var(--desktop-warning-500);
        }

        .priority-badge.low {
          background: var(--desktop-gray-50);
          color: var(--desktop-gray-500);
        }

        .task-due {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
    </div>
  );
};
