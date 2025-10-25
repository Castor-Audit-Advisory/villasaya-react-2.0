import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface DesktopHeaderProps {
  title: string;
  subtitle?: string;
  onNavigate?: (view: string) => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = ({ title, subtitle, onNavigate }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout } = useApp();

  const userDisplayName = useMemo(() => {
    if (currentUser?.name) {
      return currentUser.name;
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'Team Member';
  }, [currentUser]);

  const userInitials = useMemo(() => {
    if (!currentUser) {
      return 'VS';
    }

    const name = currentUser.name || currentUser.email;
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('') || 'VS';
  }, [currentUser]);

  const userRoleLabel = useMemo(() => {
    if (!currentUser?.role) {
      return 'Staff Member';
    }

    return currentUser.role
      .split('_')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (view: string) => {
    setShowDropdown(false);
    if (onNavigate) {
      onNavigate(view);
    }
  };

  const handleNotifications = () => {
    alert('Notifications functionality will be implemented');
  };

  const handleLogout = () => {
    if (!confirm('Are you sure you want to log out?')) {
      return;
    }

    void logout();
  };

  return (
    <header className="desktop-header">
      <div className="header-content">
        <div className="header-title-section">
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>

        <div className="header-actions">
          <div className="search-input">
            <Search size={20} />
            <input type="text" placeholder="Search anything here..." />
          </div>

          <button className="notification-btn" onClick={handleNotifications}>
            <Bell size={20} />
          </button>

          <div className="user-profile-wrapper" ref={dropdownRef}>
            <div 
              className="user-profile"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="user-avatar">
                {userInitials}
              </div>
              <div className="user-info">
                <span className="user-name">
                  {userDisplayName}
                </span>
                <span className="user-role">{userRoleLabel}</span>
              </div>
              <ChevronDown size={16} className={showDropdown ? 'chevron-rotated' : ''} />
            </div>

            {showDropdown && (
              <div className="user-dropdown">
                <button 
                  className="dropdown-item"
                  onClick={() => handleMenuClick('preferences')}
                >
                  <User size={18} />
                  <span>Preferences</span>
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => handleMenuClick('settings')}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
                <div className="dropdown-divider" />
                <button 
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .desktop-header {
          position: fixed;
          top: var(--desktop-content-padding);
          right: 0;
          width: calc(100% - var(--desktop-sidebar-width) - var(--desktop-content-padding));
          height: var(--desktop-header-height);
          background: transparent;
          z-index: 100;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 0 var(--desktop-content-padding);
        }

        .header-title-section {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .header-title {
          font-size: var(--desktop-header-6);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          line-height: 24px;
          margin: 0;
        }

        .header-subtitle {
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          line-height: 22px;
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-lg);
        }

        .search-input {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-md);
          padding: 10px var(--desktop-gap-lg);
          width: 240px;
          height: 42px;
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-10);
          border-radius: var(--desktop-radius-lg);
        }

        .search-input input {
          flex: 1;
          border: none;
          outline: none;
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          background: transparent;
        }

        .search-input input::placeholder {
          color: var(--desktop-dark-20);
        }

        .notification-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          background: var(--desktop-gray-10);
          border: none;
          border-radius: var(--desktop-radius-lg);
          cursor: pointer;
          transition: background 0.2s;
          color: var(--desktop-dark-500);
        }

        .notification-btn:hover {
          background: var(--desktop-gray-20);
        }

        .user-profile-wrapper {
          position: relative;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-md);
          padding: 4px;
          height: 42px;
          border: 1px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-md);
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .user-profile:hover {
          border-color: var(--desktop-gray-500);
        }

        .chevron-rotated {
          transform: rotate(180deg);
          transition: transform 0.2s;
        }

        .user-avatar {
          width: 34px;
          height: 34px;
          background: var(--desktop-primary-500);
          border-radius: var(--desktop-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--desktop-white-500);
          font-weight: var(--desktop-weight-semibold);
          font-size: var(--desktop-caption);
          text-transform: uppercase;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .user-name {
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          line-height: 24px;
        }

        .user-role {
          font-size: var(--desktop-caption);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          line-height: 18px;
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 200px;
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-lg);
          box-shadow: var(--desktop-shadow-md);
          padding: var(--desktop-gap-md);
          z-index: 1000;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-lg);
          width: 100%;
          padding: var(--desktop-gap-lg);
          background: transparent;
          border: none;
          border-radius: var(--desktop-radius-md);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          cursor: pointer;
          transition: background 0.2s;
          text-align: left;
        }

        .dropdown-item:hover {
          background: var(--desktop-gray-5);
        }

        .dropdown-item.logout {
          color: #EA5455;
        }

        .dropdown-item.logout:hover {
          background: #FFF1F0;
        }

        .dropdown-divider {
          height: 1px;
          background: var(--desktop-gray-20);
          margin: var(--desktop-gap-md) 0;
        }
      `}</style>
    </header>
  );
};
