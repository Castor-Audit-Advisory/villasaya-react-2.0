import { User, Calendar, Flag, CheckCircle } from 'lucide-react';

interface MobileTaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    status: 'pending' | 'todo' | 'in_progress' | 'review' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    assignee?: string;
  };
  onClick?: () => void;
}

export function MobileTaskCard({ task, onClick }: MobileTaskCardProps) {
  const statusConfig = {
    pending: { color: 'bg-[#B9B9C3]', label: 'Pending' },
    todo: { color: 'bg-[#B9B9C3]', label: 'To Do' },
    in_progress: { color: 'bg-[#FF9F43]', label: 'In Progress' },
    review: { color: 'bg-[#7B5FEB]', label: 'Review' },
    completed: { color: 'bg-[#28C76F]', label: 'Completed' },
  };

  const priorityConfig = {
    low: { color: 'text-[#28C76F]', bg: 'bg-[#28C76F]/10', icon: '↓' },
    medium: { color: 'text-[#FF9F43]', bg: 'bg-[#FF9F43]/10', icon: '→' },
    high: { color: 'text-[#EA5455]', bg: 'bg-[#EA5455]/10', icon: '↑' },
    urgent: { color: 'text-[#EA5455]', bg: 'bg-[#EA5455]/10', icon: '⚠' },
  };

  const status = statusConfig[task.status];
  const priority = priorityConfig[task.priority];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 mb-3 active:scale-[0.98] transition-transform cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[#1F1F1F] text-[15px] font-semibold mb-1 line-clamp-2">
            {task.title}
          </h3>
          {task.description && (
            <p className="text-[#B9B9C3] text-sm line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <div className={`w-2 h-2 rounded-full ${status.color} ml-3 mt-1.5 flex-shrink-0`}></div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {task.assignee && (
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-[#7B5FEB]/10 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-[#7B5FEB]" />
              </div>
              <span className="text-[#6E6B7B] text-sm">{task.assignee}</span>
            </div>
          )}
          {task.due_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#B9B9C3]" />
              <span className="text-[#6E6B7B] text-sm">
                {new Date(task.due_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
        <div className={`px-2.5 py-1 rounded-full ${priority.bg} ${priority.color} text-sm font-medium`}>
          {priority.icon} {task.priority}
        </div>
      </div>
    </div>
  );
}
