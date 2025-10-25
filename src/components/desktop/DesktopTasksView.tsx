import React, { useState, useEffect } from 'react';
import { Plus, Filter, X } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { apiRequest } from '../../utils/api';
import { Task } from '../../types';

type TaskStatus = 'pending' | 'in_progress' | 'completed';

interface FilterState {
  priority: string | null;
  assignee: string | null;
}

export const DesktopTasksView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priority: null,
    assignee: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await apiRequest<{ tasks?: Task[] }>('/tasks');
      const taskList = Array.isArray(response) ? response : response?.tasks;
      setTasks(Array.isArray(taskList) ? taskList : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id as TaskStatus;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      fetchTasks();
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.assignee && task.assignedTo !== filters.assignee) return false;
    return true;
  });

  const tasksByStatus = {
    pending: filteredTasks.filter((t) => t.status === 'pending'),
    in_progress: filteredTasks.filter((t) => t.status === 'in_progress'),
    completed: filteredTasks.filter((t) => t.status === 'completed'),
  };

  const uniquePriorities = Array.from(
    new Set(tasks.map((t) => t.priority).filter(Boolean))
  );
  const uniqueAssignees = Array.from(
    new Set(tasks.map((t) => t.assignedTo).filter(Boolean))
  );

  const TaskCard: React.FC<{ task: Task; isDragging?: boolean }> = ({
    task,
    isDragging,
  }) => (
    <div className={`task-card ${isDragging ? 'dragging' : ''}`}>
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <span className={`priority-badge priority-${task.priority || 'medium'}`}>
          {task.priority || 'Medium'}
        </span>
      </div>
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      <div className="task-footer">
        <div className="task-assignee">
          <div className="assignee-avatar">
            {task.assignedTo?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="assignee-name">{task.assignedTo || 'Unassigned'}</span>
        </div>
        {task.dueDate && (
          <span className="task-due-date">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );

  const DraggableTaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({
        id: task.id,
      });

    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          opacity: isDragging ? 0.5 : 1,
        }
      : undefined;

    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        <TaskCard task={task} isDragging={isDragging} />
      </div>
    );
  };

  const DroppableColumn: React.FC<{
    title: string;
    status: TaskStatus;
    count: number;
    color: string;
  }> = ({ title, status, count, color }) => {
    const { setNodeRef } = useDroppable({
      id: status,
    });

    return (
      <div className="kanban-column">
        <div className="column-header">
          <div className="column-title-row">
            <div className={`status-dot ${color}`} />
            <h3 className="column-title">{title}</h3>
            <span className="task-count">{count}</span>
          </div>
        </div>
        <div ref={setNodeRef} className="column-content">
          {tasksByStatus[status].map((task) => (
            <DraggableTaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="desktop-tasks-view">
      <div className="tasks-toolbar">
        <button
          className="filter-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} />
          <span>Filter</span>
          {(filters.priority || filters.assignee) && (
            <span className="filter-badge">
              {[filters.priority, filters.assignee].filter(Boolean).length}
            </span>
          )}
        </button>
        <button className="add-btn" onClick={() => console.log('Add task')}>
          <Plus size={20} />
          <span>Add New Task</span>
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Priority</label>
            <select
              value={filters.priority || ''}
              onChange={(e) =>
                setFilters({ ...filters, priority: e.target.value || null })
              }
            >
              <option value="">All Priorities</option>
              {uniquePriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Assignee</label>
            <select
              value={filters.assignee || ''}
              onChange={(e) =>
                setFilters({ ...filters, assignee: e.target.value || null })
              }
            >
              <option value="">All Assignees</option>
              {uniqueAssignees.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
          </div>
          {(filters.priority || filters.assignee) && (
            <button
              className="clear-filters-btn"
              onClick={() => setFilters({ priority: null, assignee: null })}
            >
              <X size={16} />
              Clear Filters
            </button>
          )}
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          <DroppableColumn
            title="To Do"
            status="pending"
            count={tasksByStatus.pending.length}
            color="pending"
          />
          <DroppableColumn
            title="In Progress"
            status="in_progress"
            count={tasksByStatus.in_progress.length}
            color="in-progress"
          />
          <DroppableColumn
            title="Completed"
            status="completed"
            count={tasksByStatus.completed.length}
            color="completed"
          />
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} isDragging />}
        </DragOverlay>
      </DndContext>

      <style>{`
        .desktop-tasks-view {
          width: 100%;
          height: 100%;
        }

        .tasks-toolbar {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: var(--desktop-gap-lg);
          padding: var(--desktop-gap-lg);
          margin-bottom: var(--desktop-gap-lg);
        }

        .filter-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--desktop-gap-md);
          padding: 0 var(--desktop-gap-xl);
          height: 38px;
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-lg);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .filter-btn:hover {
          border-color: var(--desktop-gray-500);
        }

        .filter-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: var(--desktop-primary-500);
          color: var(--desktop-white-500);
          border-radius: 9px;
          font-size: 10px;
          font-weight: var(--desktop-weight-semibold);
        }

        .add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--desktop-gap-md);
          padding: 0 var(--desktop-gap-xl);
          height: 38px;
          background: var(--desktop-primary-500);
          border: none;
          border-radius: var(--desktop-radius-lg);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-white-500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-btn:hover {
          background: var(--desktop-primary-400);
        }

        .filters-panel {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-xl);
          padding: var(--desktop-gap-lg);
          margin: 0 var(--desktop-gap-lg) var(--desktop-gap-lg) var(--desktop-gap-lg);
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-10);
          border-radius: var(--desktop-radius-lg);
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-sm);
          flex: 1;
        }

        .filter-group label {
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
        }

        .filter-group select {
          padding: 10px var(--desktop-gap-lg);
          height: 38px;
          background: var(--desktop-gray-5);
          border: 1px solid var(--desktop-gray-10);
          border-radius: var(--desktop-radius-md);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          color: var(--desktop-dark-500);
          outline: none;
          cursor: pointer;
        }

        .clear-filters-btn {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-sm);
          padding: 0 var(--desktop-gap-lg);
          height: 38px;
          margin-top: 18px;
          background: var(--desktop-gray-10);
          border: none;
          border-radius: var(--desktop-radius-md);
          font-size: var(--desktop-body-2);
          color: var(--desktop-dark-500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-filters-btn:hover {
          background: var(--desktop-gray-20);
        }

        .kanban-board {
          display: grid;
          grid-template-columns: repeat(24, 1fr);
          gap: var(--desktop-grid-gap);
          padding: 0 var(--desktop-gap-lg) var(--desktop-gap-lg) var(--desktop-gap-lg);
        }

        .kanban-column {
          grid-column: span 8;
          background: var(--desktop-gray-5);
          border-radius: var(--desktop-radius-lg);
          padding: var(--desktop-gap-lg);
          min-height: 450px;
        }

        .column-header {
          margin-bottom: var(--desktop-gap-lg);
        }

        .column-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.pending {
          background: #FF9F43;
        }

        .status-dot.in-progress {
          background: var(--desktop-primary-500);
        }

        .status-dot.completed {
          background: #28C76F;
        }

        .column-title {
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin: 0;
        }

        .task-count {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          padding: 0 8px;
          background: var(--desktop-gray-20);
          border-radius: 12px;
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
        }

        .column-content {
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-md);
          min-height: 350px;
        }

        .task-card {
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-10);
          border-radius: var(--desktop-radius-lg);
          padding: var(--desktop-gap-lg);
          cursor: grab;
          transition: all 0.2s;
        }

        .task-card:active {
          cursor: grabbing;
        }

        .task-card:hover {
          border-color: var(--desktop-primary-500);
          box-shadow: var(--desktop-shadow-sm);
        }

        .task-card.dragging {
          opacity: 0.5;
          box-shadow: var(--desktop-shadow-lg);
        }

        .task-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: var(--desktop-gap-sm);
        }

        .task-title {
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin: 0;
          flex: 1;
        }

        .priority-badge {
          padding: 3px 6px;
          border-radius: var(--desktop-radius-sm);
          font-size: 10px;
          font-weight: var(--desktop-weight-light);
          text-transform: capitalize;
        }

        .priority-low {
          background: #E8F5E9;
          color: #2E7D32;
        }

        .priority-medium {
          background: #FFF3E0;
          color: #F57C00;
        }

        .priority-high {
          background: #FFEBEE;
          color: #C62828;
        }

        .task-description {
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          margin: 0 0 var(--desktop-gap-md) 0;
          line-height: 1.4;
        }

        .task-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .task-assignee {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-sm);
        }

        .assignee-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--desktop-primary-500);
          color: var(--desktop-white-500);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: var(--desktop-weight-semibold);
        }

        .assignee-name {
          font-size: 10px;
          color: var(--desktop-gray-500);
        }

        .task-due-date {
          font-size: 10px;
          color: var(--desktop-gray-500);
        }
      `}</style>
    </div>
  );
};
