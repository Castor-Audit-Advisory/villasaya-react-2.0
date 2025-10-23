import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Building2, CheckSquare, DollarSign, Calendar, Users, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { useViewportType } from '../hooks/useMediaQuery';

interface DashboardProps {
  villas: any[];
}

export function Dashboard({ villas }: DashboardProps) {
  const [stats, setStats] = useState({
    totalVillas: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalExpenses: 0,
    pendingExpenses: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const viewport = useViewportType();

  useEffect(() => {
    loadStats();
  }, [villas]);

  const loadStats = async () => {
    try {
      setLoading(true);
      let totalTasks = 0;
      let completedTasks = 0;
      let totalExpenses = 0;
      let pendingExpenses = 0;
      let upcomingEvents = 0;

      // Load data from each villa
      for (const villa of villas) {
        try {
          const { tasks } = await apiRequest(`/villas/${villa.id}/tasks`);
          totalTasks += tasks?.length || 0;
          completedTasks += tasks?.filter((t: any) => t.status === 'completed').length || 0;

          const { expenses } = await apiRequest(`/villas/${villa.id}/expenses`);
          totalExpenses += expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
          pendingExpenses += expenses?.filter((e: any) => e.status === 'pending').length || 0;

          const { events } = await apiRequest(`/events?villaId=${villa.id}`);
          upcomingEvents += events?.filter((e: any) => new Date(e.startDate) >= new Date()).length || 0;
        } catch (error) {
          console.error(`Error loading stats for villa ${villa.id}:`, error);
        }
      }

      setStats({
        totalVillas: villas.length,
        totalTasks,
        completedTasks,
        totalExpenses,
        pendingExpenses,
        upcomingEvents,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Villas',
      value: stats.totalVillas,
      icon: Building2,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      trend: '+2 this month',
    },
    {
      title: 'Active Tasks',
      value: `${stats.totalTasks - stats.completedTasks}/${stats.totalTasks}`,
      icon: CheckSquare,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      trend: '12 due today',
    },
    {
      title: 'Total Expenses',
      value: `Rp ${(stats.totalExpenses / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      trend: '+8% from last month',
    },
    {
      title: 'Pending Expenses',
      value: stats.pendingExpenses,
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      trend: 'Requires attention',
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      trend: 'Next in 2 days',
    },
    {
      title: 'Completion Rate',
      value: stats.totalTasks > 0 ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` : '0%',
      icon: Activity,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      trend: '↑ 5% improvement',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  // Responsive grid configurations
  const gridCols = viewport === 'mobile' 
    ? 'grid-cols-1' 
    : viewport === 'tablet' 
    ? 'grid-cols-2' 
    : viewport === 'desktop' 
    ? 'grid-cols-3' 
    : 'grid-cols-4';
  
  const containerClasses = viewport === 'mobile'
    ? 'space-y-4'
    : viewport === 'tablet'
    ? 'space-y-6'
    : 'space-y-8';

  return (
    <div className={`${containerClasses} max-w-[1920px] mx-auto`}>
      {/* Header Section - Responsive padding and text sizes */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">
            Dashboard
          </h2>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Overview of your villa management
          </p>
        </div>
        {viewport !== 'mobile' && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {villas.length === 0 ? (
        <Card className="hover-lift transition-all duration-200">
          <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 lg:py-20">
            <Building2 className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 text-muted-foreground mb-4" />
            <h3 className="text-lg md:text-xl lg:text-2xl mb-2 text-foreground">Welcome to VillaSaya!</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4 text-center max-w-md">
              Get started by creating your first villa or joining one with an invite code
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Grid - Responsive columns */}
          <div className={`grid ${gridCols} gap-4 md:gap-6`}>
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={stat.title} 
                  className="hover-lift transition-all duration-200 hover:shadow-lg cursor-pointer"
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm sm:text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{stat.value}</p>
                    {viewport !== 'mobile' && (
                      <p className="text-sm text-muted-foreground mt-1">{stat.trend}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Content Grid - Responsive layout */}
          <div className={`grid ${viewport === 'mobile' ? 'grid-cols-1' : viewport === 'desktop' || viewport === 'wide' ? 'grid-cols-3' : 'grid-cols-2'} gap-4 md:gap-6`}>
            {/* Recent Activity Card - Takes 2 columns on desktop */}
            <Card className={`${viewport === 'desktop' || viewport === 'wide' ? 'col-span-2' : ''} hover-lift`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Activity</span>
                  {viewport !== 'mobile' && (
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-3 p-3 md:p-4 bg-muted dark:bg-gray-800 rounded-lg hover:bg-muted/80 transition-colors">
                    <CheckSquare className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                    <div className="flex-1">
                      <p className="text-sm md:text-base text-foreground font-medium">
                        {stats.completedTasks} tasks completed
                      </p>
                      <p className="text-sm md:text-sm text-muted-foreground">Across all villas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 md:p-4 bg-muted dark:bg-gray-800 rounded-lg hover:bg-muted/80 transition-colors">
                    <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-yellow-600 dark:text-yellow-400" />
                    <div className="flex-1">
                      <p className="text-sm md:text-base text-foreground font-medium">
                        {stats.pendingExpenses} pending expense approvals
                      </p>
                      <p className="text-sm md:text-sm text-muted-foreground">Requires attention</p>
                    </div>
                    {stats.pendingExpenses > 0 && viewport !== 'mobile' && (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 p-3 md:p-4 bg-muted dark:bg-gray-800 rounded-lg hover:bg-muted/80 transition-colors">
                    <Calendar className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
                    <div className="flex-1">
                      <p className="text-sm md:text-base text-foreground font-medium">
                        {stats.upcomingEvents} upcoming events
                      </p>
                      <p className="text-sm md:text-sm text-muted-foreground">In your calendar</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Villas Card - Single column on desktop */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Villas</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {villas.length} total
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 md:space-y-3 max-h-[400px] overflow-y-auto">
                  {villas.map((villa) => (
                    <div
                      key={villa.id}
                      className="flex items-center gap-3 p-3 md:p-4 bg-muted dark:bg-gray-800 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      <Building2 className="h-5 w-5 md:h-6 md:w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base text-foreground font-medium truncate">
                          {villa.name}
                        </p>
                        <p className="text-sm md:text-sm text-muted-foreground">
                          {villa.users?.length || 0} member(s)
                        </p>
                      </div>
                      {viewport !== 'mobile' && (
                        <Users className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions for Desktop */}
          {(viewport === 'desktop' || viewport === 'wide') && (
            <div className="grid grid-cols-4 gap-4">
              <Card className="hover-lift cursor-pointer">
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                    <p className="text-sm font-medium">Add Villa</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-lift cursor-pointer">
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium">Create Task</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-lift cursor-pointer">
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                    <p className="text-sm font-medium">Submit Expense</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover-lift cursor-pointer">
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm font-medium">Schedule Event</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}