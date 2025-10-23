// Custom hooks for accessing specific parts of the app state
import { useApp } from '../contexts/AppContext';
import { useMemo } from 'react';
import { UserRole, VillaUserRole, Permission } from '../types';

// Hook for authentication state
export function useAuth() {
  const app = useApp();
  return {
    isAuthenticated: app.isAuthenticated,
    currentUser: app.currentUser,
    userProfile: app.userProfile,
    login: app.login,
    logout: app.logout,
    refreshAuth: app.refreshAuth,
  };
}

// Hook for villa management
export function useVillas() {
  const app = useApp();
  return {
    villas: app.villas,
    selectedVilla: app.selectedVilla,
    loading: app.villasLoading,
    error: app.villasError,
    loadVillas: app.loadVillas,
    selectVilla: app.selectVilla,
    createVilla: app.createVilla,
    updateVilla: app.updateVilla,
    deleteVilla: app.deleteVilla,
  };
}

// Hook for task management
export function useTasks() {
  const app = useApp();
  return {
    tasks: app.tasks,
    loading: app.tasksLoading,
    error: app.tasksError,
    loadTasks: app.loadTasks,
    createTask: app.createTask,
    updateTask: app.updateTask,
    updateTaskStatus: app.updateTaskStatus,
  };
}

// Hook for expense management
export function useExpenses() {
  const app = useApp();
  return {
    expenses: app.expenses,
    loading: app.expensesLoading,
    error: app.expensesError,
    loadExpenses: app.loadExpenses,
    createExpense: app.createExpense,
    updateExpense: app.updateExpense,
    approveExpense: app.approveExpense,
  };
}

// Hook for chat management
export function useChats() {
  const app = useApp();
  return {
    chats: app.chats,
    loading: app.chatsLoading,
    error: app.chatsError,
    loadChats: app.loadChats,
    createChat: app.createChat,
  };
}

// Hook for event management
export function useEvents() {
  const app = useApp();
  return {
    events: app.events,
    loading: app.eventsLoading,
    error: app.eventsError,
    loadEvents: app.loadEvents,
    createEvent: app.createEvent,
    updateEvent: app.updateEvent,
    deleteEvent: app.deleteEvent,
  };
}

// Hook for staff management
export function useStaff() {
  const app = useApp();
  return {
    staff: app.staff,
    loading: app.staffLoading,
    error: app.staffError,
    loadStaff: app.loadStaff,
  };
}

// Hook for UI state
export function useUI() {
  const app = useApp();
  return {
    currentView: app.currentView,
    useMobileUI: app.useMobileUI,
    sidebarOpen: app.sidebarOpen,
    setCurrentView: app.setCurrentView,
    setUseMobileUI: app.setUseMobileUI,
    setSidebarOpen: app.setSidebarOpen,
  };
}

// Hook for checking user permissions
export function usePermissions() {
  const app = useApp();
  const { currentUser, selectedVilla, userProfile } = app;

  const permissions = useMemo(() => {
    if (!currentUser || !selectedVilla || !userProfile) {
      return {
        canManageVilla: false,
        canManageUsers: false,
        canManageTasks: false,
        canManageExpenses: false,
        canApproveExpenses: false,
        canCreateTasks: false,
        canCreateExpenses: false,
        canDeleteVilla: false,
        isAdmin: false,
        isLandlord: false,
        isPropertyAgent: false,
        isTenant: false,
        isStaff: false,
        villaRole: null as VillaUserRole | null,
        villaPermissions: [] as Permission[],
      };
    }

    // Find user's role and permissions for the selected villa
    const villaUser = selectedVilla.users.find(u => u.userId === currentUser.id);
    const villaRole = villaUser?.role || null;
    const villaPermissions = villaUser?.permissions || [];

    // Check global role
    const globalRole = currentUser.role;
    const isLandlord = globalRole === 'landlord';
    const isPropertyAgent = globalRole === 'property_agent';
    const isTenant = globalRole === 'tenant';
    const isStaff = globalRole === 'staff';

    // Check villa-specific role
    const isAdmin = villaRole === 'admin' || villaPermissions.includes('all');
    const canManageVilla = isAdmin || isLandlord;
    const canManageUsers = isAdmin || villaPermissions.includes('manage_users');
    const canManageTasks = isAdmin || villaPermissions.includes('manage_tasks') || isLandlord || isPropertyAgent;
    const canManageExpenses = isAdmin || villaPermissions.includes('manage_expenses') || isLandlord;
    const canApproveExpenses = isAdmin || villaPermissions.includes('approve_expenses') || isLandlord;
    const canCreateTasks = canManageTasks || isPropertyAgent;
    const canCreateExpenses = true; // All villa members can create expenses
    const canDeleteVilla = selectedVilla.createdBy === currentUser.id;

    return {
      canManageVilla,
      canManageUsers,
      canManageTasks,
      canManageExpenses,
      canApproveExpenses,
      canCreateTasks,
      canCreateExpenses,
      canDeleteVilla,
      isAdmin,
      isLandlord,
      isPropertyAgent,
      isTenant,
      isStaff,
      villaRole,
      villaPermissions,
    };
  }, [currentUser, selectedVilla, userProfile]);

  return permissions;
}

// Hook for getting filtered data based on permissions
export function useFilteredData() {
  const app = useApp();
  const permissions = usePermissions();

  const filteredTasks = useMemo(() => {
    if (!app.currentUser || permissions.isAdmin || permissions.isLandlord) {
      return app.tasks; // Admins and landlords see all tasks
    }
    
    // Staff only see tasks assigned to them
    if (permissions.isStaff) {
      return app.tasks.filter(task => 
        task.assignedTo.includes(app.currentUser!.id)
      );
    }

    // Property agents see tasks they created or are assigned to
    if (permissions.isPropertyAgent) {
      return app.tasks.filter(task => 
        task.createdBy === app.currentUser!.id ||
        task.assignedTo.includes(app.currentUser!.id)
      );
    }

    return app.tasks; // Default: show all tasks
  }, [app.tasks, app.currentUser, permissions]);

  const filteredExpenses = useMemo(() => {
    if (!app.currentUser || permissions.canManageExpenses) {
      return app.expenses; // Managers see all expenses
    }
    
    // Others only see their own expenses
    return app.expenses.filter(expense => 
      expense.createdBy === app.currentUser!.id
    );
  }, [app.expenses, app.currentUser, permissions]);

  const filteredStaff = useMemo(() => {
    if (permissions.canManageVilla) {
      return app.staff; // Managers see all staff
    }
    
    // Filter to only show active staff for non-managers
    return app.staff.filter(staff => staff.status === 'active');
  }, [app.staff, permissions]);

  return {
    tasks: filteredTasks,
    expenses: filteredExpenses,
    staff: filteredStaff,
    chats: app.chats, // All villa members can see all chats they're participants in
    events: app.events, // All villa members can see all events
  };
}