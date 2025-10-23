import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { setSupabaseEnvOverride } from '../utils/supabase/info';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

setSupabaseEnvOverride({
  VITE_SUPABASE_PROJECT_ID: process.env.VITE_SUPABASE_PROJECT_ID ?? 'test-project',
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ?? 'test-anon-key',
});
