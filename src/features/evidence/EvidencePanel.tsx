import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, c, Label, Permission, TextButton, ui } from '@/components/ui/kit';
import { useDreams } from '@/features/dreams/DreamProvider';
import type { DreamEntry } from '@/types/dream';
import { acceptedTags, currentReport } from '../../../supabase/functions/_shared/grounding';

export function EvidencePanel({ dream }: { dream: DreamEntry }) {
  const { t } = useTranslation();
  const store = useDreams();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(dream.transcript ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const report = currentReport(
    dream.content_report,
    dream.transcript ?? '',
    dream.transcript_revision,
  );
  const tags = acceptedTags(report);
  const possibleDuplicate =
    !dream.event_confirmed &&
    store.dreams.some(
      (other) =>
        other.id !== dream.id &&
        other.status === 'ready' &&
        !other.deletion_requested_at &&
        other.dream_date === dream.dream_date &&
        other.transcript?.trim() === dream.transcript?.trim(),
    );
  const act = async (operation: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await operation();
      setEditing(false);
    } catch (e) {
      setError(
        e instanceof Error && e.message === 'REVISION_CONFLICT'
          ? t('grounding.conflict')
          : t('common.error'),
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: 16 }}>
      <Label>{t('grounding.title')}</Label>
      <Text style={ui.note}>{t('grounding.scope')}</Text>
      {possibleDuplicate ? (
        <View style={{ gap: 10 }}>
          <Text style={ui.note}>{t('grounding.duplicate')}</Text>
          <Button
            secondary
            busy={busy}
            title={t('grounding.confirmEvent')}
            onPress={() => {
              void act(() => store.confirmEvent(dream.id, dream.transcript_revision));
            }}
          />
        </View>
      ) : null}
      {report ? (
        <>
          <Text style={ui.note}>
            {t(report.extractor === 'llm' ? 'grounding.llm' : 'grounding.demo')} ·{' '}
            {t('grounding.revision', { revision: report.revision })}
          </Text>
          {!report.observations.length ? (
            <Text style={ui.body}>{t('grounding.empty')}</Text>
          ) : (
            report.observations.map((o, index) => (
              <View
                key={`${o.tag}:${o.start}`}
                style={{
                  borderWidth: 1,
                  borderColor: c.border,
                  padding: 16,
                  gap: 10,
                  opacity: o.rejected ? 0.6 : 1,
                }}
              >
                <Text style={ui.body}>
                  {t(`tags.${o.tag}` as 'tags.water', { defaultValue: o.tag })}
                </Text>
                <Text style={ui.body}>“{o.quote}”</Text>
                <Text style={ui.note}>
                  {t(
                    o.rejected
                      ? 'grounding.rejected'
                      : tags.includes(o.tag) &&
                          o.polarity === 'positive' &&
                          o.literal &&
                          o.context === 'dream' &&
                          o.experiencer === 'narrator'
                        ? 'grounding.counted'
                        : 'grounding.uncertain',
                  )}
                </Text>
                <Button
                  secondary
                  busy={busy}
                  title={t(o.rejected ? 'grounding.restore' : 'grounding.reject')}
                  onPress={() => {
                    void act(() =>
                      store.rejectObservation(
                        dream.id,
                        index,
                        !o.rejected,
                        dream.transcript_revision,
                      ),
                    );
                  }}
                />
              </View>
            ))
          )}
          <Text style={ui.note}>
            {report.model} · {report.promptVersion} · {t('grounding.catalog')}{' '}
            {report.catalogVersion}
          </Text>
        </>
      ) : (
        <Text style={ui.body}>{t('grounding.legacy')}</Text>
      )}
      <TextButton
        title={t(editing ? 'common.cancel' : 'grounding.edit')}
        onPress={() => {
          if (!busy) {
            setText(dream.transcript ?? '');
            setEditing(!editing);
          }
        }}
      />
      {editing ? (
        <>
          <Text style={ui.note}>{t('grounding.editHint')}</Text>
          <TextInput
            multiline
            editable={!busy}
            value={text}
            onChangeText={setText}
            maxLength={20000}
            accessibilityLabel={t('detail.transcript')}
            style={[ui.input, { minHeight: 180, textAlignVertical: 'top' }]}
          />
          <Button
            busy={busy}
            disabled={!text.trim() || text.trim() === dream.transcript}
            title={t('grounding.save')}
            onPress={() => {
              void act(() => store.revise(dream.id, text.trim(), dream.transcript_revision));
            }}
          />
        </>
      ) : null}
      {dream.status === 'draft' || !report ? (
        <>
          {store.aiMode === 'live' ? (
            <Permission
              title={t('ai.consent')}
              description={t('ai.consentBody')}
              value={consent}
              onChange={setConsent}
            />
          ) : null}
          <Button
            busy={busy}
            disabled={
              dream.status === 'processing' ||
              store.aiMode === 'loading' ||
              store.aiMode === 'unavailable' ||
              (store.aiMode === 'live' && !consent)
            }
            title={t('grounding.analyze')}
            onPress={() => {
              void act(() => store.analyze(dream.id, consent));
            }}
          />
        </>
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" style={ui.note}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
