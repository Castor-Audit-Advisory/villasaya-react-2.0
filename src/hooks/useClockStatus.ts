/**
 * useClockStatus Hook
 * 
 * Custom hook for managing staff clock in/out functionality including:
 * - Loading clock status from API
 * - Performing clock in/out actions
 * - Location tracking via geolocation API
 * - Time formatting utilities
 * 
 * @example
 * ```tsx
 * const {
 *   status,
 *   loading,
 *   actionLoading,
 *   location,
 *   clockAction,
 *   formatTime,
 *   formatHours
 * } = useClockStatus({
 *   villaId: 'villa-123',
 *   onSuccess: () => console.log('Action completed')
 * });
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../utils/api';
import { toast } from 'sonner';

export interface UseClockStatusOptions {
  /** Villa ID to track clock status for */
  villaId: string;
  
  /** Callback fired after successful clock action */
  onSuccess?: () => void;
  
  /** Whether to enable location tracking (default: true) */
  enableLocation?: boolean;
}

export interface ClockStatus {
  isClockedIn: boolean;
  hoursWorked: number;
  todayRecords?: any[];
  lastRecord?: {
    action: 'in' | 'out';
    timestamp: string;
    location?: string;
  };
}

export interface UseClockStatusResult {
  /** Current clock status */
  status: ClockStatus | null;
  
  /** Loading state for initial status fetch */
  loading: boolean;
  
  /** Loading state for clock actions */
  actionLoading: boolean;
  
  /** User's current location (if available) */
  location: string | null;
  
  /** Perform a clock in or clock out action */
  clockAction: (action: 'in' | 'out') => Promise<void>;
  
  /** Format timestamp to display time (e.g., "02:30 PM") */
  formatTime: (timestamp: string) => string;
  
  /** Format hours worked (e.g., "8h 30m") */
  formatHours: (hours: number) => string;
  
  /** Refresh clock status */
  refresh: () => Promise<void>;
}

export function useClockStatus(options: UseClockStatusOptions): UseClockStatusResult {
  const { villaId, onSuccess, enableLocation = true } = options;

  const [status, setStatus] = useState<ClockStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [location, setLocation] = useState<string | null>(null);

  /**
   * Load clock status from API
   */
  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiRequest(`/staff/clock/status?villaId=${villaId}`);
      setStatus(data);
    } catch (error: any) {
      console.error('Error loading clock status:', error);
    } finally {
      setLoading(false);
    }
  }, [villaId]);

  /**
   * Get user's current location
   */
  const getLocation = useCallback(() => {
    if (!enableLocation || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
      },
      () => {
        // Location permission denied or unavailable
        setLocation(null);
      }
    );
  }, [enableLocation]);

  /**
   * Perform clock in or clock out action
   */
  const clockAction = useCallback(async (action: 'in' | 'out'): Promise<void> => {
    try {
      setActionLoading(true);
      
      await apiRequest('/staff/clock', {
        method: 'POST',
        body: JSON.stringify({
          villaId,
          action,
          location,
        }),
      });

      const actionText = action === 'in' ? 'Clocked In' : 'Clocked Out';
      toast.success(`${actionText} successfully!`);
      
      await loadStatus();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error clocking in/out:', error);
      toast.error(error.message || `Failed to clock ${action}`);
      throw error; // Re-throw for caller to handle if needed
    } finally {
      setActionLoading(false);
    }
  }, [villaId, location, loadStatus, onSuccess]);

  /**
   * Format timestamp to display time
   */
  const formatTime = useCallback((timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  /**
   * Format hours worked to human-readable format
   */
  const formatHours = useCallback((hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }, []);

  /**
   * Initialize: Load status on mount and when villaId changes
   */
  useEffect(() => {
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villaId]);

  /**
   * Get location on mount
   */
  useEffect(() => {
    getLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    loading,
    actionLoading,
    location,
    clockAction,
    formatTime,
    formatHours,
    refresh: loadStatus,
  };
}
