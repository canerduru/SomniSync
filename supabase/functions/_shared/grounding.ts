// Pure domain code shared by Expo and Edge. A valid quote establishes provenance,
// not semantic truth: live extraction still requires human benchmark evaluation.
export const observationTags = [
  'flying',
  'falling',
  'water',
  'teeth',
  'pursuit',
  'maze',
  'home',
  'stairs',
  'mirror',
  'door',
  'fear',
  'joy',
  'sadness',
] as const;
export type Candidate = {
  tag: string;
  quote: string;
  polarity: 'positive' | 'negative' | 'uncertain';
  literal: boolean;
  context: 'dream' | 'waking' | 'uncertain';
  experiencer: 'narrator' | 'other' | 'unknown';
};
export type Observation = Candidate & { start: number; end: number; rejected: boolean };
export type ContentReport = {
  schemaVersion: 1;
  revision: number;
  extractor: 'llm' | 'rules-demo';
  model: string;
  promptVersion: 'grounded-v1';
  catalogVersion: '2026-10-12';
  observations: Observation[];
};
const blocked = (quote: string) =>
  /(?:m[ıiuü]yordu|m[ıiuü]yorum|mad[ıi]|med[ıi]|değil|\byok\b|kimse|hatırlamıyorum|\bnot\b|\bnever\b|\bno one\b|didn't|wasn't|mutluluktan havalara|sevinçten uç|over the moon|on cloud nine)/iu.test(
    quote,
  );
const waking = (quote: string) => /uyanıkken|uyandıktan|\bawake\b|after waking/iu.test(quote);
export function groundCandidates(
  transcript: string,
  candidates: readonly Candidate[],
  revision: number,
  extractor: ContentReport['extractor'],
  model = extractor === 'llm' ? 'gpt-4o-mini' : 'conservative-rules-v1',
): ContentReport {
  const observations: Observation[] = [];
  const seen = new Set<string>();
  for (const candidate of candidates.slice(0, 40)) {
    if (
      !observationTags.includes(candidate.tag as (typeof observationTags)[number]) ||
      typeof candidate.quote !== 'string' ||
      !candidate.quote.trim() ||
      candidate.quote.length > 1500 ||
      !['positive', 'negative', 'uncertain'].includes(candidate.polarity) ||
      typeof candidate.literal !== 'boolean' ||
      !['dream', 'waking', 'uncertain'].includes(candidate.context) ||
      !['narrator', 'other', 'unknown'].includes(candidate.experiencer)
    )
      continue;
    const start = transcript.indexOf(candidate.quote);
    if (start < 0 || transcript.indexOf(candidate.quote, start + 1) >= 0) continue;
    const key = `${candidate.tag}:${start}:${candidate.quote.length}`;
    if (seen.has(key)) continue;
    seen.add(key);
    observations.push({
      tag: candidate.tag,
      quote: candidate.quote,
      literal: candidate.literal,
      experiencer: candidate.experiencer,
      polarity: blocked(candidate.quote) ? 'uncertain' : candidate.polarity,
      context: waking(candidate.quote) ? 'waking' : candidate.context,
      start,
      end: start + candidate.quote.length,
      rejected: false,
    });
  }
  return {
    schemaVersion: 1,
    revision,
    extractor,
    model,
    promptVersion: 'grounded-v1',
    catalogVersion: '2026-10-12',
    observations,
  };
}
export function acceptedTags(report: ContentReport | null): string[] {
  return [
    ...new Set(
      (report?.observations ?? [])
        .filter(
          (o) =>
            !o.rejected &&
            o.polarity === 'positive' &&
            o.literal &&
            o.context === 'dream' &&
            o.experiencer === 'narrator',
        )
        .map((o) => o.tag),
    ),
  ]
    .sort()
    .slice(0, 6);
}
export function currentReport(
  value: unknown,
  transcript: string,
  revision: number,
): ContentReport | null {
  if (!value || typeof value !== 'object') return null;
  const report = value as ContentReport;
  if (
    report.schemaVersion !== 1 ||
    report.revision !== revision ||
    !['llm', 'rules-demo'].includes(report.extractor) ||
    report.promptVersion !== 'grounded-v1' ||
    report.catalogVersion !== '2026-10-12' ||
    !Array.isArray(report.observations) ||
    report.observations.length > 40
  )
    return null;
  for (const o of report.observations) {
    if (
      !o ||
      !Number.isInteger(o.start) ||
      !Number.isInteger(o.end) ||
      o.start < 0 ||
      o.end <= o.start ||
      transcript.slice(o.start, o.end) !== o.quote ||
      typeof o.rejected !== 'boolean'
    )
      return null;
    if (
      !observationTags.includes(o.tag as (typeof observationTags)[number]) ||
      !['positive', 'negative', 'uncertain'].includes(o.polarity) ||
      typeof o.literal !== 'boolean' ||
      !['dream', 'waking', 'uncertain'].includes(o.context) ||
      !['narrator', 'other', 'unknown'].includes(o.experiencer)
    )
      return null;
  }
  return report;
}
// Deliberately narrow: this is a demo, never a substitute for live NLP evaluation.
const rules: readonly [string, RegExp][] = [
  ['pursuit', /beni\s+(?:bir\S*\s+){0,2}koval(?:ıyor|adı)|i was (?:being )?chased/iu],
  ['flying', /(?<!\p{L})uçuyordum|(?<!\p{L})uçtum|i was flying/iu],
  ['falling', /\bdüştüm|\bdüşüyordum|i was falling|i fell/iu],
  [
    'water',
    /\bdeniz\S*|\bnehir\S*|\bokyanus\S*|\bsu(?:yun|ya|da)?\b|\bsea\b|\briver\b|\bwater\b/iu,
  ],
  ['teeth', /\bdiş(?:im|lerim)\S*|my teeth/iu],
  ['home', /\bev(?:de|im|imi|ime|in)\S*|\bhome\b|my house/iu],
  ['stairs', /\bmerdiven\S*|\bstairs\b/iu],
  ['mirror', /\bayna\S*|\bmirror\b/iu],
  ['door', /\bkapı\S*|\bdoor\b/iu],
  ['maze', /\blabirent\S*|\bmaze\b/iu],
  ['fear', /\bkorktum|\bkorkuyordum|i (?:was|felt) (?:afraid|scared)/iu],
  ['joy', /\bmutluydum|\bsevindim|i (?:was|felt) happy/iu],
  ['sadness', /(?<!\p{L})üzüldüm|(?<!\p{L})üzgündüm|i (?:was|felt) sad/iu],
];
export function demoReport(transcript: string, revision: number): ContentReport {
  const candidates: Candidate[] = [];
  const sentences = transcript.match(/[^.!?\n]+[.!?]?/gu) ?? [];
  for (const sentence of sentences) {
    const quote = sentence.trim();
    if (
      blocked(quote) ||
      waking(quote) ||
      /talimat|DOI|instructions|ignore previous|dedi|diyordu|diye|söyledi|bağırdı|\bsaid\b|\bsays\b|["“”«»]/iu.test(
        quote,
      )
    )
      continue;
    for (const [tag, pattern] of rules)
      if (pattern.test(quote))
        candidates.push({
          tag,
          quote,
          polarity: 'positive',
          literal: true,
          context: 'dream',
          experiencer: 'narrator',
        });
  }
  return groundCandidates(transcript, candidates, revision, 'rules-demo');
}
