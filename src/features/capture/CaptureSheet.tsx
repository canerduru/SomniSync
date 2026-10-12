import { backendEnabled } from '@/services/supabase/client';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { useDreams } from '@/features/dreams/DreamProvider';
import { Button, c, Label, Permission, TextButton, ui } from '@/components/ui/kit';
export function CaptureSheet({
  visible,
  initialText,
  mode,
  audioUri,
  onClose,
}: {
  visible: boolean;
  initialText: string;
  mode: 'text' | 'audio';
  audioUri?: string;
  onClose: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const { t } = useTranslation();
  const store = useDreams();
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');
  const draftId = useRef(Crypto.randomUUID());
  const abort = useRef<AbortController | null>(null);
  useEffect(() => {
    if (visible) {
      draftId.current = Crypto.randomUUID();
      setText(initialText);
      setError('');
      setConsent(false);
    }
  }, [visible, initialText]);
  useEffect(() => () => abort.current?.abort(), []);
  const close = () => {
    if (busy) return;
    abort.current?.abort();
    setBusy(false);
    onClose();
  };
  const submit = async () => {
    if (!text.trim() && !(mode === 'audio' && audioUri && store.aiMode === 'live')) {
      setError(t('capture.empty'));
      return;
    }
    if (text.length > 20000) {
      setError(t('capture.limit'));
      return;
    }
    if (store.aiMode === 'loading' || store.aiMode === 'unavailable') {
      setError(t('ai.errors.AI_NOT_CONFIGURED'));
      return;
    }
    if (store.aiMode === 'live' && !consent) {
      setError(t('ai.consentRequired'));
      return;
    }
    abort.current = new AbortController();
    const signal = abort.current.signal;
    setBusy(true);
    setError('');
    try {
      const dream = await store.create(
        text,
        mode,
        setStage,
        signal,
        audioUri,
        draftId.current,
        consent,
      );
      if (signal.aborted) return;
      setBusy(false);
      onClose();
      router.push({ pathname: '/dreams/[id]', params: { id: dream.id } });
    } catch (cause) {
      if (!signal.aborted) {
        const key = `ai.errors.${cause instanceof Error ? cause.message : ''}`;
        setError(t(key as 'ai.errors.RATE_LIMITED', { defaultValue: t('common.error') }));
        void store.refresh();
        setBusy(false);
      }
    }
  };
  return (
    <Modal
      visible={visible}
      animationType={reducedMotion ? 'none' : 'slide'}
      onRequestClose={close}
    >
      <SafeAreaView style={ui.screen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ ...ui.content, maxWidth: 720, paddingTop: 12 }}
          >
            <View style={ui.spread}>
              <Label>{t(backendEnabled ? 'backend.badge' : 'common.demo')}</Label>
              <TextButton title={`${t('common.close')} ×`} onPress={close} />
            </View>
            {busy ? (
              <View style={{ paddingTop: 64, gap: 32 }}>
                <ActivityIndicator color={c.text} size="large" />
                <Text style={ui.title}>{t('capture.processing')}</Text>
                {[0, 1, 2, 3].map((s) => (
                  <View key={s} style={ui.row}>
                    <Text style={{ color: s <= stage ? c.text : c.faint, fontSize: 12 }}>
                      {s < stage ? '✓' : s === stage ? '◉' : '○'}
                    </Text>
                    <Text style={{ ...ui.subtitle, color: s <= stage ? c.text : c.faint }}>
                      {t(`capture.step${s}` as 'capture.step0')}
                    </Text>
                  </View>
                ))}
                <Text style={ui.note}>
                  {t(
                    store.aiMode === 'live'
                      ? 'ai.processing'
                      : backendEnabled
                        ? 'backend.processing'
                        : 'capture.processingNote',
                  )}
                </Text>
              </View>
            ) : (
              <>
                <Label>{t('home.capture')}</Label>
                <Text accessibilityRole="header" style={ui.title}>
                  {t('capture.title')}
                </Text>
                <Text style={ui.subtitle}>
                  {t(mode === 'audio' && store.aiMode === 'live' ? 'ai.voice' : 'capture.subtitle')}
                </Text>
                <TextInput
                  multiline
                  autoFocus={Platform.OS !== 'web'}
                  accessibilityLabel={t('capture.placeholder')}
                  placeholder={t('capture.placeholder')}
                  placeholderTextColor={c.faint}
                  value={text}
                  onChangeText={setText}
                  maxLength={20000}
                  style={{
                    ...ui.input,
                    minHeight: 220,
                    textAlignVertical: 'top',
                    fontSize: 18,
                    lineHeight: 30,
                  }}
                />
                <Text style={ui.note}>{t('capture.characters', { count: text.length })}</Text>
                {!!error && (
                  <Text accessibilityRole="alert" style={ui.body}>
                    {error} {t('capture.draftKept')}
                  </Text>
                )}
                {store.aiMode === 'live' && (
                  <Permission
                    title={t('ai.consent')}
                    description={t('ai.consentBody')}
                    value={consent}
                    onChange={setConsent}
                  />
                )}
                <Button
                  title={t('capture.analyze')}
                  onPress={() => {
                    void submit();
                  }}
                />
                <Text style={ui.note}>{t('capture.privacy')}</Text>
                <Text
                  style={{ ...ui.note, borderTopWidth: 1, borderColor: c.border, paddingTop: 16 }}
                >
                  {t(
                    store.aiMode === 'live'
                      ? 'ai.note'
                      : backendEnabled
                        ? mode === 'audio'
                          ? 'backend.mockWarning'
                          : 'backend.note'
                        : 'capture.mockWarning',
                  )}
                </Text>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
