import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { Radio } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
}

export const ProcessingModal: React.FC<ProcessingModalProps> = ({ isOpen }) => {
  const { t, language } = useTranslation();
  const [step, setStep] = useState(0);

  const stepsTr = [
    'SES DALGASI İŞLENİYOR (WHISPER AI)...',
    'BİLİNÇDIŞI METNİ AYRIŞTIRILIYOR...',
    'ÜÇLÜ MERCEK SENTEZLENİYOR (NÖRO, JUNG, ASTRO)...',
    'SİNEMATİK RÜYA GÖRSELİ ÜRETİLİYOR...',
    'GRIMOIRE ARŞİVİNE MÜHÜRLENİYOR...'
  ];

  const stepsEn = [
    'PROCESSING AUDIO BUFFER (WHISPER AI)...',
    'PARSING STREAM OF CONSCIOUSNESS...',
    'SYNTHESIZING TRIADIC LENSES (NEURO, JUNG, ASTRO)...',
    'RENDERING CINEMATIC DREAM VISUAL...',
    'SEALING RECORD INTO GRIMOIRE...'
  ];

  const currentSteps = language === 'en' ? stepsEn : stepsTr;

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      return;
    }

    const interval = setInterval(() => {
      setStep((prev) => (prev < currentSteps.length - 1 ? prev + 1 : prev));
    }, 800);

    return () => clearInterval(interval);
  }, [isOpen, currentSteps.length]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center animate-spin">
          <div className="w-3 h-3 bg-white rounded-full" />
        </div>
        <Radio size={20} className="absolute inset-0 m-auto text-white animate-pulse" />
      </div>

      <h3 className="text-xl font-serif-dream tracking-wider font-medium text-white mb-2">
        {t.record.processing_title}
      </h3>
      <p className="text-xs text-[#888888] font-mono-data tracking-wide max-w-xs mb-6">
        {t.record.processing_subtitle}
      </p>

      {/* Brutalist terminal step logs */}
      <div className="w-full max-w-xs border border-[#222222] bg-[#0c0c0c] p-3 text-left font-mono-data text-[11px] space-y-1.5">
        {currentSteps.map((stepText, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-2 ${
              idx === step
                ? 'text-white font-semibold'
                : idx < step
                ? 'text-[#555555]'
                : 'text-[#2a2a2a]'
            }`}
          >
            <span className="text-[9px]">
              {idx < step ? '[✓]' : idx === step ? '[>]' : '[ ]'}
            </span>
            <span className="truncate">{stepText}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
