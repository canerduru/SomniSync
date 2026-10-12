// Normalize browser recordings because some WebM recorders omit duration metadata.
export async function normalizedAudio(uri: string): Promise<Blob> {
  const original = await (await fetch(uri)).blob();
  if (original.size > 5 * 1024 * 1024) throw new Error('INVALID_AUDIO');
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(await original.arrayBuffer());
    if (!Number.isFinite(decoded.duration) || decoded.duration < 0.3 || decoded.duration > 65)
      throw new Error('INVALID_AUDIO_DURATION');
    const frames = Math.ceil(decoded.duration * 16000);
    const offline = new OfflineAudioContext(1, frames, 16000);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const samples = (await offline.startRendering()).getChannelData(0);
    const data = new ArrayBuffer(44 + frames * 2);
    const view = new DataView(data);
    const text = (at: number, value: string) => {
      for (let i = 0; i < value.length; i++) view.setUint8(at + i, value.charCodeAt(i));
    };
    text(0, 'RIFF');
    view.setUint32(4, data.byteLength - 8, true);
    text(8, 'WAVE');
    text(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 16000, true);
    view.setUint32(28, 32000, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    text(36, 'data');
    view.setUint32(40, frames * 2, true);
    for (let i = 0; i < frames; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]!));
      view.setInt16(44 + i * 2, sample < 0 ? sample * 32768 : sample * 32767, true);
    }
    return new Blob([data], { type: 'audio/wav' });
  } finally {
    await context.close();
  }
}
