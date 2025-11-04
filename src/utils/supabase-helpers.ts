// @ts-nocheck
// NOTE: Type checking disabled until Supabase types are generated
// Generate types with: npx supabase gen types typescript --project-id YOUR_PROJECT_ID
// Then remove @ts-nocheck and add proper types

import { supabase } from './supabase-client';
import { PostgrestError } from '@supabase/supabase-js';

export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

export interface SupabaseListResponse<T> {
  data: T[];
  error: SupabaseError | null;
  count?: number;
}

export interface SupabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

function formatSupabaseError(error: PostgrestError | Error | null): SupabaseError | null {
  if (!error) return null;
  
  if ('code' in error && 'details' in error) {
    const pgError = error as PostgrestError;
    return {
      message: pgError.message || 'Database error occurred',
      code: pgError.code,
      details: pgError.details,
      hint: pgError.hint,
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
  };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { user: null, error: formatSupabaseError(error) };
  }
  
  return { user, error: null };
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return {
    data,
    error: formatSupabaseError(error),
  };
}

export async function getVillas(userId: string): Promise<SupabaseListResponse<any>> {
  const { data, error, count } = await (supabase
    .from('villa_users') as any)
    .select(`
      villa_id,
      role,
      permissions,
      joined_at,
      villas (
        id,
        name,
        address,
        location,
        description,
        lease_details,
        created_by,
        created_at,
        updated_at
      )
    `, { count: 'exact' })
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });
  
  if (error) {
    return { data: [], error: formatSupabaseError(error), count: 0 };
  }
  
  const villas = data?.map((item: any) => ({
    ...item.villas,
    userRole: item.role,
    userPermissions: item.permissions,
    joinedAt: item.joined_at,
  })) || [];
  
  return { data: villas, error: null, count: count || 0 };
}

export async function getVillaById(villaId: string, userId: string): Promise<SupabaseResponse<any>> {
  const { data: villaUser, error: villaUserError } = await (supabase
    .from('villa_users') as any)
    .select('role, permissions')
    .eq('villa_id', villaId)
    .eq('user_id', userId)
    .single();
  
  if (villaUserError || !villaUser) {
    return { data: null, error: formatSupabaseError(villaUserError) };
  }
  
  const { data: villa, error: villaError } = await (supabase
    .from('villas') as any)
    .select('*')
    .eq('id', villaId)
    .single();
  
  if (villaError || !villa) {
    return { data: null, error: formatSupabaseError(villaError) };
  }
  
  const { data: users, error: usersError } = await (supabase
    .from('villa_users') as any)
    .select(`
      user_id,
      role,
      permissions,
      joined_at,
      profiles (
        name,
        role
      )
    `)
    .eq('villa_id', villaId);
  
  const villaWithUsers = {
    ...villa,
    userRole: villaUser.role,
    userPermissions: villaUser.permissions,
    users: users?.map((u: any) => ({
      userId: u.user_id,
      name: u.profiles?.name,
      role: u.role,
      permissions: u.permissions,
      joinedAt: u.joined_at,
    })) || [],
  };
  
  return { data: villaWithUsers, error: null };
}

export async function createVilla(data: {
  name: string;
  address: string;
  location?: string;
  description?: string;
  lease_details?: any;
}, userId: string): Promise<SupabaseResponse<any>> {
  const { data: villa, error: villaError } = await supabase
    .from('villas')
    .insert({
      name: data.name,
      address: data.address,
      location: data.location,
      description: data.description,
      lease_details: data.lease_details || {},
      created_by: userId,
    })
    .select()
    .single();
  
  if (villaError) {
    return { data: null, error: formatSupabaseError(villaError) };
  }
  
  const { error: villaUserError } = await supabase
    .from('villa_users')
    .insert({
      villa_id: villa.id,
      user_id: userId,
      role: 'admin',
      permissions: ['all'],
    });
  
  if (villaUserError) {
    await supabase.from('villas').delete().eq('id', villa.id);
    return { data: null, error: formatSupabaseError(villaUserError) };
  }
  
  return { data: villa, error: null };
}

