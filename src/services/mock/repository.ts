import {
  demoReport,
  acceptedTags,
  currentReport,
} from '../../../supabase/functions/_shared/grounding';
import { educationalText } from '../../../supabase/functions/_shared/knowledge';
import { parseJournal, type Journal } from '../../../supabase/functions/_shared/journal';
import type {
  CreateDreamInput,
  DreamFilters,
  DreamRepository,
} from '@/services/contracts/dream-repository';
import type { DemoDream } from './data';
import { seedDreams } from './data';
import { wait } from './ai';
export class MockDreamRepository implements DreamRepository {
  private dreams: DemoDream[] = seedDreams('tr');
  async list(filters: DreamFilters = {}) {
    await wait(200);
    const limit = Math.max(1, Math.min(filters.limit ?? 30, 100));
    const rows = this.dreams.filter(
      (d) =>
        (!filters.tag || d.tags.includes(filters.tag)) &&
        (!filters.fromDate || d.dream_date >= filters.fromDate) &&
        (!filters.toDate || d.dream_date <= filters.toDate),
    );
    const start = filters.cursor
      ? Math.max(0, rows.findIndex((d) => d.id === filters.cursor) + 1)
      : 0;
    const dreams = rows.slice(start, start + limit);
    return { dreams, nextCursor: start + limit < rows.length ? dreams.at(-1)?.id : undefined };
  }
  async get(id: string) {
    return this.dreams.find((d) => d.id === id) ?? null;
  }
  async create(input: CreateDreamInput): Promise<DemoDream> {
    if (input.input_mode === 'text' && !input.transcript?.trim())
      throw new Error('INVALID_TRANSCRIPT');
    const now = new Date().toISOString();
    const dream: DemoDream = {
      id: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      user_id: 'demo-session',
      title: input.transcript?.trim().split(/\s+/).slice(0, 6).join(' ') ?? null,
      transcript: input.transcript?.trim() ?? null,
      input_mode: input.input_mode,
      dream_date: input.dream_date,
      capture_timezone: input.capture_timezone,
      content_locale: input.content_locale,
      status: 'draft',
      event_confirmed: false,
      transcript_revision: 1,
      content_report: null,
      journal: null,
      neuroscience_interpretation: null,
      jungian_interpretation: null,
      astrological_interpretation: null,
      analysis_source: 'mock',
      ai_processing_consent_at: null,
      astrology_context: null,
      image_prompt: null,
      audio_path: null,
      image_path: null,
      imageUri: null,
      error_code: null,
      deletion_requested_at: null,
      aggregate_opt_in: false,
      matching_opt_in: false,
      processed_at: null,
      created_at: now,
      updated_at: now,
      tags: [],
      art: 'water',
    };
    this.dreams = [dream, ...this.dreams];
    return dream;
  }
  async saveAnalyzed(dream: DemoDream) {
    this.dreams = [dream, ...this.dreams.filter((d) => d.id !== dream.id)];
    return dream;
  }
  async updateTranscript(id: string, transcript: string, options?: { expectedRevision?: number }) {
    const dream = await this.get(id);
    if (!dream) throw new Error('NOT_FOUND');
    if (!transcript.trim() || transcript.length > 20000) throw new Error('INVALID_TRANSCRIPT');
    if (
      options?.expectedRevision !== undefined &&
      options.expectedRevision !== dream.transcript_revision
    )
      throw new Error('REVISION_CONFLICT');
    if (transcript.trim() === dream.transcript) return dream;
    Object.assign(dream, {
      transcript: transcript.trim(),
      title: transcript.trim().slice(0, 100),
      event_confirmed: false,
      transcript_revision: dream.transcript_revision + 1,
      content_report: null,
      aggregate_opt_in: false,
      matching_opt_in: false,
      status: 'draft',
      tags: [],
      image_path: null,
      imageUri: null,
      image_prompt: null,
      analysis_source: 'mock',
      ai_processing_consent_at: null,
      astrology_context: null,
      sampleKey: undefined,
      neuroscience_interpretation: null,
      jungian_interpretation: null,
      astrological_interpretation: null,
      processed_at: null,
      updated_at: new Date().toISOString(),
    });
    return dream;
  }
  async confirmEvent(id: string, revision: number) {
    const dream = await this.get(id);
    if (!dream || dream.transcript_revision !== revision) throw new Error('REVISION_CONFLICT');
    dream.event_confirmed = true;
    return dream;
  }
  async analyze(id: string) {
    const dream = await this.get(id);
    if (!dream || dream.deletion_requested_at) throw new Error('NOT_FOUND');
    const report = demoReport(dream.transcript ?? '', dream.transcript_revision);
    dream.content_report = report;
    dream.tags = acceptedTags(report);
    dream.status = 'ready';
    dream.neuroscience_interpretation = educationalText(
      report,
      dream.content_locale === 'en' ? 'en' : 'tr',
    );
    dream.jungian_interpretation =
      dream.content_locale === 'en'
        ? 'Which part of this account matters to you? This is an optional reflection question.'
        : 'Bu anlatının hangi bölümü senin için önemli? Bu, isteğe bağlı bir düşünme sorusudur.';
    dream.astrological_interpretation =
      dream.content_locale === 'en'
        ? 'Symbolic reflection only. No personal cause can be inferred.'
        : 'Yalnızca sembolik düşünme. Buradan kişisel bir neden çıkarılamaz.';
    dream.processed_at = new Date().toISOString();
    return dream;
  }
  async saveJournal(id: string, journal: Journal | null) {
    const dream = await this.get(id);
    if (!dream) throw new Error('NOT_FOUND');
    dream.journal = journal === null ? null : parseJournal(journal);
    return dream;
  }
  async rejectObservation(id: string, index: number, rejected: boolean, revision: number) {
    const dream = await this.get(id);
    if (!dream) throw new Error('NOT_FOUND');
    const report = currentReport(dream.content_report, dream.transcript ?? '', revision);
    if (dream.transcript_revision !== revision || !report?.observations[index])
      throw new Error('REVISION_CONFLICT');
    report.observations[index]!.rejected = rejected;
    dream.tags = acceptedTags(report);
    return dream;
  }
  async setSocialConsent(id: string, consent: { aggregate: boolean; matching: boolean }) {
    const dream = await this.get(id);
    if (!dream) throw new Error('NOT_FOUND');
    dream.aggregate_opt_in = consent.aggregate;
    dream.matching_opt_in = consent.matching;
    return dream;
  }
  async delete(id: string) {
    this.dreams = this.dreams.filter((d) => d.id !== id);
  }
  clear() {
    this.dreams = [];
  }
}
