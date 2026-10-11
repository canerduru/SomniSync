/**
 * CaptureService
 * Orchestrates rendering the high-resolution stylized dream card and
 * triggering the native OS share intent dialog via Web Share API, with
 * graceful fallbacks to clipboard and direct download.
 */

import { DreamRecord } from '../../types/dream';
import { renderDreamArcheCard, CardFormat } from '../../utils/cardCanvasRenderer';

export interface CaptureShareResult {
  success: boolean;
  method: 'native-share' | 'clipboard' | 'download' | 'cancelled';
  message: string;
}

export interface ICaptureService {
  captureAndShare(
    dream: DreamRecord,
    format?: CardFormat,
    language?: 'tr' | 'en'
  ): Promise<CaptureShareResult>;
}

export class CaptureService implements ICaptureService {
  async captureAndShare(
    dream: DreamRecord,
    format: CardFormat = 'portrait',
    language: 'tr' | 'en' = 'tr'
  ): Promise<CaptureShareResult> {
    const filename = `somnisync-arche-card-${dream.id.slice(-6)}.png`;

    // Step 1: Render the high-resolution stylized card
    const { blob, dataUrl } = await renderDreamArcheCard({
      dream,
      format,
      language,
    });

    const file = new File([blob], filename, { type: 'image/png' });

    // Step 2: Try native Web Share API with image file
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'SomniSync Arche-Card',
          text: `"${dream.rawTranscript.slice(0, 80)}..." // SomniSync Neuro-Social Network`,
          files: [file],
        });

        return {
          success: true,
          method: 'native-share',
          message: language === 'en' ? 'Card shared via native share intent' : 'Yerel paylaşım menüsü açıldı',
        };
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return {
            success: false,
            method: 'cancelled',
            message: language === 'en' ? 'Share cancelled' : 'Paylaşım iptal edildi',
          };
        }
        console.warn('Native share error, falling back:', err);
      }
    }

    // Fallback 1: Direct Clipboard Image Copy
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        return {
          success: true,
          method: 'clipboard',
          message: language === 'en' ? 'Arche-Card copied to clipboard' : 'Görsel panoya kopyalandı',
        };
      }
    } catch (err) {
      console.warn('Clipboard write failed, falling back to download:', err);
    }

    // Fallback 2: Direct File Download
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();

    return {
      success: true,
      method: 'download',
      message: language === 'en' ? 'Arche-Card downloaded as PNG' : 'Kart PNG olarak indirildi',
    };
  }
}

export const captureService = new CaptureService();
