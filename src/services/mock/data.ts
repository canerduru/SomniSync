import { demoReport, acceptedTags } from '../../../supabase/functions/_shared/grounding';
import i18n, { type AppLocale } from '@/i18n';
import type { DreamEntry } from '@/types/dream';
import type { ArtKind } from '@/assets/dream-art';
import { artUri } from '@/assets/dream-art';
export type DemoDream = DreamEntry & {
  tags: string[];
  art: ArtKind;
  sampleKey?: 'water' | 'falling' | 'teeth';
};
export const sampleKeys = ['water', 'falling', 'teeth'] as const;
export function seedDreams(locale: AppLocale): DemoDream[] {
  return sampleKeys.map((key, i) => {
    const t = i18n.getFixedT(locale);
    const art: ArtKind = key === 'teeth' ? 'mirror' : key;
    const date = new Date();
    date.setDate(date.getDate() - i - 1);
    const dreamDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const created = `${dreamDate}T07:15:00Z`;
    return {
      id: `demo-${key}`,
      user_id: 'demo-session',
      title: t(`samples.${key}Title`),
      transcript: t(`samples.${key}Transcript`),
      input_mode: 'text',
      dream_date: dreamDate,
      capture_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      content_locale: locale,
      status: 'ready',
      event_confirmed: false,
      transcript_revision: 1,
      content_report: demoReport(t(`samples.${key}Transcript`), 1),
      journal: null,
      neuroscience_interpretation: t('samples.neuro'),
      jungian_interpretation: t('samples.jung'),
      astrological_interpretation: t('samples.astro'),
      analysis_source: 'mock',
      ai_processing_consent_at: null,
      astrology_context: { available: false, demo: true },
      image_prompt: 'Monochrome symbolic dream landscape',
      audio_path: null,
      image_path: null,
      imageUri: artUri(art),
      error_code: null,
      deletion_requested_at: null,
      aggregate_opt_in: false,
      matching_opt_in: false,
      processed_at: created,
      created_at: created,
      updated_at: created,
      art,
      sampleKey: key,
      tags: acceptedTags(demoReport(t(`samples.${key}Transcript`), 1)),
    };
  });
}
export function localizedDream(dream: DemoDream, locale: AppLocale): DemoDream {
  if (!dream.sampleKey) return dream;
  const t = i18n.getFixedT(locale);
  const key = dream.sampleKey;
  return {
    ...dream,

    title: t(`samples.${key}Title`),
    neuroscience_interpretation: t('samples.neuro'),
    jungian_interpretation: t('samples.jung'),
    astrological_interpretation: t('samples.astro'),
  };
}
