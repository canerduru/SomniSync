import React, { useState } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { DreamRecord, LensType } from '../../types/dream';
import {
  Brain,
  Moon,
  Sparkles,
  Share2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
  BookOpen,
  ExternalLink,
  Activity,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { ShareCardModal } from '../share/ShareCardModal';
import { captureService } from '../../services/share/CaptureService';
import { ScientificDeepDiveModule } from './ScientificDeepDiveModule';
import { NeuroAnalysisPanel } from '../neuro/NeuroAnalysisPanel';

interface LensSwiperProps {
  dream: DreamRecord;
  onBack: () => void;
}

export const LensSwiper: React.FC<LensSwiperProps> = ({ dream, onBack }) => {
  const { t, language } = useTranslation();
  const [activeLens, setActiveLens] = useState<LensType>('neuroscience');
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [toastFeedback, setToastFeedback] = useState<string | null>(null);

  const lenses = [
    {
      id: 'neuroscience' as LensType,
      label: t.lenses.neuroscience,
      sub: t.lenses.neuroscience_sub,
      icon: Brain,
      content: dream.interpretations.neuroscience,
      tagline: 'HİPOKAMPAL VE TETA FAZI',
      evidenceNote: 'Stickgold & Walker (2013) // Nature Neuroscience',
    },
    {
      id: 'jungian' as LensType,
      label: t.lenses.jungian,
      sub: t.lenses.jungian_sub,
      icon: Moon,
      content: dream.interpretations.jungian,
      tagline: 'GÖLGE VE EVRİMSEL SİMÜLASYON',
      evidenceNote: 'Revonsuo (2000) // Behavioral & Brain Sciences',
    },
    {
      id: 'astrological' as LensType,
      label: t.lenses.astrological,
      sub: t.lenses.astrological_sub,
      icon: Sparkles,
      content: dream.interpretations.astrological,
      tagline: 'SİRKADİYEN VE KOZMİK TRANSİT',
      evidenceNote: 'Circadian Core Nadir // Ultradian REM Phasing',
    },
    {
      id: 'scientific_basis' as LensType,
      label: t.lenses.scientific_basis,
      sub: t.lenses.scientific_basis_sub,
      icon: BookOpen,
      content: '',
      tagline: 'PEER-REVIEWED // PUBMED LİTERATÜRÜ',
      evidenceNote: 'NCBI Entrez & Europe PMC Kanıt Ağı',
    },
  ];

  const currentLensData = lenses.find((l) => l.id === activeLens) || lenses[0];
  const scientificBasis = dream.interpretations.scientificBasis;
  const neuroProfile = scientificBasis?.neuroProfile;
  const citations = scientificBasis?.citations || [];

  const handleTriggerCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      const result = await captureService.captureAndShare(dream, 'portrait', language);
      if (result.message && result.method !== 'cancelled') {
        setToastFeedback(result.message);
        setTimeout(() => setToastFeedback(null), 3000);
      }
    } catch (err) {
      console.error('CaptureService execution failed:', err);
      setShowShareModal(true);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#070707] text-[#f5f5f5] overflow-y-auto relative selection:bg-white selection:text-black">
      <ShareCardModal
        dream={dream}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Top Bar with Back and Share Actions */}
      <div className="px-5 py-3 border-b border-[#1c1c1c] flex items-center justify-between bg-[#0a0a0a] sticky top-0 z-20 backdrop-blur">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-mono-data text-[#888888] hover:text-white uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Geri</span>
        </button>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono-data border border-[#2a2a2a] hover:border-white transition-colors bg-[#111111] uppercase tracking-wider text-[#cccccc] cursor-pointer"
          title="Özelleştirilmiş Paylaşım Kartı"
        >
          <Share2 size={12} />
          <span>Önizle</span>
        </button>
      </div>

      {/* Hero Cinematic Dream Image */}
      <div className="relative h-60 w-full bg-black overflow-hidden flex-shrink-0 border-b border-[#222222]">
        {dream.imageUrl ? (
          <img
            src={dream.imageUrl}
            alt="Dream landscape"
            className="w-full h-full object-cover filter grayscale contrast-125 brightness-90"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono-data text-xs text-[#555555]">
            NO_IMAGE_STREAM
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-transparent to-black/30" />

        {/* Date & Tag Overlay */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-data text-[#aaaaaa] uppercase tracking-widest block">
                {new Date(dream.recordedAt).toLocaleDateString()} // {new Date(dream.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[9px] font-mono-data bg-white/10 text-white px-1.5 py-0.5 border border-white/20 uppercase">
                PEER-REVIEWED
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mt-1.5">
              {dream.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-[9px] font-mono-data bg-black/80 border border-white/20 text-white px-1.5 py-0.5 uppercase"
                >
                  #{tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Transcript Section */}
      <div className="p-4 border-b border-[#1c1c1c] bg-[#0c0c0c]">
        <button
          onClick={() => setShowFullTranscript(!showFullTranscript)}
          className="w-full flex items-center justify-between text-left text-xs font-mono-data text-[#888888] hover:text-white uppercase tracking-wider cursor-pointer"
        >
          <span>Ham Bilinç Akışı (Transkript)</span>
          {showFullTranscript ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <p
          className={`text-xs text-[#cccccc] font-serif-dream italic mt-2 leading-relaxed transition-all ${
            showFullTranscript ? '' : 'line-clamp-2'
          }`}
        >
          "{dream.rawTranscript}"
        </p>
      </div>

      {/* Multi-Lens Selector Tabs (4 Tabs including Scientific Basis) */}
      <div className="border-b border-[#1c1c1c] bg-[#0a0a0a] flex overflow-x-auto scrollbar-none">
        {lenses.map((lens) => {
          const Icon = lens.icon;
          const isActive = activeLens === lens.id;
          return (
            <button
              key={lens.id}
              onClick={() => setActiveLens(lens.id)}
              className={`flex-1 min-w-[76px] py-3 px-1.5 flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-white text-white bg-[#141414]'
                  : 'border-transparent text-[#666666] hover:text-[#999999]'
              }`}
            >
              <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[9px] font-mono-data uppercase tracking-wider text-center whitespace-nowrap">
                {lens.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="p-5 flex-1 space-y-4 pb-24">
        {activeLens !== 'scientific_basis' ? (
          <>
            <div className="flex items-center justify-between border-b border-[#222222] pb-2">
              <div>
                <span className="text-[9px] font-mono-data text-[#777777] uppercase tracking-widest block">
                  {currentLensData.tagline}
                </span>
                <h3 className="text-xl font-serif-dream font-medium text-white">
                  {currentLensData.label}
                </h3>
              </div>
            </div>

            <p className="text-sm font-sans text-[#dddddd] leading-relaxed tracking-normal font-light">
              {currentLensData.content}
            </p>

            {/* Dedicated Expandable Nöro-Analiz Panel */}
            {activeLens === 'neuroscience' && (
              <div className="pt-2">
                <NeuroAnalysisPanel dream={dream} defaultExpanded={true} variant="full" />
              </div>
            )}

            {/* Scientific Evidence Footer Note */}
            <div className="border border-[#1e1e1e] p-3 bg-[#0d0d0d] space-y-1 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono-data text-[#666666] uppercase tracking-wider block">
                  ÇÖZÜMLEME METODOLOJİSİ
                </span>
                <span className="text-[9px] font-mono-data text-white font-medium">
                  {currentLensData.evidenceNote}
                </span>
              </div>
              <p className="text-[11px] text-[#888888] font-mono-data leading-relaxed">
                {currentLensData.sub}
              </p>
            </div>
          </>
        ) : (
          /* Scientific Basis & Literature Inspector Tab */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#222222] pb-2">
              <div>
                <span className="text-[9px] font-mono-data text-[#777777] uppercase tracking-widest block">
                  BİLİMSEL KANIT & NÖROBİYOLOJİK TEMEL
                </span>
                <h3 className="text-xl font-serif-dream font-medium text-white">
                  {t.lenses.scientific_basis}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-mono-data bg-white text-black px-2 py-0.5 font-bold uppercase">
                <ShieldCheck size={12} />
                <span>KANIT ONAYLI</span>
              </div>
            </div>

            {/* Primary Cognitive / Neuro Model */}
            <div className="border border-[#222222] bg-[#0c0c0c] p-3.5 space-y-2">
              <span className="text-[9px] font-mono-data text-[#777777] uppercase block tracking-wider">
                TEMEL BİLİMSEL MODEL
              </span>
              <p className="text-xs font-serif-dream text-white font-medium text-base">
                {scientificBasis?.cognitiveModel ||
                  'Stickgold & Walker (2013) REM Bellek Entegrasyonu & Revonsuo Tehdit Simülasyonu'}
              </p>
            </div>

            {/* Neurobiological Profile Grid */}
            <div className="border border-[#222222] bg-[#0a0a0a] p-3.5 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-mono-data text-white uppercase border-b border-[#1c1c1c] pb-2">
                <Activity size={13} />
                <span>{t.lenses.sleep_stage}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-data">
                <div className="p-2 border border-[#1a1a1a] bg-[#0f0f0f]">
                  <span className="text-[#666666] block">UYKU EVRESİ</span>
                  <span className="text-white font-medium">
                    {neuroProfile?.sleepStage || 'REM Sleep (Phasic)'}
                  </span>
                </div>
                <div className="p-2 border border-[#1a1a1a] bg-[#0f0f0f]">
                  <span className="text-[#666666] block">EEG SALINIMI</span>
                  <span className="text-white font-medium">
                    {neuroProfile?.eegBand || 'Theta (4–8 Hz)'}
                  </span>
                </div>
              </div>

              {/* Neurotransmitter Dynamics */}
              <div className="pt-1">
                <span className="text-[9px] font-mono-data text-[#777777] uppercase block mb-1.5">
                  {t.lenses.neurotransmitters}
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono-data">
                  <div className="p-1.5 border border-[#181818] bg-[#0d0d0d] flex justify-between">
                    <span className="text-[#888888]">Asetilkolin:</span>
                    <span className="text-white font-bold">
                      {neuroProfile?.neurotransmitters.acetylcholine || 'Yüksek'}
                    </span>
                  </div>
                  <div className="p-1.5 border border-[#181818] bg-[#0d0d0d] flex justify-between">
                    <span className="text-[#888888]">Noradrenalin:</span>
                    <span className="text-[#aaaaaa] font-bold">
                      {neuroProfile?.neurotransmitters.noradrenaline || 'Sıfır / Baskılı'}
                    </span>
                  </div>
                  <div className="p-1.5 border border-[#181818] bg-[#0d0d0d] flex justify-between">
                    <span className="text-[#888888]">Serotonin:</span>
                    <span className="text-[#aaaaaa] font-bold">
                      {neuroProfile?.neurotransmitters.serotonin || 'Baskılı'}
                    </span>
                  </div>
                  <div className="p-1.5 border border-[#181818] bg-[#0d0d0d] flex justify-between">
                    <span className="text-[#888888]">Dopamin:</span>
                    <span className="text-white font-bold">
                      {neuroProfile?.neurotransmitters.dopamine || 'Aktif'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Brain Networks */}
              <div className="pt-1">
                <span className="text-[9px] font-mono-data text-[#777777] uppercase block mb-1.5">
                  {t.lenses.brain_regions}
                </span>
                <div className="flex flex-wrap gap-1">
                  {(neuroProfile?.brainRegions || [
                    'Hipokampus (CA1 Replay)',
                    'Amigdala',
                    'Medial Prefrontal Korteks',
                    'dlPFC (Hipoaktif)',
                  ]).map((region, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] font-mono-data border border-[#222222] bg-[#121212] px-1.5 py-0.5 text-[#cccccc]"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Dedicated Expandable Nöro-Analiz Panel */}
            <div className="pt-1">
              <NeuroAnalysisPanel dream={dream} defaultExpanded={false} variant="full" />
            </div>

            {/* Peer-Reviewed Scientific Citations (PubMed Links) */}
            <div className="border border-[#222222] bg-[#0a0a0a] p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-2">
                <div className="flex items-center gap-1.5 text-xs font-mono-data text-white uppercase">
                  <BookOpen size={13} />
                  <span>{t.lenses.peer_reviewed_citations}</span>
                </div>
                <span className="text-[9px] font-mono-data text-[#888888]">
                  NCBI PUBMED
                </span>
              </div>

              <div className="space-y-3">
                {citations.map((cite) => (
                  <div
                    key={cite.id}
                    className="p-3 border border-[#1a1a1a] bg-[#0e0e0e] hover:border-[#333333] transition-colors space-y-2"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-sans text-white font-medium leading-snug">
                        {cite.title}
                      </h4>
                      <span className="text-[8px] font-mono-data bg-white text-black px-1.5 py-0.5 uppercase whitespace-nowrap font-bold">
                        {cite.evidenceLevel}
                      </span>
                    </div>

                    <p className="text-[10px] font-mono-data text-[#777777]">
                      {cite.authors} ({cite.year}) —{' '}
                      <span className="text-[#aaaaaa] italic">{cite.journal}</span>
                    </p>

                    <p className="text-[11px] font-serif-dream italic text-[#cccccc] leading-relaxed border-l-2 border-white/40 pl-2">
                      "{cite.keyFinding}"
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[9px] font-mono-data">
                      <span className="text-[#666666]">
                        PMID: {cite.pmid} {cite.doi && `// DOI: ${cite.doi}`}
                      </span>

                      <a
                        href={cite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-white hover:underline uppercase font-bold"
                      >
                        <span>{t.lenses.view_on_pubmed}</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Deep-Dive Neuro-Jungian Scientific Module */}
        <div className="pt-2">
          <ScientificDeepDiveModule dream={dream} />
        </div>

        <div className="text-center pt-2">
          <p className="text-[10px] font-mono-data text-[#555555] tracking-wider uppercase">
            {t.lenses.swipe_hint}
          </p>
        </div>
      </div>

      {/* Floating Action Button (FAB): Triggers CaptureService & Native Share Intent */}
      <div className="sticky bottom-5 self-end right-5 pr-5 pb-2 z-30 flex flex-col items-end gap-2 pointer-events-auto">
        {toastFeedback && (
          <div className="bg-white text-black text-[10px] font-mono-data font-bold px-3 py-1.5 shadow-2xl border border-white flex items-center gap-1.5 animate-fadeIn">
            <Check size={13} strokeWidth={3} />
            <span>{toastFeedback}</span>
          </div>
        )}

        <button
          onClick={handleTriggerCapture}
          disabled={isCapturing}
          className="group flex items-center gap-2 px-4 py-3 bg-black text-white border-2 border-white shadow-[0_4px_30px_rgba(0,0,0,0.9)] hover:bg-white hover:text-black transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 select-none"
          title="Capture & Share (Native Intent)"
        >
          {isCapturing ? (
            <RefreshCw size={15} className="animate-spin text-white group-hover:text-black" />
          ) : (
            <Share2 size={15} className="text-white group-hover:text-black transition-transform group-hover:scale-110" />
          )}
          <span className="text-[11px] font-mono-data font-bold tracking-widest uppercase">
            {isCapturing
              ? language === 'en'
                ? 'CAPTURING...'
                : 'İŞLENİYOR...'
              : language === 'en'
              ? 'NATIVE SHARE'
              : 'KARTI PAYLAŞ'}
          </span>
        </button>
      </div>
    </div>
  );
};
