import { useState, useEffect } from 'react';
import { Bell, Calendar, CheckCircle, Receipt, Users, TrendingUp, Clock, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { MobileBottomNav } from '../mobile/MobileBottomNav';
import { LazyImage } from '../ui/LazyImage';
import { apiRequest } from '../../utils/api';
import { PullToRefresh } from '../mobile/PullToRefresh';
import { SkeletonStatCard, SkeletonActivityItem, SkeletonList } from '../ui/skeleton';
import { useIsLandscape } from '../../utils/orientation';
import { PageHeader } from '../shared/PageHeader';

interface MobileHomeProps {
  villas: any[];
  onNavigate?: (view: string) => void;
}

interface DashboardNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  severity?: 'info' | 'warning' | 'critical';
}

export function MobileHome({ villas, onNavigate }: MobileHomeProps) {
  const [stats, setStats] = useState({
    tasks: { total: 0, pending: 0, completed: 0 },
    expenses: { total: 0, pending: 0, approved: 0 },
    staff: { total: 0, active: 0 },
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isLandscape = useIsLandscape();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [tasksData, expensesData, staffData, notificationsData] = await Promise.all([
        apiRequest('/tasks'),
        apiRequest('/expenses'),
        apiRequest('/staff'),
        apiRequest('/notifications'),
      ]);

      const tasks = tasksData.tasks || [];
      const expenses = expensesData.expenses || [];
      const staff = staffData.staff || [];
      const notificationItems: DashboardNotification[] = notificationsData.notifications || [];

      setStats({
        tasks: {
          total: tasks.length,
          pending: tasks.filter((t: any) => t.status !== 'done').length,
          completed: tasks.filter((t: any) => t.status === 'done').length,
        },
        expenses: {
          total: expenses.reduce((sum: number, e: any) => sum + e.amount, 0),
          pending: expenses.filter((e: any) => e.status === 'pending').length,
          approved: expenses.filter((e: any) => e.status === 'approved').length,
        },
        staff: {
          total: staff.length,
          active: staff.filter((s: any) => s.status === 'active' || s.status === 'clocked_in').length,
        },
      });

      setNotifications(notificationItems);

      // Combine recent activity
      const activity = [
        ...tasks.slice(0, 3).map((t: any) => ({ ...t, type: 'task' })),
        ...expenses.slice(0, 3).map((e: any) => ({ ...e, type: 'expense' })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
      
      setRecentActivity(activity);
    } catch (error) {
      toast.error('Unable to refresh dashboard. Check your connection and try again.');
    } finally {
      setIsInitialLoad(false);
    }
  };

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

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isInitialLoad) {
    return (
      <div className={`min-h-dvh bg-[#F8F8F8] pb-[calc(84px+2rem+env(safe-area-inset-bottom))] ${isLandscape ? 'pl-[calc(80px+env(safe-area-inset-left))]' : ''}`}>
        {/* Status Bar */}
        <div className="bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] px-6 sm:px-8 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-2">
          <div className="h-[15px] w-16 bg-white/20 rounded animate-pulse" />
        </div>

        {/* Header Skeleton */}
        <div className="bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] px-6 sm:px-8 py-[32px] relative overflow-hidden">
          <div className="flex items-start justify-between mb-6 relative z-10">
            <div className="flex-1 space-y-2">
              <div className="h-8 w-48 bg-white/20 rounded-xl animate-pulse" />
              <div className="h-4 w-32 bg-white/10 rounded-xl animate-pulse" />
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full animate-pulse" />
          </div>
          
          {/* Quick Stats Skeleton - matches exact button structure */}
          <div className="grid grid-cols-3 gap-3 relative z-10 mt-[30px] mr-[0px] mb-[0px] ml-[0px]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-2 animate-pulse" />
                <div className="h-[24px] w-full bg-white/20 rounded animate-pulse mb-0.5" />
                <div className="h-[16px] w-full bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Activity Skeleton */}
        <div className="px-6 sm:px-8 mt-6">
          <div className="h-6 w-32 bg-[#E8E8E8] rounded-xl animate-pulse mb-4" />
          <SkeletonList count={5}>
            <SkeletonActivityItem />
          </SkeletonList>
        </div>

        {/* Bottom Navigation */}
        <MobileBottomNav activeTab="home" onTabChange={handleNavigateTab} />
      </div>
    );
  }

  return (
    <div className={`min-h-dvh bg-[#F8F8F8] ${isLandscape ? 'pb-8' : 'pb-[calc(84px+2rem+env(safe-area-inset-bottom))]'} ${isLandscape ? 'pl-[calc(80px+env(safe-area-inset-left))]' : ''}`}>
      {/* iPad/Desktop: Max-width container */}
      <div className="mx-auto max-w-[1200px]">
      <PullToRefresh onRefresh={async () => await loadDashboardData()}>
        {/* Header with Custom Actionable Stats */}
        <PageHeader
          title={`${getCurrentGreeting()}! 👋`}
          action={{
            icon: <Bell className="w-6 h-6" />,
            onClick: () => onNavigate?.('notifications'),
            'aria-label': 'View notifications',
            badge: notifications.length,
          }}
          className="py-[32px] relative overflow-hidden"
        >
          {/* Quick Stats - Interactive Buttons (Custom within PageHeader) */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-4 relative z-10 mt-[30px]">
            <button
              onClick={() => onNavigate?.('tasks')}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 active:scale-95 transition-transform hover:bg-white/20 cursor-pointer"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-white text-[20px] font-semibold">{stats.tasks.pending}</div>
              <div className="text-white/70 text-sm">Active Tasks</div>
            </button>
            <button
              onClick={() => onNavigate?.('expenses')}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 active:scale-95 transition-transform hover:bg-white/20 cursor-pointer"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div className="text-white text-[20px] font-semibold">{stats.expenses.pending}</div>
              <div className="text-white/70 text-sm">Pending</div>
            </button>
            <button
              onClick={() => onNavigate?.('staff')}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 active:scale-95 transition-transform hover:bg-white/20 cursor-pointer"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-white text-[20px] font-semibold">{stats.staff.active}</div>
              <div className="text-white/70 text-sm">Staff Active</div>
            </button>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-8 right-12 text-white/10 text-[80px] pointer-events-none">✦</div>
          <div className="absolute bottom-12 right-8 text-white/10 text-[60px] pointer-events-none">✦</div>
        </PageHeader>

      {/* iPad/Desktop: Two-column layout for Villas & Activity */}
      <div className="md:grid md:grid-cols-2 md:gap-6 md:px-6 lg:px-8">
        
      {/* My Villas */}
      {villas.length > 0 && (
        <div className="px-6 sm:px-8 md:px-0 -mt-4 mb-6">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg">
            <h3 className="text-[#1F1F1F] text-[16px] font-semibold mb-3">My Villas</h3>
            <div className="space-y-2">
              {villas.slice(0, 3).map((villa) => (
                <div
                  key={villa.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8F8F8] transition-colors cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#7B5FEB]/20 to-[#6B4FDB]/20 rounded-lg overflow-hidden">
                    <LazyImage
                      src="https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=200"
                      alt={villa.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#1F1F1F] text-[14px] font-medium group-hover:text-[#6B4FDB] transition-colors">{villa.name}</div>
                    <div className="text-[#B9B9C3] text-sm">{villa.location || 'Bali, Indonesia'}</div>
                  </div>
                  {/* Hover indicator for iPad/desktop */}
                  <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity text-[#6B4FDB]">→</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Actions */}
      <div className="px-6 sm:px-8 my-[24px] my-[20px] mx-[0px]">
        <h3 className="text-[#1F1F1F] text-[16px] font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-4">
          <button
            onClick={() => onNavigate?.('tasks')}
            className="group bg-white border border-[#E8E8E8] rounded-2xl p-5 hover:border-[#7B5FEB] hover:shadow-md transition-all duration-200 text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-200">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-[#2E3152] text-sm font-medium">New Task</div>
          </button>
          <button
            onClick={() => onNavigate?.('expenses')}
            className="group bg-white border border-[#E8E8E8] rounded-2xl p-5 hover:border-[#FF9F43] hover:shadow-md transition-all duration-200 text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF9F43] to-[#F58B2B] rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-200">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div className="text-[#2E3152] text-sm font-medium">Submit Expense</div>
          </button>
          <button
            onClick={() => onNavigate?.('calendar')}
            className="group bg-white border border-[#E8E8E8] rounded-2xl p-5 hover:border-[#28C76F] hover:shadow-md transition-all duration-200 text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#28C76F] to-[#20B561] rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-200">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-[#2E3152] text-sm font-medium">View Calendar</div>
          </button>
          <button
            onClick={() => onNavigate?.('staff')}
            className="group bg-white border border-[#E8E8E8] rounded-2xl p-5 hover:border-[#EA5455] hover:shadow-md transition-all duration-200 text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#EA5455] to-[#DC4546] rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-200">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="text-[#2E3152] text-sm font-medium">Staff Clock</div>
          </button>
          <button
            onClick={() => onNavigate?.('messages')}
            className="group bg-white border border-[#E8E8E8] rounded-2xl p-5 hover:border-[#00CFE8] hover:shadow-md transition-all duration-200 text-center"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#00CFE8] to-[#00B8D4] rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-200">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-[#2E3152] text-sm font-medium">Messages</div>
          </button>
        </div>
      </div>

      {/* Recent Activity - Part of two-column layout on iPad */}
      {recentActivity.length > 0 && (
        <div className="px-6 sm:px-8 md:px-0 -mt-4 mb-6">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg">
            <h3 className="text-[#1F1F1F] text-[16px] font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((item, index) => (
                <div key={index} className="flex items-center gap-3 pb-3 border-b border-[#E8E8E8] last:border-0 last:pb-0 group hover:bg-[#F8F8F8] -mx-2 px-2 rounded-lg transition-colors cursor-pointer">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === 'task' ? 'bg-[#7B5FEB]/10' : 'bg-[#FF9F43]/10'
                  }`}>
                    {item.type === 'task' ? (
                      <CheckCircle className="w-5 h-5 text-[#7B5FEB]" />
                    ) : (
                      <Receipt className="w-5 h-5 text-[#FF9F43]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#1F1F1F] text-[14px] font-medium truncate">
                      {item.title || item.description}
                    </div>
                    <div className="text-[#B9B9C3] text-sm">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  {/* Hover indicator for iPad/desktop */}
                  <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity text-[#6B4FDB]">→</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab="home" onTabChange={handleNavigateTab} />
      </PullToRefresh>
      </div>
    </div>
  );
}
