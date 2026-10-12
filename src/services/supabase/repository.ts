import { currentReport } from '../../../supabase/functions/_shared/grounding';
import { parseJournal, type Journal } from '../../../supabase/functions/_shared/journal';
import type { DreamEntry } from '@/types/dream';
import type {
  CreateDreamInput,
  DreamFilters,
  DreamRepository,
} from '../contracts/dream-repository';
import * as Crypto from 'expo-crypto';
import { client, dreamAction, completeDream } from './client';
const selection = '*, dream_tags(tags(slug))' as const;
export class SupabaseDreamRepository implements DreamRepository {
  async present(row: Awaited<ReturnType<typeof this.rows>>[number]): Promise<DreamEntry> {
    const { dream_tags, ...dream } = row;
    const { data } =
      row.image_path && !row.deletion_requested_at
        ? await client().storage.from('dream-images').createSignedUrl(row.image_path, 300)
        : { data: null };
    return {
      ...dream,
      content_report: currentReport(
        dream.content_report,
        dream.transcript ?? '',
        dream.transcript_revision,
      ),
      journal: dream.journal
        ? (() => {
            try {
              return parseJournal(dream.journal);
            } catch {
              return null;
            }
          })()
        : null,
      tags: dream_tags.flatMap((r) => (r.tags ? [r.tags.slug] : [])),
      imageUri: data?.signedUrl ?? null,
    };
  }
  private async rows() {
    const { data, error } = await client().from('dreams').select(selection);
    if (error) throw error;
    return data;
  }
  async list(filters: DreamFilters = {}) {
    const limit = Math.max(1, Math.min(filters.limit ?? 30, 100));
    let query = client()
      .from('dreams')
      .select(selection)
      .order('dream_date', { ascending: false })
      .order('id', { ascending: false });
    if (filters.fromDate) query = query.gte('dream_date', filters.fromDate);
    if (filters.toDate) query = query.lte('dream_date', filters.toDate);
    if (filters.cursor) {
      const cursor = JSON.parse(filters.cursor) as { date: string; id: string };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(cursor.date) || !/^[a-f0-9-]{36}$/.test(cursor.id))
        throw new Error('INVALID_CURSOR');
      query = query.or(
        `dream_date.lt.${cursor.date},and(dream_date.eq.${cursor.date},id.lt.${cursor.id})`,
      );
    }
    // Tag filtering stays in Postgres and keeps pagination stable.
    if (filters.tag) {
      const { data: tag, error } = await client()
        .from('tags')
        .select('id')
        .eq('slug', filters.tag)
        .maybeSingle();
      if (error) throw error;
      if (!tag) return { dreams: [] };
      const { data: links, error: linkError } = await client()
        .from('dream_tags')
        .select('dream_id')
        .eq('tag_id', tag.id);
      if (linkError) throw linkError;
      if (!links.length) return { dreams: [] };
      query = query.in(
        'id',
        links.map((l) => l.dream_id),
      );
    }
    const { data, error } = await query.limit(limit + 1);
    if (error) throw error;
    const rows = data.slice(0, limit);
    const last = rows.at(-1);
    return {
      dreams: await Promise.all(rows.map((row) => this.present(row))),
      nextCursor:
        data.length > limit && last
          ? JSON.stringify({ date: last.dream_date, id: last.id })
          : undefined,
    };
  }
  async get(id: string) {
    const { data, error } = await client()
      .from('dreams')
      .select(selection)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? this.present(data) : null;
  }
  async create(input: CreateDreamInput) {
    const result = await completeDream({
      action: 'create',
      id: Crypto.randomUUID(),
      processingConsent: input.processingConsent,
      transcript: input.transcript,
      inputMode: input.input_mode,
      dreamDate: input.dream_date,
      timezone: input.capture_timezone,
      locale: input.content_locale,
    });
    const row = await this.get(result.id!);
    if (!row) throw new Error('NOT_FOUND');
    return row;
  }
  async updateTranscript(
    id: string,
    transcript: string,
    options?: { processingConsent?: boolean; jobId?: string; expectedRevision?: number },
  ) {
    await dreamAction({
      action: 'revise',
      id,
      transcript,
      expectedRevision: options?.expectedRevision,
      processingConsent: options?.processingConsent,
    });
    const row = await this.get(id);
    if (!row) throw new Error('NOT_FOUND');
    return row;
  }
  private async refreshed(id: string) {
    const row = await this.get(id);
    if (!row) throw new Error('NOT_FOUND');
    return row;
  }
  async confirmEvent(id: string, revision: number) {
    await dreamAction({ action: 'confirm_event', id, expectedRevision: revision });
    return this.refreshed(id);
  }
  async analyze(id: string, options?: { processingConsent?: boolean }) {
    const dream = await this.refreshed(id);
    await completeDream({
      action: 'update',
      id,
      expectedRevision: dream.transcript_revision,
      transcript: dream.transcript,
      jobId: Crypto.randomUUID(),
      processingConsent: options?.processingConsent,
    });
    return this.refreshed(id);
  }
  async saveJournal(id: string, journal: Journal | null) {
    await dreamAction({ action: 'journal', id, journal });
    return this.refreshed(id);
  }
  async rejectObservation(id: string, index: number, rejected: boolean, revision: number) {
    await dreamAction({
      action: 'review',
      id,
      observationIndex: index,
      rejected,
      expectedRevision: revision,
    });
    return this.refreshed(id);
  }
  async setSocialConsent(id: string, consent: { aggregate: boolean; matching: boolean }) {
    const { error } = await client()
      .from('dreams')
      .update({ aggregate_opt_in: consent.aggregate, matching_opt_in: consent.matching })
      .eq('id', id);
    if (error) throw error;
    const row = await this.get(id);
    if (!row) throw new Error('NOT_FOUND');
    return row;
  }
  async delete(id: string) {
    await dreamAction({ action: 'delete', id });
  }
  async clear() {
    await dreamAction({ action: 'clear' });
  }
}
