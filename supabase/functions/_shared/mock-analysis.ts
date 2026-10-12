import { copy } from './mock-copy.ts';
export function normalizeTag(value: string): string {
  const plain = value
    .trim()
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]+/g, '_')
    .replace(/^_|_$/g, '');
  return (
    (
      {
        su: 'water',
        deniz: 'water',
        dusme: 'falling',
        dis: 'teeth',
        disler: 'teeth',
        ayna: 'mirror',
        ev: 'home',
        sessizlik: 'silence',
        merdiven: 'stairs',
        ay: 'moon',
      } as Record<string, string>
    )[plain] ?? plain
  );
}
export function mockAnalysis(transcript: string, locale: 'tr' | 'en') {
  const lower = transcript.toLocaleLowerCase('tr');
  const tags = /diş|teeth|mirror|ayna/.test(lower)
    ? ['dişler', 'ayna', 'sessizlik']
    : /düş|fall|merdiven|stair/.test(lower)
      ? ['düşme', 'merdiven', 'ay']
      : ['su', 'ev', 'sessizlik'];
  const text = copy[locale];
  return {
    image_prompt: `Monochrome cinematic dream, ${tags.map(normalizeTag).join(', ')}`,
    interpretations: { neuroscience: text.neuro, jungian: text.jung, astrological: text.astro },
    tags: [...new Set(tags.map(normalizeTag))],
  };
}
