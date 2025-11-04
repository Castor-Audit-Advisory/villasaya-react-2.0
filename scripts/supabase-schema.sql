-- VillaSaya Database Schema for Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Public profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Landlord', 'Property Agent', 'Tenant', 'Staff')),
  profile_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Villas table
CREATE TABLE IF NOT EXISTS public.villas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  location TEXT,
  description TEXT,
  lease_details JSONB DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Villa Users (junction table)
CREATE TABLE IF NOT EXISTS public.villa_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  villa_id UUID NOT NULL REFERENCES public.villas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(villa_id, user_id)
);

-- User Settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  general JSONB DEFAULT '{}'::jsonb,
  security JSONB DEFAULT '{}'::jsonb,
  notifications JSONB DEFAULT '{}'::jsonb,
  billing JSONB DEFAULT '{}'::jsonb,
  integrations JSONB DEFAULT '{}'::jsonb,
  data_retention JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  villa_id UUID NOT NULL REFERENCES public.villas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id),
  due_date TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  villa_id UUID NOT NULL REFERENCES public.villas(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  receipt_url TEXT,
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  villa_id UUID NOT NULL REFERENCES public.villas(id) ON DELETE CASCADE,
  thread_id TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff Attendance table
CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  villa_id UUID NOT NULL REFERENCES public.villas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'clocked-in' CHECK (status IN ('clocked-in', 'clocked-out')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leave Requests table
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  villa_id UUID NOT NULL REFERENCES public.villas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invite Codes table
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  villa_id UUID NOT NULL REFERENCES public.villas(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses TEXT,
  current_uses TEXT DEFAULT '0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar Events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  villa_id UUID REFERENCES public.villas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense Templates table
CREATE TABLE IF NOT EXISTS public.expense_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount TEXT,
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table for messaging
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  villa_id UUID NOT NULL REFERENCES public.villas(id) ON DELETE CASCADE,
  thread_id TEXT NOT NULL UNIQUE,
  title TEXT,
  participants JSONB DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_villas_created_by ON public.villas(created_by);
CREATE INDEX IF NOT EXISTS idx_villa_users_villa_id ON public.villa_users(villa_id);
CREATE INDEX IF NOT EXISTS idx_villa_users_user_id ON public.villa_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_villa_id ON public.tasks(villa_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_expenses_villa_id ON public.expenses(villa_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_messages_villa_id ON public.messages(villa_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_user_id ON public.staff_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_villa_id ON public.staff_attendance(villa_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON public.leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_villa_id ON public.leave_requests(villa_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_villa_id ON public.calendar_events(villa_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_dates ON public.calendar_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_chats_villa_id ON public.chats(villa_id);
CREATE INDEX IF NOT EXISTS idx_chats_thread_id ON public.chats(thread_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villa_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view villas they are members of" ON public.villas;
DROP POLICY IF EXISTS "Users can create villas" ON public.villas;
DROP POLICY IF EXISTS "Villa admins can update villas" ON public.villas;
DROP POLICY IF EXISTS "Users can view villa members" ON public.villa_users;
DROP POLICY IF EXISTS "Villa admins can manage villa members" ON public.villa_users;
DROP POLICY IF EXISTS "Users can manage their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Villa members can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Villa members can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Villa members can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Villa members can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Villa members can view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Villa members can create expenses" ON public.expenses;
DROP POLICY IF EXISTS "Villa members can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Villa members can view messages" ON public.messages;
DROP POLICY IF EXISTS "Villa members can create messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view own attendance" ON public.staff_attendance;
DROP POLICY IF EXISTS "Users can create own attendance" ON public.staff_attendance;
DROP POLICY IF EXISTS "Users can update own attendance" ON public.staff_attendance;
DROP POLICY IF EXISTS "Villa admins can view all attendance" ON public.staff_attendance;
DROP POLICY IF EXISTS "Users can view own leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Users can create own leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Users can update own leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Villa admins can view all leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Villa admins can update leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Users can view their events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create their events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can manage their own templates" ON public.expense_templates;
DROP POLICY IF EXISTS "Villa members can view chats" ON public.chats;
DROP POLICY IF EXISTS "Villa members can create chats" ON public.chats;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for villas
CREATE POLICY "Users can view villas they are members of" ON public.villas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = id AND user_id = auth.uid())
);
CREATE POLICY "Users can create villas" ON public.villas FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Villa admins can update villas" ON public.villas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = id AND user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for villa_users
CREATE POLICY "Users can view villa members" ON public.villa_users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.villa_users vu WHERE vu.villa_id = villa_id AND vu.user_id = auth.uid())
);
CREATE POLICY "Villa admins can manage villa members" ON public.villa_users FOR ALL USING (
  EXISTS (SELECT 1 FROM public.villa_users vu WHERE vu.villa_id = villa_id AND vu.user_id = auth.uid() AND vu.role = 'admin')
);

-- RLS Policies for user_settings
CREATE POLICY "Users can manage their own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Villa members can view tasks" ON public.tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = tasks.villa_id AND user_id = auth.uid())
);
CREATE POLICY "Villa members can create tasks" ON public.tasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = tasks.villa_id AND user_id = auth.uid())
);
CREATE POLICY "Villa members can update tasks" ON public.tasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = tasks.villa_id AND user_id = auth.uid())
);
CREATE POLICY "Villa members can delete tasks" ON public.tasks FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = tasks.villa_id AND user_id = auth.uid())
);

