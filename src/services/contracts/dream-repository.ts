import type { Journal } from '../../../supabase/functions/_shared/journal';
import type { Dream, DreamEntry } from '@/types/dream';
export type { Dream } from '@/types/dream';
export interface DreamFilters {
  tag?: string;
  fromDate?: string;
  toDate?: string;
  cursor?: string;
  limit?: number;
}
export type CreateDreamInput = Pick<
  Dream,
  'input_mode' | 'dream_date' | 'capture_timezone' | 'content_locale'
> & { transcript?: string; audioUri?: string; processingConsent?: boolean };
export interface DreamRepository {
  list(filters?: DreamFilters): Promise<{ dreams: DreamEntry[]; nextCursor?: string }>;
  get(id: string): Promise<DreamEntry | null>;
  create(input: CreateDreamInput): Promise<DreamEntry>;
  updateTranscript(
    id: string,
    transcript: string,
    options?: { processingConsent?: boolean; jobId?: string; expectedRevision?: number },
  ): Promise<DreamEntry>;
  confirmEvent(id: string, revision: number): Promise<DreamEntry>;
  analyze(id: string, options?: { processingConsent?: boolean }): Promise<DreamEntry>;
  saveJournal(id: string, journal: Journal | null): Promise<DreamEntry>;
  rejectObservation(
    id: string,
    index: number,
    rejected: boolean,
    revision: number,
  ): Promise<DreamEntry>;
  setSocialConsent(
    id: string,
    consent: { aggregate: boolean; matching: boolean },
  ): Promise<DreamEntry>;
  delete(id: string): Promise<void>;
}
