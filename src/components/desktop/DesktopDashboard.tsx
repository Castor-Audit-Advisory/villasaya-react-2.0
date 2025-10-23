import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, RotateCcw } from 'lucide-react';
import { useDashboardLayout } from '../../hooks/useDashboardLayout';
import { DashboardWidget } from './widgets/DashboardWidget';
import { AddWidgetDialog } from './widgets/AddWidgetDialog';
import { WidgetType } from '../../types/dashboard';

export const DesktopDashboard: React.FC = () => {
  const {
    widgets,
    addWidget,
    removeWidget,
    resizeWidget,
    reorderWidgets,
    resetLayout,
  } = useDashboardLayout();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      
      const reorderedWidgets = arrayMove([...widgets], oldIndex, newIndex);
      reorderWidgets(reorderedWidgets);
    }
  };

  const handleAddWidget = (type: WidgetType) => {
    addWidget(type);
  };

  const handleResetLayout = () => {
    if (confirm('Are you sure you want to reset the dashboard to default layout? This will remove all customizations.')) {
      resetLayout();
    }
  };

  const existingWidgetTypes = widgets.map(w => w.type);

  return (
    <div className="desktop-dashboard">
      <div className="dashboard-toolbar">
        <div className="toolbar-info">
          <h2 className="toolbar-title">My Dashboard</h2>
          <p className="toolbar-subtitle">
            {widgets.length} widget{widgets.length !== 1 ? 's' : ''} active
          </p>
        </div>
        <div className="toolbar-actions">
          <button className="btn-secondary" onClick={handleResetLayout}>
            <RotateCcw size={16} />
            Reset Layout
          </button>
          <button className="btn-primary" onClick={() => setIsAddDialogOpen(true)}>
            <Plus size={16} />
            Add Widget
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {widgets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3 className="empty-state-title">No Widgets Added</h3>
            <p className="empty-state-text">
              Get started by adding widgets to customize your dashboard
            </p>
            <button className="btn-primary" onClick={() => setIsAddDialogOpen(true)}>
              <Plus size={16} />
              Add Your First Widget
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
              <div className="widgets-grid">
                {widgets.map((widget) => (
                  <DashboardWidget
                    key={widget.id}
                    widget={widget}
                    onRemove={removeWidget}
                    onResize={resizeWidget}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <AddWidgetDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddWidget}
        existingWidgetTypes={existingWidgetTypes}
      />

      <style>{`
        .desktop-dashboard {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .dashboard-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--desktop-gap-lg) var(--desktop-gap-lg) var(--desktop-gap-md) var(--desktop-gap-lg);
          border-bottom: 1px solid var(--desktop-gray-100);
          background: white;
        }

        .toolbar-info {
          flex: 1;
        }

        .toolbar-title {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-h3);
          font-weight: var(--desktop-weight-bold);
          color: var(--desktop-dark-500);
          margin: 0 0 2px 0;
        }

        .toolbar-subtitle {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          margin: 0;
        }

        .toolbar-actions {
          display: flex;
          gap: var(--desktop-gap-sm);
        }

        .btn-primary, .btn-secondary {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-xs);
          padding: var(--desktop-gap-sm) var(--desktop-gap-md);
          border-radius: var(--desktop-radius-md);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-medium);
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: var(--desktop-primary-500);
          color: white;
        }

        .btn-primary:hover {
          background: var(--desktop-primary-600);
        }

        .btn-secondary {
          background: transparent;
          color: var(--desktop-gray-600);
          border: 1px solid var(--desktop-gray-200);
        }

        .btn-secondary:hover {
          background: var(--desktop-gray-50);
          border-color: var(--desktop-gray-300);
        }

        .dashboard-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--desktop-gap-lg);
          background: var(--desktop-gray-25);
        }

        .widgets-grid {
          display: grid;
          grid-template-columns: repeat(24, 1fr);
          gap: var(--desktop-gap-lg);
          align-items: start;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .empty-state-icon {
          font-size: 64px;
          margin-bottom: var(--desktop-gap-lg);
        }

        .empty-state-title {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-h3);
          font-weight: var(--desktop-weight-bold);
          color: var(--desktop-dark-500);
          margin: 0 0 var(--desktop-gap-sm) 0;
        }

        .empty-state-text {
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          margin: 0 0 var(--desktop-gap-xl) 0;
          max-width: 400px;
        }
      `}</style>
    </div>
  );
};
