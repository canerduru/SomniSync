import { acceptedTags, type ContentReport } from './grounding.ts';
export type KnowledgeEntry = {
  id: string;
  active: boolean;
  scope: 'general_education';
  topic: 'memory' | 'emotion' | 'plasticity';
  title: string;
  pmid: string;
  doi: string;
  url: string;
  evidence: 'review' | 'experimental' | 'hypothesis';
  summary: { tr: string; en: string };
  limit: { tr: string; en: string };
};
// Original brief educational paraphrases; no third-party article body is stored.
// Reviewed 2026-10-12. Disable an entry here when its evidence needs re-review.
export const knowledgeCatalog: readonly KnowledgeEntry[] = [
  {
    id: 'memory-23354387',
    active: true,
    scope: 'general_education',
    topic: 'memory',
    title: 'Sleep-dependent memory triage: evolving generalization through selective processing',
    pmid: '23354387',
    doi: '10.1038/nn.3303',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23354387/',
    evidence: 'review',
    summary: {
      tr: 'Bu derleme, uykuda anıların seçici işlenmesi ve genellenmesi üzerine bir çerçeve sunar.',
      en: 'This review presents a framework for selective processing and generalization of memories during sleep.',
    },
    limit: {
      tr: 'Rüyandaki belirli bir sahnenin hangi anıdan geldiğini veya işlevini kanıtlamaz.',
      en: 'It does not establish which memory caused a particular dream scene or what that scene does.',
    },
  },
  {
    id: 'emotion-22119526',
    active: true,
    scope: 'general_education',
    topic: 'emotion',
    title: 'REM sleep depotentiates amygdala activity to previous emotional experiences',
    pmid: '22119526',
    doi: '10.1016/j.cub.2011.10.052',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22119526/',
    evidence: 'experimental',
    summary: {
      tr: 'Bu deneysel çalışma, REM uykusu ile önceden görülen duygusal uyaranlara verilen tepkinin değişimini araştırır.',
      en: 'This experiment investigates REM sleep and changes in responses to previously viewed emotional stimuli.',
    },
    limit: {
      tr: 'Rüya metni REM evresini, amigdala aktivitesini veya duygusal iyileşmeyi ölçmez.',
      en: 'A dream report does not measure REM stage, amygdala activity or emotional recovery.',
    },
  },
  {
    id: 'plasticity-24411729',
    active: true,
    scope: 'general_education',
    topic: 'plasticity',
    title:
      'Sleep and the price of plasticity: from synaptic and cellular homeostasis to memory consolidation and integration',
    pmid: '24411729',
    doi: '10.1016/j.neuron.2013.12.025',
    url: 'https://pubmed.ncbi.nlm.nih.gov/24411729/',
    evidence: 'hypothesis',
    summary: {
      tr: 'Bu perspektif yazısı, uyku ve sinaptik homeostaz hipotezini bellek süreçleriyle ilişkilendirir.',
      en: 'This perspective relates the synaptic homeostasis hypothesis to sleep and memory processes.',
    },
    limit: {
      tr: 'Bu bir hipotez çerçevesidir; kişisel rüyandan sinaps değişimi hesaplanamaz.',
      en: 'This is a hypothesis framework; synaptic changes cannot be calculated from your dream.',
    },
  },
];
export function selectKnowledge(
  report: ContentReport | null,
  catalog: readonly KnowledgeEntry[] = knowledgeCatalog,
): KnowledgeEntry[] {
  if (!report) return [];
  const tags = acceptedTags(report);
  const topics = tags.some((t) => ['fear', 'joy', 'sadness'].includes(t))
    ? ['memory', 'emotion']
    : ['memory'];
  return catalog.filter(
    (s) => s.active && s.scope === 'general_education' && topics.includes(s.topic),
  );
}
export function educationalText(report: ContentReport | null, locale: 'tr' | 'en'): string {
  return (
    selectKnowledge(report)
      .map((source) => `${source.summary[locale]} ${source.limit[locale]}`)
      .join('\n\n') ||
    (locale === 'tr'
      ? 'Bu kayıttan kişisel bir bilimsel açıklama belirlenemez.'
      : 'A personal scientific explanation cannot be determined from this report.')
  );
}
