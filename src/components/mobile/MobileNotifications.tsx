import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Bell, Info, RefreshCw } from 'lucide-react';
import { apiRequest } from '../../utils/api';
import { PullToRefresh } from './PullToRefresh';
import { MobileBottomNav } from './MobileBottomNav';
import { PageHeader } from '../shared/PageHeader';
import { SkeletonActivityItem, SkeletonList } from '../ui/skeleton';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
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

const severityStyles: Record<NonNullable<NotificationItem['severity']>, string> = {
  info: 'bg-[#E9E5FF] text-[#4634C4]',
  warning: 'bg-[#FFF5E5] text-[#9A6200]',
  critical: 'bg-[#FFE5E5] text-[#B11A1A]',
};

const severityIcons: Record<NonNullable<NotificationItem['severity']>, JSX.Element> = {
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
      <div className="min-h-dvh bg-[#F8F8F8] pb-[calc(84px+2rem+env(safe-area-inset-bottom))]">
        <div className="bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] px-6 sm:px-8 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 space-y-1.5">
              <div className="h-[32px] w-32 bg-white/20 rounded-xl animate-pulse" />
              <div className="h-[16px] w-48 bg-white/10 rounded-xl animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 animate-pulse">
                <div className="h-4 w-24 bg-white/30 rounded mb-2" />
                <div className="h-4 w-full bg-white/20 rounded mb-1" />
                <div className="h-4 w-2/3 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="px-6 sm:px-8 -mt-6">
          <SkeletonList count={4}>
            <SkeletonActivityItem />
          </SkeletonList>
        </div>
        <MobileBottomNav activeTab="home" onTabChange={handleNavigateTab} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8F8F8] pb-[calc(84px+2rem+env(safe-area-inset-bottom))]">
      <PullToRefresh onRefresh={loadNotifications}>
        <PageHeader
          title="Notifications"
          subtitle={notifications.length ? `${notifications.length} updates` : 'All caught up'}
          action={{
            icon: <RefreshCw className="w-5 h-5" />,
            onClick: loadNotifications,
            'aria-label': 'Refresh notifications',
          }}
          className="py-[32px]"
        />

        <div className="px-6 sm:px-8 space-y-3">
          {error && (
            <div className="bg-[#FFE5E5] text-[#B11A1A] rounded-2xl p-4 text-sm">
              {error}
            </div>
          )}

          {!sortedNotifications.length && !error && (
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-[#E8E8E8]">
              <Bell className="w-12 h-12 mx-auto text-[#6B4FDB] mb-3" />
              <p className="text-[#1F1F1F] font-semibold text-lg">You're up to date</p>
              <p className="text-[#8E8EA0] text-sm mt-1">
                We'll let you know when there's something new to review.
              </p>
              <Button className="mt-4" variant="outline" onClick={() => onNavigate?.('dashboard')}>
                Back to dashboard
              </Button>
            </div>
          )}

          {sortedNotifications.map((notification) => {
            const severity = notification.severity ?? 'info';
            const badgeClasses = severityStyles[severity];
            const icon = severityIcons[severity];

            return (
              <div
                key={notification.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8E8E8]"
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', badgeClasses)}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[#1F1F1F] font-semibold text-base line-clamp-1">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-[#8E8EA0]">{formatRelativeTime(notification.createdAt)}</span>
                    </div>
                    <p className="text-sm text-[#52525B] mt-1 whitespace-pre-line">
                      {notification.message}
                    </p>
                    {notification.villaName && (
                      <p className="text-xs text-[#8E8EA0] mt-2">Villa: {notification.villaName}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PullToRefresh>

      <MobileBottomNav activeTab="home" onTabChange={handleNavigateTab} />
    </div>
  );
}
