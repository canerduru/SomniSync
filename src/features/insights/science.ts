export const citations = {
  memory: {
    title: 'Sleep-dependent memory triage: evolving generalization through selective processing',
    authors: 'Robert Stickgold & Matthew P. Walker',
    journal: 'Nature Neuroscience',
    year: 2013,
    pmid: '23354387',
    doi: '10.1038/nn.3303',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23354387/',
    evidence: 'review',
  },
  emotion: {
    title: 'REM sleep depotentiates amygdala activity to previous emotional experiences',
    authors: 'Els van der Helm et al.',
    journal: 'Current Biology',
    year: 2011,
    pmid: '22119526',
    doi: '10.1016/j.cub.2011.10.052',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22119526/',
    evidence: 'experimental',
  },
  plasticity: {
    title:
      'Sleep and the price of plasticity: from synaptic and cellular homeostasis to memory consolidation and integration',
    authors: 'Giulio Tononi & Chiara Cirelli',
    journal: 'Neuron',
    year: 2014,
    pmid: '24411729',
    doi: '10.1016/j.neuron.2013.12.025',
    url: 'https://pubmed.ncbi.nlm.nih.gov/24411729/',
    evidence: 'hypothesis',
  },
} as const;
export const scienceTopics = ['memory', 'emotion', 'plasticity', 'symbolic'] as const;
export type ScienceTopic = (typeof scienceTopics)[number];
