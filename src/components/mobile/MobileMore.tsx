import React, { useState, useEffect } from 'react';
import {
  User,
  Moon,
  Sun,
  Monitor,
  MessageSquare,
  Users,
  LogOut,
  ChevronRight,
  Mail,
  Briefcase,
} from 'lucide-react';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { DarkModeToggle } from '../DarkModeToggle';
import { apiRequest } from '../../utils/api';
import { supabase } from '../../utils/supabase-client';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';

interface MobileMoreProps {
  onNavigate?: (tab: string) => void;
  onSignOut?: () => void;
}

export function MobileMore({ onNavigate, onSignOut }: MobileMoreProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { profile } = await apiRequest('/user/profile');
      setProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user_id');
      toast.success('Signed out successfully');
      onSignOut?.();
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleNavigateTab = (tab: string) => {
    onNavigate?.(tab);
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          subtitle: profile?.name || 'Loading...',
          onClick: () => {},
        },
        {
          icon: Mail,
          label: 'Email',
          subtitle: profile?.email || 'Loading...',
          onClick: () => {},
        },
        {
          icon: Briefcase,
          label: 'Role',
          subtitle: profile?.role?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Loading...',
          onClick: () => {},
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          icon: MessageSquare,
          label: 'Messages',
          onClick: () => onNavigate?.('messages'),
          showChevron: true,
        },
        {
          icon: Users,
          label: 'Staff',
          onClick: () => onNavigate?.('staff'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor,
          label: 'Theme',
          subtitle: theme === 'dark' ? 'Dark Mode' : theme === 'light' ? 'Light Mode' : 'System',
          customAction: <DarkModeToggle />,
        },
      ],
    },
  ];

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <MobileHeader />

      <div className="flex-1 overflow-y-auto pb-[calc(68px+env(safe-area-inset-bottom))]">
        <div className="p-6">
          {/* Profile Section */}
          <div className="bg-gradient-to-br from-[#7B5FEB] to-[#6B4FDB] rounded-3xl p-6 mb-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  {loading ? 'Loading...' : profile?.name || 'User'}
                </h2>
                <p className="text-white/80 text-sm">
                  {loading ? '' : profile?.email || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Sections */}
          {menuSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
              <h3 className="text-muted-foreground text-sm font-medium mb-3 px-1">
                {section.title}
              </h3>
              <div className="bg-card dark:bg-gray-900 rounded-2xl border border-border overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-4 p-4 hover:bg-muted/50 dark:hover:bg-gray-800/50 transition-colors ${
                      itemIndex < section.items.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-foreground font-medium">{item.label}</div>
                      {item.subtitle && (
                        <div className="text-muted-foreground text-sm">{item.subtitle}</div>
                      )}
                    </div>
                    {item.customAction ? (
                      item.customAction
                    ) : item.showChevron ? (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full mt-6 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-2xl p-4 flex items-center justify-center gap-3 font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      <MobileBottomNav activeTab="more" onTabChange={handleNavigateTab} />
    </div>
  );
}
