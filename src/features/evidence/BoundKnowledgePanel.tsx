import { Linking, Text, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Label, TextButton, ui } from '@/components/ui/kit';
import type { DreamEntry } from '@/types/dream';
import { currentReport } from '../../../supabase/functions/_shared/grounding';
import { selectKnowledge } from '../../../supabase/functions/_shared/knowledge';
export function BoundKnowledgePanel({ dream }: { dream: DreamEntry }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'en' ? 'en' : 'tr';
  const [error, setError] = useState(false);
  const report = currentReport(
    dream.content_report,
    dream.transcript ?? '',
    dream.transcript_revision,
  );
  const sources = selectKnowledge(report);
  return (
    <View style={{ gap: 20 }}>
      <Text style={ui.note}>{t('grounding.educationScope')}</Text>
      {!sources.length ? (
        <Text style={ui.body}>{t('grounding.noSource')}</Text>
      ) : (
        sources.map((source) => (
          <View key={source.id} style={{ gap: 10 }}>
            <Label>{t(`science.evidence.${source.evidence}`)}</Label>
            <Text style={ui.body}>{source.summary[locale]}</Text>
            <Text style={ui.note}>{source.limit[locale]}</Text>
            <Text style={ui.note}>
              {source.title} · PMID {source.pmid} · DOI {source.doi}
            </Text>
            <TextButton
              title={t('science.openSource')}
              onPress={() => {
                void Linking.openURL(source.url).catch(() => setError(true));
              }}
            />
          </View>
        ))
      )}
      {error ? (
        <Text accessibilityRole="alert" style={ui.note}>
          {t('science.linkError')}
        </Text>
      ) : null}
    </View>
  );
}
