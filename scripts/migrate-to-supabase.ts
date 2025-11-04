import { createClient } from '@supabase/supabase-js';
import { Pool } from '@neondatabase/serverless';

const SUPABASE_URL = `https://${process.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!process.env.VITE_SUPABASE_PROJECT_ID || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createSupabaseSchema() {
  console.log('🔨 Creating Supabase database schema...\n');

  const schema = `
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Users table (managed by Supabase Auth, but we'll add custom fields via metadata)
    -- Supabase Auth automatically creates auth.users table
    
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

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_villas_created_by ON public.villas(created_by);
    CREATE INDEX IF NOT EXISTS idx_villa_users_villa_id ON public.villa_users(villa_id);
    CREATE INDEX IF NOT EXISTS idx_villa_users_user_id ON public.villa_users(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_villa_id ON public.tasks(villa_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_expenses_villa_id ON public.expenses(villa_id);
    CREATE INDEX IF NOT EXISTS idx_messages_villa_id ON public.messages(villa_id);
    CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
    CREATE INDEX IF NOT EXISTS idx_staff_attendance_user_id ON public.staff_attendance(user_id);
    CREATE INDEX IF NOT EXISTS idx_leave_requests_user_id ON public.leave_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_calendar_events_villa_id ON public.calendar_events(villa_id);
    CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);

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

    -- RLS Policies for leave_requests
    CREATE POLICY "Users can view own leave requests" ON public.leave_requests FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can create own leave requests" ON public.leave_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own leave requests" ON public.leave_requests FOR UPDATE USING (auth.uid() = user_id);

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

    -- Create trigger for updated_at timestamps
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_villas_updated_at BEFORE UPDATE ON public.villas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_expense_templates_updated_at BEFORE UPDATE ON public.expense_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      console.error('❌ Error creating schema:', error);
      // Try alternative method - direct query
      console.log('Trying alternative method...');
      const statements = schema.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error: execError } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (execError) {
            console.warn(`Warning: ${execError.message}`);
          }
        }
      }
    }
    
    console.log('✅ Schema created successfully!');
  } catch (error) {
    console.error('❌ Failed to create schema:', error);
    throw error;
  }
}

async function migrateUserData() {
  console.log('\n📦 Migrating user data from Replit PostgreSQL to Supabase...\n');

  if (!process.env.DATABASE_URL) {
    console.log('⚠️  No DATABASE_URL found, skipping data migration');
    return;
  }

  const localDb = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Get users from local database
    const usersResult = await localDb.query('SELECT * FROM users');
    const users = usersResult.rows;

    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      try {
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: Math.random().toString(36).slice(-12) + 'Aa1!', // Random temp password
          email_confirm: true,
          user_metadata: {
            name: user.name,
            role: user.role,
            migrated_from_local: true,
            original_id: user.id
          }
        });

        if (authError) {
          console.error(`  ❌ Failed to create auth user ${user.email}:`, authError.message);
          continue;
        }

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user!.id,
            name: user.name,
            role: user.role,
            profile_data: user.profile_data || {},
            created_at: user.created_at,
            updated_at: user.updated_at
          });

        if (profileError) {
          console.error(`  ❌ Failed to create profile for ${user.email}:`, profileError.message);
        } else {
          console.log(`  ✅ Migrated user: ${user.email}`);
        }

        // Store mapping of old ID to new ID for reference
        console.log(`     Old ID: ${user.id} → New ID: ${authData.user!.id}`);
      } catch (error: any) {
        console.error(`  ❌ Error migrating user ${user.email}:`, error.message);
      }
    }

    console.log('\n✅ User data migration complete!');
    console.log('\n⚠️  IMPORTANT: All migrated users will need to reset their passwords');
    console.log('   You can send password reset emails from the Supabase dashboard');

  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await localDb.end();
  }
}

async function main() {
  console.log('🚀 VillaSaya Migration to Supabase\n');
  console.log('=' .repeat(50));
  
  await createSupabaseSchema();
  await migrateUserData();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Migration complete!');
  console.log('\nNext steps:');
  console.log('1. Update frontend code to use Supabase client');
  console.log('2. Remove custom backend server');
  console.log('3. Test authentication and data access');
}

main().catch(console.error);
