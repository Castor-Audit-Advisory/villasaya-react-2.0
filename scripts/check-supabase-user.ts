import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = `https://${process.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkUser() {
  console.log('🔍 Checking Supabase user status...\n');

  // Get auth user
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }

  const user = users.find(u => u.email === 'haydon@castoraustralia.com.au');
  
  if (!user) {
    console.log('❌ User not found in Supabase Auth');
    return;
  }

  console.log('✅ Auth User found:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
  console.log(`   Metadata:`, user.user_metadata);

  // Check profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    if (profileError.code === 'PGRST116') {
      console.log('\n❌ Profile NOT found - needs to be created');
    } else {
      console.error('\n❌ Error checking profile:', profileError);
    }
  } else {
    console.log('\n✅ Profile found:');
    console.log(`   Name: ${profile.name}`);
    console.log(`   Role: ${profile.role}`);
  }

  // Check user settings
  const { data: settings, error: settingsError } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (settingsError) {
    if (settingsError.code === 'PGRST116') {
      console.log('\n❌ User settings NOT found - needs to be created');
    } else {
      console.error('\n❌ Error checking settings:', settingsError);
    }
  } else {
    console.log('\n✅ User settings found');
  }
}

checkUser().catch(console.error);
