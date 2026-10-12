import type { RefObject } from 'react';
import type { View } from 'react-native';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { cardDimensions, type CardPayload } from './card';
export async function exportCard(ref: RefObject<View | null>, payload: CardPayload) {
  if (!(await Sharing.isAvailableAsync())) throw new Error('SHARING_UNAVAILABLE');
  const uri = await captureRef(ref, {
    format: 'png',
    quality: 1,
    result: 'tmpfile',
    ...cardDimensions(payload.format),
  });
  try {
    await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
  } finally {
    releaseCapture(uri);
  }
}
