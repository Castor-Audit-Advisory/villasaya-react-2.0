import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getPublicAnonKey } from './supabase/info';

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseClient) {
    const supabaseUrl = getSupabaseUrl();
    const supabaseKey = getPublicAnonKey();
    supabaseClient = createSupabaseClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

export const supabase = createClient();
