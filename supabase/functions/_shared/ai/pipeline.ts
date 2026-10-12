import {
  analysisSchema,
  PipelineError,
  type AiProviders,
  type Analysis,
  type Locale,
  type TransitContext,
} from './domain.ts';
import { validateAudio } from './audio.ts';
import { calculateTransits } from './transits.ts';
export interface JobInput {
  transcript: string;
  locale: Locale;
  inputMode: 'text' | 'audio';
  dreamDate: string;
  timezone: string;
  audio?: { base64: string; mime: string };
  processingConsent: true;
  expectedRevision?: number;
}
export interface Job {
  id: string;
  dream_id: string;
  user_id: string;
  status: 'pending' | 'failed' | 'completed';
  input: JobInput;
  state: Record<string, unknown>;
  created_at: string;
}
export interface JobStore {
  patch(job: Job, patch: Record<string, unknown>): Promise<void>;
  attempt(job: Job, stage: 'whisper' | 'interpret' | 'image'): Promise<number>;
  upload(bucket: string, path: string, bytes: Uint8Array, mime: string): Promise<void>;
  save(
    job: Job,
    transcript: string,
    analysis: Analysis,
    context: TransitContext,
    imagePath: string,
    audioPath: string | null,
  ): Promise<void>;
  finish(job: Job, error?: string): Promise<void>;
}
export async function runJob(job: Job, store: JobStore, providers: AiProviders) {
  if (job.status === 'completed') return { id: job.dream_id };

  const state = job.state;
  const patch = async (values: Record<string, unknown>) => {
    await store.patch(job, values);
    Object.assign(state, values);
  };
  const retry = async <T>(stage: 'whisper' | 'interpret', task: () => Promise<T>): Promise<T> => {
    while (true) {
      const attempt = await store.attempt(job, stage);
      try {
        return await task();
      } catch (e) {
        if (!(e instanceof PipelineError) || !e.retryable || attempt >= 2) throw e;
        await new Promise((resolve) => setTimeout(resolve, 350 + Math.random() * 350));
      }
    }
  };
  try {
    if (Date.now() - new Date(job.created_at).getTime() > 24 * 60 * 60 * 1000)
      throw new PipelineError('JOB_EXPIRED', 410);
    const input = job.input;
    if (!input.processingConsent) throw new PipelineError('PROCESSING_CONSENT_REQUIRED', 400);
    let transcript = typeof state.transcript === 'string' ? state.transcript : '';
    let audioPath = typeof state.audioPath === 'string' ? state.audioPath : null;
    if (!transcript) {
      if (input.inputMode === 'audio') {
        if (!input.audio) throw new PipelineError('AUDIO_REQUIRED', 400);
        let bytes: Uint8Array;
        try {
          bytes = Uint8Array.from(atob(input.audio.base64), (c) => c.charCodeAt(0));
        } catch {
          throw new PipelineError('INVALID_AUDIO', 400);
        }
        const audio = await validateAudio(bytes, input.audio.mime);
        transcript = await retry('whisper', () => providers.transcribe(audio, input.locale));
        if (input.transcript.trim()) transcript += `\n\n${input.transcript.trim()}`;
        if (transcript.length > 20000) throw new PipelineError('INVALID_INPUT', 400);
        const ext =
          input.audio.mime === 'audio/wav'
            ? 'wav'
            : input.audio.mime === 'audio/webm'
              ? 'webm'
              : 'm4a';
        audioPath = `${job.user_id}/${job.dream_id}/${job.id}.${ext}`;
        // Persist the transcript before Storage; retries never transcribe a successful response again.
        await patch({ transcript, audioPath: null });
        await store.upload('dream-audio', audioPath, audio.bytes, audio.mime);
        await patch({ audioPath });
      } else {
        transcript = input.transcript.trim();
        if (!transcript) throw new PipelineError('INVALID_INPUT', 400);
        await patch({ transcript });
      }
    }
    // An interrupted audio upload can be resumed without another paid transcription.
    if (input.inputMode === 'audio' && !audioPath && input.audio) {
      const audio = await validateAudio(
        Uint8Array.from(atob(input.audio.base64), (c) => c.charCodeAt(0)),
        input.audio.mime,
      );
      const ext =
        input.audio.mime === 'audio/wav'
          ? 'wav'
          : input.audio.mime === 'audio/webm'
            ? 'webm'
            : 'm4a';
      audioPath = `${job.user_id}/${job.dream_id}/${job.id}.${ext}`;
      await store.upload('dream-audio', audioPath, audio.bytes, audio.mime);
      await patch({ audioPath });
    }
    const context = state.context
      ? (state.context as TransitContext)
      : calculateTransits(new Date());
    if (!state.context) await patch({ context });
    const analysis = state.analysis
      ? analysisSchema.parse(state.analysis)
      : await retry('interpret', () => providers.interpret(transcript, input.locale, context));
    if (!state.analysis) {
      await patch({ analysis });
      // Image generation starts on the next request to bound each Edge invocation.
      return { id: job.dream_id, pending: true, stage: 2 };
    }
    const imagePath = `${job.user_id}/${job.dream_id}/${job.id}.png`;
    if (state.imagePath !== imagePath) {
      // An ambiguous response/upload failure never causes a second paid image request.
      if (state.image_attempts) throw new PipelineError('PROVIDER_RESULT_UNKNOWN');
      await store.attempt(job, 'image');
      const image = await providers.generateImage(analysis.image_prompt);
      await store.upload('dream-images', imagePath, image.bytes, image.mime);
      await patch({ imagePath });
    }
    await store.save(job, transcript, analysis, context, imagePath, audioPath);
    await store.finish(job);
    return { id: job.dream_id };
  } catch (e) {
    const error = e instanceof PipelineError ? e : new PipelineError('BACKEND_UNAVAILABLE');
    await store.finish(job, error.code);
    throw error;
  }
}
