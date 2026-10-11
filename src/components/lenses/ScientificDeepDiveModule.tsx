import React, { useState, useMemo } from 'react';
import { DreamRecord } from '../../types/dream';
import { useTranslation } from '../../context/LanguageContext';
import { neuroJungianDeepDiveService } from '../../services/science/NeuroJungianDeepDiveService';
import {
  Brain,
  Moon,
  GitMerge,
  BookOpen,
  Activity,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ScientificDeepDiveModuleProps {
  dream: DreamRecord;
}

type DeepDiveSubTab = 'neuro' | 'jung' | 'bridge' | 'literature';

export const ScientificDeepDiveModule: React.FC<ScientificDeepDiveModuleProps> = ({ dream }) => {
  const { t, language } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<DeepDiveSubTab>('neuro');
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const deepDiveData = useMemo(() => {
    return neuroJungianDeepDiveService.generateDeepDive(dream, language);
  }, [dream, language]);

  const handleCopySummary = async () => {
    try {
      const text = `[SOMNISYNC SCIENTIFIC DEEP-DIVE: NEURO-JUNGIAN CONVERGENCE]\nModel: ${deepDiveData.primaryModelTitle}\n\nÖzet: ${deepDiveData.executiveSummary}\n\nNörobiyoloji: ${deepDiveData.neurobiologicalDetail.hippocampalReplayMechanism.slice(0, 200)}...\n\nJung Biliş: ${deepDiveData.jungianCognitiveDetail.evolutionaryPreparednessTheory.slice(0, 200)}...\n\nKöprü: ${deepDiveData.neuroJungianBridge.coreThesis}\n\n// SOMNISYNC NEURO-SOCIAL NETWORK`;
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="border border-[#262626] bg-[#090909] p-4 text-[#f5f5f5] space-y-4 shadow-2xl relative overflow-hidden">
      {/* Background technical stamp */}
      <div className="absolute top-2 right-3 text-[8px] font-mono-data text-[#444444] uppercase tracking-widest pointer-events-none">
        NEURO_JUNGIAN // SCIENCE_MODULE_V2
      </div>

      {/* Header Bar with Toggle */}
      <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <div>
            <span className="text-[9px] font-mono-data text-[#777777] uppercase tracking-widest block">
              DERİNLEŞTİRİLMİŞ BİLİMSEL MODÜL
            </span>
            <h3 className="text-sm font-serif-dream font-medium uppercase text-white tracking-wider">
              Nöro-Jungian Bilimsel Temel
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="text-[10px] font-mono-data border border-[#2a2a2a] px-2 py-1 text-[#888888] hover:text-white hover:border-white transition-colors flex items-center gap-1 cursor-pointer"
            title="Bilimsel Özeti Kopyala"
          >
            {isCopied ? <Check size={11} className="text-white" /> : <Copy size={11} />}
            <span>{isCopied ? 'Kopyalandı' : 'Özet'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] font-mono-data border border-[#2a2a2a] p-1 text-[#888888] hover:text-white hover:border-white transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Executive Summary */}
          <div className="p-3 bg-[#0d0d0d] border border-[#1e1e1e] space-y-1">
            <span className="text-[9px] font-mono-data text-[#888888] uppercase block tracking-wider">
              YÖNETİCİ ÖZETİ // EXECUTIVE SYNTHESIS
            </span>
            <p className="text-xs font-serif-dream italic text-[#dddddd] leading-relaxed">
              "{deepDiveData.executiveSummary}"
            </p>
          </div>

          {/* Sub-tab Navigation */}
          <div className="flex border-b border-[#1e1e1e] bg-[#0c0c0c] text-[10px] font-mono-data uppercase tracking-wider">
            <button
              onClick={() => setActiveSubTab('neuro')}
              className={`flex-1 py-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
                activeSubTab === 'neuro'
                  ? 'border-white text-white font-bold bg-[#141414]'
                  : 'border-transparent text-[#666666] hover:text-[#999999]'
              }`}
            >
              <Brain size={12} />
              <span>Nörobiyoloji</span>
            </button>

            <button
              onClick={() => setActiveSubTab('jung')}
              className={`flex-1 py-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
                activeSubTab === 'jung'
                  ? 'border-white text-white font-bold bg-[#141414]'
                  : 'border-transparent text-[#666666] hover:text-[#999999]'
              }`}
            >
              <Moon size={12} />
              <span>Jung & Biliş</span>
            </button>

            <button
              onClick={() => setActiveSubTab('bridge')}
              className={`flex-1 py-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
                activeSubTab === 'bridge'
                  ? 'border-white text-white font-bold bg-[#141414]'
                  : 'border-transparent text-[#666666] hover:text-[#999999]'
              }`}
            >
              <GitMerge size={12} />
              <span>Sentez Köprüsü</span>
            </button>

            <button
              onClick={() => setActiveSubTab('literature')}
              className={`flex-1 py-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
                activeSubTab === 'literature'
                  ? 'border-white text-white font-bold bg-[#141414]'
                  : 'border-transparent text-[#666666] hover:text-[#999999]'
              }`}
            >
              <BookOpen size={12} />
              <span>Literatür</span>
            </button>
          </div>

          {/* Tab 1: Neuroscience Deep Dive */}
          {activeSubTab === 'neuro' && (
            <div className="space-y-3 font-mono-data text-xs">
              <div className="p-3 border border-[#1a1a1a] bg-[#0c0c0c] space-y-1.5">
                <span className="text-[9px] text-[#777777] uppercase block tracking-wider">
                  HİPOKAMPAL BELLEK YENİDEN OYNATIMI (REPLAY)
                </span>
                <p className="text-[11px] font-sans text-[#cccccc] leading-relaxed">
                  {deepDiveData.neurobiologicalDetail.hippocampalReplayMechanism}
                </p>
              </div>

              <div className="p-3 border border-[#1a1a1a] bg-[#0c0c0c] space-y-1.5">
                <span className="text-[9px] text-[#777777] uppercase block tracking-wider">
                  SİNAPTİK HOMEOSTAZ & DUYGUSAL YÜKSÜZLEŞTİRME
                </span>
                <p className="text-[11px] font-sans text-[#aaaaaa] leading-relaxed">
                  {deepDiveData.neurobiologicalDetail.synapticHomeostasisState}
                </p>
                <p className="text-[11px] font-sans text-[#888888] leading-relaxed pt-1 border-t border-[#181818]">
                  {deepDiveData.neurobiologicalDetail.noradrenalineZeroState}
                </p>
              </div>

              {/* Brain Circuit Grid */}
              <div className="border border-[#1a1a1a] bg-[#0c0c0c] p-3 space-y-2">
                <span className="text-[9px] text-[#777777] uppercase block tracking-wider">
                  AKTİF NÖRAL DEVRELER & NÖROTRANSMİTTER PROFİLİ
                </span>
                <div className="space-y-1.5">
                  {deepDiveData.neurobiologicalDetail.brainCircuits.map((circuit, idx) => (
                    <div
                      key={idx}
                      className="p-2 border border-[#181818] bg-[#0e0e0e] flex flex-col md:flex-row md:items-center justify-between text-[10px] gap-1"
                    >
                      <div>
                        <span className="text-white font-medium block">
                          {circuit.region}
                        </span>
                        <span className="text-[9px] text-[#777777]">
                          {circuit.functionalRole}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] px-1.5 py-0.5 bg-black border border-white/20 text-[#cccccc] uppercase">
                          {circuit.activityInDream}
                        </span>
                        <span className="text-[9px] text-[#888888]">
                          {circuit.neurotransmitterState}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Cognitive Jungian Psychology Deep Dive */}
          {activeSubTab === 'jung' && (
            <div className="space-y-3 font-mono-data text-xs">
              <div className="p-3 border border-[#1a1a1a] bg-[#0c0c0c] space-y-1.5">
                <span className="text-[9px] text-[#777777] uppercase block tracking-wider">
                  EVRİMSEL HAZIRLIKLILIK & KOLEKTİF BİLİNÇDIŞI
                </span>
                <p className="text-[11px] font-sans text-[#cccccc] leading-relaxed">
                  {deepDiveData.jungianCognitiveDetail.evolutionaryPreparednessTheory}
                </p>
              </div>

              <div className="p-3 border border-[#1a1a1a] bg-[#0c0c0c] space-y-1.5">
                <span className="text-[9px] text-[#777777] uppercase block tracking-wider">
                  SOMUTLAŞMIŞ BİLİŞ & KAVRAMSAL METAFOR TEORİSİ (LAKOFF & JOHNSON)
                </span>
                <p className="text-[11px] font-sans text-[#aaaaaa] leading-relaxed">
                  {deepDiveData.jungianCognitiveDetail.embodiedMetaphorInterpretation}
                </p>
              </div>

              {/* Archetypal Breakdown Cards */}
              <div className="space-y-2">
                {deepDiveData.jungianCognitiveDetail.archetypeConcepts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-[#1a1a1a] bg-[#0c0c0c] space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-serif-dream text-white font-medium uppercase">
                        {item.jungianConcept}
                      </span>
                      <span className="text-[8px] bg-white text-black px-1.5 py-0.5 font-bold uppercase">
                        BİLİŞSEL KARŞILIK
                      </span>
                    </div>

                    <p className="text-[10px] text-[#888888]">
                      <span className="text-[#666666]">Nörobiyoloji: </span>
                      {item.neurobiologicalCounterpart}
                    </p>

                    <p className="text-[10px] text-[#888888]">
                      <span className="text-[#666666]">Evrimsel Fonksiyon: </span>
                      {item.evolutionaryFunction}
                    </p>

                    <p className="text-[10px] text-[#cccccc] border-l-2 border-white pl-2 mt-1">
                      <span className="text-[#888888] block text-[9px]">GÜNDELİK ENTEGRASYON REHBERİ:</span>
                      {item.psychicIntegrationAdvice}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: The Neuro-Jungian Convergence Bridge */}
          {activeSubTab === 'bridge' && (
            <div className="space-y-3 font-mono-data text-xs">
              <div className="border border-white/30 bg-[#101010] p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-white uppercase font-bold">
                  <GitMerge size={14} />
                  <span>TEMEL YAKINSAMA TEZİ (THE SYNTHESIS THESIS)</span>
                </div>
                <p className="text-xs font-serif-dream text-[#eeeeee] leading-relaxed">
                  "{deepDiveData.neuroJungianBridge.coreThesis}"
                </p>
              </div>

              <div className="p-3 border border-[#1a1a1a] bg-[#0c0c0c] space-y-1.5">
                <span className="text-[9px] text-[#777777] uppercase block tracking-wider">
                  1. SUBKORTİKAL HARİTALANDIRMA (PANKSEPP DUYGUSAL SİSTEMLERİ)
                </span>
                <p className="text-[11px] font-sans text-[#cccccc] leading-relaxed">
                  {deepDiveData.neuroJungianBridge.subcorticalMapping}
                </p>
              </div>

              <div className="p-3 border border-[#1a1a1a] bg-[#0c0c0c] space-y-1.5">
                <span className="text-[9px] text-[#777777] uppercase block tracking-wider">
                  2. KORTİKAL ANLATI ÜRETİMİ (SANSÜRSÜZ MİTOLOJİ)
                </span>
                <p className="text-[11px] font-sans text-[#aaaaaa] leading-relaxed">
                  {deepDiveData.neuroJungianBridge.corticalNarration}
                </p>
              </div>

              <div className="p-3 border border-[#1a1a1a] bg-[#0c0c0c] space-y-1.5">
                <span className="text-[9px] text-[#777777] uppercase block tracking-wider">
                  3. TERAPÖTİK VE PSİKO-NÖROLOJİK SONUÇ
                </span>
                <p className="text-[11px] font-serif-dream italic text-white leading-relaxed">
                  {deepDiveData.neuroJungianBridge.therapeuticImplication}
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: Peer-Reviewed Scientific Literature (PubMed) */}
          {activeSubTab === 'literature' && (
            <div className="space-y-3 font-mono-data text-xs">
              <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-2">
                <span className="text-[9px] text-[#777777] uppercase tracking-wider">
                  HAKEMLİ AKADEMİK KAYNAKÇA // VERIFIED NCBI PUBMED CITATIONS
                </span>
                <span className="text-[9px] bg-white text-black px-1.5 py-0.5 font-bold uppercase">
                  5 DOĞRULANMIŞ MAKALE
                </span>
              </div>

              <div className="space-y-2.5">
                {deepDiveData.scholarlyCitations.map((cite) => (
                  <div
                    key={cite.id}
                    className="p-3 border border-[#1c1c1c] bg-[#0d0d0d] hover:border-[#333333] transition-colors space-y-1.5"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-sans text-white font-medium leading-snug">
                        {cite.title}
                      </h4>
                      <span className="text-[8px] bg-black border border-white/20 text-[#cccccc] px-1.5 py-0.5 uppercase whitespace-nowrap">
                        {cite.evidenceLevel}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#777777]">
                      {cite.authors} ({cite.year}) —{' '}
                      <span className="text-[#aaaaaa] italic">{cite.journal}</span>
                    </p>

                    <p className="text-[11px] font-serif-dream italic text-[#cccccc] leading-relaxed border-l-2 border-white pl-2">
                      "{cite.keyFinding}"
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[9px]">
                      <span className="text-[#555555]">
                        PMID: {cite.pmid} {cite.doi && `// DOI: ${cite.doi}`}
                      </span>

                      <a
                        href={cite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-white hover:underline uppercase font-bold"
                      >
                        <span>PubMed'de İncele</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
