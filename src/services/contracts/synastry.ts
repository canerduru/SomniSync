import type { AppLocale } from '@/i18n';
export interface AnonymousMatch {
  id: string;
  alias: string;
  sharedTags: string[];
  isDemo: boolean;
}
export type AggregateStats =
  | { status: 'insufficient_data' }
  | {
      status: 'ready';
      cohortSize: number;
      periodLabel: string;
      themes: { slug: string; percentage: number }[];
    };
export interface SynastryOverview {
  stats: AggregateStats;
  matches: AnonymousMatch[];
}
export interface SynastryService {
  getOverview(input: {
    aggregateConsent: boolean;
    matchingConsent: boolean;
    locale: AppLocale;
    eligibleDreams: { id: string; tags: string[] }[];
    signal?: AbortSignal;
  }): Promise<SynastryOverview>;
}
