import { useVoiceCapture, discardAudio } from '@/features/capture/useVoiceCapture';
import { backendEnabled } from '@/services/supabase/client';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Link } from 'expo-router';
import { Button, c, Empty, Label, Page, Rule, TextButton, ui } from '@/components/ui/kit';
import { DreamVisual, Orbit } from '@/components/ui/DreamArt';
import { useDreams } from '@/features/dreams/DreamProvider';
import { CaptureSheet } from '@/features/capture/CaptureSheet';
import { motion } from '@/theme/motion';
export default function RecordScreen() {
  const { t } = useTranslation();
  const store = useDreams();
  const wide = useWindowDimensions().width > 780;
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [initialText, setInitialText] = useState('');
  const [mode, setMode] = useState<'text' | 'audio'>('text');
  const [audioUri, setAudioUri] = useState<string>();
  const audioRef = useRef<string | undefined>(undefined);
  const voice = useVoiceCapture(
    (uri) => {
      discardAudio(audioRef.current);
      audioRef.current = uri;
      setAudioUri(uri);
      setInitialText('');
      setMode('audio');
      setSheet(true);
    },
    () => setError(true),
  );
  useEffect(() => () => discardAudio(audioRef.current), []);
  const isRecording = backendEnabled ? voice.recording : recording;
  const held = useRef(false);
  const abort = useRef<AbortController | null>(null);
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  useEffect(() => {
    if (!isRecording) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isRecording]);
  useEffect(() => () => abort.current?.abort(), []);
  const sample = async () => {
    if (transcribing) return;
    abort.current = new AbortController();
    setTranscribing(true);
    setError(false);
    try {
      const result = await store.transcribe(abort.current.signal);
      setInitialText(result.transcript);
      setMode(backendEnabled ? 'text' : 'audio');
      setSheet(true);
    } catch {
      if (!abort.current.signal.aborted) setError(true);
    } finally {
      setTranscribing(false);
    }
  };
  const start = () => {
    if (transcribing) return;
    if (backendEnabled) {
      setError(false);
      setSeconds(0);
      void voice.begin();
      return;
    }
    held.current = true;
    setRecording(true);
    setSeconds(0);
    scale.value = withTiming(0.94, {
      duration: motion.duration,
      reduceMotion: motion.reduceMotion,
    });
  };
  const stop = () => {
    if (backendEnabled) {
      void voice.end();
      return;
    }
    if (!held.current) return;
    held.current = false;
    setRecording(false);
    scale.value = withTiming(1, { duration: motion.duration, reduceMotion: motion.reduceMotion });
    void sample();
  };
  const latest = store.dreams[0];
  return (
    <Page>
      <View style={{ paddingTop: wide ? 48 : 32, gap: 24 }}>
        <Label>{t('home.eyebrow')}</Label>
        <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 80 : 32 }}>
          <View style={{ flex: 1, gap: 24 }}>
            <Text
              accessibilityRole="header"
              style={{ ...ui.title, fontSize: wide ? 70 : 50, lineHeight: wide ? 76 : 56 }}
            >
              {t('home.title')}
            </Text>
            <Text style={ui.subtitle}>{t('home.subtitle')}</Text>
            <View style={{ ...ui.card, marginTop: 8, padding: 24 }}>
              <View style={ui.spread}>
                <Label>{t('home.capture')}</Label>
                <Text style={ui.eyebrow}>◌</Text>
              </View>
              <Animated.View style={[{ alignSelf: 'center', marginVertical: 6 }, animated]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('home.hold')}
                  accessibilityHint={t(backendEnabled ? 'backend.recordHint' : 'home.recordHint')}
                  disabled={transcribing}
                  onPressIn={start}
                  onPressOut={stop}
                  onAccessibilityTap={() => {
                    if (backendEnabled) {
                      if (voice.recording) void voice.end();
                      else void voice.begin();
                    } else void sample();
                  }}
                  style={({ pressed }) => ({
                    width: 144,
                    height: 144,
                    borderRadius: 72,
                    borderWidth: 1,
                    borderColor: c.text,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: pressed ? c.text : c.background,
                  })}
                >
                  {transcribing ? (
                    <ActivityIndicator color={c.text} />
                  ) : (
                    <View style={{ alignItems: 'center', gap: 5 }}>
                      {Array.from({ length: 7 }, (_, i) => (
                        <View
                          key={i}
                          style={{
                            position: 'absolute',
                            left: (i - 3) * 9 - 2,
                            top: -[10, 20, 28, 35, 28, 20, 10][i]! / 2,
                            width: 2,
                            height: [10, 20, 28, 35, 28, 20, 10][i],
                            backgroundColor: isRecording ? c.background : c.text,
                          }}
                        />
                      ))}
                    </View>
                  )}
                </Pressable>
              </Animated.View>
              <Text style={{ color: c.text, fontSize: 16, textAlign: 'center' }}>
                {isRecording
                  ? `${t('home.recording')} ${t('home.time', { seconds })}`
                  : t('home.hold')}
              </Text>
              <Text style={{ ...ui.note, textAlign: 'center' }}>
                {isRecording
                  ? t(
                      store.aiMode === 'live'
                        ? 'ai.recordRelease'
                        : backendEnabled
                          ? 'backend.release'
                          : 'home.release',
                    )
                  : t(backendEnabled ? 'backend.recordHint' : 'home.recordHint')}
              </Text>
              <Rule />
              <TextButton
                title={`${t('home.text')} ↗`}
                onPress={() => {
                  discardAudio(audioRef.current);
                  audioRef.current = undefined;
                  setAudioUri(undefined);
                  setInitialText('');
                  setMode('text');
                  setSheet(true);
                }}
              />
              <TextButton
                title={t('home.demoTranscript')}
                onPress={() => {
                  void sample();
                }}
              />
              {error && (
                <Text accessibilityRole="alert" style={ui.note}>
                  {t(backendEnabled ? 'backend.recordError' : 'common.error')}
                </Text>
              )}
            </View>
          </View>
          <View style={{ flex: wide ? 0.85 : undefined, gap: 16 }}>
            <View style={{ alignItems: 'center', paddingVertical: wide ? 4 : 0 }}>
              <Orbit size={wide ? 200 : 125} />
            </View>
            <View style={ui.spread}>
              <Label>{t('home.latest')}</Label>
              <Link href="/grimoire" style={{ color: c.text, fontSize: 11 }}>
                {t('home.all')} ↗
              </Link>
            </View>
            {store.loading ? (
              <ActivityIndicator color={c.text} />
            ) : store.error ? (
              <Button
                secondary
                title={t('common.retry')}
                onPress={() => {
                  void store.refresh();
                }}
              />
            ) : latest ? (
              <Link href={{ pathname: '/dreams/[id]', params: { id: latest.id } }} asChild>
                <Pressable
                  accessibilityLabel={t('archive.open', { title: latest.title })}
                  style={{ borderWidth: 1, borderColor: c.border }}
                >
                  <DreamVisual uri={latest.imageUri} height={wide ? 240 : 260} />
                  <View style={{ padding: 20, gap: 10 }}>
                    <Label>
                      {latest.dream_date} /{' '}
                      {t(
                        latest.analysis_source === 'live'
                          ? 'ai.sample'
                          : backendEnabled
                            ? 'backend.sample'
                            : 'archive.sample',
                      )}
                    </Label>
                    <Text style={{ ...ui.title, fontSize: 28, lineHeight: 33 }}>
                      {latest.title}
                    </Text>
                  </View>
                </Pressable>
              </Link>
            ) : (
              <Empty title={t('home.noDream')} body={t('home.noDreamBody')} />
            )}
          </View>
        </View>
        <Rule />
        <View style={ui.spread}>
          <Text style={{ ...ui.note, flex: 1 }}>{t('home.footer')}</Text>
          <Text style={ui.eyebrow}>S / S</Text>
        </View>
      </View>
      <CaptureSheet
        visible={sheet}
        initialText={initialText}
        mode={mode}
        audioUri={audioUri}
        onClose={() => {
          discardAudio(audioRef.current);
          audioRef.current = undefined;
          setAudioUri(undefined);
          setSheet(false);
        }}
      />
    </Page>
  );
}
