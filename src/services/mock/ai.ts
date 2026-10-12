import { demoReport, acceptedTags } from '../../../supabase/functions/_shared/grounding';
import { educationalText } from '../../../supabase/functions/_shared/knowledge';
import i18n from '@/i18n';
import type { TranscriptionService } from '@/services/contracts/transcription';
import type { InterpretationService } from '@/services/contracts/interpretation';
import type { ImageService } from '@/services/contracts/image';
import { dreamAnalysisSchema } from '@/schemas/dream-analysis';
import { artUri, type ArtKind } from '@/assets/dream-art';
export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('ABORTED'));
      return;
    }
    const stop = () => {
      clearTimeout(timer);
      signal?.removeEventListener('abort', stop);
      reject(new Error('ABORTED'));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', stop);
      resolve();
    }, ms);
    signal?.addEventListener('abort', stop, { once: true });
  });
}
export const mockTranscription: TranscriptionService = {
  async transcribe({ locale, signal }) {
    await wait(450, signal);
    return { transcript: i18n.getFixedT(locale)('samples.waterTranscript') };
  },
};
export const mockInterpretation: InterpretationService = {
  async interpret({ transcript, locale, signal }) {
    await wait(750, signal);
    const t = i18n.getFixedT(locale);
    const report = demoReport(transcript.trim(), 1);
    const tags = acceptedTags(report);
    return dreamAnalysisSchema.parse({
      image_prompt: `Monochrome cinematic dream, ${tags.join(', ')}`,
      interpretations: {
        neuroscience: educationalText(report, locale),
        jungian: t('samples.jung'),
        astrological: t('samples.astro'),
      },
      tags,
      content_report: report,
    });
  },
};
export const mockImage: ImageService = {
  async generate({ prompt, signal }) {
    await wait(600, signal);
    const kind: ArtKind = prompt.includes('teeth')
      ? 'mirror'
      : prompt.includes('falling')
        ? 'falling'
        : 'water';
    return { imageUri: artUri(kind) };
  },
};
