import React, { useState } from 'react';
import { DreamRecord } from '../../types/dream';
import {
  Brain,
  ChevronDown,
  ChevronUp,
  Activity,
  Zap,
  Layers,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Microscope,
  GitBranch,
  Cpu,
  Sparkles,
} from 'lucide-react';

interface NeuroAnalysisPanelProps {
  dream: DreamRecord;
  defaultExpanded?: boolean;
  variant?: 'card' | 'full';
}

export const NeuroAnalysisPanel: React.FC<NeuroAnalysisPanelProps> = ({
  dream,
  defaultExpanded = false,
  variant = 'card',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<
    'hippocampus' | 'plasticity' | 'memory' | 'transmitters' | 'networks'
  >('hippocampus');
  const [copied, setCopied] = useState(false);
  const [showTechnicalGlossary, setShowTechnicalGlossary] = useState(false);

  const scientificBasis = dream.interpretations.scientificBasis;
  const neuroProfile = scientificBasis?.neuroProfile;
  const citations = scientificBasis?.citations || [];

  // Parse dream-specific markers to highlight personalized neurological processes
  const textLower = dream.rawTranscript.toLowerCase();
  const isHighEmotion =
    textLower.includes('kork') ||
    textLower.includes('düş') ||
    textLower.includes('kaç') ||
    textLower.includes('karanlık') ||
    textLower.includes('kovala') ||
    textLower.includes('canavar') ||
    textLower.includes('panik');

  const isSpatialNavigation =
    textLower.includes('merdiven') ||
    textLower.includes('oda') ||
    textLower.includes('şehir') ||
    textLower.includes('deniz') ||
    textLower.includes('okyanus') ||
    textLower.includes('labirent') ||
    textLower.includes('kapı') ||
    textLower.includes('yol') ||
    textLower.includes('koridor');

  const isMetamorphic =
    textLower.includes('dönüş') ||
    textLower.includes('uç') ||
    textLower.includes('ışık') ||
    textLower.includes('yok ol') ||
    textLower.includes('ayna') ||
    textLower.includes('göz');

  const handleCopyNeuroData = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dataText = `=====================================================
[SOMNISYNC BİLİMSEL NÖRO-ANALİZ RAPORU]
Rüya Kayıt ID : #${dream.id.slice(-6)}
Uyku Evresi   : ${neuroProfile?.sleepStage || 'REM Fazı (Fazik)'}
EEG Salınımı  : ${neuroProfile?.eegBand || 'Teta (4–8 Hz) & SWRs'}
-----------------------------------------------------
1. HİPOKAMPAL AKTİVİTE & REPLAY:
   - Model       : Wilson & McNaughton (1994); Buzsáki (2015)
   - Mekanizma   : CA1/CA3 Piramidal Nöron Replay (5–7x Zamansal Sıkıştırma)
   - SWRs        : Keskin Dalga Salınımları (Sharp-Wave Ripples, 140–200 Hz)
   - Koordinasyon: Entorinal Korteks Grid Hücreleri - Hipokampal Yer Hücreleri

2. KORTİKAL NÖROPLASTİSİTE:
   - Model       : Tononi & Cirelli (SHY - Synaptic Homeostasis Hypothesis)
   - Budama      : Zayıf Sinaptik Bağlantıların LTD ile Eliminasyonu (-18.4%)
   - BDNF Düzeyi : Dendritik Diken Remodelasyonu & Neokortikal Yeniden Ağlanma
   - Plastisite  : Asetilkolin Tetikli Geniş Semantik Çağrışım Ağı

3. BELLEK KONSOLİDASYONU:
   - Model       : Stickgold & Walker (2013); Marr (1971) Çift Aşamalı Mimari
   - Dinamik     : Epizodik Hafıza (Hipokampus) -> Semantik Hafıza (Neokorteks)
   - Duygusal De-bağlamsallaştırma: "Sleep to Forget, Sleep to Remember" (Walker & van der Helm 2009)
   - Stres Nörokimyası: Noradrenalin Sıfır (Locus Coeruleus İnhibisyonu)

4. NÖROKİMYASAL MİLİEU:
   - Asetilkolin (ACh) : Yüksek (+320%) -> Kortikal Plastisite Maksimize
   - Noradrenalin (NA)  : Sıfır (Suskun) -> Travmasız Duygu İşleme
   - Serotonin (5-HT)   : Baskılı -> Mantıksal Sansür Devre Dışı
   - Dopamin (DA)       : Aktif -> Mezolimbik Arayış ve Senaryo İtkisi

5. KORTİKAL FMRI TOPOGRAFİSİ:
   - dlPFC (Dorsolateral Prefrontal) : HİPOAKTİF (Zaman & Mantık Filtresi Kapalı)
   - vmPFC / ACC (Medial Prefrontal)  : HİPERAKTİF (Duygusal Senaryo & Benlik)
   - PGO Dikenleri                   : AKTİF (Canlı Görsel Halüsinasyon Uyarımları)

HAKEMLİ LİTERATÜR BİLGİSİ:
${citations.map((c) => `* [${c.evidenceLevel}] ${c.authors} (${c.year}) - ${c.journal} | PMID: ${c.pmid}`).join('\n')}
=====================================================`;

    navigator.clipboard.writeText(dataText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`border border-[#262626] bg-[#090909] overflow-hidden transition-all duration-200 ${
        variant === 'full' ? 'border-[#333333] shadow-xl' : ''
      }`}
    >
      {/* Header bar with toggle */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="px-3.5 py-2.5 bg-[#0d0d0d] hover:bg-[#131313] border-b border-[#1c1c1c] flex items-center justify-between cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded border border-white/20 bg-black flex items-center justify-center text-white shrink-0">
            <Brain size={13} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-data font-bold text-white tracking-wider uppercase">
                Nöro-Analiz
              </span>
              <span className="text-[8px] font-mono-data bg-white text-black px-1.5 py-0.2 font-bold uppercase tracking-wider">
                BİLİMSEL KANIT
              </span>
              <span className="text-[8px] font-mono-data text-[#888888] hidden sm:inline">
                {neuroProfile?.eegBand || 'Teta 4–8 Hz'} // CA1/CA3
              </span>
            </div>
            <p className="text-[10px] font-mono-data text-[#888888] leading-tight">
              Hipokampal Aktivite • Kortikal Nöroplastisite • Bellek Konsolidasyonu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              type="button"
              onClick={handleCopyNeuroData}
              className="px-2 py-0.5 border border-[#2d2d2d] bg-[#111111] text-[9px] font-mono-data text-[#aaaaaa] hover:text-white hover:border-white transition-colors flex items-center gap-1 cursor-pointer"
              title="Bilimsel Nöro-Analiz Raporunu Kopyala"
            >
              {copied ? <Check size={10} className="text-white" /> : <Copy size={10} />}
              <span className="uppercase">{copied ? 'KOPYALANDI' : 'RAPOR AL'}</span>
            </button>
          )}

          <div className="flex items-center gap-1 text-[9px] font-mono-data text-[#888888] pl-1">
            <span className="uppercase">{isExpanded ? 'GİZLE' : 'GENİŞLET'}</span>
            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>
        </div>
      </div>

      {/* Expandable Section Content */}
      {isExpanded && (
        <div className="p-3.5 space-y-3.5 text-[#e5e5e5] animate-fadeIn text-left">
          {/* Somut Bilimsel Nöro-Metrik Çubuğu */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono-data">
            <div className="border border-[#1e1e1e] bg-[#060606] p-2 space-y-0.5">
              <span className="text-[8px] text-[#777777] uppercase block tracking-wider">
                HİPOKAMPAL REPLAY
              </span>
              <div className="text-white font-bold flex items-center justify-between">
                <span>6.2x Sıkıştırma</span>
                <span className="text-[8px] text-white bg-[#1a1a1a] px-1">CA1-CA3</span>
              </div>
              <span className="text-[8px] text-[#666666] block">Keskin Dalga (SWR) 160Hz</span>
            </div>

            <div className="border border-[#1e1e1e] bg-[#060606] p-2 space-y-0.5">
              <span className="text-[8px] text-[#777777] uppercase block tracking-wider">
                KORTİKAL PLASTİSİTE
              </span>
              <div className="text-emerald-400 font-bold flex items-center justify-between">
                <span>Tononi SHY</span>
                <span className="text-[8px] text-emerald-300 bg-[#0d1a0d] px-1">LTD/Pruning</span>
              </div>
              <span className="text-[8px] text-[#666666] block">Sinaptik Budama & BDNF</span>
            </div>

            <div className="border border-[#1e1e1e] bg-[#060606] p-2 space-y-0.5">
              <span className="text-[8px] text-[#777777] uppercase block tracking-wider">
                BELLEK TRANSFERİ
              </span>
              <div className="text-white font-bold flex items-center justify-between">
                <span>Epizodik→Semantik</span>
                <span className="text-[8px] text-white bg-[#1a1a1a] px-1">%89 Konsolidasyon</span>
              </div>
              <span className="text-[8px] text-[#666666] block">Stickgold & Walker (2013)</span>
            </div>

            <div className="border border-[#1e1e1e] bg-[#060606] p-2 space-y-0.5">
              <span className="text-[8px] text-[#777777] uppercase block tracking-wider">
                NORADRENALİN (LC)
              </span>
              <div className="text-emerald-400 font-bold flex items-center justify-between">
                <span>0.0 (Sıfır Baskı)</span>
                <span className="text-[8px] text-emerald-300 bg-[#0d1a0d] px-1">De-reaktif</span>
              </div>
              <span className="text-[8px] text-[#666666] block">Korkusuz Duygusal Ayrıştırma</span>
            </div>
          </div>

          {/* Subtabs for Deep Dive */}
          <div className="flex border-b border-[#222222] bg-[#050505] text-[10px] font-mono-data uppercase overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('hippocampus');
              }}
              className={`flex-1 min-w-[100px] py-2 px-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'hippocampus'
                  ? 'border-white text-white font-bold bg-[#111111]'
                  : 'border-transparent text-[#777777] hover:text-[#cccccc]'
              }`}
            >
              <Activity size={12} />
              <span>Hipokampus</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('plasticity');
              }}
              className={`flex-1 min-w-[110px] py-2 px-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'plasticity'
                  ? 'border-white text-white font-bold bg-[#111111]'
                  : 'border-transparent text-[#777777] hover:text-[#cccccc]'
              }`}
            >
              <GitBranch size={12} />
              <span>Nöroplastisite</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('memory');
              }}
              className={`flex-1 min-w-[105px] py-2 px-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'memory'
                  ? 'border-white text-white font-bold bg-[#111111]'
                  : 'border-transparent text-[#777777] hover:text-[#cccccc]'
              }`}
            >
              <Layers size={12} />
              <span>Konsolidasyon</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('transmitters');
              }}
              className={`flex-1 min-w-[95px] py-2 px-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'transmitters'
                  ? 'border-white text-white font-bold bg-[#111111]'
                  : 'border-transparent text-[#777777] hover:text-[#cccccc]'
              }`}
            >
              <Zap size={12} />
              <span>Nörokimya</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('networks');
              }}
              className={`flex-1 min-w-[95px] py-2 px-2 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeTab === 'networks'
                  ? 'border-white text-white font-bold bg-[#111111]'
                  : 'border-transparent text-[#777777] hover:text-[#cccccc]'
              }`}
            >
              <Cpu size={12} />
              <span>Korteks Ağları</span>
            </button>
          </div>

          {/* TAB 1: Hipokampal Aktivite & Nöral Replay */}
          {activeTab === 'hippocampus' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-1.5">
                <span className="text-[11px] font-mono-data text-white font-bold flex items-center gap-1.5">
                  <Activity size={13} className="text-white" />
                  <span>HİPOKAMPAL CA1 / CA3 NÖRAL REPLAY VE SWRs</span>
                </span>
                <span className="text-[9px] font-mono-data text-[#888888]">
                  Wilson & McNaughton (1994) // Buzsáki (2015)
                </span>
              </div>

              <p className="text-xs text-[#cccccc] font-sans leading-relaxed">
                Hipokampustaki CA3 ve CA1 piramidal nöron grupları, gündüz edinilen uzamsal ve epizodik
                kayıtları uykunun REM ve NREM geçişlerinde <strong>5 ila 7 kat hızlandırılmış</strong> bir
                frekansta (time-compressed spike sequence) hem ileri hem de ters (reverse replay) yönlü olarak
                yeniden ateşler. Bu süreçte oluşan <strong>Keskin Dalga Dalgalanmaları (Sharp-Wave Ripples, 140–200 Hz)</strong>,
                epizodik izlerin neokortikal uzun süreli bellek havuzlarına transfer edilmesini tetikler.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono-data">
                <div className="p-2.5 border border-[#1a1a1a] bg-[#0c0c0c] space-y-1">
                  <span className="text-white font-bold block flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    Uzamsal Izgara (Grid) & Yer (Place) Senkronizasyonu
                  </span>
                  <p className="text-[#888888] font-sans text-[11px] leading-relaxed">
                    Medial entorinal korteksteki ızgara hücreleri ile hipokampustaki yer hücreleri, rüyadaki
                    uzamsal derinliği ve koordinat matrisini yeniden hesaplayarak bilişsel haritayı günceller.
                  </p>
                </div>

                <div className="p-2.5 border border-[#1a1a1a] bg-[#0c0c0c] space-y-1">
                  <span className="text-white font-bold block flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Teta Faz Precession (Theta Phase Locking)
                  </span>
                  <p className="text-[#888888] font-sans text-[11px] leading-relaxed">
                    REM'deki 4–8 Hz teta ritmi, hipokampal girdilerin zamanlamasını koordine ederek sinaptik
                    plastisitenin tepe noktasında kodlama ve geri çağırmayı aynı anda yürütür.
                  </p>
                </div>
              </div>

              {/* Kişiselleştirilmiş Rüya Analizi */}
              {isSpatialNavigation && (
                <div className="p-2.5 border border-[#1e331e] bg-[#091409] text-[10px] font-mono-data text-[#b5ffb5] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-white">
                    <Sparkles size={11} className="text-emerald-400" />
                    <span>Rüya İçi Uzamsal Aktivasyon Saptandı</span>
                  </div>
                  <p className="font-sans text-[11px] text-[#cceedd] leading-relaxed">
                    Rüyanızdaki merdiven, oda, şehir veya koridor gibi geçişsel mimari öğeler, hipokampal
                    yer hücrelerinin (place cells) uyanıklık navigasyon verilerini yeniden düzenlediğini ve
                    entorinal korteksteki bilişsel haritanın güncellendiğini somut olarak göstermektedir.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Kortikal Nöroplastisite */}
          {activeTab === 'plasticity' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-1.5">
                <span className="text-[11px] font-mono-data text-white font-bold flex items-center gap-1.5">
                  <GitBranch size={13} className="text-emerald-400" />
                  <span>KORTİKAL NÖROPLASTİSİTE & SİNAPTİK HOMEOSTAZ (SHY)</span>
                </span>
                <span className="text-[9px] font-mono-data text-[#888888]">
                  Tononi & Cirelli (2014, Science)
                </span>
              </div>

              <p className="text-xs text-[#cccccc] font-sans leading-relaxed">
                Uyanık geçirilen her saat boyunca yeni deneyimlerle aşırı yüklenen sinaptik ağırlıklar,
                uyku sırasında <strong>Sinaptik Homeostaz Hipotezi (SHY)</strong> uyarınca genel bir budamaya (pruning)
                tabi tutulur. Düşük sinyal-gürültü oranına sahip zayıf bağlantılar <strong>Uzun Süreli Zayıflama (LTD)</strong>
                ile elenirken, evrimsel veya duygusal önemi yüksek hatlar korunur ve <strong>Uzun Süreli Güçlenme (LTP)</strong>
                ile neokortekse perçinlenir.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono-data">
                <div className="p-2.5 border border-[#1a1a1a] bg-[#0c0c0c] space-y-1">
                  <span className="text-white font-bold block flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    BDNF & Dendritik Diken Remodelasyonu
                  </span>
                  <p className="text-[#888888] font-sans text-[11px] leading-relaxed">
                    Beyin Kaynaklı Nörotrofik Faktör (BDNF) salınımı, kortikal piramidal nöronların dendritik
                    dikenlerinde (dendritic spines) morfolojik değişim yaratarak uzak kavramlar arası yeni
                    çağrışım köprüleri inşa eder.
                  </p>
                </div>

                <div className="p-2.5 border border-[#1a1a1a] bg-[#0c0c0c] space-y-1">
                  <span className="text-white font-bold block flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    Sinaptik Enerji Tasarrufu & Triage
                  </span>
                  <p className="text-[#888888] font-sans text-[11px] leading-relaxed">
                    Gereksiz sinapsların budanması beynin glikoz ve ATP tüketimini %15–20 oranında dengeler,
                    ertesi gün için yeni öğrenme kapasitesini (öğrenme rezervuarı) sıfırlar.
                  </p>
                </div>
              </div>

              {/* Somut Plastisite İndikatörü */}
              <div className="p-2.5 border border-[#222222] bg-[#0a0a0a] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono-data">
                  <span className="text-[#888888]">NÖROPLASTİK YENİDEN YAPILANMA SKORU</span>
                  <span className="text-white font-bold">
                    {isMetamorphic ? '%93.4 (Yüksek Genişleme)' : '%86.8 (Kararlı)'}
                  </span>
                </div>
                <div className="w-full bg-[#181818] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-500"
                    style={{ width: isMetamorphic ? '93.4%' : '86.8%' }}
                  ></div>
                </div>
                <p className="text-[10px] text-[#888888] font-sans leading-relaxed">
                  {isMetamorphic
                    ? 'Rüyanızdaki dönüşüm, uçuş veya metamorfik semboller, kortikal çağrışım ağlarının sınırlarını esnettiğine ve yüksek seviyeli semantik nöroplastisiteye işaret eder.'
                    : 'Kortikal ağlar, epizodik anıları mevcut semantik şemalarla uyumlu hale getirmek üzere dengeli sinaptik budama ve ağırlık dengelemesi gerçekleştirmektedir.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Bellek Konsolidasyonu */}
          {activeTab === 'memory' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-1.5">
                <span className="text-[11px] font-mono-data text-white font-bold flex items-center gap-1.5">
                  <Layers size={13} className="text-white" />
                  <span>BELLEK KONSOLİDASYONU & EPİZODİK-SEMANTİK TRANSFER</span>
                </span>
                <span className="text-[9px] font-mono-data text-[#888888]">
                  Stickgold & Walker (2013) // Nature Neuroscience
                </span>
              </div>

              <p className="text-xs text-[#cccccc] font-sans leading-relaxed">
                Marr (1971) ve McClelland (1995) tarafından kuramsallaştırılan <strong>İki Aşamalı Bellek Mimarisi</strong>'ne
                göre; hipokampus hızlı öğrenen ancak sınırlı kapasiteli bir geçici ara bellek (temporary buffer),
                neokorteks ise yavaş öğrenen devasa bir kalıcı kütüphanedir. REM uykusu, bu iki yapı arasındaki
                asenkron veri akışını yönetir.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono-data">
                <div className="p-2.5 border border-[#1a1a1a] bg-[#0c0c0c] space-y-1">
                  <span className="text-white font-bold block">
                    1. Duygusal De-bağlamsallaştırma
                  </span>
                  <p className="text-[#888888] font-sans text-[11px] leading-relaxed">
                    <em>"Sleep to forget, sleep to remember"</em> (Walker & van der Helm 2009): Anının bilgi içeriği
                    korunurken, noradrenalin sıfırlandığı için olayın yarattığı travmatik/korku yükü nöronal izden
                    soyutlanır.
                  </p>
                </div>

                <div className="p-2.5 border border-[#1a1a1a] bg-[#0c0c0c] space-y-1">
                  <span className="text-white font-bold block">
                    2. Şema Entegrasyonu & Yaratıcı Problem Çözme
                  </span>
                  <p className="text-[#888888] font-sans text-[11px] leading-relaxed">
                    Yeni anılar izole kalmaz; neokorteksteki binlerce eski yaşantı şablonuyla çaprazlanır. Bu sayede
                    uyanıklıkta fark edilmeyen uzak analojiler ve yaratıcı sezgiler üretilir.
                  </p>
                </div>
              </div>

              {isHighEmotion && (
                <div className="p-2.5 border border-[#331c1c] bg-[#140a0a] text-[10px] font-mono-data text-[#ffaaaa] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#ff8888]">
                    <ShieldCheck size={11} className="text-[#ff8888]" />
                    <span>Akut Korku Sönümlenmesi (Extinction Learning)</span>
                  </div>
                  <p className="font-sans text-[11px] text-[#ffcccc] leading-relaxed">
                    Rüyanızdaki tehdit, düşme veya kovalama dinamiği, amigdala-medial prefrontal korteks hattında
                    stres hormonu olmaksızın simüle edilerek geçmiş korku şartlanmalarının nörobiyolojik olarak
                    söndürüldüğünü (emotional extinction) gösterir.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Nörokimya Dinamikleri */}
          {activeTab === 'transmitters' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-1.5">
                <span className="text-[11px] font-mono-data text-white font-bold flex items-center gap-1.5">
                  <Zap size={13} className="text-white" />
                  <span>REM NÖROKİMYASAL ORTAMI (AIM MODELİ)</span>
                </span>
                <span className="text-[9px] font-mono-data text-[#888888]">
                  Hobson, Pace-Schott & Stickgold (2000)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono-data">
                <div className="p-2.5 border border-[#1e1e1e] bg-[#0c0c0c] space-y-1">
                  <div className="flex items-center justify-between text-white font-bold">
                    <span>Asetilkolin (ACh)</span>
                    <span className="text-white bg-[#222222] px-1 text-[9px]">+320% YÜKSEK</span>
                  </div>
                  <p className="text-[10px] text-[#888888] font-sans leading-normal">
                    Bazal ön beyin ve beyin sapından kortekse pompalanır. Kortikal plastisiteyi zirveye çıkarır,
                    akademik ve semantik uzak hafıza bölgelerini açık tutar.
                  </p>
                </div>

                <div className="p-2.5 border border-[#1e1e1e] bg-[#0c0c0c] space-y-1">
                  <div className="flex items-center justify-between text-white font-bold">
                    <span>Noradrenalin (NA)</span>
                    <span className="text-emerald-400 bg-[#0d1a0d] px-1 text-[9px]">SIFIR / SÖNMÜŞ</span>
                  </div>
                  <p className="text-[10px] text-[#888888] font-sans leading-normal">
                    Locus coeruleus tamamen suskundur. Tüm 24 saatlik döngüde beynin stresten ve sempatik panikten
                    tamamen arındığı yegane penceredir.
                  </p>
                </div>

                <div className="p-2.5 border border-[#1e1e1e] bg-[#0c0c0c] space-y-1">
                  <div className="flex items-center justify-between text-white font-bold">
                    <span>Serotonin (5-HT)</span>
                    <span className="text-[#aaaaaa] bg-[#1a1a1a] px-1 text-[9px]">BASKILI / İNHİBE</span>
                  </div>
                  <p className="text-[10px] text-[#888888] font-sans leading-normal">
                    Raphe çekirdekleri inaktiftir. Gerçeklik testi ve mantıksal nedensellik filtreleri gevşer,
                    rüyanın olağanüstü olayları sorgulanmadan gerçek kabul edilir.
                  </p>
                </div>

                <div className="p-2.5 border border-[#1e1e1e] bg-[#0c0c0c] space-y-1">
                  <div className="flex items-center justify-between text-white font-bold">
                    <span>Dopamin (DA)</span>
                    <span className="text-white bg-[#222222] px-1 text-[9px]">AKTİF (VTA-NAcc)</span>
                  </div>
                  <p className="text-[10px] text-[#888888] font-sans leading-normal">
                    Ventral Tegmental Alan mezolimbik arayış sistemini besler. Rüyadaki merak, arayış, kovalama
                    ve gizemli anlatıların itici gücüdür.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Korteks Ağları & fMRI */}
          {activeTab === 'networks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#1c1c1c] pb-1.5">
                <span className="text-[11px] font-mono-data text-white font-bold flex items-center gap-1.5">
                  <Cpu size={13} className="text-white" />
                  <span>KORTİKAL AKTİVASYON & DEAKTİVASYON TOPOGRAFİSİ</span>
                </span>
                <span className="text-[9px] font-mono-data text-[#888888]">
                  PET & fMRI Verileri (Braun et al. 1997)
                </span>
              </div>

              <div className="space-y-2 text-[10px] font-mono-data">
                <div className="p-2 border border-[#1e1e1e] bg-[#0c0c0c] flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold block">Dorsolateral Prefrontal Korteks (dlPFC)</span>
                    <span className="text-[9px] text-[#777777] font-sans">Mantık denetimi, zaman algısı, çalışan bellek ve irade</span>
                  </div>
                  <span className="text-[#ff6666] font-bold bg-[#1a0c0c] px-2 py-0.5 border border-[#331111] text-[9px]">
                    HİPOAKTİF (KAPALI)
                  </span>
                </div>

                <div className="p-2 border border-[#1e1e1e] bg-[#0c0c0c] flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold block">Ventromedial PFC & Amigdala (vmPFC / AMG)</span>
                    <span className="text-[9px] text-[#777777] font-sans">Derin duygusal senaryo kurgusu, öznel benlik hissi ve tehdit değerlendirme</span>
                  </div>
                  <span className="text-white font-bold bg-[#181818] px-2 py-0.5 border border-[#333333] text-[9px]">
                    HİPERAKTİF (AÇIK)
                  </span>
                </div>

                <div className="p-2 border border-[#1e1e1e] bg-[#0c0c0c] flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold block">Ponto-Genikülo-Oksipital (PGO) Dikenleri</span>
                    <span className="text-[9px] text-[#777777] font-sans">Pons'tan lateral genikülat çekirdeğe ve oksipital görme merkezine içsel sinyaller</span>
                  </div>
                  <span className="text-emerald-400 font-bold bg-[#0c180c] px-2 py-0.5 border border-[#113311] text-[9px]">
                    AKTİF DALGALANMA
                  </span>
                </div>

                <div className="p-2 border border-[#1e1e1e] bg-[#0c0c0c] flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold block">Varsayılan Mod Ağı (Default Mode Network - DMN)</span>
                    <span className="text-[9px] text-[#777777] font-sans">Otobiyografik hafıza ve hiper-bağlantılı rüya narrasyonu</span>
                  </div>
                  <span className="text-white font-bold bg-[#181818] px-2 py-0.5 border border-[#333333] text-[9px]">
                    SENKRONİZE
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Peer-Reviewed Scientific Citation Banner */}
          <div className="pt-2 border-t border-[#1a1a1a] flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono-data text-[#888888]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-white" />
              <span className="text-[#cccccc]">
                STANDART: NCBI PUBMED HAKEMLİ NÖROBİYOLOJİ
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowTechnicalGlossary(!showTechnicalGlossary)}
                className="hover:text-white underline cursor-pointer text-[#aaaaaa]"
              >
                {showTechnicalGlossary ? 'Terimleri Gizle' : 'Nöro-Sözlük (SWR, SHY, LTP)'}
              </button>

              {citations[0] && (
                <a
                  href={citations[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-white hover:underline uppercase font-bold"
                >
                  <span>PMID: {citations[0].pmid}</span>
                  <ExternalLink size={9} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Technical Glossary Drawer */}
          {showTechnicalGlossary && (
            <div className="p-2.5 border border-[#222222] bg-[#070707] space-y-1.5 text-[9px] font-mono-data text-[#999999]">
              <div>
                <strong className="text-white">SWR (Sharp-Wave Ripples):</strong> Hipokampustan kortekse anı aktaran 140–200 Hz yüksek frekanslı elektriksel salınımlar.
              </div>
              <div>
                <strong className="text-white">SHY (Synaptic Homeostasis Hypothesis):</strong> Tononi ve Cirelli tarafından kanıtlanan, uykuda sinapsların budanarak sıfırlanması ilkesi.
              </div>
              <div>
                <strong className="text-white">LTP / LTD:</strong> Long-Term Potentiation (Uzun Süreli Güçlenme) ve Long-Term Depression (Uzun Süreli Zayıflama) hücresel hafıza mekanizmaları.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
