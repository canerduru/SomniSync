import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { DreamRecord } from '../../types/dream';
import { Download, Check, X, Share2, Sparkles, Copy, RefreshCw } from 'lucide-react';
import { renderDreamArcheCard, CardFormat } from '../../utils/cardCanvasRenderer';

interface ShareCardModalProps {
  dream: DreamRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ dream, isOpen, onClose }) => {
  const { t, language } = useTranslation();
  const [format, setFormat] = useState<CardFormat>('portrait');
  const [isGenerating, setIsGenerating] = useState(true);
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const generateCard = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { dataUrl, blob } = await renderDreamArcheCard({
        dream,
        format,
        language,
      });
      setCardDataUrl(dataUrl);
      setCardBlob(blob);
    } catch (err) {
      console.error('Failed to generate image card:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [dream, format, language]);

  useEffect(() => {
    if (isOpen) {
      generateCard();
    }
  }, [isOpen, generateCard]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!cardDataUrl) return;
    const link = document.createElement('a');
    link.download = `somnisync-arche-card-${dream.id.slice(-6)}.png`;
    link.href = cardDataUrl;
    link.click();
    showFeedback(t.share.download_png);
  };

  const handleNativeShareOrCopy = async () => {
    if (!cardBlob) return;

    const file = new File(
      [cardBlob],
      `somnisync-arche-card-${dream.id.slice(-6)}.png`,
      { type: 'image/png' }
    );

    // Try Web Share API with File (Native Mobile Share Sheet)
    if (
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          title: 'SomniSync Arche-Card',
          text: `"${dream.rawTranscript.slice(0, 80)}..." // SomniSync Neuro-Social Network`,
          files: [file],
        });
        return;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Native share failed, falling back to copy:', err);
        } else {
          return;
        }
      }
    }

    // Fallback 1: Copy Image to Clipboard
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({ 'image/png': cardBlob });
        await navigator.clipboard.write([item]);
        showFeedback(t.share.copied_image);
        return;
      }
    } catch {
      // Fallback 2: Copy formatted text
    }

    // Fallback 2: Formatted text summary
    try {
      const summaryText = `[SOMNISYNC ARCHE-CARD]\n"${dream.rawTranscript}"\n\nNöro: ${dream.interpretations.neuroscience}\nJung: ${dream.interpretations.jungian}\nEtiketler: ${dream.tags.map((t) => '#' + t.label).join(' ')}\n\n// SOMNISYNC NEURO-SOCIAL NETWORK`;
      await navigator.clipboard.writeText(summaryText);
      showFeedback(t.share.copied_text);
    } catch {
      handleDownload();
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  return (
    <div className="absolute inset-0 bg-[#000000]/95 backdrop-blur-md z-50 flex flex-col items-center justify-between p-4 overflow-y-auto selection:bg-white selection:text-black">
      
      {/* Top Modal Controls */}
      <div className="w-full max-w-sm flex justify-between items-center pb-2 border-b border-[#222222]">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-white animate-pulse" />
          <span className="text-[10px] font-mono-data tracking-widest text-[#aaaaaa] uppercase font-semibold">
            {t.share.card_title}
          </span>
        </div>

        <button
          onClick={onClose}
          className="text-xs font-mono-data text-[#888888] hover:text-white p-1 transition-colors"
          title={t.share.close}
        >
          <X size={18} />
        </button>
      </div>

      {/* Format Selector Pills (Portrait 4:5 vs Story 9:16) */}
      <div className="w-full max-w-sm flex gap-2 my-2">
        <button
          onClick={() => setFormat('portrait')}
          className={`flex-1 py-1.5 px-2 text-[10px] font-mono-data uppercase border transition-colors ${
            format === 'portrait'
              ? 'bg-white text-black border-white font-bold'
              : 'bg-[#0f0f0f] text-[#777777] border-[#222222] hover:text-white'
          }`}
        >
          {t.share.format_portrait}
        </button>
        <button
          onClick={() => setFormat('story')}
          className={`flex-1 py-1.5 px-2 text-[10px] font-mono-data uppercase border transition-colors ${
            format === 'story'
              ? 'bg-white text-black border-white font-bold'
              : 'bg-[#0f0f0f] text-[#777777] border-[#222222] hover:text-white'
          }`}
        >
          {t.share.format_story}
        </button>
      </div>

      {/* Stylized Image Card Preview Container */}
      <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center relative my-2 overflow-hidden">
        {isGenerating ? (
          <div className="w-full h-80 bg-[#0a0a0a] border border-[#222222] flex flex-col items-center justify-center p-6 text-center space-y-3">
            <RefreshCw size={22} className="text-white animate-spin" />
            <p className="text-xs font-mono-data text-[#aaaaaa] uppercase tracking-wider">
              {t.share.generating_card}
            </p>
          </div>
        ) : cardDataUrl ? (
          <div className="relative group max-h-[460px] overflow-hidden border border-[#262626] shadow-2xl bg-black">
            <img
              src={cardDataUrl}
              alt="Generated Arche-Card"
              className="w-full h-auto max-h-[460px] object-contain mx-auto filter drop-shadow-md select-none"
            />
            
            {/* Quick hover indicator */}
            <div className="absolute top-2 right-2 bg-black/80 border border-white/20 px-2 py-0.5 text-[9px] font-mono-data tracking-wider uppercase text-white pointer-events-none">
              PNG // 1080px
            </div>
          </div>
        ) : (
          <div className="w-full h-72 bg-[#0c0c0c] border border-dashed border-[#222222] flex items-center justify-center text-xs font-mono-data text-[#666666]">
            ERROR_GENERATING_CARD
          </div>
        )}

        {/* Floating Notification Toast */}
        {feedbackMessage && (
          <div className="absolute bottom-4 bg-white text-black text-[11px] font-mono-data font-bold px-3 py-1.5 shadow-xl border border-white flex items-center gap-1.5 animate-fadeIn">
            <Check size={14} strokeWidth={3} />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* Action Buttons: Native Share / Copy Image + Direct Download PNG */}
      <div className="w-full max-w-sm space-y-2 pt-2 border-t border-[#1a1a1a]">
        <div className="flex gap-2">
          {/* Share on Social / Copy Image */}
          <button
            onClick={handleNativeShareOrCopy}
            disabled={isGenerating || !cardBlob}
            className="flex-1 py-3 px-3 bg-white text-black hover:bg-[#e0e0e0] text-xs font-mono-data font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-30 cursor-pointer"
          >
            <Share2 size={14} />
            <span>{t.share.share_native}</span>
          </button>

          {/* Download PNG */}
          <button
            onClick={handleDownload}
            disabled={isGenerating || !cardDataUrl}
            className="py-3 px-4 border border-[#333333] bg-[#111111] hover:border-white text-xs font-mono-data tracking-wider uppercase text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-30 cursor-pointer"
            title={t.share.download_png}
          >
            <Download size={14} />
            <span>PNG</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2 border border-[#222222] text-[11px] font-mono-data text-[#777777] hover:text-white uppercase transition-colors"
        >
          {t.share.close}
        </button>
      </div>

    </div>
  );
};
