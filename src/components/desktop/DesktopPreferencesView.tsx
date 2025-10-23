import React, { useState } from 'react';
import { Sun, Moon, Monitor, Bell, Globe, Palette, Layout, Zap } from 'lucide-react';

export const DesktopPreferencesView: React.FC = () => {
  const [preferences, setPreferences] = useState({
    theme: 'light',
    compactMode: false,
    showNotifications: true,
    soundEffects: true,
    autoRefresh: true,
    startPage: 'dashboard',
    itemsPerPage: '25',
    language: 'en',
  });

  const handleSave = () => {
    console.log('Saving preferences:', preferences);
    alert('Preferences saved successfully!');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all preferences to defaults?')) {
      setPreferences({
        theme: 'light',
        compactMode: false,
        showNotifications: true,
        soundEffects: true,
        autoRefresh: true,
        startPage: 'dashboard',
        itemsPerPage: '25',
        language: 'en',
      });
      alert('Preferences reset to defaults');
    }
  };

  return (
    <div className="desktop-preferences-view">
      <div className="preferences-content">
        <div className="preferences-section">
          <h3 className="section-title">Appearance</h3>
          <p className="section-description">Customize how VillaSaya looks for you</p>
          
          <div className="preference-item">
            <label className="preference-label">
              <Palette size={20} />
              <span>Theme</span>
            </label>
            <div className="theme-selector">
              <button
                className={`theme-option ${preferences.theme === 'light' ? 'active' : ''}`}
                onClick={() => setPreferences({ ...preferences, theme: 'light' })}
              >
                <Sun size={20} />
                <span>Light</span>
              </button>
              <button
                className={`theme-option ${preferences.theme === 'dark' ? 'active' : ''}`}
                onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
              >
                <Moon size={20} />
                <span>Dark</span>
              </button>
              <button
                className={`theme-option ${preferences.theme === 'auto' ? 'active' : ''}`}
                onClick={() => setPreferences({ ...preferences, theme: 'auto' })}
              >
                <Monitor size={20} />
                <span>Auto</span>
              </button>
            </div>
          </div>

          <div className="preference-item">
            <div className="preference-toggle">
              <div className="toggle-info">
                <label className="preference-label">
                  <Layout size={20} />
                  <span>Compact Mode</span>
                </label>
                <p className="preference-hint">Reduce spacing and increase information density</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.compactMode}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    compactMode: e.target.checked
                  })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="preferences-section">
          <h3 className="section-title">Notifications & Alerts</h3>
          <p className="section-description">Control your notification preferences</p>
          
          <div className="preference-item">
            <div className="preference-toggle">
              <div className="toggle-info">
                <label className="preference-label">
                  <Bell size={20} />
                  <span>Desktop Notifications</span>
                </label>
                <p className="preference-hint">Show browser notifications for important updates</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.showNotifications}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    showNotifications: e.target.checked
                  })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="preference-item">
            <div className="preference-toggle">
              <div className="toggle-info">
                <label className="preference-label">
                  <Zap size={20} />
                  <span>Sound Effects</span>
                </label>
                <p className="preference-hint">Play sounds for notifications and actions</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.soundEffects}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    soundEffects: e.target.checked
                  })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="preferences-section">
          <h3 className="section-title">General Preferences</h3>
          <p className="section-description">Personalize your workspace</p>
          
          <div className="preference-item">
            <label className="preference-label">
              <Layout size={20} />
              <span>Default Start Page</span>
            </label>
            <select
              className="preference-select"
              value={preferences.startPage}
              onChange={(e) => setPreferences({
                ...preferences,
                startPage: e.target.value
              })}
            >
              <option value="dashboard">Dashboard</option>
              <option value="tasks">Tasks</option>
              <option value="staff">Staff</option>
              <option value="villas">Villas</option>
              <option value="expenses">Expenses</option>
            </select>
          </div>

          <div className="preference-item">
            <label className="preference-label">
              <Layout size={20} />
              <span>Items Per Page</span>
            </label>
            <select
              className="preference-select"
              value={preferences.itemsPerPage}
              onChange={(e) => setPreferences({
                ...preferences,
                itemsPerPage: e.target.value
              })}
            >
              <option value="10">10 items</option>
              <option value="25">25 items</option>
              <option value="50">50 items</option>
              <option value="100">100 items</option>
            </select>
          </div>

          <div className="preference-item">
            <label className="preference-label">
              <Globe size={20} />
              <span>Display Language</span>
            </label>
            <select
              className="preference-select"
              value={preferences.language}
              onChange={(e) => setPreferences({
                ...preferences,
                language: e.target.value
              })}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="zh">中文</option>
            </select>
          </div>

          <div className="preference-item">
            <div className="preference-toggle">
              <div className="toggle-info">
                <label className="preference-label">
                  <Zap size={20} />
                  <span>Auto-Refresh Data</span>
                </label>
                <p className="preference-hint">Automatically refresh data every 30 seconds</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.autoRefresh}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    autoRefresh: e.target.checked
                  })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="preferences-actions">
          <button className="btn-secondary" onClick={handleReset}>Reset to Defaults</button>
          <button className="btn-primary" onClick={handleSave}>
            Save Preferences
          </button>
        </div>
      </div>

      <style>{`
        .desktop-preferences-view {
          width: 100%;
          height: 100%;
          padding: 0 20px 20px 20px;
        }

        .preferences-content {
          background: var(--desktop-gray-5);
          border-radius: var(--desktop-radius-lg);
          padding: var(--desktop-gap-2xl);
          max-width: 800px;
          margin: 0 auto;
        }

        .preferences-section {
          margin-bottom: var(--desktop-gap-2xl);
          padding-bottom: var(--desktop-gap-2xl);
          border-bottom: 1px solid var(--desktop-gray-20);
        }

        .preferences-section:last-of-type {
          border-bottom: none;
        }

        .section-title {
          font-size: var(--desktop-header-6);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin: 0 0 var(--desktop-gap-sm) 0;
        }

        .section-description {
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          margin: 0 0 var(--desktop-gap-2xl) 0;
        }

        .preference-item {
          margin-bottom: var(--desktop-gap-xl);
        }

        .preference-item:last-child {
          margin-bottom: 0;
        }

        .preference-label {
          display: flex;
          align-items: center;
          gap: var(--desktop-gap-md);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
          margin-bottom: var(--desktop-gap-md);
        }

        .preference-hint {
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          margin: 4px 0 0 0;
        }

        .theme-selector {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--desktop-gap-md);
        }

        .theme-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--desktop-gap-md);
          padding: var(--desktop-gap-xl);
          background: var(--desktop-white-500);
          border: 2px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-lg);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          cursor: pointer;
          transition: all 0.2s;
        }

        .theme-option:hover {
          border-color: var(--desktop-gray-500);
        }

        .theme-option.active {
          border-color: var(--desktop-primary-500);
          background: var(--desktop-primary-5);
          color: var(--desktop-primary-500);
          font-weight: var(--desktop-weight-semibold);
        }

        .preference-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--desktop-gap-lg);
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-lg);
        }

        .toggle-info {
          flex: 1;
        }

        .toggle-info .preference-label {
          margin-bottom: 0;
        }

        .toggle-switch {
          position: relative;
          width: 48px;
          height: 24px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--desktop-gray-20);
          border-radius: 24px;
          transition: background 0.3s;
        }

        .toggle-slider::before {
          content: '';
          position: absolute;
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: var(--desktop-white-500);
          border-radius: 50%;
          transition: transform 0.3s;
        }

        .toggle-switch input:checked + .toggle-slider {
          background: var(--desktop-primary-500);
        }

        .toggle-switch input:checked + .toggle-slider::before {
          transform: translateX(24px);
        }

        .preference-select {
          width: 100%;
          height: 42px;
          padding: 0 var(--desktop-gap-lg);
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-lg);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-dark-500);
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .preference-select:focus {
          border-color: var(--desktop-primary-500);
        }

        .preferences-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--desktop-gap-lg);
          padding-top: var(--desktop-gap-2xl);
          margin-top: var(--desktop-gap-2xl);
          border-top: 1px solid var(--desktop-gray-20);
        }

        .btn-secondary,
        .btn-primary {
          padding: 0 var(--desktop-gap-2xl);
          height: 42px;
          border-radius: var(--desktop-radius-lg);
          font-family: var(--desktop-font-family);
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-secondary {
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-20);
          color: var(--desktop-dark-500);
        }

        .btn-secondary:hover {
          border-color: var(--desktop-gray-500);
        }

        .btn-primary {
          background: var(--desktop-primary-500);
          color: var(--desktop-white-500);
        }

        .btn-primary:hover {
          background: var(--desktop-primary-400);
        }
      `}</style>
    </div>
  );
};
