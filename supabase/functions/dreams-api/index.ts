import { currentReport, demoReport, acceptedTags } from '../_shared/grounding.ts';
import { educationalText } from '../_shared/knowledge.ts';
import { parseJournal } from '../_shared/journal.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { z } from 'npm:zod@4.3.6';
import { mockAnalysis } from '../_shared/mock-analysis.ts';
import { mockImages } from '../_shared/mock-images.ts';
import { PipelineError } from '../_shared/ai/domain.ts';
import { LiveProviders } from '../_shared/ai/providers.ts';
import { runJob, type Job, type JobStore } from '../_shared/ai/pipeline.ts';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const uuid = z.string().uuid();
const input = z.strictObject({
  action: z.enum([
    'create',
    'update',
    'delete',
    'clear',
    'delete_account',
    'capabilities',
    'resume',
    'revise',
    'journal',
    'review',
    'confirm_event',
  ]),
  expectedRevision: z.number().int().positive().optional(),
  observationIndex: z.number().int().min(0).max(39).optional(),
  rejected: z.boolean().optional(),
  journal: z.unknown().optional(),
  jobId: uuid.optional(),
  processingConsent: z.boolean().optional(),
  id: uuid.optional(),
  transcript: z.string().trim().max(20000).optional(),
  locale: z.enum(['tr', 'en']).optional(),
  dreamDate: z.iso.date().optional(),
  timezone: z.string().min(1).max(100).optional(),
  inputMode: z.enum(['text', 'audio']).optional(),
  audio: z
    .strictObject({
      base64: z.string().max(7_000_000),
      mime: z.enum(['audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/wav', 'audio/webm']),
    })
    .optional(),
});
const analysisSchema = z.strictObject({
  image_prompt: z.string().min(1).max(1000),
  interpretations: z.strictObject({
    neuroscience: z.string().min(1).max(6000),
    jungian: z.string().min(1).max(6000),
    astrological: z.string().min(1).max(6000),
  }),
  content_report: z.unknown().optional(),
  tags: z
    .array(z.string().regex(/^[a-z]+(_[a-z]+)*$/))
    .min(0)
    .max(6),
});
class ApiError extends Error {
  constructor(
    readonly code: string,
    readonly status = 400,
  ) {
    super(code);
  }
}
function check<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw new ApiError('BACKEND_UNAVAILABLE', 503);
  return result.data;
}
function bytes(base64: string) {
  try {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  } catch {
    throw new ApiError('INVALID_AUDIO');
  }
}
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  const reply = (data: unknown, status = 200) =>
    Response.json(data, { status, headers: { ...cors, 'Cache-Control': 'no-store' } });
  if (req.method !== 'POST') return reply({ error: 'METHOD_NOT_ALLOWED' }, 405);
  // Verify against Auth on every request, including retries after account deletion.
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(20000) }) },
    },
  );
  let userId: string | undefined;
  const lease = crypto.randomUUID();
  let claimed = false;
  try {
    const bearer = req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
    if (!bearer) throw new ApiError('UNAUTHENTICATED', 401);
    const { data, error } = await admin.auth.getUser(bearer);
    if (error || !data.user) throw new ApiError('UNAUTHENTICATED', 401);
    userId = data.user.id;
    if (Number(req.headers.get('content-length') ?? 0) > 7_100_000)
      throw new ApiError('PAYLOAD_TOO_LARGE', 413);
    const raw = await req.text();
    if (raw.length > 7_100_000) throw new ApiError('PAYLOAD_TOO_LARGE', 413);
    let body: z.infer<typeof input>;
    try {
      body = input.parse(JSON.parse(raw));
    } catch {
      throw new ApiError('INVALID_INPUT');
    }
    const live = Deno.env.get('AI_MODE') === 'live';
    const configured = !!Deno.env.get('OPENAI_API_KEY');
    if (body.action === 'capabilities') {
      check(await admin.rpc('ai_prune_jobs'));
      return reply({ aiMode: live ? (configured ? 'live' : 'unavailable') : 'mock' });
    }
    claimed = check(await admin.rpc('claim_mutation', { p_user: userId, p_token: lease }));
    if (!claimed) throw new ApiError('BUSY', 409);
    const profile = check(
      await admin.from('users').select('deletion_requested_at').eq('id', userId).single(),
    );
    if (!profile) throw new ApiError('UNAUTHENTICATED', 401);
    if (profile.deletion_requested_at && !['clear', 'delete_account'].includes(body.action))
      throw new ApiError('DELETION_PENDING', 409);
    // Lists every object, including leftovers from interrupted uploads. Do not delete Storage SQL rows.
    const removeFolder = async (bucket: string, prefix: string): Promise<void> => {
      if (!check(await admin.rpc('claim_mutation', { p_user: userId, p_token: lease })))
        throw new ApiError('BUSY', 409);
      const rows =
        check(await admin.storage.from(bucket).list(prefix, { limit: 100, offset: 0 })) ?? [];
      for (const row of rows) {
        if (!check(await admin.rpc('claim_mutation', { p_user: userId, p_token: lease })))
          throw new ApiError('BUSY', 409);
        if (!row.id) await removeFolder(bucket, `${prefix}/${row.name}`);
        else check(await admin.storage.from(bucket).remove([`${prefix}/${row.name}`]));
      }
      if (rows.length === 100) await removeFolder(bucket, prefix);
    };
    if (body.action === 'delete_account' || body.action === 'clear') {
      check(
        await admin
          .from('users')
          .update({ deletion_requested_at: new Date().toISOString() })
          .eq('id', userId),
      );
      for (const bucket of ['dream-audio', 'dream-images']) await removeFolder(bucket, userId);
      if (body.action === 'delete_account') {
        const result = await admin.auth.admin.deleteUser(userId);
        if (result.error) throw new ApiError('DELETE_RETRY', 503);
      } else {
        check(await admin.from('dreams').delete().eq('user_id', userId));
        check(
          await admin
            .from('users')
            .update({
              deletion_requested_at: null,
              aggregate_consent_at: null,
              matching_consent_at: null,
            })
            .eq('id', userId),
        );
      }
      return reply({ ok: true });
    }
    if (body.action === 'delete') {
      if (!body.id) throw new ApiError('INVALID_INPUT');
      const row = check(
        await admin
          .from('dreams')
          .select('id')
          .eq('id', body.id)
          .eq('user_id', userId)
          .maybeSingle(),
      );
      if (!row) return reply({ ok: true });
      check(
        await admin
          .from('dreams')
          .update({ deletion_requested_at: new Date().toISOString() })
          .eq('id', body.id)
          .eq('user_id', userId),
      );
      for (const bucket of ['dream-audio', 'dream-images'])
        await removeFolder(bucket, `${userId}/${body.id}`);
      check(await admin.from('dreams').delete().eq('id', body.id).eq('user_id', userId));
      return reply({ ok: true });
    }
    if (['revise', 'journal', 'review', 'confirm_event'].includes(body.action)) {
      if (!body.id) throw new ApiError('INVALID_INPUT');
      const existing = check(
        await admin
          .from('dreams')
          .select('*')
          .eq('id', body.id)
          .eq('user_id', userId)
          .maybeSingle(),
      );
      if (!existing || existing.deletion_requested_at) throw new ApiError('NOT_FOUND', 404);
      let name: string;
      let args: Record<string, unknown>;
      if (body.action === 'revise') {
        if (!body.transcript || !body.expectedRevision) throw new ApiError('INVALID_INPUT');
        name = 'revise_dream';
        args = {
          p_user: userId,
          p_id: body.id,
          p_transcript: body.transcript,
          p_revision: body.expectedRevision,
        };
      } else if (body.action === 'confirm_event') {
        if (!body.expectedRevision) throw new ApiError('INVALID_INPUT');
        name = 'confirm_dream_event';
        args = { p_user: userId, p_id: body.id, p_revision: body.expectedRevision };
      } else if (body.action === 'journal') {
        let journal;
        try {
          journal =
            body.journal === null
              ? null
              : parseJournal({
                  ...(body.journal as Record<string, unknown>),
                  capturedAt: new Date().toISOString(),
                });
        } catch {
          throw new ApiError('INVALID_JOURNAL');
        }
        name = 'save_dream_journal';
        args = { p_user: userId, p_id: body.id, p_journal: journal };
      } else {
        if (
          body.observationIndex === undefined ||
          body.rejected === undefined ||
          !body.expectedRevision
        )
          throw new ApiError('INVALID_INPUT');
        if (
          !currentReport(
            existing.content_report,
            existing.transcript ?? '',
            existing.transcript_revision,
          )
        )
          throw new ApiError('REVISION_CONFLICT', 409);
        name = 'review_dream_observation';
        args = {
          p_user: userId,
          p_id: body.id,
          p_index: body.observationIndex,
          p_rejected: body.rejected,
          p_revision: body.expectedRevision,
        };
      }
      const result = await admin.rpc(name, args);
      if (result.error) {
        const code = [
          'REVISION_CONFLICT',
          'BUSY',
          'NOT_FOUND',
          'INVALID_TRANSCRIPT',
          'INVALID_OBSERVATION',
          'INVALID_JOURNAL',
        ].find((c) => result.error.message.includes(c));
        throw new ApiError(
          code ?? 'BACKEND_UNAVAILABLE',
          code === 'REVISION_CONFLICT' || code === 'BUSY' ? 409 : code ? 400 : 503,
        );
      }
      return reply({ id: body.id });
    }
    if (live && ['create', 'update', 'resume'].includes(body.action)) {
      if (!configured) throw new ApiError('AI_NOT_CONFIGURED', 503);
      check(await admin.rpc('ai_prune_jobs'));
      const rpc = async (name: string, args: Record<string, unknown>) => {
        const result = await admin.rpc(name, args);
        if (result.error) {
          const code = [
            'RATE_LIMITED',
            'BUDGET_EXCEEDED',
            'IDEMPOTENCY_CONFLICT',
            'ATTEMPTS_EXHAUSTED',
            'NOT_FOUND',
            'REVISION_CONFLICT',
          ].find((c) => result.error!.message.includes(c));
          throw new PipelineError(
            code ?? 'BACKEND_UNAVAILABLE',
            code === 'RATE_LIMITED' ? 429 : code === 'BUDGET_EXCEEDED' ? 503 : code ? 409 : 503,
          );
        }
        return result.data;
      };
      let job: Job;
      if (body.action === 'resume') {
        if (!body.id) throw new ApiError('INVALID_INPUT');
        job = await rpc('ai_get_dream_job', { p_user: userId, p_dream: body.id });
        if (!job) throw new ApiError('NOT_FOUND', 404);
        if (job.state.errorCode === 'REVISION_CHANGED')
          throw new ApiError('REVISION_CONFLICT', 409);
      } else {
        if (!body.processingConsent) throw new ApiError('PROCESSING_CONSENT_REQUIRED');
        if (body.inputMode !== 'audio' && !body.transcript) throw new ApiError('INVALID_INPUT');
        const id = body.id ?? crypto.randomUUID();
        const old = check(
          await admin.from('dreams').select('*').eq('id', id).eq('user_id', userId).maybeSingle(),
        );
        if (body.action === 'update' && !old) throw new ApiError('NOT_FOUND', 404);
        if (old?.deletion_requested_at) throw new ApiError('DELETION_PENDING', 409);
        if (
          body.action === 'update' &&
          (body.expectedRevision !== old.transcript_revision ||
            body.transcript?.trim() !== old.transcript)
        )
          throw new ApiError('REVISION_CONFLICT', 409);
        const jobId = body.action === 'update' ? body.jobId : body.id;
        if (!jobId) throw new ApiError('IDEMPOTENCY_KEY_REQUIRED');
        const latest = await rpc('ai_get_dream_job', { p_user: userId, p_dream: id });
        if (latest && latest.id !== jobId && latest.status === 'pending')
          throw new ApiError('BUSY', 409);
        if (latest && latest.id !== jobId && body.action === 'create')
          throw new ApiError('IDEMPOTENCY_CONFLICT', 409);
        const timezone = body.timezone ?? old?.capture_timezone ?? 'UTC';
        let date: string;
        try {
          date = new Intl.DateTimeFormat('en-CA', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date());
        } catch {
          throw new ApiError('INVALID_TIMEZONE');
        }
        const data = {
          transcript: body.transcript ?? '',
          locale: body.locale ?? old?.content_locale ?? 'tr',
          inputMode: body.inputMode ?? 'text',
          dreamDate: body.dreamDate ?? old?.dream_date ?? date,
          timezone,
          audio: body.audio,
          processingConsent: true,
          expectedRevision: body.action === 'create' ? 1 : (old?.transcript_revision ?? 1),
        };
        // Digest excludes the inferred date, so a retry across midnight remains the same request.
        const hash = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(JSON.stringify({ ...data, dreamDate: body.dreamDate ?? null })),
        );
        const digest = Array.from(new Uint8Array(hash), (b) =>
          b.toString(16).padStart(2, '0'),
        ).join('');
        if (data.inputMode === 'audio') {
          if (!body.audio) throw new ApiError('AUDIO_REQUIRED');
          const { validateAudio } = await import('../_shared/ai/audio.ts');
          await validateAudio(bytes(body.audio.base64), body.audio.mime);
        }
        const budget = Number(Deno.env.get('AI_DAILY_GLOBAL_BUDGET_USD') ?? '2');
        const limit = Number(Deno.env.get('AI_DAILY_USER_LIMIT') ?? '3');
        if (!Number.isFinite(budget) || budget <= 0 || !Number.isInteger(limit) || limit < 1)
          throw new ApiError('AI_NOT_CONFIGURED', 503);
        job = await rpc('ai_reserve_job', {
          p_user: userId,
          p_job: jobId,
          p_dream: id,
          p_digest: digest,
          p_input: data,
          p_user_limit: limit,
          p_budget_micros: Math.floor(budget * 1e6),
        });
      }
      if (job.status === 'failed') {
        await rpc('ai_patch_job', { p_user: userId, p_job: job.id, p_patch: {} });
        check(
          await admin
            .from('dreams')
            .update({ status: 'processing', error_code: null })
            .eq('id', job.dream_id)
            .eq('user_id', userId),
        );
      }
      const store: JobStore = {
        async patch(job, patch) {
          await rpc('ai_patch_job', { p_user: userId, p_job: job.id, p_patch: patch });
        },
        async attempt(job, stage) {
          const count = await rpc('ai_attempt', { p_user: userId, p_job: job.id, p_stage: stage });
          job.state[`${stage}_attempts`] = count;
          return count;
        },
        async upload(bucket, path, data, mime) {
          check(
            await admin.storage
              .from(bucket)
              .upload(path, data, { contentType: mime, upsert: true }),
          );
        },
        async save(job, transcript, analysis, context, imagePath, audioPath) {
          const report = currentReport(analysis.content_report, transcript, 1);
          const groundedAnalysis = {
            ...analysis,
            content_report: report,
            tags: acceptedTags(report),
            interpretations: {
              ...analysis.interpretations,
              neuroscience: educationalText(report, job.input.locale),
            },
          };
          await rpc('save_ai_dream', {
            p_user: userId,
            p_job: job.id,
            p_id: job.dream_id,
            p_input: {
              ...job.input,
              transcript,
              analysisSource: 'live',
              astrologyContext: context,
            },
            p_analysis: groundedAnalysis,
            p_image: imagePath,
            p_audio: audioPath,
          });
        },
        async finish(job, error) {
          await rpc('ai_finish_job', { p_user: userId, p_job: job.id, p_error: error ?? null });
        },
      };
      const result = await runJob(job, store, new LiveProviders(Deno.env.get('OPENAI_API_KEY')!));
      return reply(result, 'pending' in result ? 202 : 200);
    }
    if (body.action === 'resume') throw new ApiError('AI_NOT_CONFIGURED', 503);
    if (!body.transcript) throw new ApiError('INVALID_INPUT');
    const id = body.id ?? crypto.randomUUID();
    const old = check(
      await admin.from('dreams').select('*').eq('id', id).eq('user_id', userId).maybeSingle(),
    );
    if (body.action === 'update' && !old) throw new ApiError('NOT_FOUND', 404);
    if (old?.deletion_requested_at) throw new ApiError('DELETION_PENDING', 409);
    if (
      body.action === 'update' &&
      (body.expectedRevision !== old.transcript_revision ||
        body.transcript.trim() !== old.transcript)
    )
      throw new ApiError('REVISION_CONFLICT', 409);
    if (old && body.action === 'create') return reply({ id });
    const locale = body.locale ?? old?.content_locale ?? 'tr';
    const timezone = body.timezone ?? old?.capture_timezone ?? 'UTC';
    let date: string;
    try {
      date = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    } catch {
      throw new ApiError('INVALID_TIMEZONE');
    }
    const report = demoReport(body.transcript, 1);
    const analysis = analysisSchema.parse({
      ...mockAnalysis(body.transcript, locale),
      tags: acceptedTags(report),
      content_report: report,
    });
    analysis.interpretations.neuroscience = educationalText(report, locale);
    const imagePath = `${userId}/${id}/mock.png`;
    const kind = analysis.tags.includes('teeth')
      ? 'mirror'
      : analysis.tags.includes('falling')
        ? 'falling'
        : 'water';
    let audioPath = old?.audio_path ?? null;
    if (body.audio) {
      const audio = bytes(body.audio.base64);
      if (audio.length < 1 || audio.length > 5 * 1024 * 1024) throw new ApiError('INVALID_AUDIO');
      const ext =
        body.audio.mime === 'audio/webm' ? 'webm' : body.audio.mime === 'audio/wav' ? 'wav' : 'm4a';
      audioPath = `${userId}/${id}/capture.${ext}`;
      check(
        await admin.storage
          .from('dream-audio')
          .upload(audioPath, audio, { contentType: body.audio.mime, upsert: true }),
      );
    }
    if (body.inputMode === 'audio' && !audioPath) throw new ApiError('AUDIO_REQUIRED');
    check(
      await admin.storage
        .from('dream-images')
        .upload(imagePath, bytes(mockImages[kind]), { contentType: 'image/png', upsert: true }),
    );
    check(
      await admin.rpc('save_mock_dream', {
        p_user: userId,
        p_id: id,
        p_input: {
          transcript: body.transcript,
          inputMode: body.inputMode ?? old?.input_mode ?? 'text',
          dreamDate: body.dreamDate ?? old?.dream_date ?? date,
          timezone,
          locale,
        },
        p_analysis: analysis,
        p_image: imagePath,
        p_audio: audioPath,
      }),
    );
    return reply({ id });
  } catch (e) {
    return reply(
      {
        error: e instanceof ApiError || e instanceof PipelineError ? e.code : 'BACKEND_UNAVAILABLE',
      },
      e instanceof ApiError || e instanceof PipelineError ? e.status : 503,
    );
  } finally {
    if (claimed && userId) await admin.rpc('release_mutation', { p_user: userId, p_token: lease });
  }
});
