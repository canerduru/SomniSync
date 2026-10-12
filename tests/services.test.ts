import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dreamAnalysisSchema } from '../src/schemas/dream-analysis';
import { MockDreamRepository } from '../src/services/mock/repository';
import { MockDreamPipeline } from '../src/services/mock/pipeline';
import { mockImage, mockInterpretation, mockTranscription } from '../src/services/mock/ai';
import type { InterpretationService } from '../src/services/contracts/interpretation';
import { buildShareSvg } from '../src/features/sharing/card';

const payload = {
  image_prompt: 'Monochrome moon above water',
  interpretations: { neuroscience: 'Memory', jungian: 'Shadow', astrological: 'Symbolic only' },
  tags: ['water', 'home', 'silence'],
};
test('analysis rejects missing lenses, duplicate or malformed tags and extra fields', () => {
  assert.equal(
    dreamAnalysisSchema.safeParse({ ...payload, interpretations: { neuroscience: 'Memory' } })
      .success,
    false,
  );
  assert.equal(
    dreamAnalysisSchema.safeParse({ ...payload, tags: ['water', 'water', 'home'] }).success,
    false,
  );
  assert.equal(
    dreamAnalysisSchema.safeParse({ ...payload, tags: ['Water', 'home', 'silence'] }).success,
    false,
  );
  assert.equal(dreamAnalysisSchema.safeParse({ ...payload, tags: [] }).success, true);
  assert.equal(dreamAnalysisSchema.safeParse({ ...payload, extra: 'unexpected' }).success, false);
});
test('pipeline creates a private ready entry without putting a URI in a database path', async () => {
  const repository = new MockDreamRepository();
  const pipeline = new MockDreamPipeline(repository, mockInterpretation, mockImage);
  const dream = await pipeline.create({
    transcript: 'Rüyamda merdivenden düşüyordum.',
    locale: 'tr',
    inputMode: 'text',
  });
  assert.equal(dream.status, 'ready');
  assert.equal(dream.aggregate_opt_in, false);
  assert.equal(dream.matching_opt_in, false);
  assert.equal(dream.content_locale, 'tr');
  assert.ok(dream.neuroscience_interpretation?.includes('kanıtlamaz'));
  assert.equal(dream.content_report?.extractor, 'rules-demo');
  assert.equal(
    dream.astrology_context &&
      typeof dream.astrology_context === 'object' &&
      'available' in dream.astrology_context &&
      dream.astrology_context.available,
    false,
  );
  assert.ok(dream.tags.includes('falling'));
  assert.ok(dream.imageUri?.startsWith('data:image/svg+xml'));
  assert.equal(dream.image_path, null);
  assert.equal(dream.audio_path, null);
  assert.equal((await repository.get(dream.id))?.id, dream.id);
});
test('aborted processing does not create a dream', async () => {
  const repository = new MockDreamRepository();
  const pipeline = new MockDreamPipeline(repository, mockInterpretation, mockImage);
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(
    pipeline.create({
      transcript: 'A private draft',
      locale: 'tr',
      inputMode: 'text',
      signal: abort.signal,
    }),
  );
  assert.equal((await repository.list()).dreams.length, 3);
});
test('invalid AI JSON is rejected before image generation or persistence', async () => {
  const repository = new MockDreamRepository();
  let imageCalled = false;
  const invalidService = {
    interpret: async () => ({ ...payload, tags: ['INVALID'] }),
  } as InterpretationService;
  const pipeline = new MockDreamPipeline(repository, invalidService, {
    generate: async () => {
      imageCalled = true;
      return { imageUri: '' };
    },
  });
  await assert.rejects(
    pipeline.create({ transcript: 'Private input', locale: 'tr', inputMode: 'text' }),
  );
  assert.equal(imageCalled, false);
  assert.equal((await repository.list()).dreams.length, 3);
});
test('image failure leaves no partially saved ready entry', async () => {
  const repository = new MockDreamRepository();
  const pipeline = new MockDreamPipeline(
    repository,
    { interpret: async () => payload },
    {
      generate: async () => {
        throw new Error('IMAGE_FAILED');
      },
    },
  );
  await assert.rejects(
    pipeline.create({ transcript: 'Private input', locale: 'tr', inputMode: 'text' }),
  );
  assert.equal((await repository.list()).dreams.length, 3);
});
test('text changes invalidate derived interpretation, themes and image', async () => {
  const repository = new MockDreamRepository();
  const dream = await repository.updateTranscript('demo-water', 'Different content');
  assert.equal(dream.status, 'draft');
  assert.equal(dream.neuroscience_interpretation, null);
  assert.equal(dream.imageUri, null);
  assert.equal(dream.image_prompt, null);
  assert.equal(dream.processed_at, null);
  assert.deepEqual(dream.tags, []);
});
test('mock transcription honors locale and supports cancellation', async () => {
  assert.ok(
    (
      await mockTranscription.transcribe({ audioUri: 'mock://recording', locale: 'en' })
    ).transcript.startsWith('I walked'),
  );
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(
    mockTranscription.transcribe({
      audioUri: 'mock://recording',
      locale: 'tr',
      signal: abort.signal,
    }),
  );
});
test('share card escapes input and contains only explicitly selected display fields', () => {
  const svg = buildShareSvg({
    title: '<script> & dream',
    tags: ['water'],
    imageUri: 'data:image/svg+xml,test',
    date: '2026-10-11',
    footer: 'A TRACE',
    demoLabel: 'DEMO',
  });
  assert.ok(svg.includes('&lt;script&gt;'));
  assert.equal(svg.includes('<script>'), false);
  assert.equal(svg.includes('neuroscience'), false);
  assert.equal(svg.includes('user_id'), false);
});

test('social mock never presents invented aggregate percentages as real data', async () => {
  const { mockSynastry } = await import('../src/services/mock/synastry');
  const overview = await mockSynastry.getOverview({
    aggregateConsent: true,
    matchingConsent: false,
    locale: 'tr',
    eligibleDreams: [],
  });
  assert.deepEqual(overview.stats, { status: 'insufficient_data' });
  assert.deepEqual(overview.matches, []);
});
test('matching requires both permissions and marks every example as fictional', async () => {
  const { mockSynastry } = await import('../src/services/mock/synastry');
  const input = {
    aggregateConsent: false,
    matchingConsent: true,
    locale: 'tr' as const,
    eligibleDreams: [{ id: 'demo-water', tags: ['water', 'home', 'silence'] }],
  };
  assert.equal(
    (await mockSynastry.getOverview({ ...input, matchingConsent: false })).matches.length,
    0,
  );
  assert.equal(
    (await mockSynastry.getOverview({ ...input, eligibleDreams: [] })).matches.length,
    0,
  );
  const matches = (await mockSynastry.getOverview(input)).matches;
  assert.equal(matches.length, 1);
  assert.equal(matches[0]?.isDemo, true);
  assert.deepEqual(matches[0]?.sharedTags, ['water', 'home', 'silence']);
});

test('Turkish and English resources expose the same translation keys', async () => {
  const { default: tr } = await import('../src/i18n/locales/tr.json');
  const { default: en } = await import('../src/i18n/locales/en.json');
  const keys = (value: Record<string, unknown>, prefix = ''): string[] =>
    Object.entries(value).flatMap(([key, child]) =>
      typeof child === 'object' && child
        ? keys(child as Record<string, unknown>, `${prefix}${key}.`)
        : [`${prefix}${key}`],
    );
  assert.deepEqual(keys(tr).sort(), keys(en).sort());
});
