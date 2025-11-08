import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bell, Info, RefreshCcw } from 'lucide-react';
import { Box, Typography } from '@mui/material';
import { apiRequest } from '../../utils/api';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { formatRelativeTime } from '../../utils/datetime';
import { Skeleton, SkeletonList } from '../ui/skeleton';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  severity?: 'info' | 'warning' | 'critical';
  villaName?: string;
}

interface DesktopNotificationsProps {
  className?: string;
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

export function DesktopNotifications({ className }: DesktopNotificationsProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      setError('Unable to load notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }} className={className}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontSize: '1.5rem', fontWeight: 600, color: '#1F1F1F' }}>
            Notifications
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#8E8EA0' }}>
            {isLoading ? 'Checking for new updates…' : `${sortedNotifications.length} updates`}
          </Typography>
        </Box>
        <Button variant="outline" onClick={loadNotifications} disabled={isLoading}>
          <RefreshCcw style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Refresh
        </Button>
      </Box>

      {error && (
        <Card sx={{ borderColor: '#FEE2E2', bgcolor: '#FEF2F2', color: '#B11A1A' }}>
          <Box sx={{ p: 2, fontSize: '0.875rem' }}>{error}</Box>
        </Card>
      )}

      {isLoading ? (
        <Card sx={{ p: 3 }}>
          <Skeleton sx={{ height: 24, width: '12rem', mb: 2 }} />
          <SkeletonList count={3}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Skeleton sx={{ width: 48, height: 48, borderRadius: '0.75rem' }} />
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Skeleton sx={{ height: 16, width: '10rem' }} />
                <Skeleton sx={{ height: 16, width: '100%' }} />
                <Skeleton sx={{ height: 16, width: '75%' }} />
              </Box>
            </Box>
          </SkeletonList>
        </Card>
      ) : !sortedNotifications.length ? (
        <Card sx={{ p: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <Bell style={{ width: '3rem', height: '3rem', color: '#6B4FDB' }} />
          <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#1F1F1F' }}>
            You're up to date
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#8E8EA0' }}>
            We'll let you know when there's something new to review.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {sortedNotifications.map((notification) => {
            const severity = notification.severity ?? 'info';
            const badgeStyles = severityStyles[severity];
            const icon = severityIcons[severity];

            return (
              <Card
                key={notification.id}
                sx={{ p: 2.5, border: '1px solid #E8E8E8', bgcolor: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '0.75rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    ...badgeStyles
                  }}>
                    {icon}
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F1F1F', fontSize: '1rem' }}>
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#8E8EA0' }}>
                        {formatRelativeTime(notification.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', color: '#52525B', whiteSpace: 'pre-line' }}>
                      {notification.message}
                    </Typography>
                    {notification.villaName && (
                      <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#8E8EA0' }}>
                        Villa: {notification.villaName}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
