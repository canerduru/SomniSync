import type { AppLocale } from '@/i18n';
export interface TranscriptionService {
  transcribe(input: {
    audioUri: string;
    locale: AppLocale;
    signal?: AbortSignal;
  }): Promise<{ transcript: string }>;
}
