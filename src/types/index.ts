// Domain Model Types for VillaSaya Application

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export type UserRole = 'landlord' | 'property_agent' | 'tenant' | 'staff';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  villas: VillaReference[];
  createdAt: string;
}

export interface VillaReference {
  villaId: string;
  role: VillaUserRole;
  permissions: Permission[];
}

// Villa Types
export interface Villa {
  id: string;
  name: string;
  address: string;
  location?: string;
  description?: string;
  leaseDetails: LeaseDetails;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  users: VillaUser[];
}

export interface LeaseDetails {
  startDate?: string;
  endDate?: string;
  duration?: number;
  rent?: number;
  deposit?: number;
}

export interface VillaUser {
  userId: string;
  role: VillaUserRole;
  permissions: Permission[];
  joinedAt: string;
}

export type VillaUserRole = 'admin' | 'landlord' | 'property_agent' | 'tenant' | 'staff';
export type Permission = 'all' | 'view' | 'edit' | 'delete' | 'manage_users' | 'manage_tasks' | 'manage_expenses' | 'approve_expenses';

// Task Types
export interface Task {
  id: string;
  villaId: string;
  title: string;
  description: string;
  assignedTo: string[];
  supervisorId?: string;
  createdBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  mandatory: Record<string, boolean>;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

export type TaskStatus = 'pending' | 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// Expense Types
export interface Expense {
  id: string;
  villaId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date?: string; // Add date field for compatibility
  taskIds?: string[];
  receipts?: string[];
  createdBy: string;
  status: ExpenseStatus;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  notes?: string;
}

export type ExpenseCategory = 'maintenance' | 'utilities' | 'supplies' | 'services' | 'repairs' | 'general';
export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'paid';

// Chat/Message Types
export interface Chat {
  id: string;
  villaId: string;
  title: string;
  subject?: string; // Add subject field for compatibility
  participants: string[];
  createdBy: string;
  createdAt: string;
  lastMessageAt?: string;
  lastMessage?: string; // Add for compatibility
  lastMessageBy?: string; // Add for compatibility
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  attachments?: string[];
  createdAt: string;
  editedAt?: string;
  readBy: string[];
}

// Event Types
export interface CalendarEvent {
  id: string;
  villaId?: string;
  userId: string;
  title: string;
  description?: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  recurring?: RecurringPattern;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export type EventType = 'personal' | 'villa' | 'maintenance' | 'inspection' | 'meeting' | 'deadline' | 'leave' | 'task';

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
}

// Staff Types
export interface StaffMember {
  id: string;
  userId: string;
  villaId: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  status: StaffStatus;
  joinedAt: string;
}

export type StaffStatus = 'active' | 'inactive' | 'on_leave' | 'clocked_in' | 'clocked_out';

export interface ClockRecord {
  id: string;
  userId: string;
  villaId: string;
  clockInTime: string;
  clockOutTime?: string;
  location?: string;
  notes?: string;
  duration?: number;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  villaId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export type LeaveType = 'vacation' | 'sick' | 'personal' | 'emergency';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// Invite Types
export interface InviteCode {
  code: string;
  villaId: string;
  role: VillaUserRole;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  usedBy?: string;
  usedAt?: string;
}

// Template Types
export interface ExpenseTemplate {
  id: string;
  villaId?: string;
  name: string;
  category: ExpenseCategory;
  amount?: number;
  description: string;
  usageCount: number;
  lastUsedAt?: string;
  createdBy: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Authentication Types
export interface AuthSession {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  name: string;
  role: UserRole;
}