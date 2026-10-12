import { currentReport } from '../../../supabase/functions/_shared/grounding';
import type { DreamPipeline } from '@/services/contracts/dream-pipeline';
import type { InterpretationService } from '@/services/contracts/interpretation';
import type { ImageService } from '@/services/contracts/image';
import { dreamAnalysisSchema } from '@/schemas/dream-analysis';
import type { MockDreamRepository } from './repository';
import type { DemoDream } from './data';
export class MockDreamPipeline implements DreamPipeline {
  constructor(
    private repository: MockDreamRepository,
    private interpretation: InterpretationService,
    private images: ImageService,
  ) {}
  async create(
    input: Parameters<DreamPipeline['create']>[0],
    onStage?: (stage: number) => void,
  ): Promise<DemoDream> {
    const { transcript, locale, inputMode, signal } = input;
    onStage?.(0);
    if (!transcript.trim() || transcript.length > 20000) throw new Error('INVALID_TRANSCRIPT');
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    onStage?.(1);
    const analysis = dreamAnalysisSchema.parse(
      await this.interpretation.interpret({ transcript, locale, dreamDate: date, signal }),
    );
    const id = `demo-${now.getTime()}-${Math.random().toString(36).slice(2, 7)}`;
    onStage?.(2);
    const image = await this.images.generate({
      prompt: analysis.image_prompt,
      dreamId: id,
      signal,
    });
    if (signal?.aborted) throw new Error('ABORTED');
    onStage?.(3);
    const time = new Date().toISOString();
    const dream: DemoDream = {
      id,
      user_id: 'demo-session',
      title: transcript.trim().split(/\s+/).slice(0, 6).join(' ').slice(0, 100),
      transcript: transcript.trim(),
      input_mode: inputMode,
      dream_date: date,
      capture_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      content_locale: locale,
      status: 'ready',
      event_confirmed: false,
      transcript_revision: 1,
      content_report: currentReport(analysis.content_report, transcript.trim(), 1),
      journal: null,
      neuroscience_interpretation: analysis.interpretations.neuroscience,
      jungian_interpretation: analysis.interpretations.jungian,
      astrological_interpretation: analysis.interpretations.astrological,
      analysis_source: 'mock',
      ai_processing_consent_at: null,
      astrology_context: { available: false, demo: true },
      image_prompt: analysis.image_prompt,
      audio_path: null,
      image_path: null,
      imageUri: image.imageUri,
      error_code: null,
      deletion_requested_at: null,
      aggregate_opt_in: false,
      matching_opt_in: false,
      processed_at: time,
      created_at: time,
      updated_at: time,
      tags: analysis.tags,
      art: analysis.tags.includes('teeth')
        ? 'mirror'
        : analysis.tags.includes('falling')
          ? 'falling'
          : 'water',
    };
    return this.repository.saveAnalyzed(dream);
  }
}
