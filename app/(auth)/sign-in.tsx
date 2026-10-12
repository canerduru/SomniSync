import { useState } from 'react';
import { Text, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Label, Page, TextButton, ui, c } from '@/components/ui/kit';
import { client } from '@/services/supabase/client';
export default function SignInScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      if (!email.trim() || password.length < 8) throw new Error('INVALID_INPUT');
      const result = signup
        ? await client().auth.signUp({ email: email.trim(), password })
        : await client().auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      setPassword('');
      if (signup && !result.data.session) setMessage(t('auth.confirm'));
    } catch {
      setMessage(t('auth.error'));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Page>
      <Label>SOMNISYNC / 01</Label>
      <Text style={ui.title}>{t('foundation.signIn')}</Text>
      <Text style={ui.subtitle}>{t('auth.privacy')}</Text>
      <TextInput
        style={ui.input}
        accessibilityLabel={t('auth.email')}
        placeholder={t('auth.email')}
        placeholderTextColor={c.muted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <TextInput
        style={ui.input}
        accessibilityLabel={t('auth.password')}
        placeholder={t('auth.password')}
        placeholderTextColor={c.muted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete={signup ? 'new-password' : 'current-password'}
        onSubmitEditing={() => void submit()}
      />
      <Button
        title={busy ? t('common.loading') : t(signup ? 'auth.signUp' : 'auth.signIn')}
        disabled={busy}
        onPress={() => void submit()}
      />
      <TextButton
        title={t(signup ? 'auth.switchSignIn' : 'auth.switchSignUp')}
        onPress={() => {
          setSignup(!signup);
          setMessage('');
        }}
      />
      {!!message && (
        <Text accessibilityRole="alert" style={ui.note}>
          {message}
        </Text>
      )}
      <Text style={ui.note}>{t('common.private')}</Text>
    </Page>
  );
}
