import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase-client';
import { apiRequest } from '../utils/api';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { DarkModeToggle } from './DarkModeToggle';
import { VillaSwitcher } from './VillaSwitcher';
import {
  Home,
  Building2,
  CheckSquare,
  DollarSign,
  Calendar,
  Users,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import villaSayaLogo from '@assets/villasaya.png';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  onSignOut: () => void;
}

export function DashboardLayout({
  children,
  currentView,
  onViewChange,
  onSignOut,
}: DashboardLayoutProps) {
  const [profile, setProfile] = useState<any>(null);
  
  // Load sidebar state from localStorage
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    loadProfile();
  }, []);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const loadProfile = async () => {
    try {
      const { profile } = await apiRequest('/user/profile');
      setProfile(profile);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user_id');
      toast.success('Signed out successfully');
      onSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'villas', label: 'Villas', icon: Building2 },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'expenses', label: 'Expenses', icon: DollarSign },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-16'
        } bg-card dark:bg-gray-900 border-r border-border transition-all duration-300 flex flex-col flex-shrink-0 relative`}
      >
        <div className={`p-6 border-b border-border ${!sidebarOpen && 'px-2'}`}>
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <img 
              src={villaSayaLogo} 
              alt="VillaSaya" 
              className={`object-contain transition-all ${sidebarOpen ? 'w-14 h-14' : 'w-10 h-10'}`} 
            />
            {sidebarOpen && (
              <h1 className="text-2xl text-indigo-600 dark:text-indigo-400">VillaSaya</h1>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'secondary' : 'ghost'}
                  className={`w-full ${sidebarOpen ? 'justify-start' : 'justify-center px-2'}`}
                  onClick={() => onViewChange(item.id)}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className={`h-5 w-5 ${sidebarOpen && 'mr-3'}`} />
                  {sidebarOpen && item.label}
                </Button>
              );
            })}
          </nav>
          
          {/* Villa Switcher */}
          {sidebarOpen && (
            <div className="mt-4">
              <VillaSwitcher variant="compact" className="w-full" />
            </div>
          )}
        </ScrollArea>

        <div className={`p-4 border-t border-border ${!sidebarOpen && 'px-2'}`}>
          {sidebarOpen ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3 mb-3 w-full hover:bg-accent/50 rounded-md p-2 transition-colors">
                    <Avatar>
                      <AvatarFallback>
                        {profile?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="truncate text-foreground font-medium">{profile?.name || 'User'}</p>
                      <p className="text-sm text-muted-foreground truncate capitalize">
                        {profile?.role?.replace('_', ' ') || 'Member'}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => onViewChange('preferences')}>
                    <User className="mr-2 h-4 w-4" />
                    User Preferences
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewChange('account')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Account Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewChange('notifications')}>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onViewChange('app-settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    App Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:bg-accent/50 rounded-full p-1 transition-colors">
                    <Avatar>
                      <AvatarFallback>
                        {profile?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => onViewChange('preferences')}>
                    <User className="mr-2 h-4 w-4" />
                    User Preferences
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewChange('account')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Account Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewChange('notifications')}>
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onViewChange('app-settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    App Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Chevron Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute bottom-4 right-0 transform translate-x-1/2 w-6 h-6 bg-card dark:bg-gray-900 border border-border rounded-full flex items-center justify-center hover:bg-accent transition-colors shadow-sm"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-card dark:bg-gray-900 border-b border-border px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <h2 className="text-xl capitalize text-foreground">
              {navItems.find((item) => item.id === currentView)?.label ||
                'Dashboard'}
            </h2>
            <DarkModeToggle />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
