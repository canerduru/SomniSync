/**
 * Live Edge Function AI Orchestrator
 * Calls the Supabase Edge Function `analyze-dream` (Whisper + GPT-4o-mini + Fal/Luma)
 * with graceful fallback to mock services if keys/endpoint are not yet set.
 */

import { ITranscriptionService, IInterpretationService, IImageService } from '../../../types/services';
import { MultiLensAnalysisResult } from '../../../types/dream';
import { mockTranscriptionService } from '../mock/MockTranscriptionService';
import { mockInterpretationService } from '../mock/MockInterpretationService';
import { mockImageService } from '../mock/MockImageService';

export class LiveEdgeFunctionService
  implements ITranscriptionService, IInterpretationService, IImageService
{
  private getEndpointUrl(): string {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl !== 'https://mock.supabase.co') {
      return `${supabaseUrl}/functions/v1/analyze-dream`;
    }
    return '/api/analyze-dream';
  }

  async transcribeAudio(audioBlob: Blob, language: string = 'tr'): Promise<string> {
    try {
      const endpoint = this.getEndpointUrl();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'dream.webm');
      formData.append('language', language);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          apikey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.transcript) {
          return data.transcript;
        }
      }
    } catch {
      // Graceful fallback to mock transcription
    }

    return mockTranscriptionService.transcribeAudio(audioBlob, language);
  }

  async analyzeDream(transcript: string, language: string = 'tr'): Promise<MultiLensAnalysisResult> {
    try {
      const endpoint = this.getEndpointUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
        },
        body: JSON.stringify({
          transcript,
          language,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.analysis && data.analysis.interpretations) {
          return data.analysis;
        }
      }
    } catch {
      // Graceful fallback to mock multi-lens analysis
    }

    return mockInterpretationService.analyzeDream(transcript, language);
  }

  async generateDreamVisual(prompt: string): Promise<string> {
    try {
      const endpoint = this.getEndpointUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '',
        },
        body: JSON.stringify({
          promptOnly: true,
          prompt,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          return data.imageUrl;
        }
      }
    } catch {
      // Graceful fallback to curated image visuals
    }

    return mockImageService.generateDreamVisual(prompt);
  }
}

export const liveEdgeFunctionService = new LiveEdgeFunctionService();
