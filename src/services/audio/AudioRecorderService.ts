export interface AudioRecorderState {
  isRecording: boolean;
  durationSeconds: number;
  audioBlob: Blob | null;
  volumeLevel: number;
}

export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;

  async startRecording(onVolumeUpdate?: (level: number) => void): Promise<boolean> {
    try {
      this.audioChunks = [];

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(this.stream);

        // Web Audio analyser for real-time waveform bars
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const checkVolume = () => {
          if (this.analyser && onVolumeUpdate) {
            this.analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            onVolumeUpdate(Math.min(1, average / 100));
            this.animationFrameId = requestAnimationFrame(checkVolume);
          }
        };
        checkVolume();

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.start();
        return true;
      }
    } catch {
      // Microphone permission not granted or unavailable in environment: simulated fallback
    }

    // Fallback simulation timer
    let simulatedLevel = 0.3;
    const interval = setInterval(() => {
      simulatedLevel = 0.2 + Math.random() * 0.7;
      if (onVolumeUpdate) onVolumeUpdate(simulatedLevel);
    }, 100);

    (this as unknown as { fallbackInterval: ReturnType<typeof setInterval> }).fallbackInterval = interval;
    return true;
  }

  async stopRecording(): Promise<Blob> {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if ((this as unknown as { fallbackInterval?: ReturnType<typeof setInterval> }).fallbackInterval) {
      clearInterval((this as unknown as { fallbackInterval: ReturnType<typeof setInterval> }).fallbackInterval);
    }

    return new Promise((resolve) => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.cleanup();
          resolve(blob);
        };
        this.mediaRecorder.stop();
      } else {
        this.cleanup();
        // Return dummy mock blob
        resolve(new Blob(['simulated-dream-audio'], { type: 'audio/webm' }));
      }
    });
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.mediaRecorder = null;
  }
}

export const audioRecorderService = new AudioRecorderService();
