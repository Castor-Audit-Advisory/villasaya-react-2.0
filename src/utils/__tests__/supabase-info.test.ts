import { afterEach, describe, expect, it } from 'vitest';
import {
  getSupabaseConfig,
  resetSupabaseConfigCache,
  setSupabaseEnvOverride,
} from '../supabase/info';

const DEFAULT_OVERRIDE = {
  VITE_SUPABASE_PROJECT_ID: 'test-project',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
} as const;

describe('supabase env configuration', () => {
  afterEach(() => {
    resetSupabaseConfigCache();
    setSupabaseEnvOverride(DEFAULT_OVERRIDE);
  });

  it('returns configuration when environment variables are present', () => {
    setSupabaseEnvOverride({
      VITE_SUPABASE_PROJECT_ID: 'project-test',
      VITE_SUPABASE_ANON_KEY: 'anon-key',
    });

    const config = getSupabaseConfig();

    expect(config.projectId).toBe('project-test');
    expect(config.publicAnonKey).toBe('anon-key');
    expect(config.supabaseUrl).toBe('https://project-test.supabase.co');
  });

  it('throws a descriptive error when project id is missing', () => {
    setSupabaseEnvOverride({
      VITE_SUPABASE_PROJECT_ID: '',
      VITE_SUPABASE_ANON_KEY: 'anon-key',
    });

    expect(() => getSupabaseConfig()).toThrowError(/VITE_SUPABASE_PROJECT_ID/);
  });

  it('throws a descriptive error when anon key is missing', () => {
    setSupabaseEnvOverride({
      VITE_SUPABASE_PROJECT_ID: 'project-test',
      VITE_SUPABASE_ANON_KEY: '',
    });

    expect(() => getSupabaseConfig()).toThrowError(/VITE_SUPABASE_ANON_KEY/);
  });
});
