import { backendEnabled } from '@/services/supabase/client';
import { useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useDreams } from '@/features/dreams/DreamProvider';
import { Button, c, Empty, Label, Page, ui } from '@/components/ui/kit';
import { ShareCard } from '@/features/sharing/ShareCard';
import { cardDimensions, type CardFormat, type CardPayload } from '@/features/sharing/card';
import { exportCard } from '@/features/sharing/export-card';
export default function ShareScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const store = useDreams();
  const dream = store.dreams.find((d) => d.id === id);
  const ref = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  const [format, setFormat] = useState<CardFormat>('post');
  const [status, setStatus] = useState<'done' | 'failed' | 'unavailable' | null>(null);
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
  const tags = dream.tags
    .slice(0, 3)
    .map((slug) => t(`tags.${slug}` as 'tags.water', { defaultValue: slug }));
  const dimensions = cardDimensions(format);
  const payload: CardPayload = {
    title: dream.title || '',
    tags,
    imageUri: dream.imageUri || '',
    date: dream.dream_date,
    footer: t('share.cardFooter'),
    demoLabel: t(
      dream.analysis_source === 'live'
        ? 'ai.sample'
        : backendEnabled
          ? 'backend.sample'
          : 'share.sample',
    ),
    format,
  };
  const share = async () => {
    setBusy(true);
    setStatus(null);
    try {
      await exportCard(ref, payload);
      setStatus('done');
    } catch (error) {
      setStatus(
        error instanceof Error && error.message === 'SHARING_UNAVAILABLE'
          ? 'unavailable'
          : 'failed',
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Page back>
      <Label>{t('share.eyebrow')}</Label>
      <Text accessibilityRole="header" style={ui.title}>
        {t('share.title')}
      </Text>
      <Text style={ui.subtitle}>{t('share.subtitle')}</Text>
      <Label>{t('shareExtra.format')}</Label>
      <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
        {(['post', 'story'] as const).map((item) => (
          <Button
            key={item}
            title={t(`shareExtra.${item}`)}
            selected={format === item}
            secondary={format !== item}
            disabled={busy}
            onPress={() => {
              setFormat(item);
              setStatus(null);
            }}
          />
        ))}
      </View>
      <Text style={ui.note}>
        {t('shareExtra.dimensions', dimensions)} · {t('shareExtra.hint')}
      </Text>
      <Label>{t('share.cardLabel')}</Label>
      <View style={{ alignItems: 'center' }}>
        <View
          ref={ref}
          collapsable={false}
          accessible
          accessibilityRole="image"
          accessibilityLabel={t('share.cardLabel')}
          style={{
            width: '100%',
            maxWidth: 400,
            aspectRatio: dimensions.width / dimensions.height,
            backgroundColor: '#080808',
            overflow: 'hidden',
          }}
        >
          <ShareCard payload={payload} />
        </View>
      </View>
      <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center', gap: 16 }}>
        <Button
          busy={busy}
          title={t(busy ? 'share.exporting' : 'share.export')}
          onPress={() => {
            void share();
          }}
        />
        {status && (
          <Text accessibilityRole="alert" style={ui.note}>
            {t(`share.${status}`)}
          </Text>
        )}
        <Text style={ui.note}>{t('share.privacy')}</Text>
      </View>
    </Page>
  );
}
