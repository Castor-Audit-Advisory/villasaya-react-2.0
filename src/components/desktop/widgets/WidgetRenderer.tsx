import React from 'react';
import { WidgetType } from '../../../types/dashboard';
import { QuickStatsWidget } from './QuickStatsWidget';
import { TasksListWidget } from './TasksListWidget';
import { ExpensesSummaryWidget } from './ExpensesSummaryWidget';
import { CalendarEventsWidget } from './CalendarEventsWidget';
import { StaffStatusWidget } from './StaffStatusWidget';
import { RecentMessagesWidget } from './RecentMessagesWidget';
import { LeaveRequestsWidget } from './LeaveRequestsWidget';
import { ExpenseChartWidget } from './ExpenseChartWidget';
import { QuickActionsWidget } from './QuickActionsWidget';
import { AnnouncementsWidget } from './AnnouncementsWidget';

interface WidgetRendererProps {
  type: WidgetType;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ type }) => {
  switch (type) {
    case 'quick-stats':
      return <QuickStatsWidget />;
    case 'tasks-list':
      return <TasksListWidget />;
    case 'expenses-summary':
      return <ExpensesSummaryWidget />;
    case 'calendar-events':
      return <CalendarEventsWidget />;
    case 'staff-status':
      return <StaffStatusWidget />;
    case 'recent-messages':
      return <RecentMessagesWidget />;
    case 'leave-requests':
      return <LeaveRequestsWidget />;
    case 'expense-chart':
      return <ExpenseChartWidget />;
    case 'quick-actions':
      return <QuickActionsWidget />;
    case 'announcements':
      return <AnnouncementsWidget />;
    default:
      return <div>Unknown widget type</div>;
  }
};
