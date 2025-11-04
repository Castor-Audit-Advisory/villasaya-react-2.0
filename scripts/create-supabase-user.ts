import { createClient } from '@supabase/supabase-js';
import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

const SUPABASE_URL = `https://${process.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!process.env.VITE_SUPABASE_PROJECT_ID || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper to capitalize role for Supabase schema
function capitalizeRole(role: string): string {
  const roleMap: Record<string, string> = {
    'landlord': 'Landlord',
    'property agent': 'Property Agent',
    'tenant': 'Tenant',
    'staff': 'Staff'
  };
  return roleMap[role.toLowerCase()] || 'Staff';
}

async function createUser() {
  console.log('🔐 Creating Supabase user account...\n');

  if (!process.env.DATABASE_URL) {
    console.log('❌ No DATABASE_URL found');
    return;
  }

  const localDb = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    // Get your user from local database
    const result = await localDb.query(
      'SELECT * FROM users WHERE email = $1',
      ['haydon@castoraustralia.com.au']
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found in local database');
      return;
    }

    const localUser = result.rows[0];
    const normalizedRole = capitalizeRole(localUser.role);
    
    console.log(`Found user: ${localUser.email}`);
    console.log(`Name: ${localUser.name}`);
    console.log(`Role: ${localUser.role} → ${normalizedRole}`);

    // Create user in Supabase Auth
    console.log('\n📝 Creating user in Supabase Auth...');
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: localUser.email,
      password: 'TempPassword123!', // Temporary password - will need to reset
      email_confirm: true,
      user_metadata: {
        name: localUser.name,
        role: normalizedRole
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ User already exists in Supabase Auth');
        
        // Get existing user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error('❌ Error listing users:', listError.message);
          return;
        }
        
        const existingUser = users.find(u => u.email === localUser.email);
        if (!existingUser) {
          console.error('❌ Could not find existing user');
          return;
        }

        console.log(`User ID: ${existingUser.id}`);

        // Check if profile exists
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', existingUser.id)
          .single();

        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.error('❌ Error checking profile:', profileCheckError.message);
          return;
        }

        if (!existingProfile) {
          console.log('📝 Creating profile...');
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: existingUser.id,
              name: localUser.name,
              role: normalizedRole,
              profile_data: localUser.profile_data || {}
            });

          if (profileError) {
            console.error('❌ Error creating profile:', profileError.message);
            return;
          }
          console.log('✅ Profile created successfully');
        } else {
          console.log('✅ Profile already exists');
        }

        console.log('\n✅ User account is ready!');
        console.log('\n⚠️  IMPORTANT: Password is set to: TempPassword123!');
        console.log('   You can change it after logging in.');
        return;
      }

      console.error('❌ Error creating auth user:', authError.message);
      return;
    }

    console.log('✅ Auth user created successfully');
    console.log(`User ID: ${authData.user.id}`);

    // Create profile
    console.log('\n📝 Creating user profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name: localUser.name,
        role: normalizedRole,
        profile_data: localUser.profile_data || {},
        created_at: localUser.created_at,
        updated_at: localUser.updated_at
      });

    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message);
      return;
    }

    console.log('✅ Profile created successfully');

    // Create default user settings
    console.log('\n📝 Creating user settings...');
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: authData.user.id,
        general: {
          companyName: 'VillaSaya Properties',
          timezone: 'UTC+8',
          language: 'English',
          dateFormat: 'DD/MM/YYYY',
          currency: 'USD'
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: '30',
          passwordExpiry: '90'
        },
        notifications: {
          emailNotifications: true,
          taskReminders: true,
          expenseAlerts: true
        }
      });

    if (settingsError) {
      console.error('❌ Error creating settings:', settingsError.message);
      return;
    }

    console.log('✅ User settings created');

    console.log('\n' + '='.repeat(60));
    console.log('✅ User account successfully created in Supabase!');
    console.log('='.repeat(60));
    console.log('\nLogin credentials:');
    console.log(`Email: ${localUser.email}`);
    console.log('Password: TempPassword123!');
    console.log('\n⚠️  Please change your password after first login!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await localDb.end();
  }
}

createUser().catch(console.error);
