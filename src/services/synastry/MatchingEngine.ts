import { DreamRecord } from '../../types/dream';
import { AnonymousResonanceMatch } from '../../types/synastry';
import { calculateJaccardSimilarity } from '../../utils/tagNormalizer';

export interface SynastryCandidate {
  anonymousTag: string;
  dreamId: string;
  tags: string[];
  snippet: string;
  recordedAt: string;
}

export class MatchingEngine {
  // Pool of candidate archetypal reflections (anonymized dream themes)
  private candidatePool: SynastryCandidate[] = [
    {
      anonymousTag: 'Dreamer #8412',
      dreamId: 'cand-01',
      tags: ['obsidyen-merdiven', 'derin-sular', 'golge-arketipi', 'esik-anahtari'],
      snippet: 'Kararan ay altında bilinmeyen bir derinliğe doğru iniş ve buz kesen parmaklar...',
      recordedAt: '3 saat önce',
    },
    {
      anonymousTag: 'Dreamer #3190',
      dreamId: 'cand-02',
      tags: ['esik-anahtari', 'kararan-ay', 'monokrom-gokyuzu'],
      snippet: 'Sonsuz kapılar ve eski bronz bir mühür arayışı...',
      recordedAt: 'Dün gece',
    },
    {
      anonymousTag: 'Dreamer #9904',
      dreamId: 'cand-03',
      tags: ['derin-sular', 'kayip-ve-donusum'],
      snippet: 'Sualtında nefes alıp okyanusun dibindeki aynaya bakmak...',
      recordedAt: '6 saat önce',
    },
  ];

  calculateMatches(userDreams: DreamRecord[]): AnonymousResonanceMatch[] {
    const synastryEnabledDreams = userDreams.filter((d) => d.allowAnonymousSynastry);

    if (synastryEnabledDreams.length === 0) {
      return [];
    }

    // Combine all unique tags of current user
    const userTagSlugs = Array.from(
      new Set(synastryEnabledDreams.flatMap((d) => d.tags.map((t) => t.slug)))
    );

    if (userTagSlugs.length === 0) {
      return [];
    }

    const matches: AnonymousResonanceMatch[] = [];

    this.candidatePool.forEach((candidate, idx) => {
      const similarity = calculateJaccardSimilarity(userTagSlugs, candidate.tags);

      // Only match if at least 1 archetype overlaps (similarity > 0)
      if (similarity > 0) {
        const sharedSlugs = candidate.tags.filter((t) => userTagSlugs.includes(t));
        const sharedLabels = sharedSlugs.map((s) =>
          s
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
        );

        // Convert 0..1 Jaccard score to human percentage (boosted to 50%-98% range for resonance feel)
        const displayScore = Math.min(98, Math.round(50 + similarity * 48));

        matches.push({
          connectionId: `conn-${candidate.dreamId}-${idx}`,
          otherUserAnonymousTag: candidate.anonymousTag,
          resonanceScore: displayScore,
          sharedTags: sharedLabels,
          snippet: candidate.snippet,
          recordedAt: candidate.recordedAt,
          status: 'pending',
        });
      }
    });

    return matches.sort((a, b) => b.resonanceScore - a.resonanceScore);
  }
}

export const matchingEngine = new MatchingEngine();
