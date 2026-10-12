import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { File } from 'expo-file-system';
export function discardAudio(uri?: string) {
  if (!uri) return;
  try {
    if (Platform.OS === 'web') URL.revokeObjectURL(uri);
    else {
      const file = new File(uri);
      if (file.exists) file.delete();
    }
  } catch {
    /* Temporary files are also managed by the OS cache. */
  }
}
export function useVoiceCapture(onComplete: (uri: string) => void, onError: () => void) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);
  const wanted = useRef(false);
  const preparing = useRef(false);
  const active = useRef(false);
  const alive = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const end = async (keep = true) => {
    wanted.current = false;
    if (timer.current) clearTimeout(timer.current);
    if (!active.current) return;
    active.current = false;
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      const uri = recorder.uri;
      if (uri && keep && alive.current) onComplete(uri);
      else discardAudio(uri ?? undefined);
    } catch {
      if (alive.current) onError();
    } finally {
      if (alive.current) setRecording(false);
    }
  };
  const begin = async () => {
    if (active.current || preparing.current) return;
    wanted.current = true;
    preparing.current = true;
    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) throw new Error('MICROPHONE_DENIED');
      if (!wanted.current || !alive.current) return;
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      if (!wanted.current || !alive.current) {
        await recorder.stop();
        discardAudio(recorder.uri ?? undefined);
        await setAudioModeAsync({ allowsRecording: false });
        return;
      }
      recorder.record();
      active.current = true;
      setRecording(true);
      timer.current = setTimeout(() => {
        void end();
      }, 60000);
    } catch {
      if (alive.current) onError();
    } finally {
      preparing.current = false;
    }
  };
  useEffect(() => {
    alive.current = true;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') void end(false);
    });
    return () => {
      alive.current = false;
      sub.remove();
      void end(false);
    };
  }, []);
  return { begin, end, recording };
}
