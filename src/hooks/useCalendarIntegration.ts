/**
 * useCalendarIntegration Hook
 * 
 * Custom hook for managing calendar integration settings including:
 * - Google Calendar connection
 * - Microsoft Outlook connection
 * - Calendar sync toggle
 * - LocalStorage persistence
 * 
 * @example
 * ```tsx
 * const {
 *   googleConnected,
 *   outlookConnected,
 *   syncEnabled,
 *   connectGoogle,
 *   connectOutlook,
 *   toggleSync
 * } = useCalendarIntegration();
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface UseCalendarIntegrationResult {
  /** Whether Google Calendar is connected */
  googleConnected: boolean;
  
  /** Whether Microsoft Outlook is connected */
  outlookConnected: boolean;
  
  /** Whether calendar sync is enabled */
  syncEnabled: boolean;
  
  /** Connect or disconnect Google Calendar */
  connectGoogle: () => void;
  
  /** Connect or disconnect Microsoft Outlook */
  connectOutlook: () => void;
  
  /** Toggle calendar sync on/off */
  toggleSync: (enabled: boolean) => void;
  
  /** Get the currently connected calendar provider */
  getConnectedProvider: () => 'google' | 'outlook' | null;
}

export function useCalendarIntegration(): UseCalendarIntegrationResult {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);

  /**
   * Load calendar connection status from localStorage on mount
   */
  useEffect(() => {
    const google = localStorage.getItem('googleCalendarConnected') === 'true';
    const outlook = localStorage.getItem('outlookCalendarConnected') === 'true';
    const sync = localStorage.getItem('calendarSyncEnabled') === 'true';

    setGoogleConnected(google);
    setOutlookConnected(outlook);
    setSyncEnabled(sync);
  }, []);

  /**
   * Connect or disconnect Google Calendar
   * Note: Only one provider can be connected at a time
   */
  const connectGoogle = useCallback(() => {
    const newState = !googleConnected;
    setGoogleConnected(newState);
    localStorage.setItem('googleCalendarConnected', String(newState));

    if (newState) {
      toast.success('Google Calendar connected successfully');
      // If connecting, disconnect Outlook (exclusive)
      if (outlookConnected) {
        setOutlookConnected(false);
        localStorage.setItem('outlookCalendarConnected', 'false');
      }
    } else {
      toast.success('Google Calendar disconnected');
      // Disable sync when disconnecting
      setSyncEnabled(false);
      localStorage.setItem('calendarSyncEnabled', 'false');
    }
  }, [googleConnected, outlookConnected]);

  /**
   * Connect or disconnect Microsoft Outlook
   * Note: Only one provider can be connected at a time
   */
  const connectOutlook = useCallback(() => {
    const newState = !outlookConnected;
    setOutlookConnected(newState);
    localStorage.setItem('outlookCalendarConnected', String(newState));

    if (newState) {
      toast.success('Microsoft Outlook connected successfully');
      // If connecting, disconnect Google (exclusive)
      if (googleConnected) {
        setGoogleConnected(false);
        localStorage.setItem('googleCalendarConnected', 'false');
      }
    } else {
      toast.success('Microsoft Outlook disconnected');
      // Disable sync when disconnecting
      setSyncEnabled(false);
      localStorage.setItem('calendarSyncEnabled', 'false');
    }
  }, [outlookConnected, googleConnected]);

  /**
   * Toggle calendar sync on/off
   */
  const toggleSync = useCallback((enabled: boolean) => {
    if (!googleConnected && !outlookConnected) {
      toast.error('Please connect a calendar first');
      return;
    }

    setSyncEnabled(enabled);
    localStorage.setItem('calendarSyncEnabled', String(enabled));
    toast.success(enabled ? 'Calendar sync enabled' : 'Calendar sync disabled');
  }, [googleConnected, outlookConnected]);

  /**
   * Get the currently connected calendar provider
   */
  const getConnectedProvider = useCallback((): 'google' | 'outlook' | null => {
    if (googleConnected) return 'google';
    if (outlookConnected) return 'outlook';
    return null;
  }, [googleConnected, outlookConnected]);

  return {
    googleConnected,
    outlookConnected,
    syncEnabled,
    connectGoogle,
    connectOutlook,
    toggleSync,
    getConnectedProvider,
  };
}