export async function updateVilla(
  villaId: string,
  updates: {
    name?: string;
    address?: string;
    location?: string;
    description?: string;
    lease_details?: any;
  }
): Promise<SupabaseResponse<any>> {
  const { data, error } = await supabase
    .from('villas')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', villaId)
    .select()
    .single();
  
  return {
    data,
    error: formatSupabaseError(error),
  };
}

export async function joinVillaWithCode(code: string, userId: string): Promise<SupabaseResponse<any>> {
  const { data: invite, error: inviteError } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', code)
    .single();
  
  if (inviteError || !invite) {
    return { 
      data: null, 
      error: { message: 'Invalid or expired invite code' } 
    };
  }
  
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { 
      data: null, 
      error: { message: 'This invite code has expired' } 
    };
  }
  
  if (invite.max_uses && parseInt(invite.current_uses) >= parseInt(invite.max_uses)) {
    return { 
      data: null, 
      error: { message: 'This invite code has reached its usage limit' } 
    };
  }
  
  const { data: existing } = await supabase
    .from('villa_users')
    .select('id')
    .eq('villa_id', invite.villa_id)
    .eq('user_id', userId)
    .single();
  
  if (existing) {
    return { 
      data: null, 
      error: { message: 'You are already a member of this villa' } 
    };
  }
  
  const { data: villaUser, error: joinError } = await supabase
    .from('villa_users')
    .insert({
      villa_id: invite.villa_id,
      user_id: userId,
      role: invite.role,
      permissions: [],
    })
    .select()
    .single();
  
  if (joinError) {
    return { data: null, error: formatSupabaseError(joinError) };
  }
  
  await supabase
    .from('invite_codes')
    .update({ 
      current_uses: (parseInt(invite.current_uses) + 1).toString() 
    })
    .eq('id', invite.id);
  
  const { data: villa } = await supabase
    .from('villas')
    .select('*')
    .eq('id', invite.villa_id)
    .single();
  
  return { data: villa, error: null };
}

export async function getTasks(villaId: string): Promise<SupabaseListResponse<any>> {
  const { data, error, count } = await supabase
    .from('tasks')
    .select(`
      *,
      assigned:assigned_to (
        id,
        name,
        role
      ),
      creator:created_by (
        id,
        name,
        role
      )
    `, { count: 'exact' })
    .eq('villa_id', villaId)
    .order('created_at', { ascending: false });
  
  return {
    data: data || [],
    error: formatSupabaseError(error),
    count: count || 0,
  };
}

export async function createTask(data: {
  villa_id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  due_date?: string;
  created_by: string;
}): Promise<SupabaseResponse<any>> {
  const { data: task, error } = await supabase
    .from('tasks')
    .insert(data)
    .select()
    .single();
  
  return {
    data: task,
    error: formatSupabaseError(error),
  };
}

export async function updateTask(
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assigned_to?: string;
    due_date?: string;
  }
): Promise<SupabaseResponse<any>> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single();
  
  return {
    data,
    error: formatSupabaseError(error),
  };
}

export async function deleteTask(taskId: string): Promise<SupabaseResponse<null>> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  
  return {
    data: null,
    error: formatSupabaseError(error),
  };
}

export async function getExpenses(villaId: string): Promise<SupabaseListResponse<any>> {
  const { data, error, count } = await supabase
    .from('expenses')
    .select(`
      *,
      submitter:submitted_by (
        id,
        name,
        role
      ),
      approver:approved_by (
        id,
        name,
        role
      )
    `, { count: 'exact' })
    .eq('villa_id', villaId)
    .order('created_at', { ascending: false });
  
  return {
    data: data || [],
    error: formatSupabaseError(error),
    count: count || 0,
  };
}

export async function createExpense(data: {
  villa_id: string;
  category: string;
  amount: string;
  description?: string;
  receipt_url?: string;
  submitted_by: string;
}): Promise<SupabaseResponse<any>> {
  const { data: expense, error } = await supabase
    .from('expenses')
    .insert(data)
    .select()
    .single();
  
  return {
    data: expense,
    error: formatSupabaseError(error),
  };
}

