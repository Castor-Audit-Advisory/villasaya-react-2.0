import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../utils/api';
import { toast } from 'sonner';

export interface UserSettings {
  general: {
    companyName: string;
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: string;
    passwordExpiry: string;
    loginAttempts: string;
    ipWhitelist: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    taskReminders: boolean;
    expenseAlerts: boolean;
    leaveRequests: boolean;
    maintenanceAlerts: boolean;
    tenantMessages: boolean;
  };
  billing: {
    autoRenewal: boolean;
    invoiceEmail: string;
    paymentMethod: string;
    billingCycle: string;
  };
  integrations: {
    googleCalendar: boolean;
    microsoftCalendar: boolean;
    slackNotifications: boolean;
    stripePayments: boolean;
  };
  dataRetention: {
    taskHistory: string;
    expenseRecords: string;
    messageArchive: string;
    auditLogs: string;
  };
}

export const defaultSettings: UserSettings = {
  general: {
    companyName: 'VillaSaya Properties',
    timezone: 'UTC+8',
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    currency: 'USD'
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAttempts: '5',
    ipWhitelist: false
  },
  notifications: {
    emailNotifications: true,
    taskReminders: true,
    expenseAlerts: true,
    leaveRequests: true,
    maintenanceAlerts: true,
    tenantMessages: true
  },
  billing: {
    autoRenewal: true,
    invoiceEmail: '',
    paymentMethod: 'Credit Card',
    billingCycle: 'monthly'
  },
  integrations: {
    googleCalendar: false,
    microsoftCalendar: false,
    slackNotifications: false,
    stripePayments: false
  },
  dataRetention: {
    taskHistory: '12',
    expenseRecords: '60',
    messageArchive: '24',
    auditLogs: '36'
  }
};

// Deep merge helper function with null/undefined safety
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output = { ...target };
  
  Object.keys(source).forEach(key => {
    const sourceValue = source[key as keyof T];
    const targetValue = target[key as keyof T];
    
    // Skip null or undefined values - preserve existing
    if (sourceValue === null || sourceValue === undefined) {
      return;
    }
    
    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue) &&
        targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
      output[key as keyof T] = deepMerge(targetValue as any, sourceValue as any);
    } else {
      output[key as keyof T] = sourceValue as any;
    }
  });
  
  return output;
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch settings from backend
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/user/settings', { method: 'GET' });
      
      if (response.settings) {
        setSettings(response.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save settings to backend
  const saveSettings = useCallback(async (updatedSettings: Partial<UserSettings>) => {
    try {
      setSaving(true);
      
      const response = await apiRequest('/user/settings', {
        method: 'PUT',
        body: JSON.stringify(updatedSettings),
      });

      if (response.success && response.settings) {
        setSettings(response.settings);
        toast.success('Settings saved successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  // Reset to defaults
  const resetSettings = useCallback(async () => {
    try {
      setSaving(true);
      
      const response = await apiRequest('/user/settings', {
        method: 'PUT',
        body: JSON.stringify(defaultSettings),
      });

      if (response.success && response.settings) {
        setSettings(response.settings);
        toast.success('Settings reset to defaults');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Failed to reset settings');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  // Update settings locally (doesn't save to backend) with deep merge
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings(prev => deepMerge(prev, updates));
  }, []);

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    saving,
    updateSettings,
    saveSettings,
    resetSettings,
    refetch: fetchSettings
  };
}
