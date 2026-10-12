import type { DreamEntry } from '@/types/dream';
import type { AppLocale } from '@/i18n';
import { MockDreamRepository } from './mock/repository';
import { MockDreamPipeline } from './mock/pipeline';
import { mockImage, mockInterpretation, mockTranscription } from './mock/ai';
import { localizedDream, type DemoDream } from './mock/data';
import { mockSynastry } from './mock/synastry';
import { backendEnabled } from './supabase/client';
import { SupabaseDreamRepository } from './supabase/repository';
import { SupabaseDreamPipeline } from './supabase/pipeline';
import { supabaseSynastry } from './supabase/synastry';
const mockRepository = new MockDreamRepository();
const backendRepository = new SupabaseDreamRepository();
export const services = {
  repository: backendEnabled ? backendRepository : mockRepository,
  synastry: backendEnabled ? supabaseSynastry : mockSynastry,
  pipeline: backendEnabled
    ? new SupabaseDreamPipeline(backendRepository)
    : new MockDreamPipeline(mockRepository, mockInterpretation, mockImage),
  transcription: mockTranscription,
  presentDream: (dream: DreamEntry, locale: AppLocale): DreamEntry =>
    backendEnabled ? dream : localizedDream(dream as DemoDream, locale),
};
