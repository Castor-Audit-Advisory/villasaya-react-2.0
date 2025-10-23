import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Briefcase,
  UserPlus,
  FileText,
  Umbrella,
  Settings,
  ChevronDown,
  ChevronRight,
  Globe,
  Shield,
  Bell,
  Zap,
  Database,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  children?: NavItem[];
}

interface DesktopSidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentView, onNavigate }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['settings']);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, onClick: () => onNavigate('dashboard') },
    { id: 'staff', label: 'Staff', icon: <Users size={20} />, onClick: () => onNavigate('staff') },
    { id: 'villas', label: 'Villas', icon: <Building2 size={20} />, onClick: () => onNavigate('villas') },
    { id: 'attendance', label: 'Attendance', icon: <Calendar size={20} />, onClick: () => onNavigate('attendance') },
    { id: 'expenses', label: 'Expenses', icon: <DollarSign size={20} />, onClick: () => onNavigate('expenses') },
    { id: 'tasks', label: 'Tasks', icon: <Briefcase size={20} />, onClick: () => onNavigate('tasks') },
    { id: 'tenants', label: 'Tenants', icon: <UserPlus size={20} />, onClick: () => onNavigate('tenants') },
    { id: 'leaves', label: 'Leave Requests', icon: <FileText size={20} />, onClick: () => onNavigate('leaves') },
    { id: 'calendar', label: 'Calendars', icon: <Umbrella size={20} />, onClick: () => onNavigate('calendar') },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <Settings size={20} />, 
      onClick: () => toggleExpand('settings'),
      children: [
        { id: 'settings-general', label: 'General Settings', icon: <Globe size={18} />, onClick: () => onNavigate('settings-general') },
        { id: 'settings-security', label: 'Security & Access', icon: <Shield size={18} />, onClick: () => onNavigate('settings-security') },
        { id: 'settings-notifications', label: 'Notifications', icon: <Bell size={18} />, onClick: () => onNavigate('settings-notifications') },
        { id: 'settings-billing', label: 'Billing & Subscription', icon: <DollarSign size={18} />, onClick: () => onNavigate('settings-billing') },
        { id: 'settings-integrations', label: 'Integrations', icon: <Zap size={18} />, onClick: () => onNavigate('settings-integrations') },
        { id: 'settings-data', label: 'Data & Retention', icon: <Database size={18} />, onClick: () => onNavigate('settings-data') },
      ]
    },
  ];

  const isActive = (id: string) => currentView === id;
  const isExpanded = (id: string) => expandedItems.includes(id);

  return (
    <aside className="desktop-sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">VS</div>
        <span className="logo-text">VillaSaya</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div key={item.id} className="nav-item-wrapper">
            <button
              className={`nav-item ${isActive(item.id) ? 'active' : ''}`}
              onClick={item.onClick}
            >
              {isActive(item.id) && <div className="active-indicator" />}
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.children && (
                <span className="nav-chevron">
                  {isExpanded(item.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              )}
            </button>
            
            {item.children && isExpanded(item.id) && (
              <div className="nav-children">
                {item.children.map((child) => (
                  <button
                    key={child.id}
                    className={`nav-child-item ${isActive(child.id) ? 'active' : ''}`}
                    onClick={child.onClick}
                  >
                    <span className="nav-child-icon">{child.icon}</span>
                    <span className="nav-child-label">{child.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <style>{`
        .desktop-sidebar {
          position: fixed;
          left: var(--desktop-content-padding);
          top: var(--desktop-content-padding);
          width: var(--desktop-sidebar-width);
          height: calc(100vh - 24px);
          background: var(--desktop-gray-5);
          border-radius: var(--desktop-radius-xl);
          display: flex;
          flex-direction: column;
          padding: var(--desktop-gap-xl) 0;
          overflow-y: auto;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-md);
          padding: 0 var(--desktop-gap-xl);
          margin-bottom: var(--desktop-gap-xl);
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: var(--desktop-primary-400);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--desktop-white-500);
          font-weight: var(--desktop-weight-semibold);
          font-size: var(--desktop-caption);
        }

        .logo-text {
          font-size: var(--desktop-header-6);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-xs);
          padding: 0 var(--desktop-gap-xl);
        }

        .nav-item-wrapper {
          display: flex;
          flex-direction: column;
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-lg);
          height: 42px;
          padding: 0 var(--desktop-gap-lg);
          background: transparent;
          border: none;
          border-radius: 0 var(--desktop-radius-lg) var(--desktop-radius-lg) 0;
          cursor: pointer;
          transition: background 0.2s;
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          text-align: left;
        }

        .nav-item:hover {
          background: var(--desktop-primary-5);
        }

        .nav-item.active {
          background: var(--desktop-primary-5);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-primary-500);
        }

        .active-indicator {
          position: absolute;
          left: -16px;
          width: 3px;
          height: 42px;
          background: var(--desktop-primary-500);
          border-radius: var(--desktop-radius-lg);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: inherit;
        }

        .nav-label {
          flex: 1;
        }

        .nav-chevron {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--desktop-gray-400);
          transition: transform 0.2s;
        }

        .nav-children {
          display: flex;
          flex-direction: column;
          margin-left: var(--desktop-gap-xl);
          padding-left: var(--desktop-gap-md);
          border-left: 1px solid var(--desktop-gray-100);
        }

        .nav-child-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-md);
          height: 36px;
          padding: 0 var(--desktop-gap-md);
          background: transparent;
          border: none;
          border-radius: var(--desktop-radius-md);
          cursor: pointer;
          transition: background 0.2s;
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-600);
          text-align: left;
        }

        .nav-child-item:hover {
          background: var(--desktop-gray-50);
          color: var(--desktop-dark-500);
        }

        .nav-child-item.active {
          background: var(--desktop-primary-10);
          font-weight: var(--desktop-weight-medium);
          color: var(--desktop-primary-500);
        }

        .nav-child-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: inherit;
          opacity: 0.8;
        }

        .nav-child-label {
          flex: 1;
        }
      `}</style>
    </aside>
  );
};
