import { useEffect } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthProvider';
import { backendEnabled } from '@/services/supabase/client';
import { Page, c, ui } from '@/components/ui/kit';
export function AuthGate({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { t } = useTranslation();
  const atAuth = segments[0] === '(auth)';
  useEffect(() => {
    if (!backendEnabled || auth.loading) return;
    if (!auth.session && !atAuth) router.replace('/sign-in');
    else if (auth.session && atAuth) router.replace('/');
  }, [auth.session, auth.loading, atAuth, router]);
  if (backendEnabled && (auth.loading || (!auth.session && !atAuth)))
    return (
      <Page>
        <ActivityIndicator color={c.text} />
        <Text style={ui.note}>{t('common.loading')}</Text>
      </Page>
    );
  return children;
}
