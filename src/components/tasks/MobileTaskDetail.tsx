import { useState } from 'react';
import { User, Calendar, Flag, MessageSquare, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PageHeader } from '../shared/PageHeader';
import { triggerHaptic } from '../../utils/haptics';

interface MobileTaskDetailProps {
  task: any;
  onBack: () => void;
  onUpdate: (taskId: string, updates: any) => void;
  onNavigate?: (tab: string) => void;
}

export function MobileTaskDetail({ task, onBack, onUpdate, onNavigate }: MobileTaskDetailProps) {
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'completed') {
      triggerHaptic('success');
    } else {
      triggerHaptic('medium');
    }
    setStatus(newStatus);
    onUpdate(task.id, { status: newStatus });
  };

  const handlePriorityChange = (newPriority: string) => {
    if (newPriority === 'urgent') {
      triggerHaptic('warning');
    } else {
      triggerHaptic('light');
    }
    setPriority(newPriority);
    onUpdate(task.id, { priority: newPriority });
  };

  const statusConfig = {
    pending: { color: 'bg-[#B9B9C3]', label: 'Pending' },
    todo: { color: 'bg-[#B9B9C3]', label: 'To Do' },
    in_progress: { color: 'bg-[#FF9F43]', label: 'In Progress' },
    review: { color: 'bg-[#7B5FEB]', label: 'Review' },
    completed: { color: 'bg-[#28C76F]', label: 'Completed' },
  };

  return (
    <div className="min-h-dvh bg-[#F8F8F8] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      <PageHeader
        title="Task Details"
        variant="white"
        onBack={onBack}
        className="mb-4"
      />

      {/* Content */}
      <div className="px-6 sm:px-8 pb-24">
        {/* Title & Status */}
        <div className="bg-white rounded-2xl p-4 mb-3">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-[#1F1F1F] text-[20px] font-semibold flex-1">{task.title}</h2>
            <div className={`w-3 h-3 rounded-full ${statusConfig[status]?.color || statusConfig.todo.color} ml-3 mt-2`}></div>
          </div>
          {task.description && (
            <p className="text-[#6E6B7B] text-[15px] leading-relaxed">{task.description}</p>
          )}
        </div>

        {/* Status & Priority */}
        <div className="bg-white rounded-2xl p-4 mb-3">
          <h3 className="text-[#1F1F1F] text-[16px] font-semibold mb-4">Status & Priority</h3>
          
          <div className="mb-4">
            <label className="text-[#6E6B7B] text-sm mb-2 block">Status</label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full h-[48px] bg-[#F8F8F8] border-2 border-[#E8E8E8] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[#6E6B7B] text-sm mb-2 block">Priority</label>
            <Select value={priority} onValueChange={handlePriorityChange}>
              <SelectTrigger className="w-full h-[48px] bg-[#F8F8F8] border-2 border-[#E8E8E8] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl p-4 mb-3">
          <h3 className="text-[#1F1F1F] text-[16px] font-semibold mb-4">Details</h3>
          
          <div className="space-y-4">
            {task.assignee && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#7B5FEB]/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-[#7B5FEB]" />
                </div>
                <div>
                  <div className="text-[#B9B9C3] text-sm">Assigned To</div>
                  <div className="text-[#5E5873] text-[15px] font-medium">{task.assignee}</div>
                </div>
              </div>
            )}

            {task.due_date && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FF9F43]/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#FF9F43]" />
                </div>
                <div>
                  <div className="text-[#B9B9C3] text-sm">Due Date</div>
                  <div className="text-[#5E5873] text-[15px] font-medium">
                    {new Date(task.due_date).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            )}

            {task.supervisor && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#28C76F]/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-[#28C76F]" />
                </div>
                <div>
                  <div className="text-[#B9B9C3] text-sm">Supervisor</div>
                  <div className="text-[#5E5873] text-[15px] font-medium">{task.supervisor}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        {status !== 'completed' && (
          <button
            onClick={() => handleStatusChange('completed')}
            className="w-full h-[56px] bg-gradient-to-r from-[#28C76F] to-[#20B561] text-white rounded-full font-semibold text-[16px] shadow-lg shadow-[#28C76F]/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 px-6"
          >
            <CheckCircle className="w-5 h-5" />
            Mark as Complete
          </button>
        )}
      </div>
    </div>
  );
}
