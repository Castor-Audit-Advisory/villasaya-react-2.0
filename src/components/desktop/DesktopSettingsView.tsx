import React from 'react';
import { 
  Shield, 
  Bell, 
  Mail, 
  DollarSign, 
  Calendar, 
  Users, 
  Building2,
  Database,
  Lock,
  Globe,
  Smartphone,
  FileText,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { toast } from 'sonner';

interface DesktopSettingsViewProps {
  section?: 'general' | 'security' | 'notifications' | 'billing' | 'integrations' | 'dataRetention';
}

export const DesktopSettingsView: React.FC<DesktopSettingsViewProps> = ({ section = 'general' }) => {
  const { settings, loading, saving, updateSettings, saveSettings, resetSettings } = useSettings();

  const handleSave = async () => {
    const success = await saveSettings(settings);
    if (!success) {
      toast.error('Failed to save settings');
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      const success = await resetSettings();
      if (!success) {
        toast.error('Failed to reset settings');
      }
    }
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3 className="section-title">General Settings</h3>
      <p className="section-description">Configure your organization's basic information and preferences</p>
      
      <div className="settings-grid">
        <div className="setting-item">
          <label className="setting-label">Company Name</label>
          <input
            type="text"
            className="setting-input"
            value={settings.general.companyName}
            onChange={(e) => updateSettings({
              ...settings,
              general: { ...settings.general, companyName: e.target.value }
            })}
          />
        </div>

        <div className="setting-item">
          <label className="setting-label">Timezone</label>
          <select
            className="setting-input"
            value={settings.general.timezone}
            onChange={(e) => updateSettings({
              ...settings,
              general: { ...settings.general, timezone: e.target.value }
            })}
          >
            <option value="UTC+8">UTC+8 (Singapore)</option>
            <option value="UTC+7">UTC+7 (Bangkok)</option>
            <option value="UTC+0">UTC+0 (London)</option>
            <option value="UTC-5">UTC-5 (New York)</option>
          </select>
        </div>

        <div className="setting-item">
          <label className="setting-label">Date Format</label>
          <select
            className="setting-input"
            value={settings.general.dateFormat}
            onChange={(e) => updateSettings({
              ...settings,
              general: { ...settings.general, dateFormat: e.target.value }
            })}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div className="setting-item">
          <label className="setting-label">Currency</label>
          <select
            className="setting-input"
            value={settings.general.currency}
            onChange={(e) => updateSettings({
              ...settings,
              general: { ...settings.general, currency: e.target.value }
            })}
          >
            <option value="USD">USD - US Dollar</option>
            <option value="SGD">SGD - Singapore Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </div>

        <div className="setting-item">
          <label className="setting-label">Language</label>
          <select
            className="setting-input"
            value={settings.general.language}
            onChange={(e) => updateSettings({
              ...settings,
              general: { ...settings.general, language: e.target.value }
            })}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="Mandarin">Mandarin</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3 className="section-title">Security & Access Control</h3>
      <p className="section-description">Manage security settings and access policies</p>
      
      <div className="settings-grid">
        <div className="setting-item setting-item-full">
          <div className="setting-toggle">
            <div>
              <label className="setting-label">Two-Factor Authentication</label>
              <p className="setting-hint">Require 2FA for all admin users</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.security.twoFactorAuth}
                onChange={(e) => updateSettings({
                  ...settings,
                  security: { ...settings.security, twoFactorAuth: e.target.checked }
                })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="setting-item">
          <label className="setting-label">Session Timeout (minutes)</label>
          <input
            type="number"
            className="setting-input"
            value={settings.security.sessionTimeout}
            onChange={(e) => updateSettings({
              ...settings,
              security: { ...settings.security, sessionTimeout: e.target.value }
            })}
          />
        </div>

        <div className="setting-item">
          <label className="setting-label">Password Expiry (days)</label>
          <input
            type="number"
            className="setting-input"
            value={settings.security.passwordExpiry}
            onChange={(e) => updateSettings({
              ...settings,
              security: { ...settings.security, passwordExpiry: e.target.value }
            })}
          />
        </div>

        <div className="setting-item">
          <label className="setting-label">Max Login Attempts</label>
          <input
            type="number"
            className="setting-input"
            value={settings.security.loginAttempts}
            onChange={(e) => updateSettings({
              ...settings,
              security: { ...settings.security, loginAttempts: e.target.value }
            })}
          />
        </div>

        <div className="setting-item setting-item-full">
          <div className="setting-toggle">
            <div>
              <label className="setting-label">IP Whitelist</label>
              <p className="setting-hint">Restrict access to specific IP addresses</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.security.ipWhitelist}
                onChange={(e) => updateSettings({
                  ...settings,
                  security: { ...settings.security, ipWhitelist: e.target.checked }
                })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3 className="section-title">Notification Preferences</h3>
      <p className="section-description">Configure email and system notifications</p>
      
      <div className="settings-grid">
        {Object.entries(settings.notifications).map(([key, value]) => (
          <div key={key} className="setting-item setting-item-full">
            <div className="setting-toggle">
              <div>
                <label className="setting-label">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateSettings({
                    ...settings,
                    notifications: { ...settings.notifications, [key]: e.target.checked }
                  })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="settings-section">
      <h3 className="section-title">Billing & Subscription</h3>
      <p className="section-description">Manage billing information and subscription settings</p>
      
      <div className="settings-grid">
        <div className="setting-item setting-item-full">
          <div className="setting-toggle">
            <div>
              <label className="setting-label">Auto-Renewal</label>
              <p className="setting-hint">Automatically renew subscription</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.billing.autoRenewal}
                onChange={(e) => updateSettings({
                  ...settings,
                  billing: { ...settings.billing, autoRenewal: e.target.checked }
                })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="setting-item">
          <label className="setting-label">Invoice Email</label>
          <input
            type="email"
            className="setting-input"
            value={settings.billing.invoiceEmail}
            onChange={(e) => updateSettings({
              ...settings,
              billing: { ...settings.billing, invoiceEmail: e.target.value }
            })}
          />
        </div>

        <div className="setting-item">
          <label className="setting-label">Payment Method</label>
          <select
            className="setting-input"
            value={settings.billing.paymentMethod}
            onChange={(e) => updateSettings({
              ...settings,
              billing: { ...settings.billing, paymentMethod: e.target.value }
            })}
          >
            <option value="Credit Card">Credit Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="PayPal">PayPal</option>
          </select>
        </div>

        <div className="setting-item">
          <label className="setting-label">Billing Cycle</label>
          <select
            className="setting-input"
            value={settings.billing.billingCycle}
            onChange={(e) => updateSettings({
              ...settings,
              billing: { ...settings.billing, billingCycle: e.target.value }
            })}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="settings-section">
      <h3 className="section-title">Integrations</h3>
      <p className="section-description">Connect third-party services and APIs</p>
      
      <div className="settings-grid">
        {Object.entries(settings.integrations).map(([key, value]) => (
          <div key={key} className="setting-item setting-item-full">
            <div className="setting-toggle">
              <div>
                <label className="setting-label">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateSettings({
                    ...settings,
                    integrations: { ...settings.integrations, [key]: e.target.checked }
                  })}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDataRetentionSettings = () => (
    <div className="settings-section">
      <h3 className="section-title">Data Retention & Storage</h3>
      <p className="section-description">Configure data retention policies (in months)</p>
      
      <div className="settings-grid">
        {Object.entries(settings.dataRetention).map(([key, value]) => (
          <div key={key} className="setting-item">
            <label className="setting-label">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </label>
            <input
              type="number"
              className="setting-input"
              value={value}
              onChange={(e) => updateSettings({
                ...settings,
                dataRetention: { ...settings.dataRetention, [key]: e.target.value }
              })}
            />
          </div>
        ))}
      </div>

      <div className="warning-box">
        <AlertCircle size={20} />
        <div>
          <p className="warning-title">Data Retention Policy</p>
          <p className="warning-text">
            Data older than the specified retention period will be automatically archived. 
            This action cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'billing':
        return renderBillingSettings();
      case 'integrations':
        return renderIntegrationSettings();
      case 'dataRetention':
        return renderDataRetentionSettings();
      default:
        return renderGeneralSettings();
    }
  };

  if (loading) {
    return (
      <div className="desktop-settings-view">
        <div className="settings-content">
          <div className="loading-state">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="desktop-settings-view">
      <div className="settings-content">
        {renderContent()}

        <div className="settings-actions">
          <button 
            className="btn-secondary" 
            onClick={handleReset}
            disabled={saving}
          >
            {saving ? 'Resetting...' : 'Reset to Defaults'}
          </button>
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <style>{`
        .desktop-settings-view {
          width: 100%;
          height: 100%;
          padding: 0 20px 20px 20px;
        }

        .settings-content {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          background: var(--desktop-gray-5);
          border-radius: var(--desktop-radius-lg);
          padding: var(--desktop-gap-2xl);
          overflow-y: auto;
          max-height: calc(100vh - 200px);
        }

        .settings-section {
          margin-bottom: var(--desktop-gap-2xl);
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

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--desktop-gap-xl);
        }

        .setting-item {
          display: flex;
          flex-direction: column;
          gap: var(--desktop-gap-md);
        }

        .setting-item-full {
          grid-column: 1 / -1;
        }

        .setting-label {
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          color: var(--desktop-dark-500);
        }

        .setting-hint {
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          color: var(--desktop-gray-500);
          margin-top: 4px;
        }

        .setting-input {
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
          transition: border-color 0.2s;
        }

        .setting-input:focus {
          border-color: var(--desktop-primary-500);
        }

        .setting-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--desktop-gap-lg);
          background: var(--desktop-white-500);
          border: 1px solid var(--desktop-gray-20);
          border-radius: var(--desktop-radius-lg);
        }

        .toggle-switch {
          position: relative;
          width: 48px;
          height: 24px;
          cursor: pointer;
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

        .warning-box {
          display: flex;
          gap: var(--desktop-gap-lg);
          padding: var(--desktop-gap-lg);
          background: #FFF4E5;
          border: 1px solid #FFE4B5;
          border-radius: var(--desktop-radius-lg);
          margin-top: var(--desktop-gap-2xl);
          color: #B35C00;
        }

        .warning-title {
          font-size: var(--desktop-body-1);
          font-weight: var(--desktop-weight-semibold);
          margin: 0 0 4px 0;
        }

        .warning-text {
          font-size: var(--desktop-body-2);
          font-weight: var(--desktop-weight-light);
          margin: 0;
        }

        .settings-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--desktop-gap-lg);
          padding-top: var(--desktop-gap-2xl);
          margin-top: var(--desktop-gap-2xl);
          border-top: 1px solid var(--desktop-gray-20);
        }

        .loading-state {
          text-align: center;
          padding: var(--desktop-gap-3xl);
          font-size: var(--desktop-body-1);
          color: var(--desktop-gray-500);
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
