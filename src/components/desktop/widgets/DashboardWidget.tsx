import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Maximize2, Minimize2 } from 'lucide-react';
import { Widget, WidgetSize } from '../../../types/dashboard';
import { WidgetRenderer } from './WidgetRenderer';
import { WIDGET_CATALOG } from './WidgetCatalog';

interface DashboardWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
  onResize: (id: string, size: WidgetSize) => void;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({ 
  widget, 
  onRemove, 
  onResize 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const widgetDef = WIDGET_CATALOG.find(w => w.type === widget.type);
  const title = widgetDef?.title || 'Widget';
  const allowedSizes = widgetDef?.allowedSizes || ['small', 'medium', 'large'];

  const handleSizeChange = () => {
    const sizes: WidgetSize[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(widget.size);
    const nextSize = sizes[(currentIndex + 1) % sizes.length];
    
    // Only change to allowed size
    if (allowedSizes.includes(nextSize)) {
      onResize(widget.id, nextSize);
    } else {
      // Find next allowed size
      const nextAllowedSize = sizes.find((s, i) => i > currentIndex && allowedSizes.includes(s)) || allowedSizes[0];
      onResize(widget.id, nextAllowedSize);
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`dashboard-widget widget-${widget.size}`}
    >
      <div className="widget-header">
        <div className="widget-drag-handle" {...attributes} {...listeners}>
          <GripVertical size={16} />
        </div>
        <h3 className="widget-title">{title}</h3>
        <div className="widget-actions">
          {allowedSizes.length > 1 && (
            <button 
              className="widget-action-btn" 
              onClick={handleSizeChange}
              title="Resize widget"
            >
              {widget.size === 'small' ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
          )}
          <button 
            className="widget-action-btn widget-remove" 
            onClick={() => onRemove(widget.id)}
            title="Remove widget"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="widget-content">
        <WidgetRenderer type={widget.type} />
      </div>

      <style>{`
        .dashboard-widget {
          background: white;
          border-radius: var(--desktop-radius-lg);
          border: 1px solid var(--desktop-gray-100);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.2s;
        }

        .dashboard-widget:hover {
          box-shadow: var(--desktop-shadow-md);
        }

        .widget-small {
          grid-column: span 6;
          min-height: 280px;
        }

        .widget-medium {
          grid-column: span 8;
          min-height: 360px;
        }

        .widget-large {
          grid-column: span 12;
          min-height: 420px;
        }

        .widget-header {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-sm);
          padding: var(--desktop-gap-md) var(--desktop-gap-lg);
          border-bottom: 1px solid var(--desktop-gray-100);
          background: var(--desktop-gray-5);
        }

        .widget-drag-handle {
          cursor: grab;
          color: var(--desktop-gray-400);
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: var(--desktop-radius-sm);
          transition: all 0.2s;
        }

        .widget-drag-handle:hover {
          background: var(--desktop-gray-100);
          color: var(--desktop-gray-600);
        }

        .widget-drag-handle:active {
          cursor: grabbing;
        }

        .widget-title {
          flex: 1;
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin: 0;
        }

        .widget-actions {
          display: flex;
          gap: var(--desktop-gap-xs);
        }

        .widget-action-btn {
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: var(--desktop-gray-400);
          cursor: pointer;
          border-radius: var(--desktop-radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .widget-action-btn:hover {
          background: var(--desktop-gray-100);
          color: var(--desktop-gray-600);
        }

        .widget-action-btn.widget-remove:hover {
          background: var(--desktop-error-50);
          color: var(--desktop-error-500);
        }

        .widget-content {
          flex: 1;
          padding: var(--desktop-gap-lg);
          overflow: auto;
        }
      `}</style>
    </div>
  );
};
