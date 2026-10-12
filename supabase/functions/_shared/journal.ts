import { acceptedTags, currentReport } from './grounding.ts';
export const emotions = ['fear', 'joy', 'sadness', 'anger', 'calm', 'mixed', 'unknown'] as const;
export type Emotion = (typeof emotions)[number];
export type Journal = {
  sleepHours: number | null;
  sleepQuality: number | null;
  stressBeforeSleep: number | null;
  dreamEmotion: Emotion | null;
  wakingMood: Emotion | null;
  recurring: boolean | null;
  sleepDate: string;
  timezone: string;
  capturedAt: string;
};
const fields = [
  'sleepHours',
  'sleepQuality',
  'stressBeforeSleep',
  'dreamEmotion',
  'wakingMood',
  'recurring',
  'sleepDate',
  'timezone',
  'capturedAt',
];
export function parseJournal(value: unknown): Journal {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('INVALID_JOURNAL');
  const v = value as Record<string, unknown>;
  if (Object.keys(v).length !== fields.length || Object.keys(v).some((k) => !fields.includes(k)))
    throw new Error('INVALID_JOURNAL');
  for (const [key, min, max, integer] of [
    ['sleepHours', 0, 24, false],
    ['sleepQuality', 1, 5, true],
    ['stressBeforeSleep', 0, 4, true],
  ] as const) {
    const number = v[key];
    if (
      number !== null &&
      (typeof number !== 'number' ||
        !Number.isFinite(number) ||
        number < min ||
        number > max ||
        (integer && !Number.isInteger(number)))
    )
      throw new Error('INVALID_JOURNAL');
  }
  for (const key of ['dreamEmotion', 'wakingMood'])
    if (v[key] !== null && !emotions.includes(v[key] as Emotion))
      throw new Error('INVALID_JOURNAL');
  if (v.recurring !== null && typeof v.recurring !== 'boolean') throw new Error('INVALID_JOURNAL');
  if (
    typeof v.sleepDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(v.sleepDate) ||
    Number.isNaN(Date.parse(v.sleepDate)) ||
    new Date(v.sleepDate).toISOString().slice(0, 10) !== v.sleepDate ||
    typeof v.capturedAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T.*Z$/.test(v.capturedAt) ||
    Number.isNaN(Date.parse(v.capturedAt)) ||
    typeof v.timezone !== 'string' ||
    v.timezone.length > 100
  )
    throw new Error('INVALID_JOURNAL');
  let collectionDate: string;
  try {
    collectionDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: v.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(v.capturedAt));
  } catch {
    throw new Error('INVALID_JOURNAL');
  }
  if (v.sleepDate > collectionDate) throw new Error('INVALID_JOURNAL');
  return v as Journal;
}
export type JournalDream = {
  id: string;
  transcript: string | null;
  dream_date: string;
  status: string;
  analysis_source: string;
  deletion_requested_at: string | null;
  transcript_revision?: number;
  content_report?: unknown;
  journal?: unknown;
  event_confirmed?: boolean;
};
export function summarizeJournal(input: readonly JournalDream[]) {
  const seen = new Set<string>();
  const rows = input.filter((d) => {
    if (seen.has(d.id) || d.status !== 'ready' || d.deletion_requested_at) return false;
    seen.add(d.id);
    return true;
  });
  const groups = new Map<string, number>();
  for (const d of rows) {
    const key = `${d.dream_date}:${d.transcript?.trim()}`;
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  let possibleDuplicates = 0,
    grounded = 0,
    answered = 0,
    conflicting = 0,
    stressAnswered = 0,
    pairedRecords = 0,
    pursuitWithStressAnswer = 0;
  for (const d of rows) {
    if ((groups.get(`${d.dream_date}:${d.transcript?.trim()}`) ?? 0) > 1 && !d.event_confirmed) {
      possibleDuplicates++;
      continue;
    }
    const report = currentReport(d.content_report, d.transcript ?? '', d.transcript_revision ?? 1);
    if (report) grounded++;
    if (!d.journal) continue;
    let journal: Journal;
    try {
      journal = parseJournal(d.journal);
    } catch {
      conflicting++;
      continue;
    }
    if (journal.sleepDate !== d.dream_date) {
      conflicting++;
      continue;
    }
    answered++;
    if (journal.stressBeforeSleep !== null) stressAnswered++;
    if (journal.stressBeforeSleep !== null && report) {
      pairedRecords++;
      if (acceptedTags(report).includes('pursuit')) pursuitWithStressAnswer++;
    }
  }
  return {
    total: rows.length,
    eligible: rows.length - possibleDuplicates,
    grounded,
    answered,
    conflicting,
    possibleDuplicates,
    stressAnswered,
    pairedRecords,
    stressMissing: rows.length - possibleDuplicates - stressAnswered,
    pursuitWithStressAnswer,
    mixedSources: new Set(rows.map((d) => d.analysis_source)).size > 1,
  };
}
