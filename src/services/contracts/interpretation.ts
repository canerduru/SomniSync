import type { AppLocale } from '@/i18n';
import type { DreamAnalysis } from '@/schemas/dream-analysis';
export interface InterpretationService {
  interpret(input: {
    transcript: string;
    locale: AppLocale;
    dreamDate: string;
    signal?: AbortSignal;
  }): Promise<DreamAnalysis>;
}
