import { demoReport } from '../supabase/functions/_shared/grounding';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seedDreams } from '../src/services/mock/data';
import { analyzeThemes, matchesTheme } from '../src/features/insights/themes';
import { citations, scienceTopics } from '../src/features/insights/science';
import {
  buildShareSvg,
  cardDimensions,
  cardLayout,
  titleLines,
} from '../src/features/sharing/card';

test('empty radar keeps all counts and percentages at zero without a dominant theme', () => {
  const result = analyzeThemes([], 'universal');
  assert.equal(result.total, 0);
  assert.equal(result.axes.length, 6);
  assert(result.axes.every((axis) => axis.count === 0 && axis.percentage === 0));
  assert.deepEqual(result.dominant, []);
});
test('radar counts distinct ready dreams and excludes pending and deleted entries', () => {
  const [base] = seedDreams('tr');
  assert(base);
  const result = analyzeThemes(
    [
      {
        ...base,
        id: 'one',
        transcript: 'Deniz gördüm. Uçuyordum.',
        content_report: demoReport('Deniz gördüm. Uçuyordum.', 1),
      },
      { ...base, id: 'one', tags: ['water'] },
      { ...base, id: 'two', transcript: 'Uçuyordum.', content_report: demoReport('Uçuyordum.', 1) },
      { ...base, id: 'pending', status: 'processing', tags: ['water'] },
      { ...base, id: 'deleted', deletion_requested_at: '2026-10-11T00:00:00Z' },
    ],
    'universal',
  );
  assert.equal(result.total, 2);
  assert.equal(result.axes.find((axis) => axis.id === 'water')?.count, 1);
  assert.equal(result.axes.find((axis) => axis.id === 'water')?.percentage, 50);
  assert.equal(result.axes.find((axis) => axis.id === 'flying')?.percentage, 100);
  assert.deepEqual(result.dominant, ['flying']);
});
test('theme matching uses exact saved tags and never transcript or generated interpretation', () => {
  const [base] = seedDreams('tr');
  assert(base);
  const dream = {
    ...base,
    tags: ['waterfall', 'not-water'],
    transcript: 'Düşündüm, su, falling, water',
    neuroscience_interpretation: 'water flying chase',
  };
  assert.equal(matchesTheme(dream, 'falling'), false);
  assert.equal(matchesTheme(dream, 'water'), false);
  assert.equal(matchesTheme(dream, 'unknown'), false);
  assert.equal(matchesTheme({ tags: ['ocean'] }, 'water'), true);
  assert.equal(matchesTheme({ tags: ['mirror'] }, 'transformation'), true);
});
test('ties preserve all dominant themes and symbolic mode has six explicit groups', () => {
  const [base] = seedDreams('tr');
  assert(base);
  assert.deepEqual(
    analyzeThemes(
      [
        {
          ...base,
          transcript: 'Deniz gördüm. Uçuyordum.',
          content_report: demoReport('Deniz gördüm. Uçuyordum.', 1),
        },
      ],
      'universal',
    ).dominant,
    ['flying', 'water'],
  );
  assert.equal(analyzeThemes([base], 'symbolic').axes.length, 6);
});
test('curated sources keep verified PubMed IDs/DOIs and no scientific source for symbolic reflection', () => {
  assert.equal(citations.memory.pmid, '23354387');
  assert.equal(citations.emotion.pmid, '22119526');
  assert.equal(citations.plasticity.pmid, '24411729');
  assert.equal(citations.emotion.doi, '10.1016/j.cub.2011.10.052');
  assert.equal(citations.plasticity.evidence, 'hypothesis');
  assert(scienceTopics.includes('symbolic'));
  assert.equal('symbolic' in citations, false);
  for (const source of Object.values(citations)) {
    assert.equal(source.url, `https://pubmed.ncbi.nlm.nih.gov/${source.pmid}/`);
    assert.match(source.doi, /^10\./);
  }
});
test('post and story share cards use exact geometry and preserve a bounded private payload', () => {
  const payload = {
    title: '<script> & "dream" '.repeat(30),
    tags: ['water'.repeat(50), 'home', 'flying', 'PRIVATE_TAG'],
    imageUri: 'data:image/png;base64,TEST',
    date: '2026-10-11',
    footer: 'A TRACE',
    demoLabel: 'DEMO',
    transcript: 'PRIVATE_TRANSCRIPT',
    user_id: 'PRIVATE_USER',
    neuroscience_interpretation: 'PRIVATE_ANALYSIS',
  };
  assert.deepEqual(cardDimensions('post'), { width: 1080, height: 1350 });
  assert.deepEqual(cardDimensions('story'), { width: 1080, height: 1920 });
  for (const format of ['post', 'story'] as const) {
    const svg = buildShareSvg({ ...payload, format });
    const layout = cardLayout({ ...payload, format });
    assert(svg.includes(`height="${cardDimensions(format).height}"`));
    assert(svg.includes('SOMNISYNC'));
    assert(svg.includes('&lt;script&gt;'));
    assert(!svg.includes('<script>'));
    for (const secret of ['PRIVATE_TRANSCRIPT', 'PRIVATE_USER', 'PRIVATE_ANALYSIS', 'PRIVATE_TAG'])
      assert(!svg.includes(secret));
    assert(layout.title.length <= 3);
    assert(layout.tags.length <= 60);
    assert(layout.titleY + 120 < layout.tagsY);
    assert(layout.tagsY < layout.footerY);
    assert(layout.footerY < layout.height);
  }
  assert(titleLines('x'.repeat(300)).every((line) => line.length <= 27));
  assert(!buildShareSvg({ ...payload, title: 'hello\u0000world' }).includes('\u0000'));
});