export async function updateExpense(
  expenseId: string,
  updates: {
    category?: string;
    amount?: string;
    description?: string;
    status?: string;
    approved_by?: string;
  }
): Promise<SupabaseResponse<any>> {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', expenseId)
    .select()
    .single();
  
  return {
    data,
    error: formatSupabaseError(error),
  };
}

export async function getMessages(villaId: string, threadId: string): Promise<SupabaseListResponse<any>> {
  const { data, error, count } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id (
        id,
        name,
        role
      )
    `, { count: 'exact' })
    .eq('villa_id', villaId)
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });
  
  return {
    data: data || [],
    error: formatSupabaseError(error),
    count: count || 0,
  };
}

export async function getChats(villaId: string): Promise<SupabaseListResponse<any>> {
  const { data, error, count } = await supabase
    .from('chats')
    .select('*', { count: 'exact' })
    .eq('villa_id', villaId)
    .order('updated_at', { ascending: false });
  
  return {
    data: data || [],
    error: formatSupabaseError(error),
    count: count || 0,
  };
}

export async function createChat(data: {
  villa_id: string;
  thread_id: string;
  title?: string;
  participants: string[];
  created_by: string;
}): Promise<SupabaseResponse<any>> {
  const { data: chat, error } = await supabase
    .from('chats')
    .insert({
      villa_id: data.villa_id,
      thread_id: data.thread_id,
      title: data.title,
      participants: data.participants,
      created_by: data.created_by,
    })
    .select()
    .single();
  
  return {
    data: chat,
    error: formatSupabaseError(error),
  };
}

export async function sendMessage(data: {
  villa_id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  attachments?: any[];
}): Promise<SupabaseResponse<any>> {
  const { data: message, error } = await supabase
    .from('messages')
    .insert(data)
    .select()
    .single();
  
  if (!error && message) {
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('thread_id', data.thread_id);
  }
  
  return {
    data: message,
    error: formatSupabaseError(error),
  };
}

export async function getStaffAttendance(villaId: string): Promise<SupabaseListResponse<any>> {
  const { data, error, count } = await supabase
    .from('staff_attendance')
    .select(`
      *,
      user:user_id (
        id,
        name,
        role
      )
    `, { count: 'exact' })
    .eq('villa_id', villaId)
    .order('clock_in', { ascending: false });
  
  return {
    data: data || [],
    error: formatSupabaseError(error),
    count: count || 0,
  };
}

export async function clockIn(data: {
  villa_id: string;
  user_id: string;
  notes?: string;
}): Promise<SupabaseResponse<any>> {
  const { data: attendance, error } = await supabase
    .from('staff_attendance')
    .insert({
      villa_id: data.villa_id,
      user_id: data.user_id,
      clock_in: new Date().toISOString(),
      status: 'clocked-in',
      notes: data.notes,
    })
    .select()
    .single();
  
  return {
    data: attendance,
    error: formatSupabaseError(error),
  };
}

export async function clockOut(attendanceId: string, notes?: string): Promise<SupabaseResponse<any>> {
  const { data, error } = await supabase
    .from('staff_attendance')
    .update({
      clock_out: new Date().toISOString(),
      status: 'clocked-out',
      notes,
    })
    .eq('id', attendanceId)
    .select()
    .single();
  
  return {
    data,
    error: formatSupabaseError(error),
  };
}

export async function getLeaveRequests(villaId: string): Promise<SupabaseListResponse<any>> {
  const { data, error, count } = await supabase
    .from('leave_requests')
    .select(`
      *,
      user:user_id (
        id,
        name,
        role
      ),
      approver:approved_by (
        id,
        name,
        role
      )
    `, { count: 'exact' })
    .eq('villa_id', villaId)
    .order('created_at', { ascending: false });
  
  return {
    data: data || [],
    error: formatSupabaseError(error),
    count: count || 0,
  };
}

export async function createLeaveRequest(data: {
  villa_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  type?: string;
  reason?: string;
}): Promise<SupabaseResponse<any>> {
  const { data: leave, error } = await supabase
    .from('leave_requests')
    .insert(data)
    .select()
    .single();
  
  return {
    data: leave,
    error: formatSupabaseError(error),
  };
}

export async function updateLeaveRequest(
  leaveId: string,
  updates: {
    status?: string;
    approved_by?: string;
  }
): Promise<SupabaseResponse<any>> {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', leaveId)
    .select()
    .single();
  
  return {
    data,
    error: formatSupabaseError(error),
  };
}

export async function getCalendarEvents(villaId: string, userId: string): Promise<SupabaseListResponse<any>> {
  const { data, error, count } = await supabase
    .from('calendar_events')
    .select('*', { count: 'exact' })
    .or(`villa_id.eq.${villaId},user_id.eq.${userId}`)
    .order('start_date', { ascending: true });
  
  return {
    data: data || [],
    error: formatSupabaseError(error),
    count: count || 0,
  };
}

export async function createCalendarEvent(data: {
  villa_id?: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  type: string;
  location?: string;
}): Promise<SupabaseResponse<any>> {
  const { data: event, error } = await supabase
    .from('calendar_events')
    .insert(data)
    .select()
    .single();
  
  return {
    data: event,
    error: formatSupabaseError(error),
  };
}

export async function updateCalendarEvent(
  eventId: string,
  updates: any
): Promise<SupabaseResponse<any>> {
  const { data, error } = await supabase
    .from('calendar_events')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', eventId)
    .select()
    .single();
  
  return {
    data,
    error: formatSupabaseError(error),
  };
}

export async function deleteCalendarEvent(eventId: string): Promise<SupabaseResponse<null>> {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', eventId);
  
  return {
    data: null,
    error: formatSupabaseError(error),
  };
}

export async function getUserSettings(userId: string): Promise<SupabaseResponse<any>> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return {
    data,
    error: formatSupabaseError(error),
  };
}

export async function updateUserSettings(
  userId: string,
  updates: {
    general?: any;
    security?: any;
    notifications?: any;
    billing?: any;
    integrations?: any;
    data_retention?: any;
  }
): Promise<SupabaseResponse<any>> {
  const { data, error } = await supabase
    .from('user_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single();
  
  return {
    data,
    error: formatSupabaseError(error),
  };
}

export async function getExpenseTemplates(userId: string): Promise<SupabaseListResponse<any>> {
  const { data, error, count } = await supabase
    .from('expense_templates')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('usage_count', { ascending: false });
  
  return {
    data: data || [],
    error: formatSupabaseError(error),
    count: count || 0,
  };
}

export async function createExpenseTemplate(data: {
  user_id: string;
  name: string;
  category: string;
  amount?: string;
  description?: string;
}): Promise<SupabaseResponse<any>> {
  const { data: template, error } = await supabase
    .from('expense_templates')
    .insert(data)
    .select()
    .single();
  
  return {
    data: template,
    error: formatSupabaseError(error),
  };
}

export async function deleteExpenseTemplate(templateId: string): Promise<SupabaseResponse<null>> {
  const { error } = await supabase
    .from('expense_templates')
    .delete()
    .eq('id', templateId);
  
  return {
    data: null,
    error: formatSupabaseError(error),
  };
}

export async function createInviteCode(data: {
  code: string;
  villa_id: string;
  role: string;
  created_by: string;
  expires_at?: string;
  max_uses?: string;
}): Promise<SupabaseResponse<any>> {
  const { data: invite, error } = await supabase
    .from('invite_codes')
    .insert(data)
    .select()
    .single();
  
  return {
    data: invite,
    error: formatSupabaseError(error),
  };
}

export async function getInviteCodes(villaId: string): Promise<SupabaseListResponse<any>> {
  const { data, error, count } = await supabase
    .from('invite_codes')
    .select('*', { count: 'exact' })
    .eq('villa_id', villaId)
    .order('created_at', { ascending: false });
  
  return {
    data: data || [],
    error: formatSupabaseError(error),
    count: count || 0,
  };
}

export async function deleteInviteCode(inviteId: string): Promise<SupabaseResponse<null>> {
  const { error } = await supabase
    .from('invite_codes')
    .delete()
    .eq('id', inviteId);
  
  return {
    data: null,
    error: formatSupabaseError(error),
  };
}
