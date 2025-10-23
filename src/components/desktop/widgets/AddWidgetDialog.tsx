import React, { useState } from 'react';
import { X, Plus, BarChart3, CheckSquare, DollarSign, Calendar, Users, MessageSquare, FileText, TrendingUp, Zap, Bell } from 'lucide-react';
import { WidgetType } from '../../../types/dashboard';
import { WIDGET_CATALOG } from './WidgetCatalog';

interface AddWidgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: WidgetType) => void;
  existingWidgetTypes: WidgetType[];
}

const iconMap: Record<string, React.ReactNode> = {
  'BarChart3': <BarChart3 size={24} />,
  'CheckSquare': <CheckSquare size={24} />,
  'DollarSign': <DollarSign size={24} />,
  'Calendar': <Calendar size={24} />,
  'Users': <Users size={24} />,
  'MessageSquare': <MessageSquare size={24} />,
  'FileText': <FileText size={24} />,
  'TrendingUp': <TrendingUp size={24} />,
  'Zap': <Zap size={24} />,
  'Bell': <Bell size={24} />,
};

export const AddWidgetDialog: React.FC<AddWidgetDialogProps> = ({ 
  isOpen, 
  onClose, 
  onAdd,
  existingWidgetTypes 
}) => {
  if (!isOpen) return null;

  const handleAddWidget = (type: WidgetType) => {
    onAdd(type);
    onClose();
  };

  return (
    <>
      <div className="dialog-overlay" onClick={onClose} />
      <div className="add-widget-dialog">
        <div className="dialog-header">
          <h2 className="dialog-title">Add Widget</h2>
          <button className="dialog-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="dialog-content">
          <p className="dialog-description">
            Select a widget to add to your dashboard. You can customize and rearrange widgets anytime.
          </p>

          <div className="widgets-grid">
            {WIDGET_CATALOG.map((widget) => {
              const count = existingWidgetTypes.filter(t => t === widget.type).length;
              const canAddMore = count < 3; // Allow up to 3 of each widget type

              return (
                <button
                  key={widget.type}
                  className={`widget-card ${!canAddMore ? 'disabled' : ''}`}
                  onClick={() => canAddMore && handleAddWidget(widget.type)}
                  disabled={!canAddMore}
                >
                  <div className="widget-card-icon">
                    {iconMap[widget.icon]}
                  </div>
                  <div className="widget-card-content">
                    <h3 className="widget-card-title">{widget.title}</h3>
                    <p className="widget-card-description">{widget.description}</p>
                    {count > 0 && (
                      <span className="widget-count-badge">
                        {count} active
                      </span>
                    )}
                  </div>
                  <div className="widget-card-action">
                    <Plus size={18} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <style>{`
          .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
          }

          .add-widget-dialog {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 720px;
            max-height: 80vh;
            background: white;
            border-radius: var(--desktop-radius-xl);
            box-shadow: var(--desktop-shadow-2xl);
            z-index: 1000;
            display: flex;
            flex-direction: column;
          }

          .dialog-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--desktop-gap-xl);
            border-bottom: 1px solid var(--desktop-gray-100);
          }

          .dialog-title {
            font-family: var(--desktop-font-family);
            font-size: var(--desktop-h3);
            font-weight: var(--desktop-weight-bold);
            color: var(--desktop-dark-500);
            margin: 0;
          }

          .dialog-close-btn {
            width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            color: var(--desktop-gray-400);
            cursor: pointer;
            border-radius: var(--desktop-radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }

          .dialog-close-btn:hover {
            background: var(--desktop-gray-100);
            color: var(--desktop-gray-600);
          }

          .dialog-content {
            flex: 1;
            overflow-y: auto;
            padding: var(--desktop-gap-xl);
          }

          .dialog-description {
            font-family: var(--desktop-font-family);
            font-size: var(--desktop-body-2);
            font-weight: var(--desktop-weight-light);
            color: var(--desktop-gray-600);
            margin: 0 0 var(--desktop-gap-xl) 0;
          }

          .widgets-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: var(--desktop-gap-md);
          }

          .widget-card {
            display: flex;
            align-items: flex-start;
            gap: var(--desktop-gap-md);
            padding: var(--desktop-gap-lg);
            background: var(--desktop-gray-10);
            border: 2px solid transparent;
            border-radius: var(--desktop-radius-lg);
            cursor: pointer;
            transition: all 0.2s;
            text-align: left;
          }

          .widget-card:hover:not(.disabled) {
            background: var(--desktop-gray-25);
            border-color: var(--desktop-primary-500);
            transform: translateY(-2px);
          }

          .widget-card.disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .widget-card-icon {
            width: 48px;
            height: 48px;
            background: var(--desktop-primary-50);
            color: var(--desktop-primary-500);
            border-radius: var(--desktop-radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .widget-card-content {
            flex: 1;
            min-width: 0;
          }

          .widget-card-title {
            font-family: var(--desktop-font-family);
            font-size: var(--desktop-body-1);
            font-weight: var(--desktop-weight-semibold);
            color: var(--desktop-dark-500);
            margin: 0 0 4px 0;
          }

          .widget-card-description {
            font-family: var(--desktop-font-family);
            font-size: var(--desktop-caption);
            font-weight: var(--desktop-weight-light);
            color: var(--desktop-gray-600);
            margin: 0;
          }

          .widget-count-badge {
            display: inline-block;
            margin-top: 6px;
            padding: 2px 8px;
            background: var(--desktop-primary-100);
            color: var(--desktop-primary-600);
            font-family: var(--desktop-font-family);
            font-size: var(--desktop-caption);
            font-weight: var(--desktop-weight-medium);
            border-radius: var(--desktop-radius-sm);
          }

          .widget-card-action {
            width: 32px;
            height: 32px;
            background: var(--desktop-primary-500);
            color: white;
            border-radius: var(--desktop-radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .widget-card.disabled .widget-card-action {
            background: var(--desktop-gray-300);
          }
        `}</style>
      </div>
    </>
  );
};