-- RLS Policies for expenses
CREATE POLICY "Villa members can view expenses" ON public.expenses FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = expenses.villa_id AND user_id = auth.uid())
);
CREATE POLICY "Villa members can create expenses" ON public.expenses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = expenses.villa_id AND user_id = auth.uid())
);
CREATE POLICY "Villa members can update expenses" ON public.expenses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = expenses.villa_id AND user_id = auth.uid())
);

-- RLS Policies for messages
CREATE POLICY "Villa members can view messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = messages.villa_id AND user_id = auth.uid())
);
CREATE POLICY "Villa members can create messages" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = messages.villa_id AND user_id = auth.uid())
);

-- RLS Policies for staff_attendance
CREATE POLICY "Users can view own attendance" ON public.staff_attendance FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own attendance" ON public.staff_attendance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attendance" ON public.staff_attendance FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Villa admins can view all attendance" ON public.staff_attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = staff_attendance.villa_id AND user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for leave_requests
CREATE POLICY "Users can view own leave requests" ON public.leave_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own leave requests" ON public.leave_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leave requests" ON public.leave_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Villa admins can view all leave requests" ON public.leave_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = leave_requests.villa_id AND user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Villa admins can update leave requests" ON public.leave_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = leave_requests.villa_id AND user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for calendar_events
CREATE POLICY "Users can view their events" ON public.calendar_events FOR SELECT USING (
  auth.uid() = user_id OR 
  (villa_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = calendar_events.villa_id AND user_id = auth.uid()))
);
CREATE POLICY "Users can create their events" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their events" ON public.calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their events" ON public.calendar_events FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for expense_templates
CREATE POLICY "Users can manage their own templates" ON public.expense_templates FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for chats
CREATE POLICY "Villa members can view chats" ON public.chats FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = chats.villa_id AND user_id = auth.uid())
);
CREATE POLICY "Villa members can create chats" ON public.chats FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.villa_users WHERE villa_id = chats.villa_id AND user_id = auth.uid())
);

-- Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_villas_updated_at ON public.villas;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON public.leave_requests;
DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON public.calendar_events;
DROP TRIGGER IF EXISTS update_expense_templates_updated_at ON public.expense_templates;
DROP TRIGGER IF EXISTS update_chats_updated_at ON public.chats;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_villas_updated_at BEFORE UPDATE ON public.villas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expense_templates_updated_at BEFORE UPDATE ON public.expense_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
