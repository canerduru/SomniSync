import type { RefObject } from 'react';
import type { View } from 'react-native';
import { buildShareSvg, cardDimensions, type CardPayload } from './card';
export async function exportCard(_ref: RefObject<View | null>, payload: CardPayload) {
  // SVG image documents cannot load external images; embed private bytes before export.
  if (payload.imageUri && !payload.imageUri.startsWith('data:')) {
    const response = await fetch(payload.imageUri);
    if (!response.ok) throw new Error('IMAGE_EXPORT_FAILED');
    const blob = await response.blob();
    const dataUri = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    payload = { ...payload, imageUri: dataUri };
  }
  const image = new Image();
  const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildShareSvg(payload))}`;
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('IMAGE_TIMEOUT')), 10000);
    image.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    image.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('IMAGE_EXPORT_FAILED'));
    };
    image.src = source;
  });
  const canvas = document.createElement('canvas');
  const dimensions = cardDimensions(payload.format);
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('CANVAS_UNAVAILABLE');
  context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('IMAGE_EXPORT_FAILED'))), 'image/png'),
  );
  const uri = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = uri;
  link.download = `somnisync-${payload.format ?? 'post'}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(uri), 1000);
}
