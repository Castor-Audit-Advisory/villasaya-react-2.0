const SUPABASE_DOMAIN = 'supabase.co';

type SupabaseEnvKey = 'VITE_SUPABASE_PROJECT_ID' | 'VITE_SUPABASE_ANON_KEY';

type SupabaseEnvOverride = Partial<Record<SupabaseEnvKey, string>>;

declare global {
  // eslint-disable-next-line no-var
  var __SUPABASE_ENV_OVERRIDE__: SupabaseEnvOverride | undefined;
}

interface SupabaseConfig {
  projectId: string;
  publicAnonKey: string;
  supabaseUrl: string;
}

let cachedConfig: SupabaseConfig | null = null;

const readOverride = (): SupabaseEnvOverride | undefined =>
  typeof globalThis !== 'undefined' ? globalThis.__SUPABASE_ENV_OVERRIDE__ : undefined;

const readEnvValue = (key: SupabaseEnvKey): string => {
  const override = readOverride();
  const rawValue = override?.[key] ?? (import.meta.env?.[key] as string | undefined);
  return typeof rawValue === 'string' ? rawValue.trim() : '';
};

const formatMissingEnvMessage = (missing: SupabaseEnvKey[]) =>
  `Missing required Supabase environment variable${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. ` +
  'Update your .env file or hosting configuration with the values documented in README.md.';

export const resetSupabaseConfigCache = () => {
  cachedConfig = null;
};

export const setSupabaseEnvOverride = (override?: SupabaseEnvOverride) => {
  if (typeof globalThis !== 'undefined') {
    globalThis.__SUPABASE_ENV_OVERRIDE__ = override;
  }
  resetSupabaseConfigCache();
};

export function getSupabaseConfig(): SupabaseConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const projectId = readEnvValue('VITE_SUPABASE_PROJECT_ID');
  const publicAnonKey = readEnvValue('VITE_SUPABASE_ANON_KEY');

  const missing: SupabaseEnvKey[] = [];
  if (!projectId) missing.push('VITE_SUPABASE_PROJECT_ID');
  if (!publicAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');

  if (missing.length > 0) {
    throw new Error(formatMissingEnvMessage(missing));
  }

  const supabaseUrl = `https://${projectId}.${SUPABASE_DOMAIN}`;

  cachedConfig = {
    projectId,
    publicAnonKey,
    supabaseUrl,
  };

  return cachedConfig;
}

export const getProjectId = () => getSupabaseConfig().projectId;
export const getPublicAnonKey = () => getSupabaseConfig().publicAnonKey;
export const getSupabaseUrl = () => getSupabaseConfig().supabaseUrl;
