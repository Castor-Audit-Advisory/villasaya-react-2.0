/**
 * Domain-specific data fetching hooks for VillaSaya
 * 
 * These hooks provide a standardized interface for fetching and managing
 * domain resources (tasks, staff, events, etc.) with proper TypeScript types.
 */

import { useMemo } from 'react';
import { useResourceData, UseResourceDataResult } from './useResourceData';
import type {
  Task,
  StaffMember,
  CalendarEvent,
  Chat,
  Expense,
} from '../types';

/**
 * Stable data extractors to prevent infinite loops
 * These are defined outside hooks so they maintain stable references
 */
const extractTasks = (response: any): Task[] => response.tasks || [];
const extractStaff = (response: any): StaffMember[] => response.staff || [];
const extractEvents = (response: any): CalendarEvent[] => response.events || [];
const extractChats = (response: any): Chat[] => response.chats || [];
const extractExpenses = (response: any): Expense[] => response.expenses || [];
const extractMessages = (response: any): any[] => response.messages || [];
const extractSingleTask = (response: any): Task[] => response.task ? [response.task] : [];
const extractSingleExpense = (response: any): Expense[] => response.expense ? [response.expense] : [];
const extractSingleStaff = (response: any): StaffMember[] => response.staff ? [response.staff] : [];

/**
 * Hook for fetching and managing tasks
 * 
 * @example
 * ```tsx
 * const { data: tasks, isInitialLoad, refresh } = useTasks();
 * 
 * // With villa filter
 * const { data: villaTasks } = useTasks({ villaId: 'villa-123' });
 * ```
 */
export function useTasks(options?: {
  villaId?: string;
  status?: string;
  assignedTo?: string;
}): UseResourceDataResult<Task> {
  // Memoize query params to prevent unnecessary refetches
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (options?.villaId) params.villaId = options.villaId;
    if (options?.status) params.status = options.status;
    if (options?.assignedTo) params.assignedTo = options.assignedTo;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [options?.villaId, options?.status, options?.assignedTo]);

  return useResourceData<Task>({
    endpoint: '/tasks',
    dataExtractor: extractTasks,
    errorMessage: 'Failed to load tasks',
    queryParams,
    dependencies: [options?.villaId, options?.status, options?.assignedTo],
  });
}

/**
 * Hook for fetching and managing staff members
 * 
 * @example
 * ```tsx
 * const { data: staff, isLoading, refresh } = useStaff();
 * 
 * // With villa filter
 * const { data: villaStaff } = useStaff({ villaId: 'villa-123' });
 * ```
 */
export function useStaff(options?: {
  villaId?: string;
  status?: string;
}): UseResourceDataResult<StaffMember> {
  // Memoize query params to prevent unnecessary refetches
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (options?.villaId) params.villaId = options.villaId;
    if (options?.status) params.status = options.status;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [options?.villaId, options?.status]);

  return useResourceData<StaffMember>({
    endpoint: '/staff',
    dataExtractor: extractStaff,
    errorMessage: 'Failed to load staff',
    queryParams,
    dependencies: [options?.villaId, options?.status],
  });
}

/**
 * Hook for fetching and managing calendar events
 * 
 * @example
 * ```tsx
 * const { data: events, refresh } = useEvents({
 *   startDate: '2025-01-01',
 *   endDate: '2025-01-31'
 * });
 * ```
 */
