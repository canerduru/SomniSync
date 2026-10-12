import { knowledgeCatalog } from '../../../supabase/functions/_shared/knowledge';
import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { c, Label, Rule, TextButton, ui } from '@/components/ui/kit';
import type { DreamEntry } from '@/types/dream';
import { citations, scienceTopics, type ScienceTopic } from './science';

export function SciencePanel({ dream }: { dream: DreamEntry }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [topic, setTopic] = useState<ScienceTopic>('memory');
  const [linkError, setLinkError] = useState(false);
  const activeTopics = scienceTopics.filter(
    (item) =>
      item === 'symbolic' ||
      knowledgeCatalog.some((source) => source.topic === item && source.active),
  );
  const currentTopic = activeTopics.includes(topic) ? topic : 'symbolic';
  const source = currentTopic === 'symbolic' ? null : citations[currentTopic];
  return (
    <View style={{ gap: 16 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded(!expanded)}
        style={{ minHeight: 48, justifyContent: 'center' }}
      >
        <Text style={ui.body}>
          {t('science.title')} {expanded ? '−' : '+'}
        </Text>
      </Pressable>
      {expanded ? (
        <>
          <Text style={ui.note}>{t('science.scope')}</Text>
          <View
            accessibilityRole="tablist"
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
          >
            {activeTopics.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="tab"
                accessibilityState={{ selected: currentTopic === item }}
                onPress={() => {
                  setTopic(item);
                  setLinkError(false);
                }}
                style={{
                  minHeight: 44,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: currentTopic === item ? c.text : c.border,
                }}
              >
                <Text style={{ color: currentTopic === item ? c.text : c.muted }}>
                  {t(`science.topics.${item}`)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={ui.body}>{t(`science.explanations.${currentTopic}`)}</Text>
          <Text style={ui.note}>{t('science.limit')}</Text>
          <Rule />
          <Label>{t('science.reflect')}</Label>
          <Text style={ui.body}>{t(`science.questions.${currentTopic}`)}</Text>
          <Text style={ui.note}>
            {t('science.recordedThemes')}:{' '}
            {dream.tags
              .map((slug) => t(`tags.${slug}` as 'tags.water', { defaultValue: slug }))
              .join(', ') || t('science.noThemes')}
          </Text>
          {source ? (
            <>
              <Rule />
              <Label>{t('science.source')}</Label>
              <Text style={ui.body}>{source.title}</Text>
              <Text style={ui.note}>
                {source.authors} · {source.journal} · {source.year}
              </Text>
              <Text style={ui.note}>
                {t(`science.evidence.${source.evidence}`)} · PMID {source.pmid}
              </Text>
              <Text style={ui.note}>DOI: {source.doi}</Text>
              <TextButton
                title={t('science.openSource')}
                onPress={() => {
                  void Linking.openURL(source.url).catch(() => setLinkError(true));
                }}
              />
              {linkError ? (
                <Text accessibilityRole="alert" style={ui.note}>
                  {t('science.linkError')}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={ui.note}>{t('science.symbolicNote')}</Text>
          )}
        </>
      ) : null}
    </View>
  );
}
