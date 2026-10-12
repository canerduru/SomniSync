import { EvidencePanel } from '@/features/evidence/EvidencePanel';
import { BoundKnowledgePanel } from '@/features/evidence/BoundKnowledgePanel';
import { JournalPanel } from '@/features/journal/JournalPanel';
import { backendEnabled } from '@/services/supabase/client';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useDreams } from '@/features/dreams/DreamProvider';
import {
  Button,
  c,
  Confirm,
  Empty,
  Label,
  Page,
  Permission,
  Rule,
  Tag,
  TextButton,
  ui,
} from '@/components/ui/kit';
import { SciencePanel } from '@/features/insights/SciencePanel';
import { DreamVisual } from '@/components/ui/DreamArt';
const lenses = ['neuroscience', 'jungian', 'astrological'] as const;
export default function DreamDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const store = useDreams();
  const router = useRouter();
  const dream = store.dreams.find((d) => d.id === id);
  const [resuming, setResuming] = useState(false);
  const [active, setActive] = useState(0);
  const [width, setWidth] = useState(300);
  const pager = useRef<ScrollView>(null);
  const [transcript, setTranscript] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState(false);
  if (store.loading)
    return (
      <Page back>
        <ActivityIndicator color={c.text} />
      </Page>
    );
  if (!dream)
    return (
      <Page back>
        <Empty
          title={t('detail.notFound')}
          body={t('detail.notFoundBody')}
          href="/grimoire"
          action={t('home.all')}
        />
      </Page>
    );
  if (dream.deletion_requested_at)
    return (
      <Page back>
        <Label>{t('auth.pending')}</Label>
        <Button
          title={t('common.retry')}
          onPress={() => {
            void store
              .remove(dream.id)
              .then(() => router.replace('/grimoire'))
              .catch(() => setError(true));
          }}
        />
        {error && <Text style={ui.note}>{t('common.error')}</Text>}
      </Page>
    );
  if (dream.status !== 'ready')
    return (
      <Page back>
        <Label>{dream.dream_date}</Label>
        <Text style={ui.title}>{dream.title}</Text>
        <Text style={ui.body}>
          {t(
            dream.status === 'draft'
              ? 'grounding.draft'
              : dream.status === 'failed'
                ? 'ai.failed'
                : 'ai.pending',
          )}
        </Text>
        <EvidencePanel key={`${dream.id}:${dream.transcript_revision}`} dream={dream} />
        {dream.status !== 'draft' && (
          <Button
            busy={resuming}
            title={t('common.retry')}
            onPress={() => {
              setResuming(true);
              setError(false);
              void store
                .resume(dream.id)
                .catch(() => setError(true))
                .finally(() => setResuming(false));
            }}
          />
        )}
        {error && <Text style={ui.note}>{t('common.error')}</Text>}
        <TextButton
          title={t('detail.delete')}
          onPress={() => {
            void store
              .remove(dream.id)
              .then(() => router.replace('/grimoire'))
              .catch(() => setError(true));
          }}
        />
      </Page>
    );
  const changeConsent = async (kind: 'aggregate' | 'matching', value: boolean) => {
    try {
      await store.setConsent(dream.id, {
        aggregate: kind === 'aggregate' ? value : dream.aggregate_opt_in,
        matching: kind === 'matching' ? value : dream.matching_opt_in,
      });
    } catch {
      setError(true);
    }
  };
  const body = [
    dream.neuroscience_interpretation,
    dream.jungian_interpretation,
    dream.astrological_interpretation,
  ];
  return (
    <Page back>
      <Label>{t('detail.eyebrow')}</Label>
      <View style={ui.spread}>
        <Label>{dream.dream_date}</Label>
        <Label>{t('common.private')}</Label>
      </View>
      <Text accessibilityRole="header" style={ui.title}>
        {dream.title}
      </Text>
      <DreamVisual uri={dream.imageUri} height={380} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {dream.tags.map((slug) => (
          <Tag key={slug} slug={slug} />
        ))}
      </View>
      <Text style={ui.note}>
        {t(
          dream.analysis_source === 'live'
            ? 'ai.note'
            : backendEnabled
              ? 'backend.note'
              : 'common.demoNote',
        )}
      </Text>
      <Button
        title={`${t('detail.share')} ↗`}
        onPress={() => router.push({ pathname: '/share/[id]', params: { id: dream.id } })}
      />
      <Rule />
      <EvidencePanel key={`${dream.id}:${dream.transcript_revision}`} dream={dream} />
      <Rule />
      <JournalPanel key={dream.id} dream={dream} />
      <Rule />
      <View style={ui.spread}>
        <Label>{t('detail.lenses')}</Label>
        <Text style={ui.note}>{String(active + 1).padStart(2, '0')} / 03</Text>
      </View>
      <View
        accessibilityRole="tablist"
        style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: c.border }}
      >
        {lenses.map((lens, i) => (
          <Pressable
            key={lens}
            accessibilityRole="tab"
            accessibilityState={{ selected: active === i }}
            onPress={() => {
              setActive(i);
              pager.current?.scrollTo({ x: i * width, animated: true });
            }}
            style={{
              flex: 1,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderColor: active === i ? c.text : 'transparent',
            }}
          >
            <Text
              style={{ color: active === i ? c.text : c.muted, fontSize: 11, textAlign: 'center' }}
            >
              {t(`detail.${lens}`)}
            </Text>
          </Pressable>
        ))}
      </View>
      <View
        style={{ overflow: 'hidden' }}
        onLayout={(e) => {
          const next = e.nativeEvent.layout.width;
          setWidth(next);
          pager.current?.scrollTo({ x: active * next, animated: false });
        }}
      >
        <ScrollView
          ref={pager}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            setActive(Math.max(0, Math.min(2, Math.round(e.nativeEvent.contentOffset.x / width))))
          }
        >
          {lenses.map((lens, i) => (
            <View key={lens} style={{ width, paddingRight: 8, gap: 20, paddingVertical: 8 }}>
              <Label>
                0{i + 1} / {t(`detail.${lens}`)}
              </Label>
              <Text style={{ ...ui.title, fontSize: 32, lineHeight: 39 }}>
                {t(
                  i === 0
                    ? 'detail.neuroSubtitle'
                    : i === 1
                      ? 'detail.jungSubtitle'
                      : 'detail.astroSubtitle',
                )}
              </Text>
              {i === 0 ? (
                <BoundKnowledgePanel dream={dream} />
              ) : (
                <>
                  <Text style={ui.note}>{t('grounding.symbolic')}</Text>
                  <Text style={ui.body}>{body[i]}</Text>
                </>
              )}
              {i === 2 &&
                dream.analysis_source === 'live' &&
                dream.astrology_context &&
                typeof dream.astrology_context === 'object' &&
                'calculated_at' in dream.astrology_context && (
                  <Text style={ui.note}>{String(dream.astrology_context.calculated_at)}</Text>
                )}
              <Text style={ui.note}>
                {t(
                  dream.analysis_source === 'live'
                    ? i === 2
                      ? 'ai.astrology'
                      : 'ai.note'
                    : i === 2
                      ? 'detail.astrologyNote'
                      : 'detail.interpretationNote',
                )}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
      <Text style={ui.note}>← {t('detail.swipe')} →</Text>
      <Rule />
      <SciencePanel dream={dream} />
      <Rule />
      <Label>{t('detail.transcript')}</Label>
      <TextButton
        title={t(transcript ? 'detail.hideTranscript' : 'detail.showTranscript')}
        onPress={() => setTranscript(!transcript)}
      />
      {transcript && <Text style={ui.body}>{dream.transcript}</Text>}
      <Rule />
      <Label>{t('detail.social')}</Label>
      <Text style={ui.note}>{t('detail.socialHint')}</Text>
      <Permission
        title={t('detail.aggregate')}
        value={dream.aggregate_opt_in}
        onChange={(v) => {
          void changeConsent('aggregate', v);
        }}
      />
      <Permission
        title={t('detail.matching')}
        value={dream.matching_opt_in}
        onChange={(v) => {
          void changeConsent('matching', v);
        }}
      />
      {error && (
        <Text accessibilityRole="alert" style={ui.note}>
          {t('common.error')}
        </Text>
      )}
      <Rule />
      <TextButton title={t('detail.delete')} onPress={() => setConfirm(true)} />
      <Confirm
        visible={confirm}
        title={t('detail.deleteTitle')}
        body={t(backendEnabled ? 'backend.deleteBody' : 'detail.deleteBody')}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          void store
            .remove(dream.id)
            .then(() => {
              setConfirm(false);
              router.replace('/grimoire');
            })
            .catch(() => {
              setConfirm(false);
              setError(true);
            });
        }}
      />
    </Page>
  );
}
