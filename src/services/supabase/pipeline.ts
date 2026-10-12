import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import type { DreamPipeline } from '../contracts/dream-pipeline';
import type { SupabaseDreamRepository } from './repository';
import { completeDream } from './client';
import { normalizedAudio } from './audio';
async function audioPayload(uri: string) {
  if (Platform.OS !== 'web') {
    const file = new File(uri);
    if (file.size > 5 * 1024 * 1024) throw new Error('INVALID_AUDIO');
    return { base64: await file.base64(), mime: 'audio/mp4' };
  }
  const blob = await normalizedAudio(uri);
  if (blob.size > 5 * 1024 * 1024) throw new Error('INVALID_AUDIO');
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]!);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  return { base64, mime: blob.type.split(';')[0] || 'audio/webm' };
}
export class SupabaseDreamPipeline implements DreamPipeline {
  constructor(private repository: SupabaseDreamRepository) {}
  async create(input: Parameters<DreamPipeline['create']>[0], onStage?: (stage: number) => void) {
    onStage?.(0);
    const audio = input.audioUri ? await audioPayload(input.audioUri) : undefined;
    onStage?.(1);
    const result = await completeDream(
      {
        action: 'create',
        id: input.id,
        transcript: input.transcript,
        locale: input.locale,
        inputMode: input.inputMode,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        audio,
        processingConsent: input.processingConsent,
      },
      input.signal,
      onStage,
    );
    onStage?.(3);
    const row = await this.repository.get(result.id!);
    if (!row) throw new Error('NOT_FOUND');
    return row;
  }
}
