import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Label, TextButton, ui } from '@/components/ui/kit';
import { useDreams } from '@/features/dreams/DreamProvider';
import type { DreamEntry } from '@/types/dream';
import { emotions, parseJournal, type Emotion } from '../../../supabase/functions/_shared/journal';

export function JournalPanel({ dream }: { dream: DreamEntry }) {
  const { t } = useTranslation();
  const store = useDreams();
  const [expanded, setExpanded] = useState(false);
  const [hours, setHours] = useState(dream.journal?.sleepHours?.toString() ?? '');
  const [quality, setQuality] = useState<number | null>(dream.journal?.sleepQuality ?? null);
  const [stress, setStress] = useState<number | null>(dream.journal?.stressBeforeSleep ?? null);
  const [emotion, setEmotion] = useState<Emotion | null>(dream.journal?.dreamEmotion ?? null);
  const [mood, setMood] = useState<Emotion | null>(dream.journal?.wakingMood ?? null);
  const [recurring, setRecurring] = useState<boolean | null>(dream.journal?.recurring ?? null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const save = async (clear = false) => {
    setBusy(true);
    setMessage('');
    try {
      const journal = clear
        ? null
        : parseJournal({
            sleepHours: hours.trim() ? Number(hours.replace(',', '.')) : null,
            sleepQuality: quality,
            stressBeforeSleep: stress,
            dreamEmotion: emotion,
            wakingMood: mood,
            recurring,
            sleepDate: dream.dream_date,
            timezone: dream.capture_timezone,
            capturedAt: new Date().toISOString(),
          });
      await store.saveJournal(dream.id, journal);
      if (clear) {
        setHours('');
        setQuality(null);
        setStress(null);
        setEmotion(null);
        setMood(null);
        setRecurring(null);
      }
      setMessage(t('journal.saved'));
    } catch (e) {
      setMessage(
        t(
          e instanceof Error && e.message === 'INVALID_JOURNAL'
            ? 'journal.invalid'
            : 'common.error',
        ),
      );
    } finally {
      setBusy(false);
    }
  };
  const choices = <T extends string | number | boolean>(
    label: string,
    values: readonly T[],
    value: T | null,
    change: (v: T | null) => void,
    name: (v: T) => string,
  ) => (
    <View style={{ gap: 8 }}>
      <Text style={ui.body}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {values.map((v) => (
          <Button
            key={String(v)}
            secondary={v !== value}
            selected={v === value}
            disabled={busy}
            title={name(v)}
            onPress={() => change(v === value ? null : v)}
          />
        ))}
      </View>
    </View>
  );
  return (
    <View style={{ gap: 16 }}>
      <TextButton
        title={`${t('journal.title')} ${expanded ? '−' : '+'}`}
        onPress={() => setExpanded(!expanded)}
      />
      {expanded ? (
        <>
          <Text style={ui.note}>{t('journal.scope')}</Text>
          <Label>
            {dream.dream_date} · {dream.capture_timezone}
          </Label>
          <Text style={ui.body}>{t('journal.hours')}</Text>
          <TextInput
            value={hours}
            onChangeText={setHours}
            keyboardType="decimal-pad"
            editable={!busy}
            placeholder="—"
            accessibilityLabel={t('journal.hours')}
            style={ui.input}
            maxLength={5}
          />
          {choices(t('journal.quality'), [1, 2, 3, 4, 5], quality, setQuality, String)}
          <Text style={ui.note}>{t('journal.qualityScale')}</Text>
          {choices(t('journal.stress'), [0, 1, 2, 3, 4], stress, setStress, String)}
          <Text style={ui.note}>{t('journal.stressScale')}</Text>
          {choices(t('journal.emotion'), emotions, emotion, setEmotion, (v) =>
            t(`journal.emotions.${v}`),
          )}
          {choices(t('journal.mood'), emotions, mood, setMood, (v) => t(`journal.emotions.${v}`))}
          {choices(t('journal.recurring'), [true, false], recurring, setRecurring, (v) =>
            t(v ? 'journal.yes' : 'journal.no'),
          )}
          <Text style={ui.note}>{t('journal.blank')}</Text>
          <Button
            busy={busy}
            title={t('journal.save')}
            onPress={() => {
              void save();
            }}
          />
          {dream.journal ? (
            <Button
              secondary
              disabled={busy}
              title={t('journal.clear')}
              onPress={() => {
                void save(true);
              }}
            />
          ) : null}
          {message ? (
            <Text accessibilityRole="alert" style={ui.note}>
              {message}
            </Text>
          ) : null}
        </>
      ) : null}
    </View>
  );
}
