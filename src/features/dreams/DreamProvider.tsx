import type { Journal } from '../../../supabase/functions/_shared/journal';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type PropsWithChildren,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthProvider';
import type { AppLocale } from '@/i18n';
import type { DreamEntry } from '@/types/dream';
import { services } from '@/services';
import { backendEnabled, client, dreamAction, completeDream } from '@/services/supabase/client';
const repository = services.repository;
function useDreamStore() {
  const { i18n } = useTranslation();
  const { session } = useAuth();
  const userId = session?.user.id;
  const locale: AppLocale = i18n.language === 'en' ? 'en' : 'tr';
  const [aiMode, setAiMode] = useState<'mock' | 'live' | 'unavailable' | 'loading'>(
    backendEnabled ? 'loading' : 'mock',
  );
  const [rawDreams, setDreams] = useState<DreamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [aggregateConsent, setAggregate] = useState(false);
  const [matchingConsent, setMatching] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const alive = useRef(true);
  const revision = useRef(0);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  const refresh = async () => {
    if (backendEnabled && !userId) {
      setLoading(false);
      return;
    }
    const request = ++revision.current;
    setLoading(true);
    setError(false);
    try {
      const collected: DreamEntry[] = [];
      let cursor: string | undefined;
      do {
        const result = await repository.list({ limit: 100, cursor });
        collected.push(...result.dreams);
        cursor = result.nextCursor;
        if (!alive.current || revision.current !== request) return;
      } while (cursor);
      if (alive.current && revision.current === request) setDreams(collected);
    } catch {
      if (alive.current && revision.current === request) setError(true);
    } finally {
      if (alive.current && revision.current === request) setLoading(false);
    }
  };
  useEffect(() => {
    void refresh();
    if (!backendEnabled || !userId) return;
    void dreamAction({ action: 'capabilities' })
      .then((result) => {
        if (alive.current) setAiMode(result.aiMode ?? 'unavailable');
      })
      .catch(() => {
        if (alive.current) setAiMode('unavailable');
      });
    void client()
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (!alive.current) return;
        if (error || !data) {
          setError(true);
          return;
        }
        setAggregate(!!data.aggregate_consent_at);
        setMatching(!!data.matching_consent_at);
        void i18n.changeLanguage(data.locale);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        if (data.timezone !== timezone)
          void client()
            .from('users')
            .update({ timezone })
            .eq('id', userId)
            .then(() => {});
      });
  }, [userId]);
  const dreams = useMemo(
    () => rawDreams.map((d) => services.presentDream(d, locale)),
    [rawDreams, locale],
  );
  const transcribe = (signal?: AbortSignal) =>
    services.transcription.transcribe({ audioUri: 'mock://recording', locale, signal });
  const create = async (
    transcript: string,
    inputMode: 'text' | 'audio',
    stage: (s: number) => void,
    signal?: AbortSignal,
    audioUri?: string,
    id?: string,
    processingConsent?: boolean,
  ) => {
    const dream = await services.pipeline.create(
      { transcript, locale, inputMode, signal, audioUri, id, processingConsent },
      stage,
    );
    await refresh();
    return dream;
  };
  const replaceDream = async (work: Promise<DreamEntry>) => {
    const updated = await work;
    if (alive.current)
      setDreams((prev) => prev.map((d) => (d.id === updated.id ? { ...updated } : d)));
    return updated;
  };
  const setConsent = async (id: string, values: { aggregate: boolean; matching: boolean }) => {
    const updated = await repository.setSocialConsent(id, values);
    if (alive.current) setDreams((prev) => prev.map((d) => (d.id === id ? updated : d)));
  };
  const remove = async (id: string) => {
    await repository.delete(id);
    if (alive.current) setDreams((prev) => prev.filter((d) => d.id !== id));
  };
  const clear = async () => {
    await repository.clear();
    if (alive.current) {
      setDreams([]);
      setAggregate(false);
      setMatching(false);
    }
  };
  const saveConsent = async (kind: 'aggregate' | 'matching', value: boolean) => {
    setConsentError(false);
    try {
      if (backendEnabled) {
        const { error } = await client()
          .from('users')
          .update(
            kind === 'aggregate'
              ? { aggregate_consent_at: value ? new Date().toISOString() : null }
              : { matching_consent_at: value ? new Date().toISOString() : null },
          )
          .eq('id', userId!)
          .select('id')
          .single();
        if (error) throw error;
      }
      if (alive.current) (kind === 'aggregate' ? setAggregate : setMatching)(value);
    } catch {
      if (alive.current) setConsentError(true);
    }
  };
  const setLanguage = async (value: AppLocale) => {
    if (backendEnabled) {
      const { error } = await client()
        .from('users')
        .update({ locale: value })
        .eq('id', userId!)
        .select('id')
        .single();
      if (error) throw error;
    }
    await i18n.changeLanguage(value);
  };
  return {
    dreams,
    aiMode,
    confirmEvent: (id: string, revision: number) =>
      replaceDream(repository.confirmEvent(id, revision)),
    revise: (id: string, transcript: string, expectedRevision: number) =>
      replaceDream(repository.updateTranscript(id, transcript, { expectedRevision })),
    analyze: (id: string, processingConsent: boolean) =>
      replaceDream(repository.analyze(id, { processingConsent })),
    saveJournal: (id: string, journal: Journal | null) =>
      replaceDream(repository.saveJournal(id, journal)),
    rejectObservation: (id: string, index: number, rejected: boolean, revision: number) =>
      replaceDream(repository.rejectObservation(id, index, rejected, revision)),
    async resume(id: string) {
      await completeDream({ action: 'resume', id });
      await refresh();
    },
    loading,
    error,
    refresh,
    transcribe,
    create,
    setConsent,
    remove,
    clear,
    aggregateConsent,
    matchingConsent,
    setAggregateConsent: (v: boolean) => {
      void saveConsent('aggregate', v);
    },
    setMatchingConsent: (v: boolean) => {
      void saveConsent('matching', v);
    },
    consentError,
    setLanguage,
    locale,
  };
}
type Store = ReturnType<typeof useDreamStore>;
const DreamContext = createContext<Store | null>(null);
function ScopedDreamProvider({ children }: PropsWithChildren) {
  const value = useDreamStore();
  return <DreamContext.Provider value={value}>{children}</DreamContext.Provider>;
}
export function DreamProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  return (
    <ScopedDreamProvider key={backendEnabled ? (session?.user.id ?? 'signed-out') : 'demo'}>
      {children}
    </ScopedDreamProvider>
  );
}
export function useDreams() {
  const context = useContext(DreamContext);
  if (!context) throw new Error('DreamProvider missing');
  return context;
}
