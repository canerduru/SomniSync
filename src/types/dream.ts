/**
 * Domain-level Dream Types & Multi-Lens Models
 * Enhanced with rigorous Scientific & Biomedical Literature Grounding
 */

export type LensType = 'neuroscience' | 'jungian' | 'astrological' | 'scientific_basis';

export interface ScientificCitation {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  pmid: string;
  doi?: string;
  keyFinding: string;
  evidenceLevel: 'Experimental EEG/fMRI' | 'Computational Model' | 'Evolutionary Hypothesis' | 'Clinical Study';
  url: string;
}

export interface NeurobiologicalProfile {
  sleepStage: 'REM Sleep (Phasic)' | 'REM Sleep (Tonic)' | 'NREM Slow-Wave (N3)' | 'Hypnagogic (N1)';
  eegBand: 'Theta (4–8 Hz)' | 'Gamma (30–80 Hz)' | 'PGO Waves' | 'Delta (<4 Hz)';
  neurotransmitters: {
    acetylcholine: 'High' | 'Normal' | 'Low';
    noradrenaline: 'Suppressed (Near Zero)' | 'Normal' | 'Elevated';
    serotonin: 'Suppressed' | 'Normal';
    dopamine: 'Active (Mesolimbic)' | 'Normal';
  };
  brainRegions: string[];
  primaryHypothesis: string;
}

export interface DreamInterpretations {
  neuroscience: string; // Hippocampal-neocortical consolidation, emotional uncoupling, neural replay
  jungian: string;      // Cognitive & evolutionary archetype integration (Threat simulation, metaphor theory)
  astrological: string; // Circadian chronobiology & planetary symbolic resonance
  scientificBasis?: {
    neuroProfile: NeurobiologicalProfile;
    citations: ScientificCitation[];
    cognitiveModel: string;
  };
}

export interface DreamTag {
  id: string;
  slug: string;
  label: string;
}

export interface DreamRecord {
  id: string;
  userId: string;
  rawTranscript: string;
  audioUrl?: string;
  imageUrl?: string;
  imagePrompt?: string;
  interpretations: DreamInterpretations;
  tags: DreamTag[];
  isPrivate: boolean;
  allowAnonymousSynastry: boolean;
  recordedAt: string;
  createdAt: string;
}

export interface MultiLensAnalysisResult {
  imagePrompt: string;
  interpretations: DreamInterpretations;
  tags: {
    slug: string;
    labelTr: string;
    labelEn: string;
  }[];
}

export interface DreamCreationPayload {
  rawTranscript: string;
  audioBlob?: Blob;
  allowAnonymousSynastry?: boolean;
}
