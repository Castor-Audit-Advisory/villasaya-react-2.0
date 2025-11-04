import * as React from 'react';
import { apiRequest } from '../utils/api';
import { authManager } from '../utils/auth';
import * as supabaseHelpers from '../utils/supabase-helpers';
import {
  User,
  Villa,
  Task,
  Expense,
  Chat,
  CalendarEvent,
  StaffMember,
  UserProfile,
} from '../types';
import { toast } from 'sonner';

const { createContext, useContext, useState, useEffect, useCallback } = React;

// Define the shape of our global state
interface AppState {
  // Authentication
  isAuthenticated: boolean;
  currentUser: User | null;
  userProfile: UserProfile | null;
  
  // Villas
  villas: Villa[];
  selectedVilla: Villa | null;
  villasLoading: boolean;
  villasError: string | null;
  
  // Tasks
  tasks: Task[];
  tasksLoading: boolean;
  tasksError: string | null;
  
  // Expenses
  expenses: Expense[];
  expensesLoading: boolean;
  expensesError: string | null;
  
  // Chats
  chats: Chat[];
  chatsLoading: boolean;
  chatsError: string | null;
  
  // Events
  events: CalendarEvent[];
  eventsLoading: boolean;
  eventsError: string | null;
  
  // Staff
  staff: StaffMember[];
  staffLoading: boolean;
  staffError: string | null;
  
  // UI State
  currentView: string;
  useMobileUI: boolean;
  sidebarOpen: boolean;
}

// Define actions available in our context
interface AppContextValue extends AppState {
  // Authentication actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  
  // Villa actions
  loadVillas: () => Promise<void>;
  selectVilla: (villa: Villa | null) => void;
  createVilla: (data: Partial<Villa>) => Promise<Villa | null>;
  updateVilla: (id: string, data: Partial<Villa>) => Promise<boolean>;
  deleteVilla: (id: string) => Promise<boolean>;
  
  // Task actions
  loadTasks: (villaId?: string) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task | null>;
  updateTask: (id: string, data: Partial<Task>) => Promise<boolean>;
  updateTaskStatus: (id: string, status: string) => Promise<boolean>;
  
  // Expense actions
  loadExpenses: (villaId?: string) => Promise<void>;
  createExpense: (data: Partial<Expense>) => Promise<Expense | null>;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<boolean>;
  approveExpense: (id: string, approved: boolean) => Promise<boolean>;
  
  // Chat actions
  loadChats: (villaId?: string) => Promise<void>;
  createChat: (data: Partial<Chat>) => Promise<Chat | null>;
  
  // Event actions
  loadEvents: (villaId?: string) => Promise<void>;
  createEvent: (data: Partial<CalendarEvent>) => Promise<CalendarEvent | null>;
  updateEvent: (id: string, data: Partial<CalendarEvent>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  
  // Staff actions
  loadStaff: (villaId?: string) => Promise<void>;
  
  // UI actions
  setCurrentView: (view: string) => void;
  setUseMobileUI: (useMobile: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Utility actions
  refreshData: () => Promise<void>;
  clearCache: () => void;
}

// Create the context
const AppContext = createContext<AppContextValue | undefined>(undefined);

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Provider component
interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Initialize state
  const [state, setState] = useState<AppState>({
    // Authentication
    isAuthenticated: false,
    currentUser: null,
    userProfile: null,
    
    // Villas
    villas: [],
    selectedVilla: null,
    villasLoading: false,
    villasError: null,
    
    // Tasks
    tasks: [],
    tasksLoading: false,
    tasksError: null,
    
    // Expenses
    expenses: [],
    expensesLoading: false,
    expensesError: null,
    
    // Chats
    chats: [],
    chatsLoading: false,
    chatsError: null,
    
    // Events
    events: [],
    eventsLoading: false,
    eventsError: null,
    
    // Staff
    staff: [],
    staffLoading: false,
    staffError: null,
    
    // UI State
    currentView: 'dashboard',
    useMobileUI: false,
    sidebarOpen: true,
  });

  const buildCacheKey = useCallback(
    (resource: string, scope?: string) => (scope ? `villasaya:${resource}:${scope}` : `villasaya:${resource}`),
    [],
  );

  const readCache = useCallback(<T,>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (error) {
      console.warn(`Failed to read cache key "${key}"`, error);
      return null;
    }
  }, []);

