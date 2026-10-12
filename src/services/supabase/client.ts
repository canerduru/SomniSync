import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient, processLock } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const backendEnabled = process.env.EXPO_PUBLIC_DATA_MODE !== 'demo' && !!url && !!key;
if (process.env.EXPO_PUBLIC_DATA_MODE === 'supabase' && !backendEnabled)
  throw new Error('SUPABASE_CONFIG_REQUIRED');
// Chunk native sessions because SecureStore values have platform-specific size limits.
const storage = {
  async getItem(name: string) {
    if (Platform.OS === 'web')
      return typeof window === 'undefined' ? null : window.sessionStorage.getItem(name);
    const count = Number(await SecureStore.getItemAsync(name));
    if (!count || count > 100) return null;
    const parts = await Promise.all(
      Array.from({ length: count }, (_, i) => SecureStore.getItemAsync(`${name}.${i}`)),
    );
    return parts.some((p) => p === null) ? null : parts.join('');
  },
  async setItem(name: string, value: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.sessionStorage.setItem(name, value);
      return;
    }
    await storage.removeItem(name);
    const count = Math.ceil(value.length / 1800);
    for (let i = 0; i < count; i++)
      await SecureStore.setItemAsync(`${name}.${i}`, value.slice(i * 1800, (i + 1) * 1800));
    await SecureStore.setItemAsync(name, String(count));
  },
  async removeItem(name: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(name);
      return;
    }
    const count = Math.min(Number(await SecureStore.getItemAsync(name)) || 0, 100);
    await SecureStore.deleteItemAsync(name);
    await Promise.all(
      Array.from({ length: count }, (_, i) => SecureStore.deleteItemAsync(`${name}.${i}`)),
    );
  },
};
export const supabase = backendEnabled
  ? createClient<Database>(url!, key!, {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
      },
    })
  : null;
if (Platform.OS !== 'web' && supabase)
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
export function client() {
  if (!supabase) throw new Error('BACKEND_NOT_CONFIGURED');
  return supabase;
}
export async function dreamAction(
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<{
  id?: string;
  ok?: boolean;
  pending?: boolean;
  stage?: number;
  aiMode?: 'mock' | 'live' | 'unavailable';
}> {
  const db = client();
  const {
    data: { session },
  } = await db.auth.getSession();
  if (!session) throw new Error('UNAUTHENTICATED');
  const abort = new AbortController();
  const cancel = () => abort.abort();
  if (signal?.aborted) cancel();
  signal?.addEventListener('abort', cancel, { once: true });
  const timeout = setTimeout(cancel, 120000);
  try {
    const response = await fetch(`${url}/functions/v1/dreams-api`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key!,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
      signal: abort.signal,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'BACKEND_UNAVAILABLE');
    return result;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}

export async function completeDream(
  body: Record<string, unknown>,
  signal?: AbortSignal,
  onStage?: (stage: number) => void,
) {
  let result = await dreamAction(body, signal);
  for (let i = 0; result.pending && i < 90; i++) {
    onStage?.(result.stage ?? 2);
    await new Promise<void>((resolve, reject) => {
      const cancel = () => {
        clearTimeout(timer);
        reject(new Error('ABORTED'));
      };
      const timer = setTimeout(() => {
        signal?.removeEventListener('abort', cancel);
        resolve();
      }, 2000);
      if (signal?.aborted) cancel();
      else signal?.addEventListener('abort', cancel, { once: true });
    });
    result = await dreamAction({ action: 'resume', id: result.id }, signal);
  }
  if (result.pending) throw new Error('PROCESSING_PENDING');
  return result;
}
