/**
 * Supabase Client Configuration & Types
 * Configured with environment variables or safe mock fallbacks for client preview.
 */

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export const getSupabaseConfig = (): SupabaseConfig => {
  return {
    supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string) || 'https://mock.supabase.co',
    supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'mock-anon-key',
  };
};

export const isSupabaseConfigured = (): boolean => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && url !== 'https://mock.supabase.co');
};
