import { useEffect, useState } from 'react';
import { services } from '@/services';
import { useDreams } from '@/features/dreams/DreamProvider';
import type { SynastryOverview } from '@/services/contracts/synastry';
export function useSynastry() {
  const store = useDreams();
  const [overview, setOverview] = useState<SynastryOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError(false);
    setOverview(null);
    void services.synastry
      .getOverview({
        aggregateConsent: store.aggregateConsent,
        matchingConsent: store.matchingConsent,
        locale: store.locale,
        eligibleDreams: store.dreams
          .filter((d) => d.matching_opt_in)
          .map((d) => ({ id: d.id, tags: d.tags })),
        signal: abort.signal,
      })
      .then((value) => {
        if (!abort.signal.aborted) setOverview(value);
      })
      .catch(() => {
        if (!abort.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [store.aggregateConsent, store.matchingConsent, store.locale, store.dreams, revision]);
  return { overview, loading, error, refresh: () => setRevision((n) => n + 1) };
}