  const writeCache = useCallback((key: string, value: unknown) => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to write cache key "${key}"`, error);
    }
  }, []);

  const removeCache = useCallback((key: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to clear cache key "${key}"`, error);
    }
  }, []);

  const withRetry = useCallback(
    async <T,>(operation: () => Promise<T>, options: { retries?: number; delayMs?: number } = {}) => {
      const { retries = 2, delayMs = 400 } = options;
      let attempt = 0;
      let lastError: unknown;

      while (attempt <= retries) {
        try {
          return await operation();
        } catch (error) {
          lastError = error;
          if (attempt === retries) {
            break;
          }
          const backoff = delayMs * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, backoff));
          attempt += 1;
        }
      }

      throw lastError ?? new Error('Operation failed after retries');
    },
    [],
  );

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      // Check authentication
      const isAuth = await authManager.initialize();
      if (isAuth) {
        const user = authManager.getCurrentUser();
        setState(prev => ({
          ...prev,
          isAuthenticated: true,
          currentUser: user,
        }));
        
        // Load initial data
        loadVillas();
        loadUserProfile();
      }

      // Check UI preferences
      const mobileUIPreference = localStorage.getItem('useMobileUI');
      if (mobileUIPreference === 'true' || window.innerWidth < 768) {
        setState(prev => ({ ...prev, useMobileUI: true }));
      }
    };

    init();

    // Listen for auth expiry
    const handleAuthExpired = () => {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        currentUser: null,
        userProfile: null,
        villas: [],
        selectedVilla: null,
        tasks: [],
        expenses: [],
        chats: [],
        events: [],
        staff: [],
      }));
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  // Load user profile
  const loadUserProfile = useCallback(async () => {
    try {
      const userId = sessionStorage.getItem('user_id');
      if (!userId) return;
      
      const profile = await apiRequest<UserProfile>(`/users/${userId}`);
      setState(prev => ({ ...prev, userProfile: profile }));
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }, []);

  // Authentication actions
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { supabase } = await import('../utils/supabase-client');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        toast.error('Invalid login credentials');
        return false;
      }

      // Save session
      authManager.saveSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.name || '',
          role: data.session.user.user_metadata?.role || 'tenant',
          createdAt: data.session.user.created_at,
        },
      });

      setState(prev => ({
        ...prev,
        isAuthenticated: true,
        currentUser: authManager.getCurrentUser(),
      }));

      // Load initial data
      await Promise.all([loadVillas(), loadUserProfile()]);
      
      toast.success('Signed in successfully!');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to sign in');
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    authManager.clearSession();
    
    try {
      const { supabase } = await import('../utils/supabase-client');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out from Supabase:', error);
    }

    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      currentUser: null,
      userProfile: null,
      villas: [],
      selectedVilla: null,
      tasks: [],
      expenses: [],
      chats: [],
      events: [],
      staff: [],
      currentView: 'dashboard',
    }));

    sessionStorage.clear();
  }, []);

  const refreshAuth = useCallback(async () => {
    const session = await authManager.refreshSession();
    if (session) {
      setState(prev => ({
        ...prev,
        currentUser: session.user,
      }));
    }
  }, []);

  // Villa actions
  const loadVillas = useCallback(async () => {
    setState(prev => ({ ...prev, villasLoading: true, villasError: null }));

    const cacheKey = buildCacheKey('villas');
    const cachedVillas = readCache<Villa[]>(cacheKey);

    if (cachedVillas && cachedVillas.length > 0) {
      setState(prev => ({ ...prev, villas: cachedVillas }));
    }

    try {
      const { user } = await supabaseHelpers.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabaseHelpers.getVillas(user.id);
      if (error) {
        throw new Error(error.message);
      }

      const loadedVillas = data || [];

      writeCache(cacheKey, loadedVillas);

      let villaToSelect: Villa | null = null;
      let shouldLoadData = false;
      let shouldClearData = false;

      setState(prev => {
        const currentVilla = prev.selectedVilla;
        if (currentVilla && loadedVillas.find((v: Villa) => v.id === currentVilla.id)) {
          villaToSelect = loadedVillas.find((v: Villa) => v.id === currentVilla.id) || null;
        } else {
          shouldLoadData = true;
          const savedVillaId = localStorage.getItem('selectedVillaId');
          if (savedVillaId && loadedVillas.length > 0) {
            villaToSelect = loadedVillas.find((v: Villa) => v.id === savedVillaId) || null;
          }

          if (!villaToSelect && loadedVillas.length > 0) {
            villaToSelect = loadedVillas[0];
          }

          if (villaToSelect) {
            localStorage.setItem('selectedVillaId', villaToSelect.id);
          } else {
            localStorage.removeItem('selectedVillaId');
            shouldClearData = true;
          }
        }

        if (shouldClearData) {
          removeCache(buildCacheKey('tasks'));
          removeCache(buildCacheKey('expenses'));
          removeCache(buildCacheKey('chats'));
          removeCache(buildCacheKey('events'));
          removeCache(buildCacheKey('staff'));
          return {
            ...prev,
            villas: loadedVillas,
            selectedVilla: null,
            villasLoading: false,
            villasError: null,
            tasks: [],
            expenses: [],
            chats: [],
            events: [],
            staff: [],
          };
        }

        return {
          ...prev,
          villas: loadedVillas,
          selectedVilla: villaToSelect,
          villasLoading: false,
          villasError: null,
        };
      });

      if (shouldLoadData && villaToSelect) {
        setTimeout(() => {
          loadTasks(villaToSelect!.id);
          loadExpenses(villaToSelect!.id);
          loadChats(villaToSelect!.id);
          loadEvents(villaToSelect!.id);
          loadStaff(villaToSelect!.id);
        }, 0);
      }
    } catch (error) {
      console.error('Error loading villas:', error);
      setState(prev => ({
        ...prev,
        villas: cachedVillas && cachedVillas.length ? cachedVillas : prev.villas,
        villasError:
          cachedVillas && cachedVillas.length
            ? 'Showing cached villas due to network issues'
            : 'Failed to load villas',
        villasLoading: false,
      }));

      if (!cachedVillas || cachedVillas.length === 0) {
        toast.error('Unable to load villas. Please check your connection and try again.');
      } else {
        toast.warning('Working offline with cached villa data.');
      }
    }
  }, [buildCacheKey, readCache, removeCache, withRetry, writeCache]);

  const selectVilla = useCallback((villa: Villa | null) => {
    setState(prev => ({ ...prev, selectedVilla: villa }));
    
    // Persist selection to localStorage
    if (villa) {
      localStorage.setItem('selectedVillaId', villa.id);
      
      // Load villa-specific data when a villa is selected
      loadTasks(villa.id);
      loadExpenses(villa.id);
      loadChats(villa.id);
      loadEvents(villa.id);
      loadStaff(villa.id);
    } else {
      localStorage.removeItem('selectedVillaId');
    }
  }, []);

  const createVilla = useCallback(async (data: Partial<Villa>): Promise<Villa | null> => {
    try {
      const { user } = await supabaseHelpers.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: villa, error } = await supabaseHelpers.createVilla({
        name: data.name || '',
        address: data.address || '',
        location: data.location,
        description: data.description,
        lease_details: data.leaseDetails,
      }, user.id);

      if (error || !villa) {
        throw new Error(error?.message || 'Failed to create villa');
      }
      
      setState(prev => ({ 
        ...prev, 
        villas: [...prev.villas, villa as Villa],
      }));
      
      toast.success('Villa created successfully');
      return villa as Villa;
    } catch (error) {
      console.error('Error creating villa:', error);
      toast.error('Failed to create villa');
      return null;
    }
  }, []);

  const updateVilla = useCallback(async (id: string, data: Partial<Villa>): Promise<boolean> => {
    try {
      const { data: villa, error } = await supabaseHelpers.updateVilla(id, {
        name: data.name,
        address: data.address,
        location: data.location,
        description: data.description,
        lease_details: data.leaseDetails,
      });

      if (error || !villa) {
        throw new Error(error?.message || 'Failed to update villa');
      }
      
      setState(prev => ({ 
        ...prev, 
        villas: prev.villas.map(v => v.id === id ? villa as Villa : v),
        selectedVilla: prev.selectedVilla?.id === id ? villa as Villa : prev.selectedVilla,
      }));
      
      toast.success('Villa updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating villa:', error);
      toast.error('Failed to update villa');
      return false;
    }
  }, []);

  const deleteVilla = useCallback(async (id: string): Promise<boolean> => {
    try {
      // NOTE: Villa deletion will cascade to related data via RLS policies
      const { supabase } = await import('../utils/supabase-client');
      const { error } = await supabase.from('villas').delete().eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
      
      let wasSelected = false;
      
      // Use setState updater to access current state
      setState(prev => {
        wasSelected = prev.selectedVilla?.id === id;
        
        // Clear localStorage if deleting the selected villa
        if (wasSelected) {
          localStorage.removeItem('selectedVillaId');
        }
        
        return {
          ...prev,
          villas: prev.villas.filter(v => v.id !== id),
          selectedVilla: prev.selectedVilla?.id === id ? null : prev.selectedVilla,
        };
      });
      
      toast.success('Villa deleted successfully');
      
      // If we deleted the selected villa, reload villas to auto-select another
      if (wasSelected) {
        // Use setTimeout to ensure state update completes first
        setTimeout(() => loadVillas(), 0);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting villa:', error);
      toast.error('Failed to delete villa');
      return false;
    }
  }, []);

  // Task actions
  const loadTasks = useCallback(
    async (villaId?: string) => {
      setState(prev => ({ ...prev, tasksLoading: true, tasksError: null }));

      const targetVillaId = villaId || state.selectedVilla?.id;
      if (!targetVillaId) {
        setState(prev => ({
          ...prev,
          tasks: [],
          tasksLoading: false,
          tasksError: 'No villa selected',
        }));
        return;
      }

      const cacheKey = buildCacheKey('tasks', targetVillaId);
      const cachedTasks = readCache<Task[]>(cacheKey);

      if (cachedTasks && cachedTasks.length > 0) {
        setState(prev => ({ ...prev, tasks: cachedTasks }));
      }

      try {
        const { data, error } = await withRetry(() => supabaseHelpers.getTasks(targetVillaId));
        
        if (error) {
          throw new Error(String(error));
        }

        const nextTasks = data || [];
        writeCache(cacheKey, nextTasks);

        setState(prev => ({
          ...prev,
          tasks: nextTasks,
          tasksLoading: false,
          tasksError: null,
        }));
      } catch (error) {
        console.error('Error loading tasks:', error);
        setState(prev => ({
          ...prev,
          tasks: cachedTasks && cachedTasks.length ? cachedTasks : prev.tasks,
          tasksError:
            cachedTasks && cachedTasks.length
              ? 'Showing cached tasks due to network issues'
              : 'Failed to load tasks',
          tasksLoading: false,
        }));

        if (!cachedTasks || cachedTasks.length === 0) {
          toast.error('Unable to load tasks. Please check your connection.');
        } else {
          toast.warning('Working offline with cached tasks.');
        }
      }
    },
    [buildCacheKey, readCache, withRetry, writeCache, state.selectedVilla],
  );

  const createTask = useCallback(async (data: Partial<Task>): Promise<Task | null> => {
    try {
      const { user, error: userError } = await supabaseHelpers.getCurrentUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const villaId = data.villaId || state.selectedVilla?.id;
      if (!villaId) {
        throw new Error('No villa selected');
      }

      const taskData = {
        villa_id: villaId,
        title: data.title || '',
        description: data.description,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        assigned_to: data.assignedTo?.[0],
        due_date: data.dueDate,
        created_by: user.id,
      };

      const { data: task, error } = await supabaseHelpers.createTask(taskData);
      
      if (error) {
        throw new Error(String(error));
      }
      
      setState(prev => ({ 
        ...prev, 
        tasks: [...prev.tasks, task],
      }));
      
      toast.success('Task created successfully');
      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      return null;
    }
  }, [state.selectedVilla]);

  const updateTask = useCallback(async (id: string, data: Partial<Task>): Promise<boolean> => {
    try {
      const updates = {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assigned_to: data.assignedTo?.[0],
        due_date: data.dueDate,
      };

      const { data: task, error } = await supabaseHelpers.updateTask(id, updates);
      
      if (error) {
        throw new Error(String(error));
      }
      
      setState(prev => ({ 
        ...prev, 
        tasks: prev.tasks.map(t => t.id === id ? task : t),
      }));
      
      toast.success('Task updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      return false;
    }
  }, []);

  const updateTaskStatus = useCallback(async (id: string, status: string): Promise<boolean> => {
    try {
      const { data: task, error } = await supabaseHelpers.updateTask(id, { status });
      
      if (error) {
        throw new Error(String(error));
      }
      
      setState(prev => ({ 
        ...prev, 
        tasks: prev.tasks.map(t => t.id === id ? task : t),
      }));
      
      toast.success('Task status updated');
      return true;
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
      return false;
    }
  }, []);

  // Expense actions
  const loadExpenses = useCallback(
    async (villaId?: string) => {
      setState(prev => ({ ...prev, expensesLoading: true, expensesError: null }));

      const targetVillaId = villaId || state.selectedVilla?.id;
      if (!targetVillaId) {
        setState(prev => ({
          ...prev,
          expenses: [],
          expensesLoading: false,
          expensesError: 'No villa selected',
        }));
        return;
      }

      const cacheKey = buildCacheKey('expenses', targetVillaId);
      const cachedExpenses = readCache<Expense[]>(cacheKey);

      if (cachedExpenses && cachedExpenses.length > 0) {
        setState(prev => ({ ...prev, expenses: cachedExpenses }));
      }

      try {
        const { data, error } = await withRetry(() => supabaseHelpers.getExpenses(targetVillaId));
        
        if (error) {
          throw new Error(String(error));
        }

        const nextExpenses = data || [];
        writeCache(cacheKey, nextExpenses);

        setState(prev => ({
          ...prev,
          expenses: nextExpenses,
          expensesLoading: false,
          expensesError: null,
        }));
      } catch (error) {
        console.error('Error loading expenses:', error);
        setState(prev => ({
          ...prev,
          expenses: cachedExpenses && cachedExpenses.length ? cachedExpenses : prev.expenses,
          expensesError:
            cachedExpenses && cachedExpenses.length
              ? 'Showing cached expenses due to network issues'
              : 'Failed to load expenses',
          expensesLoading: false,
        }));

        if (!cachedExpenses || cachedExpenses.length === 0) {
          toast.error('Unable to load expenses. Please check your connection.');
        } else {
          toast.warning('Working offline with cached expenses.');
        }
      }
    },
    [buildCacheKey, readCache, withRetry, writeCache, state.selectedVilla],
  );

  const createExpense = useCallback(async (data: Partial<Expense>): Promise<Expense | null> => {
    try {
      const { user, error: userError } = await supabaseHelpers.getCurrentUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const villaId = data.villaId || state.selectedVilla?.id;
      if (!villaId) {
        throw new Error('No villa selected');
      }

      const expenseData = {
        villa_id: villaId,
        category: data.category || 'general',
        amount: String(data.amount || 0),
        description: data.description,
        receipt_url: data.receipts?.[0],
        submitted_by: user.id,
      };

      const { data: expense, error } = await supabaseHelpers.createExpense(expenseData);
      
      if (error) {
        throw new Error(String(error));
      }
      
      setState(prev => ({ 
        ...prev, 
        expenses: [...prev.expenses, expense],
      }));
      
      toast.success('Expense created successfully');
      return expense;
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to create expense');
      return null;
    }
  }, [state.selectedVilla]);

  const updateExpense = useCallback(async (id: string, data: Partial<Expense>): Promise<boolean> => {
    try {
      const updates = {
        category: data.category,
        amount: data.amount ? String(data.amount) : undefined,
        description: data.description,
        status: data.status,
      };

      const { data: expense, error } = await supabaseHelpers.updateExpense(id, updates);
      
      if (error) {
        throw new Error(String(error));
      }
      
      setState(prev => ({ 
        ...prev, 
        expenses: prev.expenses.map(e => e.id === id ? expense : e),
      }));
      
      toast.success('Expense updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
      return false;
    }
  }, []);

  const approveExpense = useCallback(async (id: string, approved: boolean): Promise<boolean> => {
    try {
      const { user, error: userError } = await supabaseHelpers.getCurrentUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const updates = {
        status: approved ? 'approved' : 'rejected',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      };

      const { data: expense, error } = await supabaseHelpers.updateExpense(id, updates);
      
      if (error) {
        throw new Error(String(error));
      }
      
      setState(prev => ({ 
        ...prev, 
        expenses: prev.expenses.map(e => e.id === id ? expense : e),
      }));
      
      toast.success(`Expense ${approved ? 'approved' : 'rejected'}`);
      return true;
    } catch (error) {
      console.error('Error updating expense approval:', error);
      toast.error('Failed to update expense approval');
      return false;
    }
  }, []);

  // Chat actions
  const loadChats = useCallback(
    async (villaId?: string) => {
      setState(prev => ({ ...prev, chatsLoading: true, chatsError: null }));

      const cacheKey = buildCacheKey('chats', villaId ?? 'all');
      const cachedChats = readCache<Chat[]>(cacheKey);

      if (cachedChats && cachedChats.length > 0) {
        setState(prev => ({ ...prev, chats: cachedChats }));
      }

      try {
        const endpoint = villaId ? `/villas/${villaId}/chats` : '/chats';
        const { chats } = await withRetry(() => apiRequest<{ chats: Chat[] }>(endpoint));
        const nextChats = chats || [];

        writeCache(cacheKey, nextChats);

        setState(prev => ({
          ...prev,
          chats: nextChats,
          chatsLoading: false,
          chatsError: null,
        }));
      } catch (error) {
        console.error('Error loading chats:', error);
        setState(prev => ({
          ...prev,
          chats: cachedChats && cachedChats.length ? cachedChats : prev.chats,
          chatsError:
            cachedChats && cachedChats.length
              ? 'Showing cached chats due to network issues'
              : 'Failed to load chats',
          chatsLoading: false,
        }));

        if (!cachedChats || cachedChats.length === 0) {
          toast.error('Unable to load chats. Please check your connection.');
        } else {
          toast.warning('Working offline with cached chats.');
        }
      }
    },
    [buildCacheKey, readCache, withRetry, writeCache],
  );

  const createChat = useCallback(async (data: Partial<Chat>): Promise<Chat | null> => {
    try {
      const { chat } = await apiRequest<{ chat: Chat }>('/chats', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      setState(prev => ({ 
        ...prev, 
        chats: [...prev.chats, chat],
      }));
      
      toast.success('Chat created successfully');
      return chat;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
      return null;
    }
  }, []);

  // Event actions
  const loadEvents = useCallback(
    async (villaId?: string) => {
      setState(prev => ({ ...prev, eventsLoading: true, eventsError: null }));

      const cacheKey = buildCacheKey('events', villaId ?? 'all');
      const cachedEvents = readCache<CalendarEvent[]>(cacheKey);

      if (cachedEvents && cachedEvents.length > 0) {
        setState(prev => ({ ...prev, events: cachedEvents }));
      }

      try {
        const endpoint = villaId ? `/villas/${villaId}/events` : '/events';
        const { events } = await withRetry(() => apiRequest<{ events: CalendarEvent[] }>(endpoint));
        const nextEvents = events || [];

        writeCache(cacheKey, nextEvents);

        setState(prev => ({
          ...prev,
          events: nextEvents,
          eventsLoading: false,
          eventsError: null,
        }));
      } catch (error) {
        console.error('Error loading events:', error);
        setState(prev => ({
          ...prev,
          events: cachedEvents && cachedEvents.length ? cachedEvents : prev.events,
          eventsError:
            cachedEvents && cachedEvents.length
              ? 'Showing cached events due to network issues'
              : 'Failed to load events',
          eventsLoading: false,
        }));

        if (!cachedEvents || cachedEvents.length === 0) {
          toast.error('Unable to load events. Please check your connection.');
        } else {
          toast.warning('Working offline with cached events.');
        }
      }
    },
    [buildCacheKey, readCache, withRetry, writeCache],
  );

  const createEvent = useCallback(async (data: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
    try {
      const { event } = await apiRequest<{ event: CalendarEvent }>('/events', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      setState(prev => ({ 
        ...prev, 
        events: [...prev.events, event],
      }));
      
      toast.success('Event created successfully');
      return event;
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      return null;
    }
  }, []);

  const updateEvent = useCallback(async (id: string, data: Partial<CalendarEvent>): Promise<boolean> => {
    try {
      const { event } = await apiRequest<{ event: CalendarEvent }>(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      setState(prev => ({ 
        ...prev, 
        events: prev.events.map(e => e.id === id ? event : e),
      }));
      
      toast.success('Event updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      return false;
    }
  }, []);

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiRequest(`/events/${id}`, { method: 'DELETE' });
      
      setState(prev => ({ 
        ...prev, 
        events: prev.events.filter(e => e.id !== id),
      }));
      
      toast.success('Event deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      return false;
    }
  }, []);

  // Staff actions
  const loadStaff = useCallback(
    async (villaId?: string) => {
      setState(prev => ({ ...prev, staffLoading: true, staffError: null }));

      const cacheKey = buildCacheKey('staff', villaId ?? 'all');
      const cachedStaff = readCache<StaffMember[]>(cacheKey);

      if (cachedStaff && cachedStaff.length > 0) {
        setState(prev => ({ ...prev, staff: cachedStaff }));
      }

      try {
        const endpoint = villaId ? `/villas/${villaId}/staff` : '/staff';
        const { staff } = await withRetry(() => apiRequest<{ staff: StaffMember[] }>(endpoint));
        const nextStaff = staff || [];

        writeCache(cacheKey, nextStaff);

        setState(prev => ({
          ...prev,
          staff: nextStaff,
          staffLoading: false,
          staffError: null,
        }));
      } catch (error) {
        console.error('Error loading staff:', error);
        setState(prev => ({
          ...prev,
          staff: cachedStaff && cachedStaff.length ? cachedStaff : prev.staff,
          staffError:
            cachedStaff && cachedStaff.length
              ? 'Showing cached staff due to network issues'
              : 'Failed to load staff',
          staffLoading: false,
        }));

        if (!cachedStaff || cachedStaff.length === 0) {
          toast.error('Unable to load staff. Please check your connection.');
        } else {
          toast.warning('Working offline with cached staff records.');
        }
      }
    },
    [buildCacheKey, readCache, withRetry, writeCache],
  );

  // UI actions
  const setCurrentView = useCallback((view: string) => {
    setState(prev => ({ ...prev, currentView: view }));
  }, []);

  const setUseMobileUI = useCallback((useMobile: boolean) => {
    setState(prev => ({ ...prev, useMobileUI: useMobile }));
    localStorage.setItem('useMobileUI', String(useMobile));
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, sidebarOpen: open }));
  }, []);

  // Utility actions
  const refreshData = useCallback(async () => {
    if (state.isAuthenticated) {
      await Promise.all([
        loadVillas(),
        loadUserProfile(),
        state.selectedVilla && loadTasks(state.selectedVilla.id),
        state.selectedVilla && loadExpenses(state.selectedVilla.id),
        state.selectedVilla && loadChats(state.selectedVilla.id),
        state.selectedVilla && loadEvents(state.selectedVilla.id),
        state.selectedVilla && loadStaff(state.selectedVilla.id),
      ].filter(Boolean));
    }
  }, [
    loadChats,
    loadExpenses,
    loadEvents,
    loadStaff,
    loadTasks,
    loadUserProfile,
    loadVillas,
    state.isAuthenticated,
    state.selectedVilla,
  ]);

  const clearCache = useCallback(() => {
    removeCache(buildCacheKey('villas'));
    removeCache(buildCacheKey('tasks'));
    removeCache(buildCacheKey('expenses'));
    removeCache(buildCacheKey('chats'));
    removeCache(buildCacheKey('events'));
    removeCache(buildCacheKey('staff'));

    setState(prev => ({
      ...prev,
      villas: [],
      tasks: [],
      expenses: [],
      chats: [],
      events: [],
      staff: [],
      villasError: null,
      tasksError: null,
      expensesError: null,
      chatsError: null,
      eventsError: null,
      staffError: null,
    }));
  }, [buildCacheKey, removeCache]);

  // Create the context value
  const contextValue: AppContextValue = {
    ...state,
    login,
    logout,
    refreshAuth,
    loadVillas,
    selectVilla,
    createVilla,
    updateVilla,
    deleteVilla,
    loadTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    loadExpenses,
    createExpense,
    updateExpense,
    approveExpense,
    loadChats,
    createChat,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    loadStaff,
    setCurrentView,
    setUseMobileUI,
    setSidebarOpen,
    refreshData,
    clearCache,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}