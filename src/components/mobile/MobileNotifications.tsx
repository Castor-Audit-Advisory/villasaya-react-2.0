import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bell, Info, RefreshCw } from 'lucide-react';
import { Box, Typography } from '@mui/material';
import { apiRequest } from '../../utils/api';
import { PullToRefresh } from './PullToRefresh';
import { MobileBottomNav } from './MobileBottomNav';
import { PageHeader } from '../shared/PageHeader';
import { SkeletonActivityItem, SkeletonList } from '../ui/skeleton';
import { Button } from '../ui/button';
import { formatRelativeTime } from '../../utils/datetime';

interface MobileNotificationsProps {
  onNavigate?: (view: string) => void;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  severity?: 'info' | 'warning' | 'critical';
  villaName?: string;
}

const severityStyles: Record<NonNullable<NotificationItem['severity']>, { bgcolor: string; color: string }> = {
  info: { bgcolor: '#E9E5FF', color: '#4634C4' },
  warning: { bgcolor: '#FFF5E5', color: '#9A6200' },
  critical: { bgcolor: '#FFE5E5', color: '#B11A1A' },
};

const severityIcons: Record<NonNullable<NotificationItem['severity']>, React.ReactElement> = {
  info: <Info className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  critical: <AlertTriangle className="w-4 h-4" />,
};

export function MobileNotifications({ onNavigate }: MobileNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  const loadNotifications = async () => {
    setError(null);
    try {
      const response = await apiRequest<{ notifications: NotificationItem[] }>('/notifications');
      setNotifications(response.notifications || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Unable to load notifications. Pull to refresh to try again.');
    } finally {
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleNavigateTab = (tab: string) => {
    const viewMap: { [key: string]: string } = {
      home: 'dashboard',
      villas: 'villas',
      calendar: 'calendar',
      tasks: 'tasks',
      expenses: 'expenses',
    };
    onNavigate?.(viewMap[tab] || tab);
  };

  if (isInitialLoad) {
    return (
      <Box sx={{ 
        minHeight: '100dvh', 
        bgcolor: '#F8F8F8', 
        pb: 'calc(84px + 2rem + env(safe-area-inset-bottom))' 
      }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #7B5FEB 0%, #6B4FDB 100%)', 
          px: { xs: 3, sm: 4 }, 
          pt: 'calc(0.75rem + env(safe-area-inset-top))', 
          pb: 3 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box sx={{ height: 32, width: 128, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '0.75rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
              <Box sx={{ height: 16, width: 192, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
            </Box>
            <Box sx={{ width: 48, height: 48, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: '50%', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: '1rem', p: 2, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
                <Box sx={{ height: 16, width: 96, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 1, mb: 1 }} />
                <Box sx={{ height: 16, width: '100%', bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1, mb: 0.5 }} />
                <Box sx={{ height: 16, width: '66.666667%', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ px: { xs: 3, sm: 4 }, mt: -3 }}>
          <SkeletonList count={4}>
            <SkeletonActivityItem />
          </SkeletonList>
        </Box>
        <MobileBottomNav activeTab="home" onTabChange={handleNavigateTab} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100dvh', 
      bgcolor: '#F8F8F8', 
      pb: 'calc(84px + 2rem + env(safe-area-inset-bottom))' 
    }}>
      <PullToRefresh onRefresh={loadNotifications}>
        <PageHeader
          title="Notifications"
          subtitle={notifications.length ? `${notifications.length} updates` : 'All caught up'}
          action={{
            icon: <RefreshCw style={{ width: '1.25rem', height: '1.25rem' }} />,
            onClick: loadNotifications,
            'aria-label': 'Refresh notifications',
          }}
          className="py-[32px]"
        />

        <Box sx={{ px: { xs: 3, sm: 4 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {error && (
            <Box sx={{ bgcolor: '#FFE5E5', color: '#B11A1A', borderRadius: '1rem', p: 2, fontSize: '0.875rem' }}>
              {error}
            </Box>
          )}

          {!sortedNotifications.length && !error && (
            <Box sx={{ bgcolor: 'white', borderRadius: '1rem', p: 3, textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #E8E8E8' }}>
              <Bell style={{ width: '3rem', height: '3rem', margin: '0 auto', color: '#6B4FDB', marginBottom: '0.75rem' }} />
              <Typography sx={{ color: '#1F1F1F', fontWeight: 600, fontSize: '1.125rem' }}>
                You're up to date
              </Typography>
              <Typography variant="body2" sx={{ color: '#8E8EA0', fontSize: '0.875rem', mt: 0.5 }}>
                We'll let you know when there's something new to review.
              </Typography>
              <Button sx={{ mt: 2 }} variant="outline" onClick={() => onNavigate?.('dashboard')}>
                Back to dashboard
              </Button>
            </Box>
          )}

          {sortedNotifications.map((notification) => {
            const severity = notification.severity ?? 'info';
            const badgeStyles = severityStyles[severity];
            const icon = severityIcons[severity];

            return (
              <Box
                key={notification.id}
                sx={{ bgcolor: 'white', borderRadius: '1rem', p: 2, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #E8E8E8' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '0.75rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    ...badgeStyles
                  }}>
                    {icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ 
                        color: '#1F1F1F', 
                        fontWeight: 600, 
                        fontSize: '1rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#8E8EA0' }}>
                        {formatRelativeTime(notification.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#52525B', mt: 0.5, whiteSpace: 'pre-line' }}>
                      {notification.message}
                    </Typography>
                    {notification.villaName && (
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#8E8EA0', mt: 1 }}>
                        Villa: {notification.villaName}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </PullToRefresh>

      <MobileBottomNav activeTab="home" onTabChange={handleNavigateTab} />
    </Box>
  );
}