export function useEvents(options?: {
  villaId?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  includeAll?: boolean;
}): UseResourceDataResult<CalendarEvent> {
  // Memoize query params to prevent unnecessary refetches
  const queryParams = useMemo(() => {
    const params: Record<string, string | boolean> = {};
    if (options?.villaId) params.villaId = options.villaId;
    if (options?.startDate) params.startDate = options.startDate;
    if (options?.endDate) params.endDate = options.endDate;
    if (options?.type) params.type = options.type;
    if (options?.includeAll !== undefined) params.includeAll = options.includeAll;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [
    options?.villaId,
    options?.startDate,
    options?.endDate,
    options?.type,
    options?.includeAll,
  ]);

  return useResourceData<CalendarEvent>({
    endpoint: '/events',
    dataExtractor: extractEvents,
    errorMessage: 'Failed to load events',
    queryParams,
    dependencies: [
      options?.startDate,
      options?.endDate,
      options?.villaId,
      options?.type,
      options?.includeAll,
    ],
  });
}

/**
 * Hook for fetching and managing chats
 * 
 * @example
 * ```tsx
 * const { data: chats, isInitialLoad, refresh } = useChats();
 * 
 * // With villa filter
 * const { data: villaChats } = useChats({ villaId: 'villa-123' });
 * ```
 */
export function useChats(options?: {
  villaId?: string;
}): UseResourceDataResult<Chat> {
  // Memoize query params to prevent unnecessary refetches
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (options?.villaId) params.villaId = options.villaId;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [options?.villaId]);

  return useResourceData<Chat>({
    endpoint: '/chats',
    dataExtractor: extractChats,
    errorMessage: 'Failed to load messages',
    queryParams,
    dependencies: [options?.villaId],
  });
}

/**
 * Hook for fetching and managing expenses
 * 
 * @example
 * ```tsx
 * const { data: expenses, refresh } = useExpenses();
 * 
 * // With filters
 * const { data: pendingExpenses } = useExpenses({
 *   status: 'pending',
 *   villaId: 'villa-123'
 * });
 * ```
 */
export function useExpenses(options?: {
  villaId?: string;
  status?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}): UseResourceDataResult<Expense> {
  // Memoize query params to prevent unnecessary refetches
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (options?.villaId) params.villaId = options.villaId;
    if (options?.status) params.status = options.status;
    if (options?.category) params.category = options.category;
    if (options?.startDate) params.startDate = options.startDate;
    if (options?.endDate) params.endDate = options.endDate;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [
    options?.villaId,
    options?.status,
    options?.category,
    options?.startDate,
    options?.endDate,
  ]);

  return useResourceData<Expense>({
    endpoint: '/expenses',
    dataExtractor: extractExpenses,
    errorMessage: 'Failed to load expenses',
    queryParams,
    dependencies: [
      options?.villaId,
      options?.status,
      options?.category,
      options?.startDate,
      options?.endDate,
    ],
  });
}

/**
 * Hook for fetching messages for a specific chat
 * 
 * @example
 * ```tsx
 * const { data: messages, refresh } = useChatMessages('chat-123');
 * ```
 */
export function useChatMessages(chatId: string) {
  return useResourceData({
    endpoint: `/chats/${chatId}/messages`,
    dataExtractor: extractMessages,
    errorMessage: 'Failed to load messages',
    dependencies: [chatId],
  });
}

/**
 * Hook for fetching a single task by ID
 * 
 * @example
 * ```tsx
 * const { data: [task], isLoading } = useTask('task-123');
 * ```
 */
export function useTask(taskId: string) {
  return useResourceData<Task>({
    endpoint: `/tasks/${taskId}`,
    dataExtractor: extractSingleTask,
    errorMessage: 'Failed to load task',
    dependencies: [taskId],
  });
}

/**
 * Hook for fetching a single expense by ID
 * 
 * @example
 * ```tsx
 * const { data: [expense], isLoading } = useExpense('expense-123');
 * ```
 */
export function useExpense(expenseId: string) {
  return useResourceData<Expense>({
    endpoint: `/expenses/${expenseId}`,
    dataExtractor: extractSingleExpense,
    errorMessage: 'Failed to load expense',
    dependencies: [expenseId],
  });
}

/**
 * Hook for fetching a single staff member by ID
 * 
 * @example
 * ```tsx
 * const { data: [staff], isLoading } = useStaffMember('staff-123');
 * ```
 */
export function useStaffMember(staffId: string) {
  return useResourceData<StaffMember>({
    endpoint: `/staff/${staffId}`,
    dataExtractor: extractSingleStaff,
    errorMessage: 'Failed to load staff member',
    dependencies: [staffId],
  });
}
