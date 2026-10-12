import i18n from '@/i18n';
import type { SynastryService } from '@/services/contracts/synastry';
import { wait } from './ai';
export const mockSynastry: SynastryService = {
  async getOverview({ matchingConsent, eligibleDreams, locale, signal }) {
    await wait(150, signal);
    const sharedTags = [...new Set(eligibleDreams.flatMap((d) => d.tags))].slice(0, 3);
    return {
      stats: { status: 'insufficient_data' },
      matches:
        matchingConsent && sharedTags.length
          ? [
              {
                id: 'fictional-match',
                alias: i18n.getFixedT(locale)('synastry.alias'),
                sharedTags,
                isDemo: true,
              },
            ]
          : [],
    };
  },
};
