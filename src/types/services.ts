/**
 * Service Abstraction Interfaces
 * Phase 2 & 3 will implement these with deterministic mock data.
 * Phase 4 will swap in live Whisper, GPT-4o-mini & Fal/Luma without touching any UI code.
 */

import { MultiLensAnalysisResult } from './dream';
import { CollectiveSynastryData, AnonymousResonanceMatch } from './synastry';

export interface ITranscriptionService {
  transcribeAudio(audioBlob: Blob, language?: string): Promise<string>;
}

export interface IInterpretationService {
  analyzeDream(transcript: string, language?: string): Promise<MultiLensAnalysisResult>;
}

export interface IImageService {
  generateDreamVisual(prompt: string): Promise<string>;
}

export interface ISynastryService {
  getCollectiveStats(timeWindowHours?: number): Promise<CollectiveSynastryData>;
  findResonanceMatches(userId: string): Promise<AnonymousResonanceMatch[]>;
  respondToMatch(connectionId: string, status: 'acknowledged' | 'dismissed'): Promise<void>;
}
