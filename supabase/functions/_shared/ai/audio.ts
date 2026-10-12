import { parseBuffer } from 'npm:music-metadata@12.1.0';
import { PipelineError, type AudioInput } from './domain.ts';
export async function validateAudio(bytes: Uint8Array, mime: string): Promise<AudioInput> {
  if (bytes.length < 44 || bytes.length > 5 * 1024 * 1024)
    throw new PipelineError('INVALID_AUDIO', 400);
  try {
    const metadata = await parseBuffer(
      bytes,
      { mimeType: mime, size: bytes.length },
      { duration: true, skipCovers: true },
    );
    const duration = metadata.format.duration;
    if (!duration || !Number.isFinite(duration) || duration < 0.3 || duration > 65)
      throw new Error('INVALID_DURATION');
    // Unsupported/unknown durations fail closed before the paid transcription request.
    if (!metadata.format.codec || !metadata.format.sampleRate) throw new Error('INVALID_CODEC');
    return { bytes, mime, duration };
  } catch {
    throw new PipelineError('INVALID_AUDIO_DURATION', 400);
  }
}
