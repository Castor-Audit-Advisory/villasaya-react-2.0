export type WidgetSize = 'small' | 'medium' | 'large';

export type WidgetType = 
  | 'quick-stats'
  | 'tasks-list'
  | 'expenses-summary'
  | 'calendar-events'
  | 'staff-status'
  | 'recent-messages'
  | 'leave-requests'
  | 'expense-chart'
  | 'quick-actions'
  | 'announcements';

export interface Widget {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  position: number;
}

export interface DashboardLayout {
  widgets: Widget[];
}

export interface WidgetDefinition {
  type: WidgetType;
  title: string;
  description: string;
  icon: string;
  defaultSize: WidgetSize;
  allowedSizes: WidgetSize[];
}
