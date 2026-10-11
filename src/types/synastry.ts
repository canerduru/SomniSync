/**
 * Dream Synastry & Anonymous Matching Types
 */

export interface CollectiveTagStat {
  tag: string;
  label: string;
  percentage: number;
  dreamCount: number;
}

export interface CollectiveSynastryData {
  timeWindowHours: number;
  totalDreamsSampled: number;
  topArchetypes: CollectiveTagStat[];
  activeMoonPhase: string;
  calculatedAt: string;
}

export interface AnonymousResonanceMatch {
  connectionId: string;
  otherUserAnonymousTag: string; // e.g. "Dreamer #8412"
  resonanceScore: number;         // 0 to 100 percentage
  sharedTags: string[];
  snippet?: string;              // Minimal masked archetype reflection
  recordedAt: string;
  status: 'pending' | 'acknowledged' | 'dismissed';
}
