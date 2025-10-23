import { useState, useEffect } from 'react';
import { Widget, WidgetType, WidgetSize, DashboardLayout } from '../types/dashboard';
import { WIDGET_CATALOG } from '../components/desktop/widgets/WidgetCatalog';

const STORAGE_KEY = 'villasaya_dashboard_layout';

const getDefaultLayout = (): DashboardLayout => {
  return {
    widgets: [
      { id: 'widget-1', type: 'quick-stats', size: 'small', position: 0 },
      { id: 'widget-2', type: 'tasks-list', size: 'medium', position: 1 },
      { id: 'widget-3', type: 'expenses-summary', size: 'medium', position: 2 },
      { id: 'widget-4', type: 'calendar-events', size: 'medium', position: 3 },
    ],
  };
};

const loadLayout = (): DashboardLayout => {
  if (typeof window === 'undefined') return getDefaultLayout();
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load dashboard layout:', error);
  }
  return getDefaultLayout();
};

const saveLayout = (layout: DashboardLayout) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch (error) {
    console.error('Failed to save dashboard layout:', error);
  }
};

export const useDashboardLayout = () => {
  const [layout, setLayout] = useState<DashboardLayout>(loadLayout);

  useEffect(() => {
    saveLayout(layout);
  }, [layout]);

  const addWidget = (type: WidgetType) => {
    const widgetDef = WIDGET_CATALOG.find(w => w.type === type);
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      size: widgetDef?.defaultSize || 'medium',
      position: layout.widgets.length,
    };

    setLayout({
      ...layout,
      widgets: [...layout.widgets, newWidget],
    });
  };

  const removeWidget = (id: string) => {
    setLayout({
      ...layout,
      widgets: layout.widgets
        .filter(w => w.id !== id)
        .map((w, index) => ({ ...w, position: index })),
    });
  };

  const resizeWidget = (id: string, size: WidgetSize) => {
    setLayout({
      ...layout,
      widgets: layout.widgets.map(w => 
        w.id === id ? { ...w, size } : w
      ),
    });
  };

  const reorderWidgets = (widgets: Widget[]) => {
    setLayout({
      ...layout,
      widgets: widgets.map((w, index) => ({ ...w, position: index })),
    });
  };

  const resetLayout = () => {
    setLayout(getDefaultLayout());
  };

  return {
    widgets: layout.widgets,
    addWidget,
    removeWidget,
    resizeWidget,
    reorderWidgets,
    resetLayout,
  };
};
