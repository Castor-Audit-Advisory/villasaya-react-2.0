import { getSupabaseUrl } from './supabase/info';

/**
 * Database Seeding Utility
 *
 * Run this to create test users for each role in VillaSaya
 *
 * Usage:
 * 1. Open browser console on the app
 * 2. Copy and paste this code
 * 3. Run: seedDatabase()
 */

export async function seedDatabase() {
  try {
    const response = await fetch(
      `${getSupabaseUrl()}/functions/v1/make-server-41a1615d/seed-test-users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log('✅ Database seeded successfully!');
      console.log('\n📧 Test User Credentials:');
      console.log('='.repeat(50));
      
      data.users.forEach((user: any) => {
        console.log(`\n${user.role}:`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Password: ${user.password}`);
      });
      
      console.log('\n' + '='.repeat(50));
      console.log('\n🏠 Test Villas Created:');
      data.villas.forEach((villa: any) => {
        console.log(`  - ${villa.name} (${villa.location})`);
      });
      
      return data;
    } else {
      console.error('❌ Error seeding database:', data.error);
      return data;
    }
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    throw error;
  }
}

// Alternative: Direct API call for quick seeding
export const SEED_ENDPOINT = '/seed-test-users';
