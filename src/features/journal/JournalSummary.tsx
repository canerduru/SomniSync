import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Label, ui } from '@/components/ui/kit';
import type { DreamEntry } from '@/types/dream';
import { summarizeJournal } from '../../../supabase/functions/_shared/journal';
export function JournalSummary({ dreams }: { dreams: readonly DreamEntry[] }) {
  const { t } = useTranslation();
  const groups = useMemo(
    () =>
      ['live', 'mock']
        .map((mode) => ({
          mode,
          stats: summarizeJournal(dreams.filter((d) => d.analysis_source === mode)),
        }))
        .filter((g) => g.stats.total > 0),
    [dreams],
  );
  return (
    <View style={{ gap: 14 }}>
      <Label>{t('journal.summary')}</Label>
      <Text style={ui.note}>{t('journal.summaryScope')}</Text>
      {groups.map(({ mode, stats }) => (
        <View key={mode} style={{ gap: 8 }}>
          <Label>{t(mode === 'live' ? 'grounding.llm' : 'grounding.demo')}</Label>
          <Text style={ui.body}>
            {t('journal.counts', {
              total: stats.total,
              grounded: stats.grounded,
              answered: stats.answered,
            })}
          </Text>
          <Text style={ui.note}>
            {t('journal.paired', {
              paired: stats.pairedRecords,
              count: stats.pursuitWithStressAnswer,
            })}
          </Text>
          <Text style={ui.note}>
            {t('journal.missing', {
              missing: stats.stressMissing,
              conflicting: stats.conflicting,
              duplicates: stats.possibleDuplicates,
            })}
          </Text>
        </View>
      ))}
    </View>
  );
}
