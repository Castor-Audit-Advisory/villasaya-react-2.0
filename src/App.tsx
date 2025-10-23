import React, { useState, useEffect } from 'react';
import { apiRequest } from './utils/api';
import { authManager } from './utils/auth';
import { Villa } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useIsDesktop, useIsTablet, useIsMobile } from './hooks/useMediaQuery';
import { MobileAuthPage } from './components/MobileAuthPage';
import { MobileExpenseManager } from './components/MobileExpenseManager';
import { MobileTaskManager } from './components/MobileTaskManager';
import { MobileStaffManager } from './components/MobileStaffManager';
import { MobileVillaManager } from './components/MobileVillaManager';
import { MobileHome } from './components/dashboard/MobileHome';
import { MobileVillaActions } from './components/mobile/MobileVillaActions';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { MobileCalendar } from './components/calendar/MobileCalendar';
import { MobileMessaging } from './components/messaging/MobileMessaging';
import { MobileMore } from './components/mobile/MobileMore';
import { MobileNotifications } from './components/mobile/MobileNotifications';
import { DashboardLayout } from './components/DashboardLayout';
import { Dashboard } from './components/Dashboard';
import { DesktopNotifications } from './components/dashboard/DesktopNotifications';
import { VillaList } from './components/VillaList';
import { VillaDetail } from './components/VillaDetail';
import { TaskBoard } from './components/TaskBoard';
import { ExpenseManager } from './components/ExpenseManager';
import { CalendarView } from './components/CalendarView';
import { StaffManager } from './components/StaffManager';
import { MessagingInterface } from './components/MessagingInterface';
import { UserPreferences } from './components/UserPreferences';
import { Toaster } from './components/ui/sonner';
import { TouchTargetDebugOverlay } from './utils/touchTargetAudit';
import { DesktopApp } from './components/desktop/DesktopApp';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [villas, setVillas] = useState<Villa[]>([]);
  const [selectedVilla, setSelectedVilla] = useState<Villa | null>(null);
  
  // Responsive hooks for automatic viewport detection
  const isDesktop = useIsDesktop();
  const isTablet = useIsTablet();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Initialize auth manager and check session
    const initAuth = async () => {
      const isAuth = await authManager.initialize();
      if (isAuth) {
        setIsAuthenticated(true);
        loadVillas();
      }
    };
    
    initAuth();
    
    // Listen for auth expiry events
    const handleAuthExpired = () => {
      setIsAuthenticated(false);
      setCurrentView('dashboard');
      setVillas([]);
      setSelectedVilla(null);
    };
    
    window.addEventListener('auth:expired', handleAuthExpired);
    
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadVillas();
    }
  }, [isAuthenticated]);

  const loadVillas = async () => {
    try {
      const { villas } = await apiRequest('/villas');
      setVillas(villas || []);
    } catch (error) {
      console.error('Error loading villas:', error);
      const { toast } = await import('sonner');
      toast.error('Failed to load villas', {
        description: error instanceof Error ? error.message : 'Please try again later'
      });
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    loadVillas();
  };

  const handleSignOut = async () => {
    // Clear session and auth tokens
    authManager.clearSession();
    
    // Sign out from Supabase
    try {
      const { supabase } = await import('./utils/supabase-client');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out from Supabase:', error);
    }
    
    // Clear local state
    setIsAuthenticated(false);
    setCurrentView('dashboard');
    setVillas([]);
    setSelectedVilla(null);
    
    // Clear all session storage
    sessionStorage.clear();
  };

  const handleVillaSelect = (villa: any) => {
    setSelectedVilla(villa);
  };

  const handleBackToVillas = () => {
    setSelectedVilla(null);
    loadVillas();
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSelectedVilla(null);
  };

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <MobileAuthPage onAuthSuccess={handleAuthSuccess} />
        <Toaster />
      </>
    );
  }

  const renderContent = () => {
    // If villa is selected from villa list, show detail
    if (selectedVilla) {
      return <VillaDetail villa={selectedVilla} onBack={handleBackToVillas} />;
    }

    // Mobile/Tablet views (< 1024px)
    if (!isDesktop) {
      switch (currentView) {
        case 'dashboard':
        case 'home':
          return <MobileHome villas={villas} onNavigate={handleViewChange} />;
        case 'villas':
          return <MobileVillaManager villas={villas} onNavigate={handleViewChange} />;
        case 'expenses':
          return <MobileExpenseManager villas={villas} onNavigate={handleViewChange} />;
        case 'tasks':
          return <MobileTaskManager villas={villas} onNavigate={handleViewChange} />;
        case 'staff':
          return <MobileStaffManager villas={villas} onNavigate={handleViewChange} />;
        case 'calendar':
          return <MobileCalendar villas={villas} onNavigate={handleViewChange} />;
        case 'messages':
          return <MobileMessaging villas={villas} onNavigate={handleViewChange} />;
        case 'notifications':
          return <MobileNotifications onNavigate={handleViewChange} />;
        case 'more':
          return <MobileMore onNavigate={handleViewChange} onSignOut={handleSignOut} />;
        default:
          return <MobileHome villas={villas} onNavigate={handleViewChange} />;
      }
    }

    // Desktop views (>= 1024px)
    switch (currentView) {
      case 'dashboard':
      case 'home':
        return <Dashboard villas={villas} />;
      case 'villas':
        return <VillaList onVillaSelect={handleVillaSelect} />;
      case 'tasks':
        return <TaskBoard villas={villas} />;
      case 'expenses':
        return <ExpenseManager villas={villas} />;
      case 'calendar':
        return <CalendarView villas={villas} />;
      case 'staff':
        return <StaffManager villas={villas} />;
      case 'messages':
        return <MessagingInterface villas={villas} />;
      case 'notifications':
        return <DesktopNotifications className="max-w-3xl" />;
      case 'preferences':
      case 'account':
      case 'app-settings':
        return <UserPreferences />;
      default:
        return <Dashboard villas={villas} />;
    }
  };

  // Desktop layout with new HR Admin UI design
  if (isDesktop) {
    return (
      <>
        <DesktopApp />
        <Toaster />
      </>
    );
  }

  // Mobile/Tablet layout with bottom navigation
  return (
    <>
      {/* Apple HIG: Skip navigation for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-vs-primary focus:text-white focus:rounded-md"
      >
        Skip to main content
      </a>
      
      <div className="mobile-layout min-h-screen bg-background pb-20">
        {/* Apple HIG: Main content landmark for screen readers */}
        <main id="main-content" role="main">
          {renderContent()}
        </main>
        
        {/* Apple HIG: Complementary content */}
        <aside role="complementary" aria-label="Villa quick actions">
          <MobileVillaActions villas={villas} onVillaUpdate={loadVillas} />
        </aside>
      </div>
      
      <MobileBottomNav
        activeTab={currentView === 'dashboard' ? 'home' : currentView}
        onTabChange={handleViewChange}
      />
      <Toaster />
      
      {/* Development tool: Touch target audit overlay */}
      {import.meta.env.DEV && <TouchTargetDebugOverlay />}
    </>
  );
}

// Wrap the App with Error Boundary and Context Provider
export default function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log errors to monitoring service in production
        console.error('App Error:', error, errorInfo);
      }}
    >
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}