import {
  analysisSchema,
  PipelineError,
  redactImagePrompt,
  systemPrompt,
  type AiProviders,
  type Analysis,
} from './domain.ts';
import { LiveProviders, pngBytes } from './providers.ts';
import { calculateTransits } from './transits.ts';
import { validateAudio } from './audio.ts';
import { runJob, type Job, type JobStore } from './pipeline.ts';
function assert(value: unknown, message = 'Assertion failed'): asserts value {
  if (!value) throw new Error(message);
}
async function rejects(task: () => unknown | Promise<unknown>, code?: string) {
  try {
    await task();
  } catch (error) {
    assert(
      !code || (error instanceof Error && error.message === code),
      `Expected ${code}, got ${error instanceof Error ? error.message : 'unknown'}`,
    );
    return;
  }
  throw new Error('Expected rejection');
}
const analysis: Analysis = {
  image_prompt: 'Anonymous silhouette above a monochrome ocean, cinematic grain',
  interpretations: {
    neuroscience:
      'Belleğin gündelik deneyimleri birleştirmesini düşünmek için sembolik bir başlangıç.',
    jungian: 'Kendine sor: Bu imge uyanık hayatındaki hangi duyguyu çağrıştırıyor olabilir?',
    astrological:
      'Hesaplanan gökyüzü konumları bu sembolik düşünceye eşlik eder; kesin bir açıklama değildir.',
  },
  tags: ['water', 'home', 'silence'],
};
const context = calculateTransits(new Date('2026-03-20T15:00:00Z'));
const png = new Uint8Array(24);
png.set([137, 80, 78, 71, 13, 10, 26, 10]);
function wav(seconds: number) {
  const frames = Math.ceil(seconds * 16000);
  const bytes = new Uint8Array(44 + frames * 2);
  const view = new DataView(bytes.buffer);
  const text = (i: number, s: string) => {
    for (let k = 0; k < s.length; k++) bytes[i + k] = s.charCodeAt(k);
  };
  text(0, 'RIFF');
  view.setUint32(4, bytes.length - 8, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 16000, true);
  view.setUint32(28, 32000, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, frames * 2, true);
  return bytes;
}
function fixture() {
  const job: Job = {
    id: crypto.randomUUID(),
    dream_id: crypto.randomUUID(),
    user_id: crypto.randomUUID(),
    status: 'pending',
    input: {
      transcript: 'Rüyamda deniz gördüm.',
      locale: 'tr',
      inputMode: 'text',
      dreamDate: '2026-10-11',
      timezone: 'Europe/Istanbul',
      processingConsent: true,
    },
    state: {},
    created_at: new Date().toISOString(),
  };
  const calls = { transcribe: 0, interpret: 0, image: 0, save: 0, upload: 0, finish: 0 };
  const store: JobStore = {
    async patch(_j, patch) {
      Object.assign(job.state, patch);
    },
    async attempt(_j, stage) {
      const key = `${stage}_attempts`;
      const count = Number(job.state[key] ?? 0);
      if (count >= (stage === 'image' ? 1 : 2)) throw new PipelineError('ATTEMPTS_EXHAUSTED');
      job.state[key] = count + 1;
      return count + 1;
    },
    async upload() {
      calls.upload++;
    },
    async save() {
      calls.save++;
    },
    async finish(_j, error) {
      calls.finish++;
      job.status = error ? 'failed' : 'completed';
      if (!error) {
        job.input = {} as Job['input'];
        job.state = {};
      }
    },
  };
  const providers: AiProviders = {
    async transcribe() {
      calls.transcribe++;
      return 'Rüyamda deniz gördüm.';
    },
    async interpret() {
      calls.interpret++;
      return analysis;
    },
    async generateImage() {
      calls.image++;
      return { bytes: png, mime: 'image/png' };
    },
  };
  return { job, store, providers, calls };
}
Deno.test('strict analysis rejects extra fields and duplicate tags', async () => {
  await rejects(() => analysisSchema.parse({ ...analysis, extra: true }));
  await rejects(() => analysisSchema.parse({ ...analysis, tags: ['water', 'water', 'home'] }));
});
Deno.test('language is explicit and narratives are untrusted', () => {
  assert(systemPrompt('tr').includes('entirely in Turkish'));
  assert(systemPrompt('en').includes('entirely in English'));
  assert(systemPrompt('tr').includes('untrusted'));
});
Deno.test('image prompt removes email, URL and phone identifiers', () => {
  const result = redactImagePrompt('x@example.com https://example.com +90 555 123 45 67 sea');
  assert(!result.includes('@') && !result.includes('https:') && !result.includes('555'));
});
Deno.test('sky context calculates seven finite dated positions at March equinox', () => {
  assert(context.positions.length === 7);
  assert(context.positions.every((p) => p.longitude >= 0 && p.longitude < 360));
  const sun = context.positions.find((p) => p.body === 'sun')!;
  assert(sun.longitude < 1 || sun.longitude > 359);
  assert(context.calculated_at === '2026-03-20T15:00:00.000Z');
});
Deno.test('real WAV duration is accepted', async () => {
  assert((await validateAudio(wav(0.5), 'audio/wav')).duration === 0.5);
});
Deno.test('oversized, long and unknown audio rejected before paid calls', async () => {
  await rejects(() => validateAudio(wav(66), 'audio/wav'), 'INVALID_AUDIO_DURATION');
  await rejects(() => validateAudio(new Uint8Array(6 * 1024 * 1024), 'audio/wav'), 'INVALID_AUDIO');
  await rejects(() => validateAudio(new Uint8Array(100), 'audio/wav'), 'INVALID_AUDIO_DURATION');
});
Deno.test('text flow skips Whisper and splits image generation into another request', async () => {
  const f = fixture();
  assert('pending' in (await runJob(f.job, f.store, f.providers)));
  assert(f.calls.image === 0);
  const result = await runJob(f.job, f.store, f.providers);
  assert(
    result.id === f.job.dream_id &&
      f.calls.transcribe === 0 &&
      Number(f.calls.image) === 1 &&
      f.calls.save === 1,
  );
});
Deno.test('completed receipts do not call paid providers again', async () => {
  const f = fixture();
  await runJob(f.job, f.store, f.providers);
  await runJob(f.job, f.store, f.providers);
  await runJob(f.job, f.store, f.providers);
  assert(f.calls.interpret === 1 && f.calls.image === 1);
});
Deno.test('stored image resumes failed database commit without regeneration', async () => {
  const f = fixture();
  await runJob(f.job, f.store, f.providers);
  f.store.save = async () => {
    throw new Error('Database unavailable');
  };
  await rejects(() => runJob(f.job, f.store, f.providers), 'BACKEND_UNAVAILABLE');
  f.store.save = async () => {};
  await runJob(f.job, f.store, f.providers);
  assert(f.calls.interpret === 1 && f.calls.image === 1);
});
Deno.test('ambiguous image response is never repeated', async () => {
  const f = fixture();
  await runJob(f.job, f.store, f.providers);
  f.providers.generateImage = async () => {
    f.calls.image++;
    throw new PipelineError('PROVIDER_TIMEOUT', 503, true);
  };
  await rejects(() => runJob(f.job, f.store, f.providers), 'PROVIDER_TIMEOUT');
  await rejects(() => runJob(f.job, f.store, f.providers), 'PROVIDER_RESULT_UNKNOWN');
  assert(f.calls.image === 1 && f.calls.save === 0);
});
Deno.test('transient interpretation failure is retried at most twice', async () => {
  const f = fixture();
  f.providers.interpret = async () => {
    f.calls.interpret++;
    throw new PipelineError('PROVIDER_BUSY', 503, true);
  };
  await rejects(() => runJob(f.job, f.store, f.providers), 'PROVIDER_BUSY');
  await rejects(() => runJob(f.job, f.store, f.providers), 'ATTEMPTS_EXHAUSTED');
  assert(f.calls.interpret === 2 && f.calls.image === 0);
});
Deno.test('audio upload failure resumes without another Whisper request', async () => {
  const f = fixture();
  f.job.input.inputMode = 'audio';
  f.job.input.transcript = '';
  f.job.input.audio = { base64: btoa(String.fromCharCode(...wav(0.5))), mime: 'audio/wav' };
  f.store.upload = async () => {
    throw new Error('Storage unavailable');
  };
  await rejects(() => runJob(f.job, f.store, f.providers), 'BACKEND_UNAVAILABLE');
  f.store.upload = async () => {};
  await runJob(f.job, f.store, f.providers);
  await runJob(f.job, f.store, f.providers);
  assert(f.calls.transcribe === 1 && f.calls.save === 1);
});
Deno.test('explicit consent required before provider calls', async () => {
  const f = fixture();
  f.job.input.processingConsent = false as true;
  await rejects(() => runJob(f.job, f.store, f.providers), 'PROCESSING_CONSENT_REQUIRED');
  assert(f.calls.interpret === 0 && f.calls.image === 0);
});
Deno.test('expired jobs fail before paid calls', async () => {
  const f = fixture();
  f.job.created_at = '2026-01-01T00:00:00Z';
  await rejects(() => runJob(f.job, f.store, f.providers), 'JOB_EXPIRED');
  assert(f.calls.interpret === 0 && f.job.status === 'failed');
});
Deno.test('requests preserve GPT model, strict schema and store false', async () => {
  let body: Record<string, unknown> = {};
  const request: typeof fetch = async (_url, init) => {
    body = JSON.parse(String(init?.body));
    return Response.json({
      choices: [
        {
          finish_reason: 'stop',
          message: { content: JSON.stringify({ ...analysis, observations: [] }) },
        },
      ],
    });
  };
  const providers = new LiveProviders('fixture-openai', request);
  await providers.interpret('A dream', 'tr', context);
  assert(body.model === 'gpt-4o-mini' && body.store === false);
  assert((body.response_format as { json_schema: { strict: boolean } }).json_schema.strict);
});
Deno.test('refusal and malformed JSON are rejected', async () => {
  const refused = new LiveProviders('x', async () =>
    Response.json({ choices: [{ message: { refusal: 'No' } }] }),
  );
  await rejects(() => refused.interpret('Dream', 'tr', context), 'AI_REFUSED');
  const invalid = new LiveProviders('x', async () =>
    Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{}' } }] }),
  );
  await rejects(() => invalid.interpret('Dream', 'tr', context), 'INVALID_AI_OUTPUT');
});
Deno.test('image request uses one low-quality portrait and inline PNG', async () => {
  let captured: RequestInit | undefined;
  const provider = new LiveProviders('x', async (url, init) => {
    assert(String(url) === 'https://api.openai.com/v1/images/generations');
    captured = init;
    return Response.json({ data: [{ b64_json: btoa(String.fromCharCode(...png)) }] });
  });
  const result = await provider.generateImage(analysis.image_prompt);
  assert(result.bytes.length === 24);
  const body = JSON.parse(String(captured?.body));
  assert(
    body.model === 'gpt-image-2' &&
      body.n === 1 &&
      body.quality === 'low' &&
      body.size === '1024x1536' &&
      body.moderation === 'auto',
  );
});
Deno.test('malformed media and URL responses fail closed', async () => {
  await rejects(() => pngBytes(new Uint8Array(24)));
  const provider = new LiveProviders('x', async () =>
    Response.json({ data: [{ url: 'http://127.0.0.1/admin' }] }),
  );
  await rejects(() => provider.generateImage('Dream'), 'INVALID_PROVIDER_IMAGE');
});
Deno.test('quota exhaustion and moderation are stable non-retryable errors', async () => {
  const provider = new LiveProviders('x', async () =>
    Response.json({ error: { code: 'insufficient_quota' } }, { status: 429 }),
  );
  await rejects(() => provider.interpret('Dream', 'tr', context), 'AI_QUOTA_EXCEEDED');
  const blocked = new LiveProviders('x', async () =>
    Response.json({ error: { code: 'moderation_blocked' } }, { status: 400 }),
  );
  await rejects(() => blocked.generateImage('Dream'), 'IMAGE_BLOCKED');
});

Deno.test(
  'live response tags and neuroscience are derived server-side from grounded candidates',
  async () => {
    const raw = {
      ...analysis,
      tags: ['water', 'home', 'silence'],
      interpretations: {
        ...analysis.interpretations,
        neuroscience: 'Your amygdala is healed with a 95 percent confidence.',
      },
      observations: [
        {
          tag: 'fear',
          quote: 'Korktum.',
          polarity: 'positive',
          literal: true,
          context: 'dream',
          experiencer: 'narrator',
        },
        {
          tag: 'flying',
          quote: 'Uçuyordum.',
          polarity: 'positive',
          literal: true,
          context: 'dream',
          experiencer: 'narrator',
        },
      ],
    };
    const provider = new LiveProviders('fixture', async () =>
      Response.json({
        choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(raw) } }],
      }),
    );
    const result = await provider.interpret('Korktum.', 'tr', context);
    assert(JSON.stringify(result.tags) === '["fear"]');
    assert(!result.interpretations.neuroscience.includes('95'));
    assert(result.interpretations.neuroscience.includes('ölçmez'));
  },
);
