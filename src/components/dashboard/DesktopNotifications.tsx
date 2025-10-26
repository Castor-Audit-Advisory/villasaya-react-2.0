import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bell, Info, RefreshCcw } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { formatRelativeTime } from '../../utils/datetime';
import { Skeleton, SkeletonList } from '../ui/skeleton';
import { cn } from '../ui/utils';

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

const severityStyles: Record<NonNullable<NotificationItem['severity']>, string> = {
  info: 'bg-[#E9E5FF] text-[#4634C4]',
  warning: 'bg-[#FFF5E5] text-[#9A6200]',
  critical: 'bg-[#FFE5E5] text-[#B11A1A]',
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
    <div className={cn('flex flex-col gap-4 w-full', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1F1F1F]">Notifications</h1>
          <p className="text-sm text-[#8E8EA0]">
            {isLoading ? 'Checking for new updates…' : `${sortedNotifications.length} updates`}
          </p>
        </div>
        <Button variant="outline" onClick={loadNotifications} disabled={isLoading}>
          <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {error && (
        <Card className="border-[#FEE2E2] bg-[#FEF2F2] text-[#B11A1A]">
          <div className="p-4 text-sm">{error}</div>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <SkeletonList count={3}>
            <div className="flex gap-3">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </SkeletonList>
        </Card>
      ) : !sortedNotifications.length ? (
        <Card className="p-12 text-center flex flex-col items-center gap-3">
          <Bell className="w-12 h-12 text-[#6B4FDB]" />
          <h2 className="text-lg font-semibold text-[#1F1F1F]">You're up to date</h2>
          <p className="text-sm text-[#8E8EA0]">
            We'll let you know when there's something new to review.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sortedNotifications.map((notification) => {
            const severity = notification.severity ?? 'info';
            const badgeClasses = severityStyles[severity];
            const icon = severityIcons[severity];

            return (
              <Card
                key={notification.id}
                className="p-5 border border-[#E8E8E8] bg-white shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', badgeClasses)}>
                    {icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#1F1F1F] text-base">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-[#8E8EA0]">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-[#52525B] whitespace-pre-line">
                      {notification.message}
                    </p>
                    {notification.villaName && (
                      <p className="text-xs text-[#8E8EA0]">Villa: {notification.villaName}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
