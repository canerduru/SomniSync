import { backendEnabled, client, dreamAction } from '@/services/supabase/client';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useDreams } from '@/features/dreams/DreamProvider';
import { Button, c, Confirm, Label, Page, Rule, ui } from '@/components/ui/kit';
import { locales } from '@/i18n';
export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const store = useDreams();
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [accountConfirm, setAccountConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [cleared, setCleared] = useState(false);
  return (
    <Page back>
      <Label>{t('settings.eyebrow')}</Label>
      <Text accessibilityRole="header" style={ui.title}>
        {t('settings.title')}
      </Text>
      <Rule />
      <Label>{t('settings.language')}</Label>
      <View style={ui.row}>
        {locales.map((locale) => (
          <Pressable
            key={locale}
            accessibilityRole="button"
            accessibilityState={{ selected: i18n.language === locale }}
            onPress={() => {
              void store.setLanguage(locale).catch(() => setError(true));
            }}
            style={{
              borderWidth: 1,
              borderColor: i18n.language === locale ? c.text : c.border,
              padding: 16,
              flex: 1,
            }}
          >
            <Text style={{ color: c.text }}>
              {locale === 'tr' ? 'Türkçe' : 'English'} {i18n.language === locale ? '✓' : ''}
            </Text>
          </Pressable>
        ))}
      </View>
      <Rule />
      <Label>{t('settings.privacy')}</Label>
      <Text style={ui.subtitle}>{t('settings.privacyBody')}</Text>
      <Button secondary title={t('settings.manage')} onPress={() => router.push('/synastry')} />
      <Rule />
      {error && (
        <Text accessibilityRole="alert" style={ui.note}>
          {t('common.error')}
        </Text>
      )}
      <Label>{t(backendEnabled ? 'backend.session' : 'settings.session')}</Label>
      <Text style={ui.subtitle}>
        {t(backendEnabled ? 'backend.sessionBody' : 'settings.sessionBody')}
      </Text>
      <Button
        secondary
        title={t(backendEnabled ? 'backend.clear' : 'settings.clear')}
        disabled={busy}
        onPress={() => setConfirm(true)}
      />
      {cleared && (
        <Text accessibilityRole="alert" style={ui.note}>
          {t(backendEnabled ? 'backend.cleared' : 'settings.cleared')}
        </Text>
      )}
      <Rule />
      <Label>SOMNISYNC / MVP · PHASE 03</Label>
      {backendEnabled && (
        <>
          <Button
            secondary
            disabled={busy}
            title={t('auth.signOut')}
            onPress={() => {
              void client()
                .auth.signOut()
                .then(({ error }) => {
                  if (error) setError(true);
                });
            }}
          />
          <Button
            secondary
            disabled={busy}
            title={t('auth.deleteAccount')}
            onPress={() => setAccountConfirm(true)}
          />
        </>
      )}
      <Confirm
        visible={accountConfirm}
        title={t('auth.deleteTitle')}
        body={t('auth.deleteBody')}
        onCancel={() => {
          if (!busy) setAccountConfirm(false);
        }}
        onConfirm={() => {
          if (busy) return;
          setBusy(true);
          setError(false);
          void dreamAction({ action: 'delete_account' })
            .then(async () => {
              await client().auth.signOut({ scope: 'local' });
            })
            .catch(() => setError(true))
            .finally(() => {
              setBusy(false);
              setAccountConfirm(false);
            });
        }}
      />
      <Confirm
        visible={confirm}
        title={t(backendEnabled ? 'backend.clearTitle' : 'settings.clearTitle')}
        body={t(backendEnabled ? 'backend.clearBody' : 'settings.clearBody')}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          if (busy) return;
          setBusy(true);
          setError(false);
          void store
            .clear()
            .then(() => setCleared(true))
            .catch(() => setError(true))
            .finally(() => {
              setConfirm(false);
              setBusy(false);
            });
        }}
      />
    </Page>
  );
}
