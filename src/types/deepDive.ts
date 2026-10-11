/**
 * Domain types for the Neuro-Jungian Scientific Deep-Dive Module
 * Bridges Jungian Analytical Psychology with Modern Cognitive Neuroscience
 */

import { ScientificCitation } from './dream';

export interface BrainCircuitDetail {
  region: string;
  functionalRole: string;
  activityInDream: 'Hyperactive' | 'Hypoactive' | 'Synchronized' | 'Suppressed';
  neurotransmitterState: string;
}

export interface CognitiveJungianConcept {
  jungianConcept: string; // e.g. "Gölge (Shadow)", "Kolektif Bilinçdışı", "Bireyleşme"
  neurobiologicalCounterpart: string; // e.g. "Amigdala ve ventromedial PFC baskılaması"
  evolutionaryFunction: string; // e.g. "Revonsuo Tehdit Simülasyonu"
  psychicIntegrationAdvice: string;
}

export interface NeuroJungianConvergence {
  coreThesis: string;
  subcorticalMapping: string;
  corticalNarration: string;
  therapeuticImplication: string;
}

export interface ScientificDeepDiveData {
  primaryModelTitle: string;
  executiveSummary: string;
  neurobiologicalDetail: {
    hippocampalReplayMechanism: string;
    synapticHomeostasisState: string;
    noradrenalineZeroState: string;
    circadianPhase: string;
    brainCircuits: BrainCircuitDetail[];
  };
  jungianCognitiveDetail: {
    activeArchetypes: string[];
    evolutionaryPreparednessTheory: string;
    embodiedMetaphorInterpretation: string;
    shadowWorkIntegration: string;
    archetypeConcepts: CognitiveJungianConcept[];
  };
  neuroJungianBridge: NeuroJungianConvergence;
  scholarlyCitations: ScientificCitation[];
}
