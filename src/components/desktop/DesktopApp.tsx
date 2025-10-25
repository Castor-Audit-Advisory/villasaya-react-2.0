import React, { useEffect } from 'react';
import { DesktopLayout } from './DesktopLayout';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopHeader } from './DesktopHeader';
import { DesktopDashboard } from './DesktopDashboard';
import { DesktopStaffView } from './DesktopStaffView';
import { DesktopTasksView } from './DesktopTasksView';
import { DesktopExpensesView } from './DesktopExpensesView';
import { DesktopCalendarView } from './DesktopCalendarView';
import { DesktopMessagingView } from './DesktopMessagingView';
import { DesktopVillasView } from './DesktopVillasView';
import { DesktopAttendanceView } from './DesktopAttendanceView';
import { DesktopTenantsView } from './DesktopTenantsView';
import { DesktopLeavesView } from './DesktopLeavesView';
import { DesktopSettingsView } from './DesktopSettingsView';
import { DesktopPreferencesView } from './DesktopPreferencesView';
import { useApp } from '../../contexts/AppContext';

export const DesktopApp: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isAuthenticated,
    villas,
    villasLoading,
    loadVillas,
  } = useApp();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (!villasLoading && villas.length === 0) {
      void loadVillas();
    }
  }, [isAuthenticated, loadVillas, villas, villasLoading]);

  const getHeaderProps = () => {
    switch (currentView) {
      case 'staff':
        return {
          title: 'Staff',
          subtitle: 'All Employee Information',
        };
      case 'tasks':
        return {
          title: 'Tasks',
          subtitle: 'Manage all property tasks',
        };
      case 'expenses':
        return {
          title: 'Expenses',
          subtitle: 'Track and manage expenses',
        };
      case 'calendar':
        return {
          title: 'Calendars',
          subtitle: 'Schedule and events',
        };
      case 'messages':
        return {
          title: 'Messages',
          subtitle: 'Team communication',
        };
      case 'villas':
        return {
          title: 'Villas',
          subtitle: 'Property portfolio',
        };
      case 'attendance':
        return {
          title: 'Attendance',
          subtitle: 'Staff attendance tracking',
        };
      case 'tenants':
        return {
          title: 'Tenants',
          subtitle: 'Tenant management',
        };
      case 'leaves':
        return {
          title: 'Leave Requests',
          subtitle: 'Leave requests',
        };
      case 'settings-general':
        return {
          title: 'General Settings',
          subtitle: "Configure your organization's basic information",
        };
      case 'settings-security':
        return {
          title: 'Security & Access',
          subtitle: 'Manage security and access control',
        };
      case 'settings-notifications':
        return {
          title: 'Notifications',
          subtitle: 'Configure notification preferences',
        };
      case 'settings-billing':
        return {
          title: 'Billing & Subscription',
          subtitle: 'Manage billing and payment settings',
        };
      case 'settings-integrations':
        return {
          title: 'Integrations',
          subtitle: 'Connect third-party services',
        };
      case 'settings-data':
        return {
          title: 'Data & Retention',
          subtitle: 'Configure data retention policies',
        };
      case 'settings':
        return {
          title: 'Settings',
          subtitle: 'System configuration and admin settings',
        };
      case 'preferences':
        return {
          title: 'Preferences',
          subtitle: 'Personalize your workspace',
        };
      case 'dashboard':
      default:
        return {
          title: 'Dashboard',
          subtitle: "Welcome back! Here's what's happening with your properties.",
        };
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'staff':
        return <DesktopStaffView />;
      case 'tasks':
        return <DesktopTasksView />;
      case 'expenses':
        return <DesktopExpensesView />;
      case 'calendar':
        return <DesktopCalendarView />;
      case 'messages':
        return <DesktopMessagingView />;
      case 'villas':
        return <DesktopVillasView />;
      case 'attendance':
        return <DesktopAttendanceView />;
      case 'tenants':
        return <DesktopTenantsView />;
      case 'leaves':
        return <DesktopLeavesView />;
      case 'settings-general':
        return <DesktopSettingsView section="general" />;
      case 'settings-security':
        return <DesktopSettingsView section="security" />;
      case 'settings-notifications':
        return <DesktopSettingsView section="notifications" />;
      case 'settings-billing':
        return <DesktopSettingsView section="billing" />;
      case 'settings-integrations':
        return <DesktopSettingsView section="integrations" />;
      case 'settings-data':
        return <DesktopSettingsView section="dataRetention" />;
      case 'settings':
        return <DesktopSettingsView section="general" />;
      case 'preferences':
        return <DesktopPreferencesView />;
      case 'dashboard':
      default:
        return <DesktopDashboard />;
    }
  };

  return (
    <DesktopLayout
      sidebar={
        <DesktopSidebar
          currentView={currentView}
          onNavigate={setCurrentView}
        />
      }
      header={<DesktopHeader {...getHeaderProps()} onNavigate={setCurrentView} />}
    >
      {renderView()}
    </DesktopLayout>
  );
};
