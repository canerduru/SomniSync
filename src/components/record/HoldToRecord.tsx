import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { audioRecorderService } from '../../services/audio/AudioRecorderService';
import { Mic, FileText, Check, ShieldCheck, HelpCircle } from 'lucide-react';
import { DreamRecord } from '../../types/dream';
import { transcriptionService, interpretationService, imageService } from '../../services/ai';
import { storageService } from '../../services/storage/StorageService';
import { dreamRepository } from '../../services/db/DreamRepository';
import { useAuth } from '../../context/AuthContext';
import { ProcessingModal } from './ProcessingModal';

interface HoldToRecordProps {
  onDreamCreated: (dream: DreamRecord) => void;
  onNavigateToGrimoire?: () => void;
  dreamsCount?: number;
}

export const HoldToRecord: React.FC<HoldToRecordProps> = ({
  onDreamCreated,
  onNavigateToGrimoire,
  dreamsCount = 6,
}) => {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [allowSynastry, setAllowSynastry] = useState(true);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState('');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isHeldRef = useRef(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartRecord = async (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (isRecording || isProcessing) return;
    setErrorMessage(null);

    isHeldRef.current = true;
    setIsRecording(true);
    setRecordSeconds(0);

    timerRef.current = setInterval(() => {
      setRecordSeconds((prev) => prev + 1);
    }, 1000);

    await audioRecorderService.startRecording((level) => {
      setVolumeLevel(level);
    });
  };

  const handleReleaseRecord = async (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isHeldRef.current || !isRecording) return;
    isHeldRef.current = false;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);

    // Hardening: Guard against accidental short taps
    if (recordSeconds < 1) {
      setErrorMessage(t.record.too_short_err);
      setTimeout(() => setErrorMessage(null), 3500);
      return;
    }

    setIsProcessing(true);

    try {
      const audioBlob = await audioRecorderService.stopRecording();
      const audioUrl = await storageService.uploadAudio(audioBlob, user.id);
      // Step 1: Transcribe
      const transcript = await transcriptionService.transcribeAudio(audioBlob, language);
      // Step 2: Multi-Lens Analysis
      const analysis = await interpretationService.analyzeDream(transcript, language);
      // Step 3: Generate Visual
      const generatedImageUrl = await imageService.generateDreamVisual(analysis.imagePrompt);
      const imageUrl = await storageService.uploadImage(generatedImageUrl, user.id);

      // Persist to Repository with normalized tags
      const savedDream = await dreamRepository.saveDream(
        user.id,
        transcript,
        analysis,
        imageUrl,
        audioUrl,
        allowSynastry
      );

      onDreamCreated(savedDream);
    } catch {
      setErrorMessage(t.record.network_err);
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim() || isProcessing) return;
    setShowTextModal(false);
    setIsProcessing(true);

    try {
      const analysis = await interpretationService.analyzeDream(textInput, language);
      const generatedImageUrl = await imageService.generateDreamVisual(analysis.imagePrompt);
      const imageUrl = await storageService.uploadImage(generatedImageUrl, user.id);

      const savedDream = await dreamRepository.saveDream(
        user.id,
        textInput,
        analysis,
        imageUrl,
        null,
        allowSynastry
      );

      setTextInput('');
      onDreamCreated(savedDream);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6">
      <ProcessingModal isOpen={isProcessing} />

      {/* Top brutalist guidance */}
      <div className="text-center pt-2">
        <span className="text-[10px] font-mono-data tracking-widest text-[#777777] uppercase border border-[#222222] px-2 py-0.5 inline-block mb-3 bg-[#0c0c0c]">
          {isRecording ? t.record.recording : 'NÖRAL SES MÜHÜRÜ'}
        </span>
        <h2 className="text-3xl font-serif-dream font-light tracking-wide text-white">
          {isRecording ? `${recordSeconds}s` : t.record.listening_audio}
        </h2>
        <p className="text-xs text-[#777777] font-mono-data mt-2 max-w-xs mx-auto">
          {isRecording
            ? t.record.release_to_process
            : t.record.quick_tips}
        </p>

        {errorMessage && (
          <div className="mt-3 p-2 bg-[#1a0a0a] border border-[#552222] text-[#ff8888] text-[11px] font-mono-data text-center max-w-xs mx-auto animate-fadeIn">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Center: Large Brutalist Hold to Record Button with Audio Waveform */}
      <div className="flex flex-col items-center justify-center my-auto py-8">
        <div className="relative flex items-center justify-center">
          {/* Animated pulsing outer rings when recording */}
          {isRecording && (
            <>
              <div
                className="absolute w-56 h-56 rounded-full border border-white/20 animate-ping pointer-events-none"
                style={{ transform: `scale(${1 + volumeLevel * 0.4})` }}
              />
              <div
                className="absolute w-48 h-48 rounded-full border border-white/40 pointer-events-none transition-all duration-75"
                style={{ transform: `scale(${1 + volumeLevel * 0.25})` }}
              />
            </>
          )}

          {/* Main Large Tactile Button */}
          <button
            onMouseDown={handleStartRecord}
            onMouseUp={handleReleaseRecord}
            onTouchStart={handleStartRecord}
            onTouchEnd={handleReleaseRecord}
            className={`w-40 h-40 rounded-full border flex flex-col items-center justify-center transition-all duration-200 select-none cursor-pointer active:scale-95 shadow-2xl relative z-10 ${
              isRecording
                ? 'bg-white text-black border-white shadow-[0_0_50px_rgba(255,255,255,0.25)]'
                : 'bg-[#0f0f0f] text-white border-[#333333] hover:border-white'
            }`}
          >
            <Mic
              size={36}
              className={`mb-2 transition-transform ${isRecording ? 'scale-110 text-black' : 'text-white'}`}
            />
            <span
              className={`text-[10px] font-mono-data tracking-widest uppercase font-medium px-2 text-center ${
                isRecording ? 'text-black' : 'text-[#aaaaaa]'
              }`}
            >
              {isRecording ? t.record.release_to_process : t.record.hold_to_record}
            </span>
          </button>
        </div>

        {/* Live Audio Volume Bar */}
        {isRecording && (
          <div className="flex items-center gap-1 mt-6 h-6">
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className="w-1 bg-white rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(4, Math.min(24, Math.sin((i + 1) * 0.8) * volumeLevel * 28))}px`,
                }}
              />
            ))}
          </div>
        )}
        {/* Quick link to examine existing test data & images */}
        {!isRecording && onNavigateToGrimoire && (
          <button
            type="button"
            onClick={onNavigateToGrimoire}
            className="mt-5 px-3 py-1.5 border border-[#2a2a2a] bg-[#0c0c0c] hover:border-white text-[10px] font-mono-data text-[#cccccc] flex items-center gap-2 transition-all cursor-pointer group shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ARŞİVDEKİ TEST VERİLERİ VE GÖRSELLERİ İNCELE ({dreamsCount} KAYIT)</span>
            <span className="text-[#777777] group-hover:text-white transition-colors">→</span>
          </button>
        )}
      </div>

      {/* Bottom Controls: Synastry Consent & Text Fallback */}
      <div className="space-y-4 pt-2">
        {/* Synastry opt-in consent */}
        <label className="flex items-start gap-3 p-3 border border-[#1e1e1e] bg-[#0c0c0c] cursor-pointer hover:border-[#333333] transition-colors">
          <input
            type="checkbox"
            checked={allowSynastry}
            onChange={(e) => setAllowSynastry(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-4 h-4 mt-0.5 border flex items-center justify-center transition-colors ${
            allowSynastry ? 'border-white bg-white text-black' : 'border-[#444444] bg-transparent'
          }`}>
            {allowSynastry && <Check size={12} strokeWidth={3} />}
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-1.5 text-xs font-mono-data text-[#cccccc]">
              <span>{t.record.synastry_consent_label}</span>
              <ShieldCheck size={12} className="text-white" />
            </div>
            <p className="text-[10px] text-[#666666] leading-tight mt-0.5 font-mono-data">
              {t.record.synastry_consent_hint}
            </p>
          </div>
        </label>

        {/* Text fallback button */}
        <button
          onClick={() => setShowTextModal(true)}
          className="w-full py-2.5 px-4 border border-[#2a2a2a] bg-[#111111] hover:border-white text-xs font-mono-data tracking-wider uppercase text-[#cccccc] flex items-center justify-center gap-2 transition-colors"
        >
          <FileText size={14} className="text-[#888888]" />
          <span>{t.record.text_fallback_btn}</span>
        </button>
      </div>

      {/* Text Fallback Modal */}
      {showTextModal && (
        <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur z-40 flex flex-col justify-end p-5">
          <div className="border border-[#262626] bg-[#0d0d0d] p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#222222] pb-3">
              <h3 className="text-base font-serif-dream font-medium uppercase tracking-wider">
                {t.record.modal_title}
              </h3>
              <button
                onClick={() => setShowTextModal(false)}
                className="text-xs font-mono-data text-[#888888] hover:text-white"
              >
                [X]
              </button>
            </div>

            {/* Quick Test Dream Presets */}
            <div className="space-y-1.5">
              <div className="text-[9px] font-mono-data text-[#777777] uppercase tracking-wider">
                HIZLI TEST ŞABLONLARI (TEK TIKLA DOLDUR):
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setTextInput(
                      'Sonsuz siyah mermer bir merdivenden iniyordum. Gökyüzü yarılıp içinden karanlık bir ay doğdu ve bana eski bronz bir anahtar uzatıldı.'
                    )
                  }
                  className="text-left p-1.5 bg-[#121212] border border-[#222222] hover:border-white text-[10px] font-mono-data text-[#aaaaaa] hover:text-white transition-colors"
                >
                  [1] Obsidyen Merdiven & Kara Ay (Gölge Arketipi)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTextInput(
                      'Okyanusun en derin ve karanlık dibindeydim ama nefes alabiliyordum. Aşağıda parlayan devasa kristal bir mabet yükseliyordu.'
                    )
                  }
                  className="text-left p-1.5 bg-[#121212] border border-[#222222] hover:border-white text-[10px] font-mono-data text-[#aaaaaa] hover:text-white transition-colors"
                >
                  [2] Derin Sular & Kristal Mabet (Bilinçdışı Okyanusu)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTextInput(
                      'Zamanın durduğu dev bir saat kulesinin çarkları arasındaydım. Havada asılı kum taneleri ve göğsümden çıkan bir kuzgun vardı.'
                    )
                  }
                  className="text-left p-1.5 bg-[#121212] border border-[#222222] hover:border-white text-[10px] font-mono-data text-[#aaaaaa] hover:text-white transition-colors"
                >
                  [3] Donan Saat Kulesi & Kuzgun (Kronos & Nigredo)
                </button>
              </div>
            </div>

            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={t.record.modal_placeholder}
              rows={4}
              className="w-full bg-[#080808] border border-[#2a2a2a] p-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-white resize-none font-sans"
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowTextModal(false)}
                className="flex-1 py-2 border border-[#2a2a2a] text-xs font-mono-data text-[#888888] hover:border-white hover:text-white uppercase"
              >
                {t.record.modal_cancel}
              </button>
              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim()}
                className="flex-1 py-2 bg-white text-black text-xs font-mono-data font-bold hover:bg-[#e0e0e0] uppercase disabled:opacity-30 disabled:pointer-events-none"
              >
                {t.record.modal_submit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
