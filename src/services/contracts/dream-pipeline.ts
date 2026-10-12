import type { AppLocale } from '@/i18n';
import type { DreamEntry } from '@/types/dream';
export interface DreamPipeline {
  create(
    input: {
      transcript: string;
      audioUri?: string;
      processingConsent?: boolean;
      id?: string;
      locale: AppLocale;
      inputMode: 'text' | 'audio';
      signal?: AbortSignal;
    },
    onStage?: (stage: number) => void,
  ): Promise<DreamEntry>;
}
