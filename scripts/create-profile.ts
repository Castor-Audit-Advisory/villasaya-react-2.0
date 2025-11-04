import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = `https://${process.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createProfile() {
  console.log('📝 Creating profile and settings...\n');

  const userId = 'd5b9a91e-29a3-4d7e-9b09-39ea15d79512';
  const name = 'Haydon Bawden';
  const role = 'Staff'; // Capitalized for schema constraint

  // Create profile
  console.log('Creating profile...');
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      name: name,
      role: role,
      profile_data: {}
    });

  if (profileError) {
    console.error('❌ Profile error:', profileError.message);
  } else {
    console.log('✅ Profile created successfully');
  }

  // Create user settings
  console.log('\nCreating user settings...');
  const { error: settingsError } = await supabase
    .from('user_settings')
    .insert({
      user_id: userId,
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
    console.error('❌ Settings error:', settingsError.message);
  } else {
    console.log('✅ User settings created successfully');
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ User account setup complete!');
  console.log('='.repeat(60));
  console.log('\nLogin credentials:');
  console.log('Email: haydon@castoraustralia.com.au');
  console.log('Password: TempPassword123!');
  console.log('\n⚠️  Change your password after first login!');
}

createProfile().catch(console.error);
