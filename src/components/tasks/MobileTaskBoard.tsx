import { useState } from 'react';
import { Plus, Search, Filter, CheckCircle, Clock } from 'lucide-react';
import { MobileBottomNav } from '../mobile/MobileBottomNav';
import { MobileTaskCard } from './MobileTaskCard';
import { MobileTaskDetail } from './MobileTaskDetail';
import { MobileTaskCreate } from './MobileTaskCreate';
import { apiRequest } from '../../utils/api';
import { toast } from 'sonner';
import { PullToRefresh } from '../mobile/PullToRefresh';
import { SkeletonTaskCard, SkeletonList } from '../ui/skeleton';
import { SwipeToDelete } from '../mobile/SwipeToDelete';
import { logTaskStatusChange } from '../../utils/taskAnalytics';
import { useTasks } from '../../hooks/useDataFetching';
import { PageHeader } from '../shared/PageHeader';
import { DataList } from '../shared/DataList';

interface MobileTaskBoardProps {
  villas: any[];
  onNavigate?: (view: string) => void;
}

export function MobileTaskBoard({ villas, onNavigate }: MobileTaskBoardProps) {
  // Use custom hook for data fetching
  const { 
    data: tasks, 
    isInitialLoad, 
    refresh: loadTasks,
    setData: setTasks 
  } = useTasks();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'create'>('list');
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'todo' | 'in_progress' | 'review' | 'completed'>('all');

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setCurrentView('detail');
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      toast.success('Task created successfully!');
      await loadTasks();
      setCurrentView('list');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, updates: any) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      const oldStatus = task?.status || 'unknown';

      await apiRequest(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });

      if (updates.status && updates.status !== oldStatus) {
        const userId = sessionStorage.getItem('user_id') || 'unknown';
        logTaskStatusChange(
          taskId,
          task?.title || 'Untitled Task',
          oldStatus,
          updates.status,
          userId,
          task?.villaId
        );
      }

      toast.success('Task updated successfully!');
      await loadTasks();
      setCurrentView('list');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: 'DELETE',
      });
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      throw error; // Propagate error to SwipeToDelete for proper state reset
    }
  };

  const handleNavigateTab = (tab: string) => {
    const viewMap: { [key: string]: string } = {
      home: 'dashboard',
      villas: 'villas',
      calendar: 'calendar',
      tasks: 'tasks',
      expenses: 'expenses',
    };
    onNavigate?.(viewMap[tab] || tab);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || task.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  if (currentView === 'detail' && selectedTask) {
    return (
      <MobileTaskDetail
        task={selectedTask}
        onBack={() => {
          setCurrentView('list');
          setSelectedTask(null);
        }}
        onUpdate={handleUpdateTask}
        onNavigate={handleNavigateTab}
      />
    );
  }

  if (currentView === 'create') {
    return (
      <MobileTaskCreate
        villas={villas}
        onBack={() => setCurrentView('list')}
        onCreate={handleCreateTask}
      />
    );
  }

  if (isInitialLoad) {
    return (
      <div className="min-h-dvh bg-[#F8F8F8] pb-[calc(84px+2rem+env(safe-area-inset-bottom))]">
        {/* Status Bar */}
        <div className="bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] px-6 sm:px-8 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2">
          <div className="h-[15px] w-16 bg-white/20 rounded animate-pulse" />
        </div>

        {/* Header with Gradient */}
        <div className="bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] px-6 sm:px-8 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 space-y-1.5">
              <div className="h-[32px] w-32 bg-white/20 rounded-xl animate-pulse" />
              <div className="h-[16px] w-48 bg-white/10 rounded-xl animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-white rounded-full animate-pulse" />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-[#E8E8E8] rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 bg-[#E8E8E8] rounded-xl mb-3 animate-pulse" />
                <div className="h-[28px] w-12 bg-[#E8E8E8] rounded mb-1 animate-pulse" />
                <div className="h-[14px] w-full bg-[#E8E8E8] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 sm:px-8 py-4">
          <div className="h-[48px] w-full bg-white border-2 border-[#E8E8E8] rounded-xl animate-pulse" />
        </div>

        {/* Filter Pills Skeleton */}
        <div className="px-6 sm:px-8 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-11 w-24 bg-white border border-[#E8E8E8] rounded-full animate-pulse" />
            ))}
          </div>
        </div>

        {/* Task Cards Skeleton */}
        <div className="px-6 sm:px-8">
          <SkeletonList count={6}>
            <SkeletonTaskCard />
          </SkeletonList>
        </div>

        {/* Bottom Navigation */}
        <MobileBottomNav activeTab="tasks" onTabChange={handleNavigateTab} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8F8F8] pb-[calc(84px+2rem+env(safe-area-inset-bottom))]">
      <PullToRefresh onRefresh={async () => await loadTasks()}>
        {/* Header with Stats */}
        <PageHeader
          title="Tasks"
          action={{
            icon: <Plus className="w-6 h-6" />,
            onClick: () => setCurrentView('create'),
            'aria-label': 'Create new task'
          }}
          stats={[
            {
              icon: <CheckCircle className="w-5 h-5" />,
              value: taskCounts.all,
              label: 'Total Tasks'
            },
            {
              icon: <Clock className="w-5 h-5" />,
              value: taskCounts.in_progress,
              label: 'In Progress',
              color: 'linear-gradient(to bottom right, #FF9F43, #F58B2B)'
            },
            {
              icon: <CheckCircle className="w-5 h-5" />,
              value: taskCounts.completed,
              label: 'Completed',
              color: 'linear-gradient(to bottom right, #28C76F, #20B561)'
            }
          ]}
        />

      {/* Search */}
      <div className="px-6 sm:px-8 py-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B9B9C3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full h-[48px] pl-12 pr-4 bg-white border-2 border-[#E8E8E8] rounded-xl text-[15px] placeholder:text-[#B9B9C3] focus:border-[#7B5FEB] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 sm:px-8 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 min-h-[44px] h-11 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-[#7B5FEB] text-white'
                : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
            }`}
          >
            All ({taskCounts.all})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-4 min-h-[44px] h-11 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'pending'
                ? 'bg-[#9F7AEA] text-white'
                : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
            }`}
          >
            Pending ({taskCounts.pending})
          </button>
          <button
            onClick={() => setActiveFilter('todo')}
            className={`px-4 min-h-[44px] h-11 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'todo'
                ? 'bg-[#B9B9C3] text-white'
                : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
            }`}
          >
            To Do ({taskCounts.todo})
          </button>
          <button
            onClick={() => setActiveFilter('in_progress')}
            className={`px-4 min-h-[44px] h-11 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'in_progress'
                ? 'bg-[#FF9F43] text-white'
                : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
            }`}
          >
            In Progress ({taskCounts.in_progress})
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-4 min-h-[44px] h-11 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === 'completed'
                ? 'bg-[#28C76F] text-white'
                : 'bg-white text-[#6E6B7B] border border-[#E8E8E8]'
            }`}
          >
            Completed ({taskCounts.completed})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="px-6 sm:px-8">
        <DataList
          data={filteredTasks}
          isLoading={false}
          error={null}
          renderItem={(task) => (
            <SwipeToDelete
              onDelete={() => handleDeleteTask(task.id)}
              deleteLabel="Delete"
            >
              <MobileTaskCard task={task} onClick={() => handleTaskClick(task)} />
            </SwipeToDelete>
          )}
          keyExtractor={(task) => task.id}
          emptyState={{
            icon: <CheckCircle className="w-12 h-12 text-[#B9B9C3]" />,
            title: 'No tasks found',
            description: searchQuery 
              ? 'Try adjusting your search or filters'
              : 'Create your first task to get started',
            action: !searchQuery && activeFilter === 'all' ? {
              label: 'Create Task',
              onClick: () => setCurrentView('create')
            } : undefined
          }}
        />
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab="tasks" onTabChange={handleNavigateTab} />
      </PullToRefresh>
    </div>
  );
}
